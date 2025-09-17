-- Script SQL ultra-simple pour corriger les quartiers

-- 1. Créer la table community_stats
CREATE TABLE IF NOT EXISTS community_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    total_members INTEGER DEFAULT 0,
    total_exchanges INTEGER DEFAULT 0,
    total_events INTEGER DEFAULT 0,
    total_items INTEGER DEFAULT 0,
    last_activity TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Ajouter la contrainte unique après création de la table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'community_stats_community_id_key') THEN
        ALTER TABLE community_stats ADD CONSTRAINT community_stats_community_id_key UNIQUE (community_id);
    END IF;
END $$;

-- 3. Ajouter le champ activity_level
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'communities' AND column_name = 'activity_level') THEN
        ALTER TABLE communities ADD COLUMN activity_level TEXT DEFAULT 'moderate';
    END IF;
END $$;

-- 4. Supprimer toutes les statistiques existantes
DELETE FROM community_stats;

-- 5. Insérer les nouvelles statistiques
INSERT INTO community_stats (community_id, total_members, total_exchanges, total_events, total_items, last_activity)
VALUES 
  ('180ff050-a5e9-4f46-98d9-02fcc1e3e047', 18, 8, 2, 5, now()),
  ('71b1e844-03b0-437e-9e88-43b56b9e7205', 12, 5, 1, 3, now()),
  ('8e45a71d-3722-4c7c-b61b-bec3d8193e4b', 25, 12, 3, 8, now()),
  ('8f5dc355-c90d-4086-b793-dcb117e3ca21', 22, 10, 2, 6, now());

-- 6. Mettre à jour les niveaux d'activité
UPDATE communities SET activity_level = 'active' WHERE name IN ('Montmartre', 'Marais');
UPDATE communities SET activity_level = 'moderate' WHERE name IN ('Belleville', 'Canal Saint-Martin');

-- 7. Vérification finale
SELECT 
  c.name,
  c.city,
  c.is_active,
  c.activity_level,
  cs.total_members
FROM communities c
LEFT JOIN community_stats cs ON cs.community_id = c.id
WHERE c.is_active = true
ORDER BY c.name;
