import { STATUS_LABELS, type BusBayDisplay, type BusStatus } from "@/lib/types";
import { formatIstTime } from "@/lib/datetime";
import SplitFlap from "./SplitFlap";

const STATUS_DOT: Record<BusStatus, string> = {
  scheduled: "bg-stone-400",
  approaching: "bg-sky-500",
  boarding: "bg-amber-500",
  at_terminal: "bg-orange-500",
  departed: "bg-stone-300",
};

export default function BusGrid({ buses }: { buses: BusBayDisplay[] }) {
  if (buses.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-2xl font-medium text-stone-400 md:text-4xl">
          No buses currently at Terminal 44
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Table layout — used from tablet width up, and this is what the TV renders.
          h-full + the browser's default table row-height algorithm distributes any
          leftover vertical space evenly across rows, so every bus fits on screen at
          once, on any device, with no scroll or pagination. */}
      <table className="hidden h-full w-full table-fixed border-separate border-spacing-0 md:table">
        <thead>
          <tr className="text-left text-orange-700">
            <th className="w-[10%] bg-orange-100 px-4 py-2 text-sm font-bold md:text-lg">Bay</th>
            <th className="w-[16%] bg-orange-100 px-4 py-2 text-sm font-bold md:text-lg">Bus No.</th>
            <th className="w-[18%] bg-orange-100 px-4 py-2 text-sm font-bold md:text-lg">Operator</th>
            <th className="w-[26%] bg-orange-100 px-4 py-2 text-sm font-bold md:text-lg">Route</th>
            <th className="w-[12%] bg-orange-100 px-4 py-2 text-sm font-bold md:text-lg">Arrival</th>
            <th className="w-[12%] bg-orange-100 px-4 py-2 text-sm font-bold md:text-lg">Departure</th>
            <th className="w-[14%] bg-orange-100 px-4 py-2 text-sm font-bold md:text-lg">Status</th>
          </tr>
        </thead>
        <tbody>
          {buses.map((bus, i) => (
            <tr key={bus.id} className={i % 2 === 0 ? "bg-white" : "bg-orange-50/60"}>
              <td className="px-4 py-1 md:py-2">
                <SplitFlap text={bus.bay} size="md" />
              </td>
              <td className="overflow-hidden px-4 py-1 md:py-2">
                <SplitFlap text={bus.bus_number} size="sm" className="max-w-full overflow-hidden" />
              </td>
              <td className="overflow-hidden px-4 py-1 text-sm text-ellipsis whitespace-nowrap text-stone-700 md:py-2 md:text-lg">
                {bus.operator_name}
              </td>
              <td className="overflow-hidden px-4 py-1 text-sm text-ellipsis whitespace-nowrap text-stone-700 md:py-2 md:text-lg">
                {bus.route_from} → {bus.route_to}
                {bus.route_via && (
                  <span className="block text-xs text-stone-400 md:text-sm">via {bus.route_via}</span>
                )}
              </td>
              <td className="px-4 py-1 text-sm text-stone-700 md:py-2 md:text-lg">
                {formatIstTime(bus.scheduled_arrival)}
              </td>
              <td className="px-4 py-1 text-sm text-stone-700 md:py-2 md:text-lg">
                {formatIstTime(bus.scheduled_departure)}
              </td>
              <td className="px-4 py-1 md:py-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-stone-700 shadow-sm md:text-sm">
                  <span className={`h-2 w-2 rounded-full md:h-2.5 md:w-2.5 ${STATUS_DOT[bus.status]}`} />
                  {STATUS_LABELS[bus.status]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Card layout — phones. Each card shares the screen height equally
          (flex-1 per card) so the full list fits with no scroll here either. */}
      <ul className="flex h-full flex-col gap-1.5 overflow-hidden p-1.5 md:hidden">
        {buses.map((bus) => (
          <li
            key={bus.id}
            className="flex flex-1 flex-col justify-center overflow-hidden rounded-xl border border-orange-100 bg-white px-3 py-1"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-stone-500">BAY</span>
                <SplitFlap text={bus.bay} size="sm" />
              </div>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-600">
                <span className={`h-2 w-2 rounded-full ${STATUS_DOT[bus.status]}`} />
                {STATUS_LABELS[bus.status]}
              </span>
            </div>
            <p className="mt-1">
              <SplitFlap text={bus.bus_number} size="sm" />
            </p>
            <p className="mt-1 truncate text-sm text-stone-600">{bus.operator_name}</p>
            <p className="truncate text-sm text-stone-500">
              {bus.route_from} → {bus.route_to}
            </p>
            <p className="truncate text-xs text-stone-400">
              Arr {formatIstTime(bus.scheduled_arrival)} · Dep {formatIstTime(bus.scheduled_departure)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
