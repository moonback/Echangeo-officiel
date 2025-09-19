-- Script pour ajouter des membres de test aux communautés
-- Utilise les UIDs utilisateur fournis

-- UIDs utilisateur disponibles
WITH user_ids AS (
  SELECT unnest(ARRAY[
    '3341d50d-778a-47fb-8668-6cbab95482d4'::uuid,
    'b312d982-528c-4a99-8a31-0bb99ad1ea79'::uuid,
    '9bc3d5e5-5e26-4119-862f-9753476fe895'::uuid
  ]) as user_id
),
-- Récupérer les communautés des Yvelines
yvelines_communities AS (
  SELECT id, name, city FROM communities 
  WHERE country = 'France' 
    AND city IN (
      'Versailles', 'Saint-Germain-en-Laye', 'Mantes-la-Jolie', 'Rambouillet', 'Poissy',
      'Conflans-Sainte-Honorine', 'Houilles', 'Sartrouville', 'Le Chesnay', 'Vélizy-Villacoublay',
      'Trappes', 'Guyancourt', 'Montigny-le-Bretonneux', 'Élancourt', 'Maurepas', 'Plaisir',
      'Houdan', 'Mantes-la-Ville', 'Bonnières-sur-Seine', 'Limay', 'Meulan-en-Yvelines',
      'Les Mureaux', 'Aubergenville', 'Épône', 'Gargenville', 'Jouy-en-Josas', 'Buc',
      'Toussus-le-Noble', 'Châteaufort', 'Magny-les-Hameaux', 'Saint-Rémy-lès-Chevreuse',
      'Chevreuse', 'Dampierre-en-Yvelines', 'Maintenon', 'Chartres'
    )
)

-- Ajouter des membres aléatoirement aux communautés
INSERT INTO community_members (community_id, user_id, role, is_active, joined_at)
SELECT 
  c.id,
  u.user_id,
  CASE 
    WHEN random() < 0.1 THEN 'admin'::text
    WHEN random() < 0.2 THEN 'moderator'::text
    ELSE 'member'::text
  END as role,
  true as is_active,
  now() - (random() * interval '30 days') as joined_at
FROM yvelines_communities c
CROSS JOIN user_ids u
WHERE random() < 0.7 -- 70% de chance d'être membre de chaque communauté
ON CONFLICT (community_id, user_id) 
DO UPDATE SET
  role = EXCLUDED.role,
  is_active = true,
  joined_at = EXCLUDED.joined_at;

-- Vérifier le résultat
SELECT 
  c.name,
  c.city,
  COUNT(cm.id) as total_members,
  COUNT(CASE WHEN cm.is_active = true THEN 1 END) as active_members,
  COUNT(CASE WHEN cm.role = 'admin' THEN 1 END) as admins,
  COUNT(CASE WHEN cm.role = 'moderator' THEN 1 END) as moderators,
  COUNT(CASE WHEN cm.role = 'member' THEN 1 END) as members
FROM communities c
LEFT JOIN community_members cm ON c.id = cm.community_id
WHERE c.country = 'France' 
  AND c.city IN (
    'Versailles', 'Saint-Germain-en-Laye', 'Mantes-la-Jolie', 'Rambouillet', 'Poissy',
    'Conflans-Sainte-Honorine', 'Houilles', 'Sartrouville', 'Le Chesnay', 'Vélizy-Villacoublay',
    'Trappes', 'Guyancourt', 'Montigny-le-Bretonneux', 'Élancourt', 'Maurepas', 'Plaisir',
    'Houdan', 'Mantes-la-Ville', 'Bonnières-sur-Seine', 'Limay', 'Meulan-en-Yvelines',
    'Les Mureaux', 'Aubergenville', 'Épône', 'Gargenville', 'Jouy-en-Josas', 'Buc',
    'Toussus-le-Noble', 'Châteaufort', 'Magny-les-Hameaux', 'Saint-Rémy-lès-Chevreuse',
    'Chevreuse', 'Dampierre-en-Yvelines', 'Maintenon', 'Chartres'
  )
GROUP BY c.id, c.name, c.city
ORDER BY total_members DESC, c.name;
