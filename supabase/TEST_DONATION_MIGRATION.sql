-- Script de test pour la migration des dons
-- Ce script teste la nouvelle contrainte et les fonctionnalités

-- Test 1: Vérifier que la contrainte accepte le nouveau type 'donation'
INSERT INTO public.items (
  id,
  owner_id,
  title,
  description,
  category,
  condition,
  offer_type,
  is_available,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000', -- UUID de test
  'Test Don - Livres enfants',
  'Collection de livres pour enfants en excellent état',
  'books',
  'excellent',
  'donation', -- Nouveau type
  true,
  now(),
  now()
);

-- Test 2: Vérifier que les anciens types fonctionnent toujours
INSERT INTO public.items (
  id,
  owner_id,
  title,
  description,
  category,
  condition,
  offer_type,
  is_available,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'Test Prêt - Perceuse',
  'Perceuse en bon état',
  'tools',
  'good',
  'loan', -- Type existant
  true,
  now(),
  now()
);

-- Test 3: Vérifier la vue des statistiques
SELECT * FROM public.offer_type_stats;

-- Test 4: Vérifier que l'index fonctionne
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM public.items 
WHERE offer_type = 'donation';

-- Test 5: Compter les objets par type
SELECT 
  offer_type,
  count(*) as total_items,
  count(case when is_available = true then 1 end) as available_items
FROM public.items 
GROUP BY offer_type
ORDER BY offer_type;

-- Nettoyage des données de test
DELETE FROM public.items 
WHERE owner_id = '00000000-0000-0000-0000-000000000000';

-- Vérification finale
SELECT 'Migration des dons testée avec succès!' as status;
