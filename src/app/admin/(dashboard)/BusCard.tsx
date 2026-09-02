"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setBusStatus, removeFromDisplay } from "@/lib/actions/buses";
import { formatIstTime } from "@/lib/datetime";
import { BUS_STATUSES, STATUS_LABELS, type BusBayDisplay, type BusStatus } from "@/lib/types";
import SplitFlap from "@/app/display/SplitFlap";

const STATUS_STYLES: Record<BusStatus, string> = {
  scheduled: "bg-stone-100 text-stone-700",
  approaching: "bg-sky-100 text-sky-700",
  boarding: "bg-amber-100 text-amber-800",
  at_terminal: "bg-orange-100 text-orange-800",
  departed: "bg-stone-200 text-stone-500",
};

export default function BusCard({ bus }: { bus: BusBayDisplay }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleStatusChange(status: BusStatus) {
    startTransition(async () => {
      await setBusStatus(bus.id, status);
      router.refresh();
    });
  }

  function handleRemove() {
    if (!confirm(`Remove ${bus.bus_number} from the live display?`)) return;
    startTransition(async () => {
      await removeFromDisplay(bus.id);
      router.refresh();
    });
  }

  return (
    <li className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-stone-500">BAY</span>
            <SplitFlap text={bus.bay} size="sm" />
            <SplitFlap text={bus.bus_number} size="sm" />
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[bus.status]}`}>
              {STATUS_LABELS[bus.status]}
            </span>
          </div>
          <p className="mt-2 text-sm text-stone-600">{bus.operator_name}</p>
          <p className="mt-1 text-sm text-stone-500">
            {bus.route_from} → {bus.route_to}
            {bus.route_via ? ` via ${bus.route_via}` : ""}
          </p>
          <p className="mt-1 text-xs text-stone-400">
            Arr {formatIstTime(bus.scheduled_arrival)} · Dep {formatIstTime(bus.scheduled_departure)}
          </p>
        </div>
        <Link
          href={`/admin/buses/${bus.id}/edit`}
          className="shrink-0 rounded-lg border border-orange-200 px-3 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50"
        >
          Edit
        </Link>
      </div>

      <div className="mt-3 flex items-center gap-2 border-t border-stone-100 pt-3">
        <select
          value={bus.status}
          disabled={pending}
          onChange={(e) => handleStatusChange(e.target.value as BusStatus)}
          className="flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm disabled:opacity-60"
        >
          {BUS_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={pending}
          onClick={handleRemove}
          className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
        >
          Remove
        </button>
      </div>
    </li>
  );
}
