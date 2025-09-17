-- Migration corrective pour réparer les objets marqués à tort comme suspendus par l'admin
-- Cette migration annule l'effet de la migration précédente qui a marqué tous les objets non disponibles comme suspendus

-- Remettre à FALSE les objets qui n'ont pas été explicitement suspendus par un admin
-- (c'est-à-dire ceux qui n'ont pas de suspension_reason spécifique)
UPDATE items 
SET 
  suspended_by_admin = FALSE,
  suspension_reason = NULL,
  suspended_at = NULL,
  suspended_by = NULL
WHERE 
  suspended_by_admin = TRUE 
  AND suspension_reason = 'Suspendu par l''administrateur'
  AND suspended_at = updated_at;

-- Commentaire sur la migration corrective
COMMENT ON TABLE items IS 'Table des objets - migration corrective appliquée pour réparer les objets marqués à tort comme suspendus';
