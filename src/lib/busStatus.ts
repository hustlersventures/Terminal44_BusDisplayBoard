import { ROTATION } from "@/lib/constants";
import type { BusStatus } from "@/lib/types";

const STATUS_ORDER: Record<BusStatus, number> = { arrived: 0, leaving_soon: 1, departed: 2 };

/**
 * Status is time-driven, not manually stepped through — there's no
 * "Scheduled"/"Boarding" state to pick anymore. A bus is "Arrived" the
 * moment it's added, automatically advances to "Leaving Soon" inside the
 * configured window before its scheduled departure, and to "Departed" once
 * that time passes. This is computed fresh wherever a bus is displayed (no
 * cron/background job).
 *
 * The stored status is a floor, not the whole answer: time can always push
 * it forward (arrived → leaving_soon → departed), but never pulls it
 * backward. Without that rule, manually setting "Leaving Soon" early would
 * look like it silently failed the moment the page next reloaded and time
 * alone still said "Arrived".
 */
export function computeDisplayStatus(bus: { status: BusStatus; scheduled_departure: string }): BusStatus {
  const departureMs = new Date(bus.scheduled_departure).getTime();
  const leavingSoonMs = departureMs - ROTATION.LEAVING_SOON_MINUTES * 60_000;
  const now = Date.now();

  let autoStatus: BusStatus = "arrived";
  if (now >= departureMs) autoStatus = "departed";
  else if (now >= leavingSoonMs) autoStatus = "leaving_soon";

  return STATUS_ORDER[bus.status] >= STATUS_ORDER[autoStatus] ? bus.status : autoStatus;
}
