create table public.bus_bay_display (
  id uuid not null default gen_random_uuid (),
  bay text not null,
  bus_number text not null,
  operator_name text not null,
  route_from text not null,
  route_to text not null,
  route_via text null,
  scheduled_arrival timestamp with time zone not null,
  scheduled_departure timestamp with time zone not null,
  status text not null default 'scheduled'::text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint bus_bay_display_pkey primary key (id),
  constraint bus_bay_display_status_check check (
    (
      status = any (
        array[
          'scheduled'::text,
          'approaching'::text,
          'boarding'::text,
          'at_terminal'::text,
          'departed'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;