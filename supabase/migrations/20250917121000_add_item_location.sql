-- Add geolocation fields to items
alter table public.items
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

create index if not exists items_latitude_idx on public.items (latitude);
create index if not exists items_longitude_idx on public.items (longitude);

