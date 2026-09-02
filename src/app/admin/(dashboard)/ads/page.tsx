import Link from "next/link";
import { getAllBusAdvertisements } from "@/lib/actions/ads";
import AdCard from "./AdCard";

export const dynamic = "force-dynamic";

export default async function AdsPage() {
  const ads = await getAllBusAdvertisements();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-stone-900">Advertisements ({ads.length})</h1>

      <Link
        href="/admin/ads/new"
        className="rounded-2xl bg-orange-500 px-5 py-4 text-center text-base font-semibold text-white shadow-md shadow-orange-200 transition active:scale-[0.98] hover:bg-orange-600"
      >
        + Upload Advertisement
      </Link>

      <p className="text-xs text-stone-400">
        This is the order ads will rotate in on the display board. Use ▲ ▼ to reorder.
      </p>

      {ads.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-stone-300 px-4 py-10 text-center text-sm text-stone-500">
          No advertisements uploaded yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {ads.map((ad, index) => (
            <AdCard key={ad.id} ad={ad} position={index} total={ads.length} />
          ))}
        </ul>
      )}
    </div>
  );
}
