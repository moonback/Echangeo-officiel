-- Script de correction pour réparer les objets marqués à tort comme suspendus par l'admin
-- À exécuter directement dans l'interface Supabase SQL Editor

-- 1. Remettre à FALSE les objets qui ont été marqués automatiquement comme suspendus
UPDATE items 
SET 
  suspended_by_admin = FALSE,
  suspension_reason = NULL,
  suspended_at = NULL,
  suspended_by = NULL
WHERE 
  suspended_by_admin = TRUE 
  AND suspension_reason = 'Suspendu par l''administrateur'
  AND suspended_at = updated_at;

-- 2. Vérifier le résultat
SELECT 
  COUNT(*) as total_items,
  COUNT(CASE WHEN is_available = TRUE THEN 1 END) as available_items,
  COUNT(CASE WHEN is_available = FALSE THEN 1 END) as unavailable_items,
  COUNT(CASE WHEN suspended_by_admin = TRUE THEN 1 END) as admin_suspended_items
FROM items;

-- 3. Afficher quelques exemples d'objets pour vérification
SELECT 
  id, 
  title, 
  is_available, 
  suspended_by_admin, 
  suspension_reason,
  created_at
FROM items 
ORDER BY created_at DESC 
LIMIT 10;
