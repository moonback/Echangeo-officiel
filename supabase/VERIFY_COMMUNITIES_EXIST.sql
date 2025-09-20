-- Script pour vérifier que les quartiers existent et les créer si nécessaire

-- 1. Vérifier les quartiers existants
SELECT 
  'Quartiers existants' as info,
  COUNT(*) as nombre,
  COUNT(CASE WHEN is_active = true THEN 1 END) as actifs,
  COUNT(CASE WHEN is_active = false THEN 1 END) as inactifs
FROM communities;

-- 2. Afficher tous les quartiers
SELECT 
  id,
  name,
  city,
  postal_code,
  is_active,
  created_at,
  updated_at
FROM communities 
ORDER BY created_at DESC;

-- 3. Si aucun quartier n'existe, en créer des exemples
INSERT INTO communities (id, name, description, city, postal_code, country, center_latitude, center_longitude, radius_km, is_active, created_at, updated_at)
SELECT * FROM (VALUES 
  ('quartier-paris-1', 'Belleville', 'Quartier populaire et multiculturel de Paris', 'Paris', '75019', 'France', 48.8722, 2.3767, 2, true, now(), now()),
  ('quartier-paris-2', 'Canal Saint-Martin', 'Quartier branché autour du canal', 'Paris', '75010', 'France', 48.8708, 2.3686, 2, true, now(), now()),
  ('quartier-paris-3', 'Montmartre', 'Quartier artistique et historique', 'Paris', '75018', 'France', 48.8867, 2.3431, 2, true, now(), now()),
  ('quartier-paris-4', 'Marais', 'Quartier historique et culturel', 'Paris', '75004', 'France', 48.8566, 2.3522, 2, true, now(), now())
) AS new_communities(id, name, description, city, postal_code, country, center_latitude, center_longitude, radius_km, is_active, created_at, updated_at)
WHERE NOT EXISTS (SELECT 1 FROM communities WHERE communities.is_active = true);

-- 4. Vérifier le résultat après création
SELECT 
  'Quartiers après vérification/création' as info,
  COUNT(*) as nombre,
  COUNT(CASE WHEN is_active = true THEN 1 END) as actifs
FROM communities;

-- 5. Afficher les quartiers actifs
SELECT 
  id,
  name,
  city,
  postal_code,
  radius_km,
  is_active
FROM communities 
WHERE is_active = true
ORDER BY created_at ASC;
