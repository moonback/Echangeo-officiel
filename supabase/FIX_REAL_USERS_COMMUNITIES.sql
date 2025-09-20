-- Script pour ajouter les utilisateurs réels aux quartiers
-- Basé sur les données fournies par l'utilisateur

-- 1. Vérifier d'abord les quartiers disponibles
SELECT 
  'Quartiers disponibles' as info,
  COUNT(*) as nombre
FROM communities 
WHERE is_active = true;

-- 2. Afficher les quartiers disponibles
SELECT 
  id,
  name,
  city,
  postal_code,
  is_active,
  created_at
FROM communities 
WHERE is_active = true
ORDER BY created_at ASC;

-- 3. Ajouter les utilisateurs réels au premier quartier disponible
INSERT INTO community_members (community_id, user_id, role, joined_at, is_active)
SELECT 
  c.id,
  p.id,
  'member',
  p.created_at, -- Utiliser la date de création du profil comme date d'adhésion
  true
FROM profiles p
CROSS JOIN (
  SELECT id FROM communities 
  WHERE is_active = true 
  ORDER BY created_at ASC 
  LIMIT 1
) c
WHERE p.id IN (
  'e4202a3d-43c7-4863-a99b-fcd451e61ebd', -- mayssondevoye78+2@gmail.com
  'bccbc8cd-4803-40a9-8292-4e18bff8f771', -- mayssondevoye78+1@gmail.com
  '9bc3d5e5-5e26-4119-862f-9753476fe895', -- devoye.maysson+1@gmail.com
  'b312d982-528c-4a99-8a31-0bb99ad1ea79'  -- devoye.maysson@gmail.com
)
ON CONFLICT (community_id, user_id) DO NOTHING;

-- 4. Vérifier que les utilisateurs ont bien été ajoutés
SELECT 
  p.email,
  p.full_name,
  c.name as community_name,
  c.city,
  cm.joined_at,
  cm.role,
  cm.is_active as member_active
FROM profiles p
INNER JOIN community_members cm ON p.id = cm.user_id
INNER JOIN communities c ON cm.community_id = c.id
WHERE p.id IN (
  'e4202a3d-43c7-4863-a99b-fcd451e61ebd',
  'bccbc8cd-4803-40a9-8292-4e18bff8f771',
  '9bc3d5e5-5e26-4119-862f-9753476fe895',
  'b312d982-528c-4a99-8a31-0bb99ad1ea79'
)
ORDER BY p.created_at DESC;

-- 5. Statistiques finales
SELECT 
  'Utilisateurs avec communautés après correction' as statut,
  COUNT(DISTINCT p.id) as nombre
FROM profiles p
INNER JOIN community_members cm ON p.id = cm.user_id
WHERE cm.is_active = true;
