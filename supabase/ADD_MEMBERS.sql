-- Script pour ajouter des membres de test aux quartiers

-- 1. Créer la table community_members si elle n'existe pas
CREATE TABLE IF NOT EXISTS community_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
    joined_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(community_id, user_id)
);

-- 2. Insérer des membres de test pour chaque quartier
-- Note: Ces insertions ne fonctionneront que si des profils existent dans la table profiles

-- Pour Belleville
INSERT INTO community_members (community_id, user_id, role, joined_at, is_active)
SELECT 
  '180ff050-a5e9-4f46-98d9-02fcc1e3e047',
  id,
  'admin',
  now() - interval '30 days',
  true
FROM profiles 
LIMIT 1
ON CONFLICT (community_id, user_id) DO NOTHING;

-- Pour Canal Saint-Martin
INSERT INTO community_members (community_id, user_id, role, joined_at, is_active)
SELECT 
  '71b1e844-03b0-437e-9e88-43b56b9e7205',
  id,
  'moderator',
  now() - interval '20 days',
  true
FROM profiles 
LIMIT 1
ON CONFLICT (community_id, user_id) DO NOTHING;

-- Pour Montmartre
INSERT INTO community_members (community_id, user_id, role, joined_at, is_active)
SELECT 
  '8e45a71d-3722-4c7c-b61b-bec3d8193e4b',
  id,
  'member',
  now() - interval '15 days',
  true
FROM profiles 
LIMIT 1
ON CONFLICT (community_id, user_id) DO NOTHING;

-- Pour Marais
INSERT INTO community_members (community_id, user_id, role, joined_at, is_active)
SELECT 
  '8f5dc355-c90d-4086-b793-dcb117e3ca21',
  id,
  'member',
  now() - interval '10 days',
  true
FROM profiles 
LIMIT 1
ON CONFLICT (community_id, user_id) DO NOTHING;

-- 3. Vérifier les membres ajoutés
SELECT 
  c.name as quartier,
  cm.role,
  cm.joined_at,
  cm.is_active,
  p.full_name,
  p.email
FROM community_members cm
JOIN communities c ON c.id = cm.community_id
LEFT JOIN profiles p ON p.id = cm.user_id
WHERE cm.is_active = true
ORDER BY c.name, cm.joined_at DESC;
