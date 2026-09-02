"use client";

import { useEffect, useState } from "react";

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

  if (!now) return <span className="tabular-nums opacity-0">--:--:--</span>;

  return (
    <span className="tabular-nums">
      {now.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour12: true })}
    </span>
  );
}
