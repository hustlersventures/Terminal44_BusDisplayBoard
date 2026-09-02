"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadAdvertisement } from "@/lib/actions/ads";
import { ROTATION } from "@/lib/constants";
import type { AdMediaType } from "@/lib/types";

function detectMediaType(file: File): AdMediaType | null {
  if (file.type === "image/gif") return "gif";
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return null;
}

function readVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error("Could not read this video file."));
    };
    video.src = URL.createObjectURL(file);
  });
}

export default function UploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<AdMediaType | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  // Default: every ad (including video) shows for the standard 5s slot.
  const [playFullDuration, setPlayFullDuration] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    setDuration(null);
    setPlayFullDuration(false);
    setPreviewUrl(null);
    setFile(null);
    setMediaType(null);

    const selected = e.target.files?.[0];
    if (!selected) return;

    const type = detectMediaType(selected);
    if (!type) {
      setError("Unsupported file type. Please choose an image, GIF, or video.");
      return;
    }

    if (type === "video") {
      setChecking(true);
      try {
        const seconds = await readVideoDuration(selected);
        if (seconds > ROTATION.MAX_VIDEO_DURATION_S) {
          setError(
            `This video is ${seconds.toFixed(1)}s long. Videos can't be longer than ${ROTATION.MAX_VIDEO_DURATION_S}s — please trim it and try again.`,
          );
          if (fileInputRef.current) fileInputRef.current.value = "";
          setChecking(false);
          return;
        }
        setDuration(seconds);
      } catch {
        setError("Could not read this video file. Please try a different one.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        setChecking(false);
        return;
      }
      setChecking(false);
    }

    setFile(selected);
    setMediaType(type);
    setPreviewUrl(URL.createObjectURL(selected));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please enter a title.");
      return;
    }
    if (!file || !mediaType) {
      setError("Please choose a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.set("title", title.trim());
    formData.set("media_type", mediaType);
    formData.set("file", file);
    if (duration != null) formData.set("duration_seconds", String(duration));
    formData.set("play_full_duration", String(mediaType === "video" && playFullDuration));

    setSubmitting(true);
    const result = await uploadAdvertisement(formData);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? "Upload failed.");
      return;
    }
    router.push("/admin/ads");
  }

  const busy = checking || submitting;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm font-medium text-stone-700">
          Title
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="e.g. Terminal 44 Combo Offer"
          className="rounded-xl border border-stone-300 px-4 py-3.5 text-base outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="file" className="text-sm font-medium text-stone-700">
          Image, GIF, or Video (max {ROTATION.MAX_VIDEO_DURATION_S}s for video)
        </label>
        <input
          id="file"
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          required
          className="rounded-xl border border-stone-300 px-4 py-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-orange-500 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
        />
        {checking && <p className="text-sm text-stone-500">Checking video duration…</p>}
      </div>

      {previewUrl && mediaType && !error && (
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
          {mediaType === "video" ? (
            <video src={previewUrl} controls className="max-h-64 w-full" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Preview" className="max-h-64 w-full object-contain" />
          )}
          {duration != null && (
            <p className="px-3 py-1.5 text-xs text-stone-500">Duration: {duration.toFixed(1)}s</p>
          )}
        </div>
      )}

      {mediaType === "video" && !error && (
        <label className="flex items-start gap-3 rounded-xl border border-stone-200 px-4 py-3.5">
          <input
            type="checkbox"
            checked={playFullDuration}
            onChange={(e) => setPlayFullDuration(e.target.checked)}
            className="mt-0.5 h-5 w-5 accent-orange-500"
          />
          <span className="text-sm text-stone-700">
            Play the full video ({duration?.toFixed(1)}s) instead of the default {ROTATION.DEFAULT_AD_MS / 1000}s
            slot.
            <span className="block text-xs text-stone-400">
              Leave this unchecked to show it for {ROTATION.DEFAULT_AD_MS / 1000}s like every other ad — you can
              change this later from the advertisements list.
            </span>
          </span>
        </label>
      )}

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy || !file}
        className="mt-2 rounded-xl bg-orange-500 px-6 py-4 text-base font-semibold text-white shadow-md shadow-orange-200 transition active:scale-[0.98] hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Uploading…" : "Upload Advertisement"}
      </button>
    </form>
  );
}
