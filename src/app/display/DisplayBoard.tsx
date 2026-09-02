"use client";

import { useEffect, useMemo, useState } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { fetchDisplayAds, fetchDisplayBuses } from "@/lib/data/display";
import { ROTATION } from "@/lib/constants";
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

  const totalBusPages = Math.max(1, Math.ceil(buses.length / ROTATION.BUS_PAGE_SIZE));
  // Clamped for rendering/scheduling — the bus list can shrink (realtime)
  // out from under a busPage that was valid when it was set.
  const safeBusPage = busPage < totalBusPages ? busPage : 0;
  const currentBusPage = buses.slice(
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

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-white">
      <header className="flex items-center justify-between bg-orange-500 px-5 py-3 text-white md:px-8 md:py-4">
        <div>
          <p className="text-xs font-semibold tracking-widest opacity-80 md:text-sm">TERMINAL 44</p>
          <h1 className="text-xl font-extrabold md:text-3xl">Bus Bay Arrivals</h1>
        </div>
        <div className="text-xl font-bold md:text-3xl">
          <Clock />
        </div>
      </header>

      {phase === "bus" || !activeAd ? (
        <BusGrid buses={currentBusPage} />
      ) : (
        <AdSlide ad={activeAd} onVideoEnded={advanceFromVideoEnd} />
      )}

      {totalBusPages > 1 && phase === "bus" && (
        <div className="flex items-center justify-center gap-1.5 bg-orange-50 py-2">
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
