-- Migration pour ajouter la vérification automatique des bannissements expirés

-- Fonction pour désactiver automatiquement les bannissements expirés
CREATE OR REPLACE FUNCTION public.check_expired_bans() RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  -- Désactiver tous les bannissements expirés
  UPDATE public.user_bans 
  SET is_active = false, updated_at = now()
  WHERE is_active = true 
  AND expires_at IS NOT NULL 
  AND expires_at <= now();

  -- Compter le nombre de bannissements désactivés
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Fonction améliorée pour vérifier si un utilisateur est banni (inclut la vérification d'expiration)
CREATE OR REPLACE FUNCTION public.is_user_banned(target_user_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  -- D'abord, vérifier et désactiver les bannissements expirés
  PERFORM public.check_expired_bans();
  
  -- Ensuite, vérifier s'il y a des bannissements actifs
  RETURN EXISTS (
    SELECT 1 FROM public.user_bans 
    WHERE user_id = target_user_id 
    AND is_active = true 
    AND (expires_at IS NULL OR expires_at > now())
  );
END;
$$ LANGUAGE plpgsql;

-- Trigger pour vérifier automatiquement les bannissements expirés lors de la connexion
CREATE OR REPLACE FUNCTION public.on_auth_user_login() RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier et nettoyer les bannissements expirés
  PERFORM public.check_expired_bans();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer un trigger sur la table auth.users (si possible avec Supabase)
-- Note: Cette fonction peut être appelée manuellement ou via un cron job
-- car les triggers sur auth.users peuvent ne pas être disponibles

-- Vue mise à jour pour inclure la vérification d'expiration
CREATE OR REPLACE VIEW public.user_ban_stats AS
SELECT 
  p.id as user_id,
  p.email,
  p.full_name,
  CASE 
    WHEN ub.id IS NOT NULL 
         AND ub.is_active = true 
         AND (ub.expires_at IS NULL OR ub.expires_at > now()) 
    THEN true 
    ELSE false 
  END as is_banned,
  ub.reason as ban_reason,
  ub.ban_type,
  ub.expires_at,
  ub.created_at as banned_at,
  ub.banned_by,
  pb.full_name as banned_by_name
FROM public.profiles p
LEFT JOIN public.user_bans ub ON p.id = ub.user_id 
  AND ub.is_active = true 
  AND (ub.expires_at IS NULL OR ub.expires_at > now())
LEFT JOIN public.profiles pb ON ub.banned_by = pb.id;

-- Fonction pour obtenir les statistiques de bannissement
CREATE OR REPLACE FUNCTION public.get_ban_stats() RETURNS TABLE(
  total_bans INTEGER,
  active_bans INTEGER,
  expired_bans INTEGER,
  permanent_bans INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM public.user_bans) as total_bans,
    (SELECT COUNT(*)::INTEGER FROM public.user_bans WHERE is_active = true) as active_bans,
    (SELECT COUNT(*)::INTEGER FROM public.user_bans 
     WHERE is_active = false AND expires_at IS NOT NULL AND expires_at <= now()) as expired_bans,
    (SELECT COUNT(*)::INTEGER FROM public.user_bans 
     WHERE is_active = true AND expires_at IS NULL) as permanent_bans;
END;
$$ LANGUAGE plpgsql;

-- Commentaire pour documenter l'utilisation
COMMENT ON FUNCTION public.check_expired_bans() IS 'Désactive automatiquement tous les bannissements expirés et retourne le nombre de bannissements désactivés';
COMMENT ON FUNCTION public.is_user_banned(UUID) IS 'Vérifie si un utilisateur est actuellement banni (inclut la vérification automatique des expirations)';
COMMENT ON FUNCTION public.get_ban_stats() IS 'Retourne les statistiques globales des bannissements';
