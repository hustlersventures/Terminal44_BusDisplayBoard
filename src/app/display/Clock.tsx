"use client";

import { useEffect, useState } from "react";
import SplitFlap from "./SplitFlap";

// Isolated in its own component so its once-a-second re-render never
// touches the rotation state machine in DisplayBoard.
export default function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    const kick = setTimeout(tick, 0); // first tick just after mount, client-only
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(kick);
      clearInterval(id);
    };
  }, []);

  const time = now
    ? now.toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "--:--:--";
  const date = now
    ? now.toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <div className={`flex items-center gap-2 ${now ? "" : "opacity-0"}`}>
      <p className="text-xs font-semibold tracking-wide opacity-80 md:text-sm">{date}</p>
      <SplitFlap text={time} size="md" tone="inverted" />
    </div>
  );
}
