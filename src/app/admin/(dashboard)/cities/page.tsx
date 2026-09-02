import { getCities } from "@/lib/actions/cities";
import AddCityForm from "./AddCityForm";

export const dynamic = "force-dynamic";

export default async function CitiesPage() {
  const cities = await getCities();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-stone-900">Cities ({cities.length})</h1>
      <p className="text-xs text-stone-400">
        These are the From/To options shown when adding or editing a bus arrival — a fixed
        list so routes can only be selected, not mistyped. Cities can be added here but not
        removed (Postgres enum values, once added, are permanent).
      </p>

      <AddCityForm />

      {cities.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-stone-300 px-4 py-10 text-center text-sm text-stone-500">
          No cities yet — add the first one above.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {cities.map((city) => (
            <li key={city} className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-900">
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
