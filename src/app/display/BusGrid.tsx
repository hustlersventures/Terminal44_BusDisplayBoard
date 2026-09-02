import { STATUS_LABELS, type BusBayDisplay, type BusStatus } from "@/lib/types";
import { formatIstTime } from "@/lib/datetime";

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
    <div className="flex-1 overflow-hidden">
      {/* Table layout — used from tablet width up, and this is what the TV renders. */}
      <table className="hidden w-full table-fixed border-separate border-spacing-0 sm:table">
        <thead>
          <tr className="text-left text-orange-700">
            <th className="w-[10%] bg-orange-100 px-4 py-3 text-lg font-bold md:text-2xl">Bay</th>
            <th className="w-[16%] bg-orange-100 px-4 py-3 text-lg font-bold md:text-2xl">Bus No.</th>
            <th className="w-[18%] bg-orange-100 px-4 py-3 text-lg font-bold md:text-2xl">Operator</th>
            <th className="w-[26%] bg-orange-100 px-4 py-3 text-lg font-bold md:text-2xl">Route</th>
            <th className="w-[12%] bg-orange-100 px-4 py-3 text-lg font-bold md:text-2xl">Arrival</th>
            <th className="w-[12%] bg-orange-100 px-4 py-3 text-lg font-bold md:text-2xl">Departure</th>
            <th className="w-[14%] bg-orange-100 px-4 py-3 text-lg font-bold md:text-2xl">Status</th>
          </tr>
        </thead>
        <tbody>
          {buses.map((bus, i) => (
            <tr key={bus.id} className={i % 2 === 0 ? "bg-white" : "bg-orange-50/60"}>
              <td className="px-4 py-4 text-2xl font-extrabold text-orange-600 md:py-5 md:text-4xl">
                {bus.bay}
              </td>
              <td className="px-4 py-4 text-xl font-bold text-stone-900 md:py-5 md:text-3xl">
                {bus.bus_number}
              </td>
              <td className="px-4 py-4 text-lg text-stone-700 md:py-5 md:text-2xl">{bus.operator_name}</td>
              <td className="px-4 py-4 text-lg text-stone-700 md:py-5 md:text-2xl">
                {bus.route_from} → {bus.route_to}
                {bus.route_via && (
                  <span className="block text-base text-stone-400 md:text-lg">via {bus.route_via}</span>
                )}
              </td>
              <td className="px-4 py-4 text-lg text-stone-700 md:py-5 md:text-2xl">
                {formatIstTime(bus.scheduled_arrival)}
              </td>
              <td className="px-4 py-4 text-lg text-stone-700 md:py-5 md:text-2xl">
                {formatIstTime(bus.scheduled_departure)}
              </td>
              <td className="px-4 py-4 md:py-5">
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-base font-semibold text-stone-700 shadow-sm md:text-xl">
                  <span className={`h-2.5 w-2.5 rounded-full md:h-3 md:w-3 ${STATUS_DOT[bus.status]}`} />
                  {STATUS_LABELS[bus.status]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Card layout — phones */}
      <ul className="flex flex-col gap-3 p-3 sm:hidden">
        {buses.map((bus) => (
          <li key={bus.id} className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-orange-500 px-2.5 py-1 text-base font-bold text-white">
                Bay {bus.bay}
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-600">
                <span className={`h-2 w-2 rounded-full ${STATUS_DOT[bus.status]}`} />
                {STATUS_LABELS[bus.status]}
              </span>
            </div>
            <p className="mt-2 text-lg font-bold text-stone-900">{bus.bus_number}</p>
            <p className="text-sm text-stone-600">{bus.operator_name}</p>
            <p className="mt-1 text-sm text-stone-500">
              {bus.route_from} → {bus.route_to}
            </p>
            <p className="mt-1 text-xs text-stone-400">
              Arr {formatIstTime(bus.scheduled_arrival)} · Dep {formatIstTime(bus.scheduled_departure)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
