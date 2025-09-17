-- Script pour vérifier les statistiques des quartiers

-- Vérifier les quartiers et leurs stats
SELECT 
  c.id,
  c.name,
  c.city,
  cs.total_members,
  cs.active_members,
  cs.total_items,
  cs.total_exchanges,
  cs.total_events
FROM communities c
LEFT JOIN community_stats cs ON c.id = cs.community_id
WHERE c.is_active = true
ORDER BY c.name;

-- Vérifier les membres des quartiers
SELECT 
  c.name as community_name,
  COUNT(cm.id) as member_count,
  COUNT(CASE WHEN cm.is_active = true THEN 1 END) as active_member_count
FROM communities c
LEFT JOIN community_members cm ON c.id = cm.community_id
WHERE c.is_active = true
GROUP BY c.id, c.name
ORDER BY c.name;

-- Vérifier si les stats sont à jour
SELECT 
  c.name,
  cs.total_members as stats_members,
  COUNT(cm.id) as actual_members,
  cs.total_members - COUNT(cm.id) as difference
FROM communities c
LEFT JOIN community_stats cs ON c.id = cs.community_id
LEFT JOIN community_members cm ON c.id = cm.community_id AND cm.is_active = true
WHERE c.is_active = true
GROUP BY c.id, c.name, cs.total_members
ORDER BY c.name;
