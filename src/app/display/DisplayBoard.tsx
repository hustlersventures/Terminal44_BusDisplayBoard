"use client";

import { useEffect, useMemo, useState } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { fetchDisplayAds, fetchDisplayBuses } from "@/lib/data/display";
import { ROTATION } from "@/lib/constants";
import { computeDisplayStatus } from "@/lib/busStatus";
import type { Advertisement, BusBayDisplay } from "@/lib/types";
import BusGrid from "./BusGrid";
import AdSlide from "./AdSlide";
import Clock from "./Clock";

type Phase = "bus" | "ad";

export default function DisplayBoard({
  initialBuses,
  initialAds,
}: {
  initialBuses: BusBayDisplay[];
  initialAds: Advertisement[];
}) {
  const supabase = useMemo(() => createPublicClient(), []);

  const [buses, setBuses] = useState(initialBuses);
  const [ads, setAds] = useState(initialAds);

  const [phase, setPhase] = useState<Phase>("bus");
  const [busPage, setBusPage] = useState(0);
  const [adIndex, setAdIndex] = useState(0);
  // Refreshed every few seconds purely to force a re-check of the
  // departed-grace filter below — no DB write happens the moment a grace
  // window elapses, so nothing else would otherwise trigger that row's
  // removal right on time. Starts null (not Date.now()) so the first render
  // stays pure/SSR-safe; set from an effect instead.
  const [nowMs, setNowMs] = useState<number | null>(null);

  // --- Realtime sync: any change on either table triggers a fresh fetch. ---
  // Simplest reliable approach for a handful of rows — no manual patching,
  // no polling.
  useEffect(() => {
    const channel = supabase
      .channel("display-board")
      .on("postgres_changes", { event: "*", schema: "public", table: "bus_bay_display" }, () => {
        fetchDisplayBuses(supabase).then(setBuses).catch(console.error);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "bus_advertisements" }, () => {
        fetchDisplayAds(supabase).then(setAds).catch(console.error);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  useEffect(() => {
    const update = () => setNowMs(Date.now());
    update();
    const id = setInterval(update, 15_000);
    return () => clearInterval(id);
  }, []);

  // A bus marked "departed" keeps showing for DEPARTED_GRACE_MS after that,
  // then its row drops off the board entirely.
  const visibleBuses = useMemo(() => {
    if (nowMs === null) return buses;
    const cutoff = nowMs - ROTATION.DEPARTED_GRACE_MS;
    return buses.filter((bus) => bus.status !== "departed" || new Date(bus.updated_at).getTime() >= cutoff);
  }, [buses, nowMs]);

  const totalBusPages = Math.max(1, Math.ceil(visibleBuses.length / ROTATION.BUS_PAGE_SIZE));
  // Clamped for rendering/scheduling — the bus list can shrink (realtime)
  // out from under a busPage that was valid when it was set.
  const safeBusPage = busPage < totalBusPages ? busPage : 0;
  const currentBusPage = visibleBuses.slice(
  const currentBusPage = visibleBuses.slice(
    safeBusPage * ROTATION.BUS_PAGE_SIZE,
    safeBusPage * ROTATION.BUS_PAGE_SIZE + ROTATION.BUS_PAGE_SIZE,
  );

  // --- Bus phase: show the current page for BUS_DISPLAY_MS, then advance
  // to the next page, or — once every page has had its turn — hand off to
  // the ad rotation (if any ads are active). ---
  useEffect(() => {
    if (phase !== "bus") return;
    const id = setTimeout(() => {
      const next = safeBusPage + 1;
      if (next < totalBusPages) {
        setBusPage(next);
      } else {
        setBusPage(0);
        if (ads.length > 0) setPhase("ad");
      }
    }, ROTATION.BUS_DISPLAY_MS);
    return () => clearTimeout(id);
  }, [phase, safeBusPage, totalBusPages, ads.length]);

  const activeAd = ads.length > 0 ? ads[adIndex % ads.length] : null;

  // --- Ad phase: show the current ad for its configured/measured duration. ---
  useEffect(() => {
    if (phase !== "ad") return;
    if (!activeAd) {
      const id = setTimeout(() => setPhase("bus"), 0);
      return () => clearTimeout(id);
    }
    // Images, GIFs, and videos all default to the same 5s slot — a video
    // only gets its full (<=20s) measured length when explicitly opted in.
    const durationMs =
      activeAd.media_type === "video" && activeAd.play_full_duration
        ? Math.min(activeAd.duration_seconds ?? ROTATION.DEFAULT_AD_MS / 1000, ROTATION.MAX_VIDEO_DURATION_S) * 1000
        : ROTATION.DEFAULT_AD_MS;
    const id = setTimeout(() => {
      setAdIndex((i) => i + 1);
      setPhase("bus");
    }, durationMs);
    return () => clearTimeout(id);
  }, [phase, activeAd]);

  function advanceFromVideoEnd() {
    setAdIndex((i) => i + 1);
    setPhase("bus");
  }

  const showingAd = phase === "ad" && !!activeAd;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-white">
      {!showingAd && (
        <header className="flex items-center justify-between bg-orange-500 px-4 py-1.5 text-white md:px-6 md:py-2">
          <div>
            <p className="text-[10px] font-semibold tracking-widest opacity-80 md:text-xs">TERMINAL 44</p>
            <h1 className="text-base font-extrabold md:text-xl">Bus Bay Arrivals</h1>
          </div>
          <Clock />
        </header>
      )}

      {!showingAd ? (
        <BusGrid buses={currentBusPage} />
      ) : (
        <AdSlide ad={activeAd} onVideoEnded={advanceFromVideoEnd} />
      )}

      {totalBusPages > 1 && phase === "bus" && (
        <div className="flex items-center justify-center gap-1.5 bg-orange-50 py-1.5">
          {Array.from({ length: totalBusPages }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-6 rounded-full ${i === safeBusPage ? "bg-orange-500" : "bg-orange-200"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
