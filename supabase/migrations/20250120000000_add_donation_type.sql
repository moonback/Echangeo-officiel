-- Ajouter le type 'donation' aux types d'offre existants
-- Cette migration prépare l'interface pour la future fonctionnalité de dons

-- Modifier la contrainte pour inclure le nouveau type 'donation'
alter table public.items
  drop constraint if exists items_offer_type_check;

alter table public.items
  add constraint items_offer_type_check 
  check (offer_type in ('loan', 'trade', 'donation'));

-- Commentaire pour clarifier le nouveau type
comment on column public.items.offer_type is 'Type d''offre: loan (prêt), trade (troc) ou donation (don)';

-- Index pour améliorer les performances (déjà existant, mais on s'assure qu'il est à jour)
create index if not exists items_offer_type_idx on public.items (offer_type);

-- Ajouter une vue pour les statistiques par type d'offre
create or replace view public.offer_type_stats as
select 
  offer_type,
  count(*) as total_items,
  count(case when is_available = true then 1 end) as available_items,
  avg(estimated_value) as avg_value,
  count(distinct owner_id) as unique_owners
from public.items
where offer_type is not null
group by offer_type;

-- Commentaire sur la vue
comment on view public.offer_type_stats is 'Statistiques par type d''offre pour le dashboard admin';
