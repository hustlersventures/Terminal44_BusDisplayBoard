"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { busArrivalSchema, type BusArrivalInput } from "@/lib/validation";
import { istInputToIso } from "@/lib/datetime";
import type { BusBayDisplay, BusStatus } from "@/lib/types";

export interface ActionResult {
  ok: boolean;
  error?: string;
  id?: string;
}

/** All currently displayed (is_active) bus entries, for the admin dashboard and the live board. */
export async function getActiveBuses(): Promise<BusBayDisplay[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bus_bay_display")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data as BusBayDisplay[];
}

/** Distinct bay codes seen so far, used to build a quick-pick list in the arrival form. */
export async function getDistinctBays(): Promise<string[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("bus_bay_display").select("bay");
  if (error) throw error;
  const unique = new Set((data as { bay: string }[]).map((row) => row.bay));
  return Array.from(unique).sort();
}

export async function getBusById(id: string): Promise<BusBayDisplay | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("bus_bay_display").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as BusBayDisplay | null;
}

/**
 * Searches past bus_bay_display rows by bus number (case-insensitive,
 * partial match) so the admin can find a bus that has arrived before.
 * Returns at most one row per bus number — the most recent one — since
 * that's what re-arrival prefill needs.
 */
export async function searchBuses(query: string): Promise<BusBayDisplay[]> {
  const q = query.trim();
  if (!q) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bus_bay_display")
    .select("*")
    .ilike("bus_number", `%${q}%`)
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw error;

  const seen = new Set<string>();
  const uniqueByBusNumber: BusBayDisplay[] = [];
  for (const row of data as BusBayDisplay[]) {
    const key = row.bus_number.toUpperCase();
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueByBusNumber.push(row);
    if (uniqueByBusNumber.length >= 8) break;
  }
  return uniqueByBusNumber;
}

function normalizeBusNumber(raw: string) {
  return raw.trim().toUpperCase();
}

/**
 * Records a new arrival. If the same bus (by bus_number) already has an
 * active display entry, that old entry is retired (marked departed /
 * inactive) so the board never shows one bus in two bays at once — this
 * is what "re-arrival reuses the bus/operator relationship" means given
 * there's no separate bus master table: history lives in this same table.
 */
export async function createArrival(input: BusArrivalInput): Promise<ActionResult> {
  const parsed = busArrivalSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const value = parsed.data;
  const busNumber = normalizeBusNumber(value.bus_number);

  const supabase = createAdminClient();

  const { error: retireError } = await supabase
    .from("bus_bay_display")
    .update({ is_active: false, status: "departed", updated_at: new Date().toISOString() })
    .eq("bus_number", busNumber)
    .eq("is_active", true);
  if (retireError) return { ok: false, error: retireError.message };

  const { data: maxRow } = await supabase
    .from("bus_bay_display")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextSortOrder = (maxRow?.sort_order ?? 0) + 1;

  const { data, error } = await supabase
    .from("bus_bay_display")
    .insert({
      bay: value.bay.trim(),
      bus_number: busNumber,
      operator_name: value.operator_name.trim(),
      route_from: value.route_from.trim(),
      route_to: value.route_to.trim(),
      route_via: value.route_via,
      scheduled_arrival: istInputToIso(value.scheduled_arrival),
      scheduled_departure: istInputToIso(value.scheduled_departure),
      status: value.status,
      sort_order: nextSortOrder,
      is_active: true,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin");
  return { ok: true, id: data.id };
}

export async function updateArrival(id: string, input: BusArrivalInput): Promise<ActionResult> {
  const parsed = busArrivalSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const value = parsed.data;
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("bus_bay_display")
    .update({
      bay: value.bay.trim(),
      bus_number: normalizeBusNumber(value.bus_number),
      operator_name: value.operator_name.trim(),
      route_from: value.route_from.trim(),
      route_to: value.route_to.trim(),
      route_via: value.route_via,
      scheduled_arrival: istInputToIso(value.scheduled_arrival),
      scheduled_departure: istInputToIso(value.scheduled_departure),
      status: value.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin");
  return { ok: true, id };
}

/** Quick status change (e.g. mark boarding/departed) without opening the full edit form. */
export async function setBusStatus(id: string, status: BusStatus): Promise<ActionResult> {
  const supabase = createAdminClient();
  const isActive = status !== "departed";
  const { error } = await supabase
    .from("bus_bay_display")
    .update({ status, is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin");
  return { ok: true, id };
}

/** Removes an entry from the live board without deleting its history. */
export async function removeFromDisplay(id: string): Promise<ActionResult> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("bus_bay_display")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin");
  return { ok: true, id };
}
