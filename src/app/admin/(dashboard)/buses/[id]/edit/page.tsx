import { notFound } from "next/navigation";
import { getBusById, getDistinctBays } from "@/lib/actions/buses";
import { isoToIstInput } from "@/lib/datetime";
import BusForm from "../../BusForm";
import { updateArrivalFormAction } from "../../formActions";

export default async function EditArrivalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [bus, existingBays] = await Promise.all([getBusById(id), getDistinctBays()]);

  if (!bus) notFound();

  const boundAction = updateArrivalFormAction.bind(null, id);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-stone-900">Edit Arrival</h1>
      <BusForm
        mode="edit"
        action={boundAction}
        existingBays={existingBays}
        submitLabel="Save Changes"
        initialValues={{
          bay: bus.bay,
          bus_number: bus.bus_number,
          operator_name: bus.operator_name,
          route_from: bus.route_from,
          route_to: bus.route_to,
          route_via: bus.route_via ?? "",
          scheduled_arrival: isoToIstInput(bus.scheduled_arrival),
          scheduled_departure: isoToIstInput(bus.scheduled_departure),
          status: bus.status,
        }}
      />
    </div>
  );
}
