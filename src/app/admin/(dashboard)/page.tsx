import Link from "next/link";
import { getActiveBuses } from "@/lib/actions/buses";
import BusCard from "./BusCard";

// Admin must always see current DB state, never a build-time snapshot.
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const buses = await getActiveBuses();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-stone-900">Live Buses ({buses.length})</h1>
      </div>

      <Link
        href="/admin/buses/new"
        className="rounded-2xl bg-orange-500 px-5 py-4 text-center text-base font-semibold text-white shadow-md shadow-orange-200 transition active:scale-[0.98] hover:bg-orange-600"
      >
        + Add New Arrival
      </Link>

      {buses.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-stone-300 px-4 py-10 text-center text-sm text-stone-500">
          No buses are currently on the display board.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {buses.map((bus) => (
            <BusCard key={bus.id} bus={bus} />
          ))}
        </ul>
      )}
    </div>
  );
}
