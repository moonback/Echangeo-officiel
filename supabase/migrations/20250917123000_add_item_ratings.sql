create table if not exists public.item_ratings (
  id uuid primary key default uuid_generate_v4(),
  item_id uuid not null references public.items(id) on delete cascade,
  rater_id uuid not null references public.profiles(id) on delete cascade,
  score int2 not null check (score between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create unique index if not exists item_ratings_unique_per_user on public.item_ratings(item_id, rater_id);
create index if not exists item_ratings_item_idx on public.item_ratings(item_id);
create index if not exists item_ratings_rater_idx on public.item_ratings(rater_id);

