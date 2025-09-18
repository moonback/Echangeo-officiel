-- Script pour vérifier les données des communautés

-- Vérifier les communautés et leurs stats
SELECT 
  c.id,
  c.name,
  c.city,
  c.is_active,
  cs.total_members,
  cs.total_items,
  cs.total_exchanges,
  cs.total_events,
  cs.last_activity,
  cs.calculated_at
FROM communities c
LEFT JOIN community_stats cs ON c.id = cs.community_id
ORDER BY c.name;

-- Compter les membres par communauté
SELECT 
  c.name,
  COUNT(cm.id) as actual_members,
  COUNT(CASE WHEN cm.is_active = true THEN 1 END) as active_members
FROM communities c
LEFT JOIN community_members cm ON c.id = cm.community_id
GROUP BY c.id, c.name
ORDER BY actual_members DESC;

-- Compter les items par communauté
SELECT 
  c.name,
  COUNT(i.id) as actual_items,
  COUNT(CASE WHEN i.is_available = true THEN 1 END) as available_items
FROM communities c
LEFT JOIN items i ON c.id = i.community_id
GROUP BY c.id, c.name
ORDER BY actual_items DESC;

-- Compter les échanges par communauté
SELECT 
  c.name,
  COUNT(r.id) as total_requests,
  COUNT(CASE WHEN r.status = 'completed' THEN 1 END) as completed_exchanges
FROM communities c
LEFT JOIN items i ON c.id = i.community_id
LEFT JOIN requests r ON r.item_id = i.id
GROUP BY c.id, c.name
ORDER BY completed_exchanges DESC;

-- Compter les événements par communauté
SELECT 
  c.name,
  COUNT(ce.id) as total_events,
  COUNT(CASE WHEN ce.is_active = true THEN 1 END) as active_events
FROM communities c
LEFT JOIN community_events ce ON c.id = ce.community_id
GROUP BY c.id, c.name
ORDER BY total_events DESC;
