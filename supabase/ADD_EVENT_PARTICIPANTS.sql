-- Script pour ajouter des participants de test aux événements
-- Assurez-vous que les événements et les utilisateurs existent avant d'exécuter ce script

-- 1. Vérifier les événements existants
SELECT 
  'Événements disponibles' as info,
  COUNT(*) as nombre,
  STRING_AGG(title, ', ') as titres
FROM community_events 
WHERE is_active = true;

-- 2. Vérifier les utilisateurs disponibles
SELECT 
  'Utilisateurs disponibles' as info,
  COUNT(*) as nombre,
  STRING_AGG(COALESCE(full_name, email), ', ') as noms
FROM profiles;

-- 3. Ajouter des participants aux événements à venir
INSERT INTO event_participants (
  id,
  event_id,
  user_id,
  status,
  registered_at
)
SELECT 
  gen_random_uuid(),
  ce.id,
  p.id,
  CASE 
    WHEN RANDOM() < 0.7 THEN 'registered'
    WHEN RANDOM() < 0.9 THEN 'confirmed'
    ELSE 'cancelled'
  END,
  NOW() - INTERVAL (FLOOR(RANDOM() * 7) || ' days')::INTERVAL
FROM community_events ce
CROSS JOIN profiles p
WHERE ce.is_active = true
AND ce.start_date > NOW()
AND RANDOM() < 0.4  -- 40% de chance qu'un utilisateur participe à un événement
LIMIT 50; -- Limiter le nombre de participants pour éviter trop de données

-- 4. Ajouter quelques participants confirmés pour les événements récents
INSERT INTO event_participants (
  id,
  event_id,
  user_id,
  status,
  registered_at
)
SELECT 
  gen_random_uuid(),
  ce.id,
  p.id,
  'confirmed',
  ce.created_at + INTERVAL (FLOOR(RANDOM() * 5) || ' days')::INTERVAL
FROM community_events ce
CROSS JOIN profiles p
WHERE ce.is_active = true
AND ce.start_date <= NOW()  -- Événements passés
AND RANDOM() < 0.3  -- 30% de chance qu'un utilisateur ait participé
LIMIT 30;

-- 5. Vérifier les participants créés
SELECT 
  'Participants créés' as info,
  COUNT(*) as nombre_total,
  COUNT(CASE WHEN status = 'registered' THEN 1 END) as inscrits,
  COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmes,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as annules
FROM event_participants;

-- 6. Afficher les statistiques par événement
SELECT 
  ce.title,
  c.name as communaute,
  ce.event_type,
  ce.start_date,
  ce.max_participants,
  COUNT(ep.id) as participants_totaux,
  COUNT(CASE WHEN ep.status = 'confirmed' THEN 1 END) as confirmes,
  COUNT(CASE WHEN ep.status = 'registered' THEN 1 END) as en_attente,
  COUNT(CASE WHEN ep.status = 'cancelled' THEN 1 END) as annules,
  CASE 
    WHEN ce.max_participants > 0 THEN 
      ROUND((COUNT(ep.id)::FLOAT / ce.max_participants * 100)::NUMERIC, 1)
    ELSE 0
  END as pourcentage_remplissage
FROM community_events ce
LEFT JOIN communities c ON ce.community_id = c.id
LEFT JOIN event_participants ep ON ce.id = ep.event_id
WHERE ce.is_active = true
GROUP BY ce.id, ce.title, c.name, ce.event_type, ce.start_date, ce.max_participants
ORDER BY ce.start_date ASC;

-- 7. Afficher les participants par événement (premiers résultats)
SELECT 
  ce.title as evenement,
  c.name as communaute,
  COALESCE(p.full_name, p.email) as participant,
  ep.status,
  ep.registered_at
FROM event_participants ep
JOIN community_events ce ON ep.event_id = ce.id
JOIN communities c ON ce.community_id = c.id
JOIN profiles p ON ep.user_id = p.id
WHERE ce.is_active = true
ORDER BY ce.start_date ASC, ep.registered_at DESC
LIMIT 20;
