/**
 * Terminal 44 runs on India Standard Time (fixed UTC+5:30, no DST), which
 * may not match the server's local timezone in every environment. These
 * helpers do the conversion explicitly instead of relying on ambient
 * server TZ, so <input type="datetime-local"> always round-trips as IST
 * wall-clock time regardless of where the app is deployed.
 */
const IST_OFFSET_MIN = 5 * 60 + 30;

/** "YYYY-MM-DDTHH:mm" (IST wall clock, from a <input type="datetime-local">) -> UTC ISO string. */
export function istInputToIso(local: string): string {
  const [datePart, timePart] = local.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm] = timePart.split(":").map(Number);
  const asIfUtcMs = Date.UTC(y, m - 1, d, hh, mm);
  const trueUtcMs = asIfUtcMs - IST_OFFSET_MIN * 60_000;
  return new Date(trueUtcMs).toISOString();
}

/** UTC ISO string -> "YYYY-MM-DDTHH:mm" (IST wall clock) for prefilling a datetime-local input. */
export function isoToIstInput(iso: string): string {
  const shifted = new Date(new Date(iso).getTime() + IST_OFFSET_MIN * 60_000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-${pad(shifted.getUTCDate())}` +
    `T${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}`
  );
}

/** UTC ISO string -> short human time for display, e.g. "10:30 AM IST". */
export function formatIstTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** UTC ISO string -> short human date+time for display. */
export function formatIstDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
