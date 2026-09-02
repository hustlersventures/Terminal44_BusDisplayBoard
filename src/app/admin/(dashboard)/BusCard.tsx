"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setBusStatus } from "@/lib/actions/buses";
import { computeDisplayStatus } from "@/lib/busStatus";
import { formatIstTime } from "@/lib/datetime";
import { BUS_STATUSES, STATUS_LABELS, type BusBayDisplay, type BusStatus } from "@/lib/types";

const STATUS_ACTIVE_STYLES: Record<BusStatus, string> = {
  arrived: "bg-orange-500 text-white",
  leaving_soon: "bg-amber-500 text-white",
  departed: "bg-stone-500 text-white",
};

export default function BusCard({ bus }: { bus: BusBayDisplay }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const displayStatus = computeDisplayStatus(bus);

  function handleStatusChange(status: BusStatus) {
    if (status === "departed" && !confirm(`Mark ${bus.bus_number} as departed? It will leave the live display.`)) {
      return;
    }
    startTransition(async () => {
      await setBusStatus(bus.id, status);
      router.refresh();
    });
  }

  return (
    <li className="rounded-2xl border border-stone-200 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="rounded-lg bg-orange-500 px-2 py-1 text-xs font-bold text-white">Bay {bus.bay}</span>
        <span className="text-base font-bold text-stone-900">{bus.bus_number}</span>
      </div>
      <p className="mt-1 text-sm text-stone-600">
        {bus.operator_name} · {bus.route_from} → {bus.route_to}
      </p>
      <p className="text-xs text-stone-400">
        Arr {formatIstTime(bus.scheduled_arrival)} · Dep {formatIstTime(bus.scheduled_departure)}
      </p>

      <div className="mt-2 flex gap-1.5">
        {BUS_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            disabled={pending}
            onClick={() => handleStatusChange(s)}
            className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
              displayStatus === s ? STATUS_ACTIVE_STYLES[s] : "bg-stone-100 text-stone-500 hover:bg-stone-200"
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>
    </li>
  );
}
