# Terminal 44 — Bus Display Board

A mobile-first admin portal + public live display board for tracking which bus is in which
bay at Terminal 44, built on Next.js (App Router) and the existing shared Supabase project.

Petpooja/order-tagging integration is intentionally out of scope for this app — see
`Terminal 44 Bus Bay & Order Tracking.md` for that separate, longer-term system.

## What's here

- **`/admin`** — mobile-first admin portal (login, live bus list, add/edit arrivals,
  advertisement management). Protected by a signed session cookie; not Supabase Auth.
- **`/display`** — public, unauthenticated live board. Rotates between the bus/bay grid and
  the advertisement sequence, and stays in sync via Supabase Realtime (no polling).
- **`/`** — simple landing page linking to both.

## Database

This app reuses the **existing** `bus_bay_display` table in the shared Fleetzen Supabase
project (see `current_schema.sql`) — it is not a dedicated database for this app, so
migrations only ever add what's genuinely new and never touch unrelated tables.

The one addition, in `supabase/migrations/0001_bus_advertisements.sql`:

- `public.bus_advertisements` table (image/gif/video, display order, active flag, measured
  video duration with a DB-level `CHECK` capping it at 20s).
- `bus_advertisements` Storage bucket (public read).
- Both added to the `supabase_realtime` publication and given a public-read RLS policy,
  matching the convention already used for `bus_bay_display`.

Run a new migration with:

```bash
node -r dotenv/config scripts/run-migration.mjs supabase/migrations/000X_name.sql dotenv_config_path=.env.local
```

### Re-arrival behavior

There's no separate bus/operator master table — `bus_bay_display` is itself the history.
"Search an existing bus" looks up past rows by `bus_number` and prefills operator/route.
Saving a new arrival automatically retires (marks `departed`, `is_active=false`) any other
active row for that same bus number, so the board never shows one bus in two bays at once.

## Environment variables

Copy real values into `.env.local` (already git-ignored, alongside `.env`):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # server-only — admin writes + storage uploads
DB_HOST= DB_USER= DB_PORT= DB_PASSWORD= DB_NAME=   # only used by scripts/run-migration.mjs
ADMIN_USERNAME=admin
ADMIN_PASSWORD=terminal44@
SESSION_SECRET=                 # random string, signs the admin session cookie
```

## Running locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000/admin/login` (default: `admin` / `terminal44@`) and
`http://localhost:3000/display` in a separate tab/device to watch updates sync live.

## Rotation timing

Hardcoded in `src/lib/constants.ts` (`ROTATION`) — bus display duration, default ad
duration for images/GIFs, the 20s video cap, and bus-grid page size — all in one place so
the schedule is easy to retune without touching the state machine in
`src/app/display/DisplayBoard.tsx`.

## Deployment

Not covered here — Vercel deployment is a separate follow-up step.
