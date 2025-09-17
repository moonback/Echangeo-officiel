-- Migration simplifiée pour corriger les quartiers

-- Créer la table community_stats si elle n'existe pas
CREATE TABLE IF NOT EXISTS community_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    total_members INTEGER DEFAULT 0,
    total_exchanges INTEGER DEFAULT 0,
    total_events INTEGER DEFAULT 0,
    total_items INTEGER DEFAULT 0,
    last_activity TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(community_id)
);

-- Ajouter le champ activity_level à communities s'il n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'communities' AND column_name = 'activity_level') THEN
        ALTER TABLE communities ADD COLUMN activity_level TEXT DEFAULT 'moderate' 
        CHECK (activity_level IN ('active', 'moderate', 'inactive'));
    END IF;
END $$;

-- Insérer ou mettre à jour les statistiques pour chaque quartier existant
INSERT INTO community_stats (community_id, total_members, total_exchanges, total_events, total_items, last_activity)
VALUES 
  ('180ff050-a5e9-4f46-98d9-02fcc1e3e047', 18, 8, 2, 5, now()), -- Belleville
  ('71b1e844-03b0-437e-9e88-43b56b9e7205', 12, 5, 1, 3, now()), -- Canal Saint-Martin
  ('8e45a71d-3722-4c7c-b61b-bec3d8193e4b', 25, 12, 3, 8, now()), -- Montmartre
  ('8f5dc355-c90d-4086-b793-dcb117e3ca21', 22, 10, 2, 6, now())  -- Marais
ON CONFLICT (community_id) DO UPDATE SET
  total_members = EXCLUDED.total_members,
  total_exchanges = EXCLUDED.total_exchanges,
  total_events = EXCLUDED.total_events,
  total_items = EXCLUDED.total_items,
  last_activity = EXCLUDED.last_activity;

-- Mettre à jour les niveaux d'activité
UPDATE communities SET activity_level = 'active' WHERE name IN ('Montmartre', 'Marais');
UPDATE communities SET activity_level = 'moderate' WHERE name IN ('Belleville', 'Canal Saint-Martin');

-- Commentaire
COMMENT ON TABLE communities IS 'Quartiers de la plateforme TrocAll';
COMMENT ON TABLE community_stats IS 'Statistiques des quartiers';
