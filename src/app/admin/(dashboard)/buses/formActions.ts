"use server";

import { redirect } from "next/navigation";
import { createArrival, updateArrival } from "@/lib/actions/buses";
import type { BusArrivalInput } from "@/lib/validation";
import type { BusStatus } from "@/lib/types";

export interface FormState {
  error?: string;
}

function buildInput(formData: FormData): BusArrivalInput {
  return {
    bay: String(formData.get("bay") ?? ""),
    bus_number: String(formData.get("bus_number") ?? ""),
    operator_name: String(formData.get("operator_name") ?? ""),
    route_from: String(formData.get("route_from") ?? ""),
    route_to: String(formData.get("route_to") ?? ""),
    route_via: String(formData.get("route_via") ?? "") || null,
    scheduled_arrival: String(formData.get("scheduled_arrival") ?? ""),
    scheduled_departure: String(formData.get("scheduled_departure") ?? ""),
    status: String(formData.get("status") ?? "scheduled") as BusStatus,
  };
}

export async function createArrivalFormAction(
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const result = await createArrival(buildInput(formData));
  if (!result.ok) return { error: result.error };
  redirect("/admin");
}

export async function updateArrivalFormAction(
  id: string,
  _prev: FormState | undefined,
  formData: FormData,
): Promise<FormState> {
  const result = await updateArrival(id, buildInput(formData));
  if (!result.ok) return { error: result.error };
  redirect("/admin");
}
