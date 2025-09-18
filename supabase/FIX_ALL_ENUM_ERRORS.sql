-- Script complet pour corriger toutes les erreurs d'enum
-- Corrige les catégories manquantes ET le type d'offre 'donation'

-- 1. CORRIGER LES CATÉGORIES MANQUANTES
-- Supprimer l'ancienne contrainte de catégorie
ALTER TABLE public.items
  DROP CONSTRAINT IF EXISTS items_category_check;

-- Ajouter la nouvelle contrainte avec TOUTES les catégories
ALTER TABLE public.items
  ADD CONSTRAINT items_category_check 
  CHECK (category IN (
    'tools', 
    'electronics', 
    'books', 
    'sports', 
    'kitchen', 
    'garden', 
    'toys', 
    'fashion',
    'furniture',
    'music',
    'baby',
    'art',
    'beauty',
    'auto',
    'office',
    'services', 
    'other'
  ));

-- 2. CORRIGER LE TYPE D'OFFRE
-- Supprimer l'ancienne contrainte de type d'offre
ALTER TABLE public.items
  DROP CONSTRAINT IF EXISTS items_offer_type_check;

-- Ajouter la nouvelle contrainte avec le type 'donation'
ALTER TABLE public.items
  ADD CONSTRAINT items_offer_type_check 
  CHECK (offer_type IN ('loan', 'trade', 'donation'));

-- 3. METTRE À JOUR LES COMMENTAIRES
COMMENT ON COLUMN public.items.category IS 'Catégorie de l''objet: tools, electronics, books, sports, kitchen, garden, toys, fashion, furniture, music, baby, art, beauty, auto, office, services, other';
COMMENT ON COLUMN public.items.offer_type IS 'Type d''offre: loan (prêt), trade (troc) ou donation (don)';

-- 4. CRÉER LA VUE DES STATISTIQUES
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

-- 5. CRÉER UNE VUE POUR LES STATISTIQUES DE CATÉGORIES
CREATE OR REPLACE VIEW public.category_stats AS
SELECT 
  category,
  count(*) as total_items,
  count(case when is_available = true then 1 end) as available_items,
  avg(estimated_value) as avg_value,
  count(distinct owner_id) as unique_owners
FROM public.items
WHERE category IS NOT NULL
GROUP BY category;

-- 6. COMMENTAIRES SUR LES VUES
COMMENT ON VIEW public.offer_type_stats IS 'Statistiques par type d''offre pour le dashboard admin';
COMMENT ON VIEW public.category_stats IS 'Statistiques par catégorie pour le dashboard admin';

-- 7. VÉRIFICATIONS
SELECT 'Contraintes mises à jour avec succès!' as status;

-- Test des catégories
SELECT 'furniture'::text IN (
  'tools', 'electronics', 'books', 'sports', 'kitchen', 'garden', 'toys', 
  'fashion', 'furniture', 'music', 'baby', 'art', 'beauty', 'auto', 'office', 'services', 'other'
) as furniture_valid;

-- Test du type d'offre
SELECT 'donation'::text IN ('loan', 'trade', 'donation') as donation_valid;

-- Afficher les contraintes mises à jour
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname IN ('items_category_check', 'items_offer_type_check');
