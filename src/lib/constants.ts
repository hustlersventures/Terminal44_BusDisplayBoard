/**
 * Hardcoded display-rotation timings. Kept in one place so the rotation
 * logic (src/app/display/DisplayBoard.tsx) can be tuned later without
 * touching the state machine itself.
 */
export const ROTATION = {
  /** How long the bus/bay grid is shown before rotating to an ad. */
  BUS_DISPLAY_MS: 10_000,
  /** Fallback duration for image/GIF ads (no intrinsic playback length). */
  DEFAULT_AD_MS: 5_000,
  /** Hard cap enforced both client-side (upload) and DB-side (CHECK constraint). */
  MAX_VIDEO_DURATION_S: 20,
  /** Bus rows per display page — the board paginates instead of overflowing/shrinking. */
  BUS_PAGE_SIZE: 6,
  /** How long a bus stays visible (as "Departed") after being marked departed, before its row is removed. */
  DEPARTED_GRACE_MS: 2 * 60 * 1000,
} as const;

export const SESSION_COOKIE_NAME = "t44_admin_session";
export const SESSION_DURATION_SECONDS = 60 * 60 * 12; // 12 hours

export const BUS_ADVERTISEMENTS_BUCKET = "bus_advertisements";

export const MAX_UPLOAD_BYTES = {
  image: 8 * 1024 * 1024, // 8MB
  gif: 12 * 1024 * 1024, // 12MB
  video: 40 * 1024 * 1024, // 40MB (short clips only, duration-capped anyway)
} as const;
