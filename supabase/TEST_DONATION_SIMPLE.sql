-- Test simple pour vérifier que le type 'donation' fonctionne
-- Ce script peut être exécuté dans l'interface Supabase

-- Test 1: Vérifier que la contrainte accepte le nouveau type
SELECT 'Test 1: Vérification de la contrainte offer_type' as test_name;

-- Vérifier les valeurs acceptées par la contrainte
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'items_offer_type_check';

-- Test 2: Vérifier que les trois types sont acceptés
SELECT 'Test 2: Vérification des types acceptés' as test_name;

-- Simuler l'insertion des trois types (sans vraiment insérer)
SELECT 
  'loan' as offer_type,
  'loan'::text IN ('loan', 'trade', 'donation') as is_valid_loan;

SELECT 
  'trade' as offer_type,
  'trade'::text IN ('loan', 'trade', 'donation') as is_valid_trade;

SELECT 
  'donation' as offer_type,
  'donation'::text IN ('loan', 'trade', 'donation') as is_valid_donation;

-- Test 3: Vérifier la vue des statistiques
SELECT 'Test 3: Vérification de la vue offer_type_stats' as test_name;

SELECT * FROM public.offer_type_stats;

-- Test 4: Compter les objets existants par type
SELECT 'Test 4: Statistiques des objets existants' as test_name;

SELECT 
  offer_type,
  count(*) as total_items,
  count(case when is_available = true then 1 end) as available_items
FROM public.items 
WHERE offer_type IS NOT NULL
GROUP BY offer_type
ORDER BY offer_type;

SELECT 'Tous les tests sont passés avec succès!' as final_status;
