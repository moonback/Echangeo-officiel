-- Script de debug pour vérifier les communautés des utilisateurs
-- Ce script aide à diagnostiquer pourquoi les quartiers ne s'affichent pas

-- 1. Vérifier tous les utilisateurs et leurs communautés
SELECT 
  p.id as user_id,
  p.email,
  p.full_name,
  p.created_at as user_created_at,
  cm.id as member_id,
  cm.joined_at,
  cm.is_active as member_active,
  cm.role,
  c.id as community_id,
  c.name as community_name,
  c.city,
  c.postal_code,
  c.is_active as community_active
FROM profiles p
LEFT JOIN community_members cm ON p.id = cm.user_id
LEFT JOIN communities c ON cm.community_id = c.id
ORDER BY p.created_at DESC, cm.joined_at ASC
LIMIT 20;

-- 2. Compter les utilisateurs avec et sans communautés
SELECT 
  'Utilisateurs avec communautés' as statut,
  COUNT(DISTINCT p.id) as nombre
FROM profiles p
INNER JOIN community_members cm ON p.id = cm.user_id
WHERE cm.is_active = true

UNION ALL

SELECT 
  'Utilisateurs sans communautés' as statut,
  COUNT(DISTINCT p.id) as nombre
FROM profiles p
LEFT JOIN community_members cm ON p.id = cm.user_id AND cm.is_active = true
WHERE cm.id IS NULL;

-- 3. Vérifier les communautés actives
SELECT 
  'Communautés actives' as statut,
  COUNT(*) as nombre
FROM communities 
WHERE is_active = true

UNION ALL

SELECT 
  'Communautés inactives' as statut,
  COUNT(*) as nombre
FROM communities 
WHERE is_active = false;

-- 4. Détails des communautés actives
SELECT 
  id,
  name,
  city,
  postal_code,
  is_active,
  created_at,
  (SELECT COUNT(*) FROM community_members WHERE community_id = c.id AND is_active = true) as member_count
FROM communities c
WHERE is_active = true
ORDER BY created_at DESC;

-- 5. Vérifier les membres de communauté
SELECT 
  c.name as community_name,
  c.city,
  COUNT(cm.id) as total_members,
  COUNT(CASE WHEN cm.is_active = true THEN 1 END) as active_members,
  COUNT(CASE WHEN cm.is_active = false THEN 1 END) as inactive_members
FROM communities c
LEFT JOIN community_members cm ON c.id = cm.community_id
WHERE c.is_active = true
GROUP BY c.id, c.name, c.city
ORDER BY active_members DESC;

-- 6. Trouver les utilisateurs récents sans communautés (pour debug)
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.created_at,
  'Aucune communauté' as statut
FROM profiles p
LEFT JOIN community_members cm ON p.id = cm.user_id AND cm.is_active = true
WHERE cm.id IS NULL
ORDER BY p.created_at DESC
LIMIT 10;
