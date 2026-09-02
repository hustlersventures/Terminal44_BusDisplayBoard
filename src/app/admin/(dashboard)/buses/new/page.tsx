import { getDistinctBays } from "@/lib/actions/buses";
import BusForm from "../BusForm";
import { createArrivalFormAction } from "../formActions";

export const dynamic = "force-dynamic";

export default async function NewArrivalPage() {
  const existingBays = await getDistinctBays();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-stone-900">Add New Arrival</h1>
      <BusForm
        mode="new"
        action={createArrivalFormAction}
        existingBays={existingBays}
        submitLabel="Save Arrival"
      />
    </div>
  );
}
