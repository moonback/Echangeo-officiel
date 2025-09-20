-- Script pour ajouter des utilisateurs de test aux quartiers existants
-- Ce script s'assure que les utilisateurs sont bien rattachés aux quartiers

-- 1. Créer des utilisateurs de test s'ils n'existent pas
INSERT INTO profiles (id, email, full_name, created_at, updated_at)
VALUES 
  ('test-user-1', 'test1@example.com', 'Utilisateur Test 1', now(), now()),
  ('test-user-2', 'test2@example.com', 'Utilisateur Test 2', now(), now()),
  ('test-user-3', 'test3@example.com', 'Utilisateur Test 3', now(), now())
ON CONFLICT (id) DO NOTHING;

-- 2. Ajouter les utilisateurs de test au premier quartier disponible
INSERT INTO community_members (community_id, user_id, role, joined_at, is_active)
SELECT 
  c.id,
  'test-user-1',
  'member',
  now() - interval '30 days',
  true
FROM communities c
WHERE c.is_active = true
ORDER BY c.created_at ASC
LIMIT 1
ON CONFLICT (community_id, user_id) DO NOTHING;

INSERT INTO community_members (community_id, user_id, role, joined_at, is_active)
SELECT 
  c.id,
  'test-user-2',
  'member',
  now() - interval '20 days',
  true
FROM communities c
WHERE c.is_active = true
ORDER BY c.created_at ASC
LIMIT 1
ON CONFLICT (community_id, user_id) DO NOTHING;

INSERT INTO community_members (community_id, user_id, role, joined_at, is_active)
SELECT 
  c.id,
  'test-user-3',
  'member',
  now() - interval '10 days',
  true
FROM communities c
WHERE c.is_active = true
ORDER BY c.created_at ASC
LIMIT 1
ON CONFLICT (community_id, user_id) DO NOTHING;

-- 3. Ajouter tous les utilisateurs existants au premier quartier s'ils n'ont pas de quartier
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
WHERE p.id NOT IN (
  SELECT DISTINCT user_id 
  FROM community_members 
  WHERE is_active = true
)
ON CONFLICT (community_id, user_id) DO NOTHING;

-- 4. Vérifier le résultat
SELECT 
  'Utilisateurs avec communautés après ajout' as statut,
  COUNT(DISTINCT p.id) as nombre
FROM profiles p
INNER JOIN community_members cm ON p.id = cm.user_id
WHERE cm.is_active = true;

-- 5. Afficher les détails des utilisateurs de test
SELECT 
  p.email,
  p.full_name,
  c.name as community_name,
  c.city,
  cm.joined_at,
  cm.role
FROM profiles p
INNER JOIN community_members cm ON p.id = cm.user_id
INNER JOIN communities c ON cm.community_id = c.id
WHERE p.email LIKE 'test%@example.com'
ORDER BY p.created_at DESC;
