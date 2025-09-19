-- Script pour initialiser les statistiques des communautés
-- Ce script crée la table community_stats si elle n'existe pas et calcule les stats

-- Créer la table community_stats si elle n'existe pas
CREATE TABLE IF NOT EXISTS community_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID UNIQUE REFERENCES communities(id) ON DELETE CASCADE,
  total_members INTEGER DEFAULT 0,
  active_members INTEGER DEFAULT 0,
  total_items INTEGER DEFAULT 0,
  total_exchanges INTEGER DEFAULT 0,
  total_events INTEGER DEFAULT 0,
  last_activity TIMESTAMPTZ,
  calculated_at TIMESTAMPTZ DEFAULT now()
);

-- Insérer ou mettre à jour les statistiques pour toutes les communautés actives
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
GROUP BY c.id
ON CONFLICT (community_id) 
DO UPDATE SET
  total_members = EXCLUDED.total_members,
  active_members = EXCLUDED.active_members,
  total_items = EXCLUDED.total_items,
  total_exchanges = EXCLUDED.total_exchanges,
  total_events = EXCLUDED.total_events,
  last_activity = EXCLUDED.last_activity,
  calculated_at = now();

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
