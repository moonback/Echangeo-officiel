-- Script pour mettre à jour la contrainte offer_type existante
-- À exécuter si la base de données existe déjà avec l'ancienne contrainte

-- Supprimer l'ancienne contrainte
ALTER TABLE public.items
  DROP CONSTRAINT IF EXISTS items_offer_type_check;

-- Ajouter la nouvelle contrainte avec le type 'donation'
ALTER TABLE public.items
  ADD CONSTRAINT items_offer_type_check 
  CHECK (offer_type IN ('loan', 'trade', 'donation'));

-- Mettre à jour le commentaire
COMMENT ON COLUMN public.items.offer_type IS 'Type d''offre: loan (prêt), trade (troc) ou donation (don)';

-- Créer la vue des statistiques si elle n'existe pas
CREATE OR REPLACE VIEW public.offer_type_stats AS
SELECT 
  offer_type,
  count(*) as total_items,
  count(case when is_available = true then 1 end) as available_items,
  avg(estimated_value) as avg_value,
  count(distinct owner_id) as unique_owners
FROM public.items
WHERE offer_type IS NOT NULL
GROUP BY offer_type;

-- Commentaire sur la vue
COMMENT ON VIEW public.offer_type_stats IS 'Statistiques par type d''offre pour le dashboard admin';

-- Vérification
SELECT 'Contrainte offer_type mise à jour avec succès!' as status;
