"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { adUploadSchema } from "@/lib/validation";
import { BUS_ADVERTISEMENTS_BUCKET, MAX_UPLOAD_BYTES, ROTATION } from "@/lib/constants";
import type { Advertisement, AdMediaType } from "@/lib/types";
import type { ActionResult } from "@/lib/actions/buses";

export async function getAllBusAdvertisements(): Promise<Advertisement[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bus_advertisements")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data as Advertisement[];
}

function extensionFor(filename: string, fallback: string) {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? fallback : filename.slice(dot + 1).toLowerCase();
}

export async function uploadAdvertisement(formData: FormData): Promise<ActionResult> {
  const title = String(formData.get("title") ?? "");
  const mediaType = String(formData.get("media_type") ?? "") as AdMediaType;
  const durationRaw = formData.get("duration_seconds");
  const duration_seconds = durationRaw ? Number(durationRaw) : null;
  const playFullDuration = formData.get("play_full_duration") === "true";
  const file = formData.get("file");

  const parsed = adUploadSchema.safeParse({ title, media_type: mediaType, duration_seconds });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Please choose a file to upload." };
  }

  if (mediaType === "video" && !duration_seconds) {
    return { ok: false, error: "Could not read the video's duration. Please try a different file." };
  }

  const maxBytes = MAX_UPLOAD_BYTES[mediaType];
  if (file.size > maxBytes) {
    return { ok: false, error: `File is too large (max ${(maxBytes / (1024 * 1024)).toFixed(0)}MB).` };
  }

  const supabase = createAdminClient();
  const ext = extensionFor(file.name, mediaType === "video" ? "mp4" : mediaType === "gif" ? "gif" : "jpg");
  const storagePath = `${mediaType}/${crypto.randomUUID()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from(BUS_ADVERTISEMENTS_BUCKET)
    .upload(storagePath, arrayBuffer, {
      contentType: file.type || undefined,
      upsert: false,
    });
  if (uploadError) return { ok: false, error: uploadError.message };

  const { data: publicUrlData } = supabase.storage.from(BUS_ADVERTISEMENTS_BUCKET).getPublicUrl(storagePath);

  const { data: maxRow } = await supabase
    .from("bus_advertisements")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = (maxRow?.display_order ?? 0) + 1;

  const { data, error } = await supabase
    .from("bus_advertisements")
    .insert({
      title: parsed.data.title.trim(),
      media_type: mediaType,
      storage_path: storagePath,
      public_url: publicUrlData.publicUrl,
      duration_seconds: mediaType === "video" ? duration_seconds : null,
      // Everything defaults to the 5s slot; a video can opt into playing
      // its full (≤20s) length instead.
      play_full_duration: mediaType === "video" ? playFullDuration : false,
      display_order: nextOrder,
      is_active: true,
    })
    .select("id")
    .single();

  if (error) {
    // Roll back the uploaded file so we don't leak orphaned storage objects.
    await supabase.storage.from(BUS_ADVERTISEMENTS_BUCKET).remove([storagePath]);
    // The DB's CHECK constraint is a second line of defense behind the
    // client-side duration check — translate its raw message if it's ever
    // what actually catches an oversized video.
    const friendly = error.message.includes("bus_advertisements_duration_check")
      ? `Videos can't be longer than ${ROTATION.MAX_VIDEO_DURATION_S} seconds.`
      : error.message;
    return { ok: false, error: friendly };
  }

  revalidatePath("/admin/ads");
  revalidatePath("/display");
  return { ok: true, id: data.id };
}

export async function toggleAdvertisementActive(id: string, isActive: boolean): Promise<ActionResult> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("bus_advertisements")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/ads");
  revalidatePath("/display");
  return { ok: true, id };
}

/** Lets the admin flip a video between the default 5s slot and playing its full measured length. */
export async function setPlayFullDuration(id: string, playFullDuration: boolean): Promise<ActionResult> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("bus_advertisements")
    .update({ play_full_duration: playFullDuration, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/ads");
  revalidatePath("/display");
  return { ok: true, id };
}

export async function deleteAdvertisement(id: string): Promise<ActionResult> {
  const supabase = createAdminClient();
  const { data: row } = await supabase.from("bus_advertisements").select("storage_path").eq("id", id).maybeSingle();

  const { error } = await supabase.from("bus_advertisements").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  if (row?.storage_path) {
    await supabase.storage.from(BUS_ADVERTISEMENTS_BUCKET).remove([row.storage_path]);
  }

  revalidatePath("/admin/ads");
  revalidatePath("/display");
  return { ok: true, id };
}

/** Swaps display_order with the adjacent advertisement so the admin can nudge the rotation sequence. */
export async function moveAdvertisement(id: string, direction: "up" | "down"): Promise<ActionResult> {
  const supabase = createAdminClient();
  const { data: all, error } = await supabase
    .from("bus_advertisements")
    .select("id, display_order")
    .order("display_order", { ascending: true });
  if (error) return { ok: false, error: error.message };

  const index = all.findIndex((row) => row.id === id);
  if (index === -1) return { ok: false, error: "Advertisement not found." };

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= all.length) return { ok: true, id }; // already at the edge, no-op

  const current = all[index];
  const neighbor = all[swapIndex];

  const { error: e1 } = await supabase
    .from("bus_advertisements")
    .update({ display_order: neighbor.display_order })
    .eq("id", current.id);
  const { error: e2 } = await supabase
    .from("bus_advertisements")
    .update({ display_order: current.display_order })
    .eq("id", neighbor.id);
  if (e1 || e2) return { ok: false, error: (e1 || e2)?.message };

  revalidatePath("/admin/ads");
  revalidatePath("/display");
  return { ok: true, id };
}
