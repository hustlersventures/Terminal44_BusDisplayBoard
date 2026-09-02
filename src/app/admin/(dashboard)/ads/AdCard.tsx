"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleAdvertisementActive, deleteAdvertisement, moveAdvertisement } from "@/lib/actions/ads";
import type { Advertisement } from "@/lib/types";

const MEDIA_BADGE: Record<Advertisement["media_type"], string> = {
  image: "bg-sky-100 text-sky-700",
  gif: "bg-purple-100 text-purple-700",
  video: "bg-orange-100 text-orange-700",
};

export default function AdCard({
  ad,
  position,
  total,
}: {
  ad: Advertisement;
  position: number;
  total: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function move(direction: "up" | "down") {
    startTransition(async () => {
      await moveAdvertisement(ad.id, direction);
      router.refresh();
    });
  }

  function toggleActive() {
    startTransition(async () => {
      await toggleAdvertisementActive(ad.id, !ad.is_active);
      router.refresh();
    });
  }

  function remove() {
    if (!confirm(`Delete "${ad.title}"? This can't be undone.`)) return;
    startTransition(async () => {
      await deleteAdvertisement(ad.id);
      router.refresh();
    });
  }

  return (
    <li className="flex gap-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm">
      <div className="flex w-20 shrink-0 flex-col items-center gap-1">
        <button
          type="button"
          disabled={pending || position === 0}
          onClick={() => move("up")}
          className="w-full rounded-lg border border-stone-200 py-1 text-stone-500 disabled:opacity-30"
          aria-label="Move earlier in rotation"
        >
          ▲
        </button>
        <span className="text-xs font-semibold text-stone-400">#{position + 1}</span>
        <button
          type="button"
          disabled={pending || position === total - 1}
          onClick={() => move("down")}
          className="w-full rounded-lg border border-stone-200 py-1 text-stone-500 disabled:opacity-30"
          aria-label="Move later in rotation"
        >
          ▼
        </button>
      </div>

      <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-stone-100">
        {ad.media_type === "video" ? (
          <video src={ad.public_url} muted playsInline className="h-full w-full object-cover" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ad.public_url} alt={ad.title} className="h-full w-full object-cover" />
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-stone-900">{ad.title}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${MEDIA_BADGE[ad.media_type]}`}>
              {ad.media_type}
            </span>
            {ad.duration_seconds != null && (
              <span className="text-xs text-stone-400">{ad.duration_seconds.toFixed(1)}s</span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-stone-400">
            {ad.is_active ? "Showing in rotation" : "Hidden from display"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={toggleActive}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
              ad.is_active ? "bg-stone-100 text-stone-600 hover:bg-stone-200" : "bg-orange-500 text-white hover:bg-orange-600"
            }`}
          >
            {ad.is_active ? "Disable" : "Enable"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={remove}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  );
}
