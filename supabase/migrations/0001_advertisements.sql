-- BusDisplay: advertisement management
-- Adds exactly one new table + one new storage bucket for the ad rotation
-- feature. Does not touch any other table in this shared project.

begin;

create table if not exists public.bus_advertisements (
  id uuid not null default gen_random_uuid(),
  title text not null,
  media_type text not null,
  storage_path text not null,
  public_url text not null,
  duration_seconds numeric null,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint bus_advertisements_pkey primary key (id),
  constraint bus_advertisements_media_type_check check (
    media_type = any (array['image'::text, 'gif'::text, 'video'::text])
  ),
  constraint bus_advertisements_duration_check check (
    -- videos must carry a measured duration capped at 20s; images/gifs
    -- don't need one (they use the configured default ad duration).
    (media_type = 'video' and duration_seconds is not null and duration_seconds > 0 and duration_seconds <= 20)
    or (media_type <> 'video')
  )
);

alter table public.bus_advertisements enable row level security;

drop policy if exists "Anyone can read active bus_advertisements" on public.bus_advertisements;
create policy "Anyone can read active bus_advertisements"
  on public.bus_advertisements
  for select
  to anon, authenticated
  using (is_active = true);

-- Admin writes go through the server using the service role key, which
-- bypasses RLS entirely, so no anon/authenticated write policies are added.

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'bus_advertisements'
  ) then
    execute 'alter publication supabase_realtime add table public.bus_advertisements';
  end if;
end $$;

insert into storage.buckets (id, name, public)
values ('bus_advertisements', 'bus_advertisements', true)
on conflict (id) do nothing;

drop policy if exists "Public read access for advertisement media" on storage.objects;
create policy "Public read access for advertisement media"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'bus_advertisements');

commit;
