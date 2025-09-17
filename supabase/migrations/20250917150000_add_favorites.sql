-- Favorites: table de favoris utilisateur → objet
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint favorites_user_item_unique unique (user_id, item_id)
);

-- Index pour accélérer les requêtes
create index if not exists idx_favorites_user on public.favorites(user_id);
create index if not exists idx_favorites_item on public.favorites(item_id);

-- RLS (décommentez en production)
-- alter table public.favorites enable row level security;
-- create policy "Favoris: lecture par l'utilisateur" on public.favorites
--   for select using (auth.uid() = user_id);
-- create policy "Favoris: insertion par l'utilisateur" on public.favorites
--   for insert with check (auth.uid() = user_id);
-- create policy "Favoris: suppression par l'utilisateur" on public.favorites
--   for delete using (auth.uid() = user_id);


