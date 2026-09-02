-- BusDisplay: let a video opt into playing its full (<=20s) length instead
-- of the default 5s ad slot that images/GIFs/videos all use by default.

begin;

alter table public.bus_advertisements
  add column if not exists play_full_duration boolean not null default false;

commit;
