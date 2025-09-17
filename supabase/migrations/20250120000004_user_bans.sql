-- Migration pour ajouter la gestion des bannissements d'utilisateurs

-- Table des bannissements
CREATE TABLE IF NOT EXISTS public.user_bans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  banned_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  ban_type TEXT NOT NULL DEFAULT 'temporary' CHECK (ban_type IN ('temporary', 'permanent')),
  expires_at TIMESTAMPTZ, -- NULL pour les bannissements permanents
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS user_bans_user_id_idx ON public.user_bans(user_id);
CREATE INDEX IF NOT EXISTS user_bans_active_idx ON public.user_bans(is_active);
CREATE INDEX IF NOT EXISTS user_bans_expires_idx ON public.user_bans(expires_at);

-- Contrainte unique pour éviter les bannissements multiples actifs
CREATE UNIQUE INDEX IF NOT EXISTS user_bans_active_unique ON public.user_bans(user_id) 
WHERE is_active = true;

-- Table des détails utilisateur pour l'admin
CREATE TABLE IF NOT EXISTS public.user_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  admin_notes TEXT,
  last_admin_review TIMESTAMPTZ,
  warning_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS user_details_user_unique ON public.user_details(user_id);

-- Vue pour obtenir les statistiques de bannissement
CREATE OR REPLACE VIEW public.user_ban_stats AS
SELECT 
  p.id as user_id,
  p.email,
  p.full_name,
  CASE 
    WHEN ub.id IS NOT NULL AND ub.is_active = true THEN true 
    ELSE false 
  END as is_banned,
  ub.reason as ban_reason,
  ub.ban_type,
  ub.expires_at,
  ub.created_at as banned_at,
  ub.banned_by,
  pb.full_name as banned_by_name
FROM public.profiles p
LEFT JOIN public.user_bans ub ON p.id = ub.user_id AND ub.is_active = true
LEFT JOIN public.profiles pb ON ub.banned_by = pb.id;

-- Fonction pour bannir un utilisateur
CREATE OR REPLACE FUNCTION public.ban_user(
  target_user_id UUID,
  admin_user_id UUID,
  ban_reason TEXT,
  ban_type TEXT DEFAULT 'temporary',
  expires_at TIMESTAMPTZ DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  -- Vérifier que l'utilisateur n'est pas déjà banni
  IF EXISTS (
    SELECT 1 FROM public.user_bans 
    WHERE user_id = target_user_id AND is_active = true
  ) THEN
    RETURN false;
  END IF;

  -- Insérer le bannissement
  INSERT INTO public.user_bans (user_id, banned_by, reason, ban_type, expires_at)
  VALUES (target_user_id, admin_user_id, ban_reason, ban_type, expires_at);

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour débannir un utilisateur
CREATE OR REPLACE FUNCTION public.unban_user(target_user_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  -- Désactiver tous les bannissements actifs de l'utilisateur
  UPDATE public.user_bans 
  SET is_active = false, updated_at = now()
  WHERE user_id = target_user_id AND is_active = true;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier si un utilisateur est banni
CREATE OR REPLACE FUNCTION public.is_user_banned(target_user_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_bans 
    WHERE user_id = target_user_id 
    AND is_active = true 
    AND (expires_at IS NULL OR expires_at > now())
  );
END;
$$ LANGUAGE plpgsql;
