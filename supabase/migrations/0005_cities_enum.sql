-- BusDisplay: replace the `cities` lookup table with a Postgres enum type.
-- No more auxiliary tables for this — a fixed, curated list like "cities we
-- serve" is exactly what an enum is for. Trade-off (inherent to Postgres,
-- not a choice here): enum values can be ADDED but never REMOVED — there
-- is no `ALTER TYPE ... DROP VALUE`. The admin Cities page reflects that:
-- add-only, no delete.
--
-- Named bus_route_city (not just "city_enum") on purpose — this shared
-- project already has an unrelated public.city_enum used by
-- parking_locations.city; a same-named type would have collided with it
-- (it did, briefly, during development — see git history).
--
-- No DB-side functions here by design: listing/adding enum values happens
-- entirely in application code (src/lib/actions/cities.ts) via a direct
-- Postgres connection, since PostgREST/supabase-js can't query or alter a
-- type without one.
--
-- route_from/route_to on bus_bay_display stay plain `text` — this enum is
-- the admin UI's source of truth for the dropdown, not a column type, so
-- the shared production table itself is untouched.

begin;

-- Cleanup: an earlier draft of this migration collided with the shared
-- city_enum type and added two RPC functions on top of it before that was
-- caught. Both are dropped here — no DB functions in this design, and
-- these specifically pointed at the wrong (unrelated) enum.
drop function if exists public.get_cities();
drop function if exists public.add_city(text);

create type public.bus_route_city as enum (
  'Bangalore', 'Chennai', 'Goa', 'Hyderabad', 'Mangalore',
  'Mumbai', 'Pune', 'Tirupati', 'Vijayawada', 'Visakhapatnam'
);

drop table if exists public.cities;

commit;
