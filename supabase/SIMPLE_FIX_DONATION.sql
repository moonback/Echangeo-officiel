-- Solution simple pour corriger l'erreur de type d'offre
-- Ce script peut être exécuté directement dans Supabase SQL Editor

-- Vérifier d'abord la contrainte actuelle
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'items_offer_type_check';

-- Supprimer l'ancienne contrainte si elle existe
ALTER TABLE public.items
  DROP CONSTRAINT IF EXISTS items_offer_type_check;

-- Ajouter la nouvelle contrainte avec 'donation'
ALTER TABLE public.items
  ADD CONSTRAINT items_offer_type_check 
  CHECK (offer_type IN ('loan', 'trade', 'donation'));

-- Vérifier que ça fonctionne
SELECT 'donation'::text IN ('loan', 'trade', 'donation') as donation_valid;

-- Afficher la nouvelle contrainte
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'items_offer_type_check';

SELECT 'Type donation ajouté avec succès!' as status;
