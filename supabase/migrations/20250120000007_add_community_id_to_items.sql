-- Ajouter la colonne community_id à la table items
-- pour associer les objets aux communautés/quartiers

-- Ajouter la colonne community_id
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES communities(id) ON DELETE SET NULL;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_items_community_id ON items(community_id);

-- Commentaire pour documenter la colonne
COMMENT ON COLUMN items.community_id IS 'ID de la communauté/quartier où l''objet est disponible';
