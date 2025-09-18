-- Script pour mettre à jour les statistiques des quartiers

-- Mettre à jour les stats pour tous les quartiers actifs
UPDATE community_stats 
SET 
  total_members = (
    SELECT COUNT(*) 
    FROM community_members 
    WHERE community_id = community_stats.community_id 
    AND is_active = true
  ),
  active_members = (
    SELECT COUNT(*) 
    FROM community_members 
    WHERE community_id = community_stats.community_id 
    AND is_active = true
  ),
  calculated_at = now()
WHERE community_id IN (
  SELECT id FROM communities WHERE is_active = true
);

-- Insérer des stats pour les quartiers qui n'en ont pas
INSERT INTO community_stats (community_id, total_members, active_members, total_items, total_exchanges, total_events, calculated_at)
SELECT 
  c.id,
  COUNT(cm.id) as total_members,
  COUNT(CASE WHEN cm.is_active = true THEN 1 END) as active_members,
  0 as total_items,
  0 as total_exchanges,
  0 as total_events,
  now() as calculated_at
FROM communities c
LEFT JOIN community_members cm ON c.id = cm.community_id
WHERE c.is_active = true
AND c.id NOT IN (SELECT community_id FROM community_stats)
GROUP BY c.id;

-- Vérifier le résultat
SELECT 
  c.name,
  cs.total_members,
  cs.active_members,
  cs.calculated_at
FROM communities c
LEFT JOIN community_stats cs ON c.id = cs.community_id
WHERE c.is_active = true
ORDER BY c.name;
