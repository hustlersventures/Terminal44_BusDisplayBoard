import { getDistinctBays } from "@/lib/actions/buses";
import { getCities } from "@/lib/actions/cities";
import BusForm from "../BusForm";
import { createArrivalFormAction } from "../formActions";

export const dynamic = "force-dynamic";

export default async function NewArrivalPage() {
  const [existingBays, cities] = await Promise.all([getDistinctBays(), getCities()]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-stone-900">Add New Arrival</h1>
      <BusForm action={createArrivalFormAction} existingBays={existingBays} cities={cities} />
    </div>
  );
}
