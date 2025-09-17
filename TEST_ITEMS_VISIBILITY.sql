-- Script de test pour vérifier la visibilité des objets
-- À exécuter dans l'interface Supabase SQL Editor

-- 1. Vérifier tous les objets et leur statut
SELECT 
  id,
  title,
  is_available,
  suspended_by_admin,
  suspension_reason,
  created_at
FROM items 
ORDER BY created_at DESC;

-- 2. Compter les objets par statut
SELECT 
  'Total objets' as statut,
  COUNT(*) as nombre
FROM items
UNION ALL
SELECT 
  'Objets disponibles' as statut,
  COUNT(*) as nombre
FROM items 
WHERE is_available = TRUE AND suspended_by_admin = FALSE
UNION ALL
SELECT 
  'Objets non disponibles' as statut,
  COUNT(*) as nombre
FROM items 
WHERE is_available = FALSE AND suspended_by_admin = FALSE
UNION ALL
SELECT 
  'Objets suspendus par admin' as statut,
  COUNT(*) as nombre
FROM items 
WHERE suspended_by_admin = TRUE;

-- 3. Vérifier que les objets suspendus par admin ne devraient pas apparaître dans l'interface utilisateur
-- (cette requête simule ce que fait le hook useItems)
SELECT 
  id,
  title,
  is_available,
  suspended_by_admin
FROM items 
WHERE suspended_by_admin = FALSE
ORDER BY created_at DESC;
