-- BusDisplay: simplify bus_bay_display.status from 5 values down to 3 —
-- arrived / leaving_soon / departed. The old "Scheduled"/"Approaching"
-- pre-arrival states don't apply anymore (adding an arrival already means
-- the bus is physically at the terminal), and "Boarding" is folded into
-- "Leaving Soon". This table belongs solely to this app (unlike most of
-- this shared project), so tightening its own CHECK constraint is safe.

begin;

alter table public.bus_bay_display drop constraint if exists bus_bay_display_status_check;

update public.bus_bay_display set status = 'arrived' where status in ('scheduled', 'approaching', 'at_terminal');
update public.bus_bay_display set status = 'leaving_soon' where status = 'boarding';
-- 'departed' rows are already correct.

alter table public.bus_bay_display add constraint bus_bay_display_status_check
  check (status = any (array['arrived'::text, 'leaving_soon'::text, 'departed'::text]));

commit;
