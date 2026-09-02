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

The additions, in `supabase/migrations/`:

- **`0001_advertisements.sql`** — `public.bus_advertisements` table (image/gif/video,
  display order, active flag, measured video duration with a DB-level `CHECK` capping it
  at 20s) and a `bus_advertisements` Storage bucket (public read). Both added to the
  `supabase_realtime` publication and given a public-read RLS policy, matching the
  convention already used for `bus_bay_display`. (The file is named `advertisements`;
  the table inside it is `bus_advertisements` — a rename mid-build renamed the table but
  not the migration filename.)
- **`0002_ad_play_full_duration.sql`** — adds `play_full_duration` (see Rotation timing
  below).
- **`0003_drop_old_advertisements.sql`** — drops a same-session leftover `advertisements`
  table from before the rename (confirmed empty first); its matching orphaned storage
  bucket was removed separately via the Storage API, since Supabase blocks direct SQL
  deletes on `storage.buckets`.
- **`0004_cities.sql`** — superseded by `0005` below; kept for history.
- **`0005_cities_enum.sql`** — drops the `cities` table from `0004` and replaces it with a
  Postgres enum, `public.bus_route_city`, seeded with the same 10 cities. Backs the From/To
  dropdowns in the arrival form (see below). Not a foreign key on `bus_bay_display` —
  `route_from`/`route_to` there are still plain `text`; the enum only constrains what the
  admin UI lets you pick or add.

  **Naming note, worth reading before touching this:** this shared project already has an
  unrelated `public.city_enum` used by `parking_locations.city` (a different, pre-existing
  part of the system). An earlier draft of this migration used that same name and,
  because `bus_route_city`'s creation was guarded with `if not exists`, silently reused
  the existing type instead of erroring — meaning a later step nearly polluted an
  unrelated production enum before it was caught and repaired. `bus_route_city` is
  deliberately namespaced to avoid this. **Before naming any new DB object in this
  project, check it doesn't already exist for something else** — this is a big shared
  database, not one scoped to this app.

Run a new migration with:

```bash
node -r dotenv/config scripts/run-migration.mjs supabase/migrations/000X_name.sql dotenv_config_path=.env.local
```

### Re-arrival behavior

There's no separate bus/operator master table — `bus_bay_display` is itself the history.
"Search an existing bus" looks up past rows by `bus_number` and prefills operator/route.
Saving a new arrival automatically retires (marks `departed`, `is_active=false`) any other
active row for that same bus number, so the board never shows one bus in two bays at once.

### Cities (route From/To)

From/To are `<select>` dropdowns, not free text — this is deliberate: typing "Hyd" instead
of "Hyderabad" would silently fragment the data. The valid values live in a Postgres enum
(`public.bus_route_city`), not a table — there are no auxiliary tables in this project for
small curated lists like this.

There are also **no DB-side functions** (no RPCs) — PostgREST/supabase-js can't query or
extend an enum type on its own, so `src/lib/actions/cities.ts` talks to Postgres directly
via a small connection pool (`src/lib/db.ts`, using the `DB_*` env vars) instead of going
through the usual Supabase client. This is the one place in the app that does that; it's
the trade-off of "enum instead of table, no DB functions."

An admin can add a new city inline from either dropdown (auto-selected once added), or
from `/admin/cities`. **Adding is one-way** — Postgres enums have no `DROP VALUE`, so once
a city is added it's permanent; the Cities page has no delete button by design.

There's no "Via" field anymore — it was removed from the form (the `route_via` column
still exists on `bus_bay_display` for old rows, just unused going forward).

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
//test

Then open `http://localhost:3000/admin/login` (default: `admin` / `terminal44@`) and
`http://localhost:3000/display` in a separate tab/device to watch updates sync live.

## Rotation timing

Hardcoded in `src/lib/constants.ts` (`ROTATION`) — bus display duration, default ad slot
duration, the 20s video cap, and bus-grid page size — all in one place so the schedule is
easy to retune without touching the state machine in `src/app/display/DisplayBoard.tsx`.

**Default ad duration is 5s for every media type, including video.** A video only plays
its full measured length (up to the 20s cap) if `play_full_duration` is set on that ad —
toggle it at upload time or later from the advertisements list. A short video left on the
default 5s slot loops to fill it rather than freezing on its last frame.

## Gotchas

- `next.config.ts` sets `experimental.serverActions.bodySizeLimit` to `50mb` — the default
  1MB limit rejects video uploads (Server Actions carry the file as multipart FormData)
  before our own `MAX_UPLOAD_BYTES` check ever runs.
- Editing a migration file after it's been applied doesn't retroactively change the
  database — always add a new numbered migration for further changes.

## Deployment

Not covered here — Vercel deployment is a separate follow-up step.
