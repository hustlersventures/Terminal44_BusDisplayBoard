import { ROTATION } from "@/lib/constants";
import type { BusStatus } from "@/lib/types";

/**
 * Status is time-driven, not manually stepped through — there's no
 * "Scheduled"/"Boarding" state to pick anymore. A bus is "Arrived" the
 * moment it's added, automatically flips to "Leaving Soon" inside the
 * configured window before its scheduled departure, and to "Departed"
 * once that time passes. This is computed fresh wherever a bus is
 * displayed (no cron/background job) — "departed" is the one terminal
 * state: once a row is actually marked departed (manually, or by the
 * sweep in getActiveBuses), it stays departed regardless of the clock.
 */
export function computeDisplayStatus(bus: { status: BusStatus; scheduled_departure: string }): BusStatus {
  if (bus.status === "departed") return "departed";

  const departureMs = new Date(bus.scheduled_departure).getTime();
  const leavingSoonMs = departureMs - ROTATION.LEAVING_SOON_MINUTES * 60_000;
  const now = Date.now();

  if (now >= departureMs) return "departed";
  if (now >= leavingSoonMs) return "leaving_soon";
  return "arrived";
}
