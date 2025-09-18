-- Script complet pour mettre à jour toutes les statistiques des quartiers

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
  total_items = (
    SELECT COUNT(*) 
    FROM items 
    WHERE community_id = community_stats.community_id 
    AND is_available = true
  ),
  total_exchanges = (
    SELECT COUNT(*) 
    FROM requests 
    WHERE status = 'completed'
    AND item_id IN (
      SELECT id FROM items WHERE community_id = community_stats.community_id
    )
  ),
  total_events = (
    SELECT COUNT(*) 
    FROM community_events 
    WHERE community_id = community_stats.community_id 
    AND is_active = true
  ),
  last_activity = (
    SELECT GREATEST(
      COALESCE(MAX(cm.joined_at), '1900-01-01'::timestamp),
      COALESCE(MAX(i.created_at), '1900-01-01'::timestamp),
      COALESCE(MAX(r.created_at), '1900-01-01'::timestamp),
      COALESCE(MAX(ce.created_at), '1900-01-01'::timestamp)
    )
    FROM community_members cm
    FULL OUTER JOIN items i ON i.community_id = community_stats.community_id
    FULL OUTER JOIN requests r ON r.item_id = i.id
    FULL OUTER JOIN community_events ce ON ce.community_id = community_stats.community_id
    WHERE cm.community_id = community_stats.community_id
  ),
  calculated_at = now()
WHERE community_id IN (
  SELECT id FROM communities WHERE is_active = true
);

-- Insérer des stats pour les quartiers qui n'en ont pas
INSERT INTO community_stats (community_id, total_members, active_members, total_items, total_exchanges, total_events, last_activity, calculated_at)
SELECT 
  c.id,
  COUNT(DISTINCT cm.id) as total_members,
  COUNT(DISTINCT CASE WHEN cm.is_active = true THEN cm.id END) as active_members,
  COUNT(DISTINCT i.id) as total_items,
  COUNT(DISTINCT CASE WHEN r.status = 'completed' THEN r.id END) as total_exchanges,
  COUNT(DISTINCT ce.id) as total_events,
  GREATEST(
    COALESCE(MAX(cm.joined_at), '1900-01-01'::timestamp),
    COALESCE(MAX(i.created_at), '1900-01-01'::timestamp),
    COALESCE(MAX(r.created_at), '1900-01-01'::timestamp),
    COALESCE(MAX(ce.created_at), '1900-01-01'::timestamp)
  ) as last_activity,
  now() as calculated_at
FROM communities c
LEFT JOIN community_members cm ON c.id = cm.community_id
LEFT JOIN items i ON c.id = i.community_id AND i.is_available = true
LEFT JOIN requests r ON r.item_id = i.id
LEFT JOIN community_events ce ON c.id = ce.community_id AND ce.is_active = true
WHERE c.is_active = true
AND c.id NOT IN (SELECT community_id FROM community_stats)
GROUP BY c.id;

-- Vérifier le résultat
SELECT 
  c.name,
  c.city,
  cs.total_members,
  cs.active_members,
  cs.total_items,
  cs.total_exchanges,
  cs.total_events,
  cs.last_activity,
  cs.calculated_at
FROM communities c
LEFT JOIN community_stats cs ON c.id = cs.community_id
WHERE c.is_active = true
ORDER BY cs.total_members DESC, c.name;
