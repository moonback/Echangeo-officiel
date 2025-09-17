-- Migration pour le système de notifications

-- Table des notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'badge_earned', 
    'challenge_completed', 
    'level_up', 
    'points_earned', 
    'reward_available',
    'transaction_update',
    'info'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  action_url TEXT -- URL pour l'action associée
);

CREATE INDEX IF NOT EXISTS notifications_profile_idx ON public.notifications(profile_id);
CREATE INDEX IF NOT EXISTS notifications_type_idx ON public.notifications(type);
CREATE INDEX IF NOT EXISTS notifications_read_idx ON public.notifications(read);
CREATE INDEX IF NOT EXISTS notifications_created_idx ON public.notifications(created_at);

-- Fonction pour nettoyer les notifications expirées
CREATE OR REPLACE FUNCTION public.cleanup_expired_notifications()
RETURNS VOID AS $$
BEGIN
  DELETE FROM public.notifications 
  WHERE expires_at IS NOT NULL AND expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Fonction pour créer une notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_profile_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}',
  p_expires_at TIMESTAMPTZ DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    profile_id, type, title, message, data, expires_at, action_url
  ) VALUES (
    p_profile_id, p_type, p_title, p_message, p_data, p_expires_at, p_action_url
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour marquer toutes les notifications comme lues
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read(p_profile_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.notifications 
  SET read = true 
  WHERE profile_id = p_profile_id AND read = false;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour nettoyer automatiquement les notifications expirées
CREATE OR REPLACE FUNCTION public.trigger_cleanup_notifications()
RETURNS TRIGGER AS $$
BEGIN
  -- Nettoyer les notifications expirées lors de chaque insertion
  PERFORM public.cleanup_expired_notifications();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cleanup_notifications_on_insert
  AFTER INSERT ON public.notifications
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.trigger_cleanup_notifications();

-- Vue pour les statistiques de notifications
CREATE OR REPLACE VIEW public.notification_stats AS
SELECT 
  profile_id,
  COUNT(*) as total_notifications,
  COUNT(*) FILTER (WHERE read = false) as unread_count,
  COUNT(*) FILTER (WHERE type = 'badge_earned') as badge_notifications,
  COUNT(*) FILTER (WHERE type = 'level_up') as level_notifications,
  COUNT(*) FILTER (WHERE type = 'challenge_completed') as challenge_notifications,
  MAX(created_at) as last_notification_at
FROM public.notifications
GROUP BY profile_id;
