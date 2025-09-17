-- Migration pour corriger les quartiers existants

-- S'assurer que la table community_stats existe et créer des statistiques pour les quartiers existants
-- D'abord, supprimer les statistiques existantes pour éviter les conflits
DELETE FROM community_stats WHERE community_id IN (
  SELECT id FROM communities WHERE is_active = true
);

-- Insérer les nouvelles statistiques
INSERT INTO community_stats (community_id, total_members, total_exchanges, total_events, total_items, last_activity)
SELECT 
  id as community_id,
  CASE 
    WHEN name = 'Belleville' THEN 18
    WHEN name = 'Canal Saint-Martin' THEN 12
    WHEN name = 'Montmartre' THEN 25
    WHEN name = 'Marais' THEN 22
    ELSE 10
  END as total_members,
  CASE 
    WHEN name = 'Belleville' THEN 8
    WHEN name = 'Canal Saint-Martin' THEN 5
    WHEN name = 'Montmartre' THEN 12
    WHEN name = 'Marais' THEN 10
    ELSE 3
  END as total_exchanges,
  CASE 
    WHEN name = 'Belleville' THEN 2
    WHEN name = 'Canal Saint-Martin' THEN 1
    WHEN name = 'Montmartre' THEN 3
    WHEN name = 'Marais' THEN 2
    ELSE 1
  END as total_events,
  CASE 
    WHEN name = 'Belleville' THEN 5
    WHEN name = 'Canal Saint-Martin' THEN 3
    WHEN name = 'Montmartre' THEN 8
    WHEN name = 'Marais' THEN 6
    ELSE 2
  END as total_items,
  now() as last_activity
FROM communities 
WHERE is_active = true;

-- Ajouter le champ activity_level s'il n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'communities' AND column_name = 'activity_level') THEN
        ALTER TABLE communities ADD COLUMN activity_level TEXT DEFAULT 'moderate' 
        CHECK (activity_level IN ('active', 'moderate', 'inactive'));
    END IF;
END $$;

-- Mettre à jour les niveaux d'activité
UPDATE communities SET activity_level = 'active' WHERE name IN ('Montmartre', 'Marais');
UPDATE communities SET activity_level = 'moderate' WHERE name IN ('Belleville', 'Canal Saint-Martin');

-- Commentaire
COMMENT ON TABLE communities IS 'Quartiers de la plateforme TrocAll';
