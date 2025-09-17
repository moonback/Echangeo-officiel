-- Add additional, pertinent fields to items
alter table public.items
  add column if not exists brand text,
  add column if not exists model text,
  add column if not exists estimated_value numeric,
  add column if not exists tags text[] default '{}'::text[],
  add column if not exists available_from date,
  add column if not exists available_to date,
  add column if not exists location_hint text;

-- Optional helpful indexes
create index if not exists items_brand_idx on public.items (brand);
create index if not exists items_model_idx on public.items (model);
create index if not exists items_available_from_idx on public.items (available_from);
create index if not exists items_available_to_idx on public.items (available_to);

