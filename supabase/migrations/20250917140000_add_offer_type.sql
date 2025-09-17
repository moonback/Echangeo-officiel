-- Ajouter le type d'offre aux items (prêt ou troc)
alter table public.items
  add column if not exists offer_type text default 'loan' check (offer_type in ('loan', 'trade'));

-- Ajouter un champ pour ce que l'utilisateur recherche en échange (pour les trocs)
alter table public.items
  add column if not exists desired_items text;

-- Modifier la contrainte de catégorie pour inclure les services
alter table public.items
  drop constraint if exists items_category_check;

alter table public.items
  add constraint items_category_check 
  check (category in ('tools', 'electronics', 'books', 'sports', 'kitchen', 'garden', 'toys', 'services', 'other'));

-- Index pour améliorer les performances
create index if not exists items_offer_type_idx on public.items (offer_type);

-- Commentaires pour clarifier
comment on column public.items.offer_type is 'Type d''offre: loan (prêt) ou trade (troc)';
comment on column public.items.desired_items is 'Ce que l''utilisateur recherche en échange pour un troc';
