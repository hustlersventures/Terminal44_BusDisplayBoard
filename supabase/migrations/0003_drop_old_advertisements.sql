-- Cleanup: the table/bucket were renamed advertisements -> bus_advertisements
-- (0001 recreated under the new name rather than renaming in place, since
-- editing a migration file doesn't retroactively rename anything already
-- applied). The old table was confirmed empty before this ran.
--
-- The old storage bucket is dropped separately via scripts/drop-old-bucket.mjs
-- using the Storage API — Supabase blocks direct SQL deletes on
-- storage.buckets ("Use the Storage API instead").

begin;

drop table if exists public.advertisements;

commit;
