-- Migration pour ajouter le champ suspended_by_admin à la table items
-- Cela permet de distinguer les objets suspendus par l'administrateur des objets simplement non disponibles

-- Ajouter la colonne suspended_by_admin
ALTER TABLE items 
ADD COLUMN suspended_by_admin BOOLEAN DEFAULT FALSE;

-- Ajouter la colonne suspension_reason pour stocker la raison de la suspension
ALTER TABLE items 
ADD COLUMN suspension_reason TEXT;

-- Ajouter la colonne suspended_at pour stocker la date de suspension
ALTER TABLE items 
ADD COLUMN suspended_at TIMESTAMPTZ;

-- Ajouter la colonne suspended_by pour stocker l'ID de l'administrateur qui a suspendu
ALTER TABLE items 
ADD COLUMN suspended_by UUID REFERENCES profiles(id);

-- Créer un index pour améliorer les performances des requêtes sur les objets suspendus
CREATE INDEX idx_items_suspended_by_admin ON items(suspended_by_admin) WHERE suspended_by_admin = TRUE;

-- Ne pas marquer automatiquement les objets non disponibles comme suspendus par l'admin
-- Les objets suspendus par l'admin seront marqués manuellement par les administrateurs
-- UPDATE items 
-- SET 
--   suspended_by_admin = TRUE,
--   suspension_reason = 'Suspendu par l''administrateur',
--   suspended_at = updated_at
-- WHERE is_available = FALSE;

-- Commentaire sur la migration
COMMENT ON COLUMN items.suspended_by_admin IS 'Indique si l''objet a été suspendu par un administrateur';
COMMENT ON COLUMN items.suspension_reason IS 'Raison de la suspension administrative';
COMMENT ON COLUMN items.suspended_at IS 'Date et heure de la suspension administrative';
COMMENT ON COLUMN items.suspended_by IS 'ID de l''administrateur qui a suspendu l''objet';
