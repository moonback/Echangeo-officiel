-- Migration pour améliorer le système de gamification et de réputation

-- Table des niveaux utilisateur
CREATE TABLE IF NOT EXISTS public.user_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 1,
  points INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL DEFAULT 'Nouveau membre',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS user_levels_profile_unique ON public.user_levels(profile_id);
CREATE INDEX IF NOT EXISTS user_levels_level_idx ON public.user_levels(level);
CREATE INDEX IF NOT EXISTS user_levels_points_idx ON public.user_levels(points);

-- Table des points gagnés (historique)
CREATE TABLE IF NOT EXISTS public.user_points_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  source_type TEXT NOT NULL, -- 'transaction', 'rating', 'challenge', 'bonus'
  source_id UUID, -- ID de la transaction, évaluation, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_points_history_profile_idx ON public.user_points_history(profile_id);
CREATE INDEX IF NOT EXISTS user_points_history_created_idx ON public.user_points_history(created_at);

-- Table des défis
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly', 'special')),
  target_value INTEGER NOT NULL,
  reward_points INTEGER NOT NULL,
  reward_badge TEXT,
  reward_title TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des défis accomplis par les utilisateurs
CREATE TABLE IF NOT EXISTS public.user_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS user_challenges_unique ON public.user_challenges(profile_id, challenge_id);
CREATE INDEX IF NOT EXISTS user_challenges_completed_idx ON public.user_challenges(is_completed);

-- Table des badges étendus
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT, -- Nom de l'icône Lucide
  color TEXT DEFAULT 'brand', -- Couleur du badge
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  requirements JSONB NOT NULL DEFAULT '{}', -- Critères pour obtenir le badge
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des badges obtenus par les utilisateurs
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source_type TEXT, -- 'manual', 'automatic', 'challenge'
  source_id UUID -- ID de la source (challenge, transaction, etc.)
);

CREATE UNIQUE INDEX IF NOT EXISTS user_badges_unique ON public.user_badges(profile_id, badge_id);
CREATE INDEX IF NOT EXISTS user_badges_profile_idx ON public.user_badges(profile_id);

-- Fonction pour calculer automatiquement les niveaux
CREATE OR REPLACE FUNCTION public.calculate_user_level(points INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Système de niveaux basé sur des points croissants
  -- Niveau 1: 0-99 points
  -- Niveau 2: 100-249 points  
  -- Niveau 3: 250-499 points
  -- Niveau 4: 500-999 points
  -- Niveau 5: 1000-1999 points
  -- etc.
  
  IF points < 100 THEN
    RETURN 1;
  ELSIF points < 250 THEN
    RETURN 2;
  ELSIF points < 500 THEN
    RETURN 3;
  ELSIF points < 1000 THEN
    RETURN 4;
  ELSIF points < 2000 THEN
    RETURN 5;
  ELSIF points < 3500 THEN
    RETURN 6;
  ELSIF points < 5500 THEN
    RETURN 7;
  ELSIF points < 8000 THEN
    RETURN 8;
  ELSIF points < 11000 THEN
    RETURN 9;
  ELSE
    RETURN 10 + FLOOR((points - 11000) / 5000);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir le titre du niveau
CREATE OR REPLACE FUNCTION public.get_level_title(level INTEGER)
RETURNS TEXT AS $$
BEGIN
  CASE level
    WHEN 1 THEN RETURN 'Nouveau membre';
    WHEN 2 THEN RETURN 'Membre actif';
    WHEN 3 THEN RETURN 'Voisin engagé';
    WHEN 4 THEN RETURN 'Membre de confiance';
    WHEN 5 THEN RETURN 'Expert communautaire';
    WHEN 6 THEN RETURN 'Champion local';
    WHEN 7 THEN RETURN 'Ambassadeur';
    WHEN 8 THEN RETURN 'Légende';
    WHEN 9 THEN RETURN 'Maître';
    WHEN 10 THEN RETURN 'Grand Maître';
    ELSE RETURN 'Légende Vivante';
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour ajouter des points à un utilisateur
CREATE OR REPLACE FUNCTION public.add_user_points(
  p_profile_id UUID,
  p_points INTEGER,
  p_reason TEXT,
  p_source_type TEXT DEFAULT 'manual',
  p_source_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  current_level INTEGER;
  new_level INTEGER;
  current_points INTEGER;
BEGIN
  -- Ajouter l'entrée dans l'historique
  INSERT INTO public.user_points_history (
    profile_id, points, reason, source_type, source_id
  ) VALUES (
    p_profile_id, p_points, p_reason, p_source_type, p_source_id
  );
  
  -- Mettre à jour ou créer le niveau utilisateur
  INSERT INTO public.user_levels (profile_id, points, level, title)
  VALUES (
    p_profile_id, 
    p_points, 
    public.calculate_user_level(p_points),
    public.get_level_title(public.calculate_user_level(p_points))
  )
  ON CONFLICT (profile_id) 
  DO UPDATE SET 
    points = user_levels.points + p_points,
    level = public.calculate_user_level(user_levels.points + p_points),
    title = public.get_level_title(public.calculate_user_level(user_levels.points + p_points)),
    updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Vue pour les statistiques de gamification
CREATE OR REPLACE VIEW public.gamification_stats AS
SELECT 
  ul.profile_id,
  ul.level,
  ul.points,
  ul.title,
  COALESCE(prs.ratings_count, 0) as ratings_count,
  COALESCE(prs.overall_score, 0) as overall_score,
  COALESCE(pac.completed_lends, 0) as completed_lends,
  COALESCE(pac.completed_borrows, 0) as completed_borrows,
  COALESCE(pac.completed_lends + pac.completed_borrows, 0) as total_transactions,
  COUNT(DISTINCT ub.badge_id) as badges_count
FROM public.user_levels ul
LEFT JOIN public.profile_reputation_stats prs ON prs.profile_id = ul.profile_id
LEFT JOIN public.profile_activity_counts pac ON pac.profile_id = ul.profile_id
LEFT JOIN public.user_badges ub ON ub.profile_id = ul.profile_id
GROUP BY ul.profile_id, ul.level, ul.points, ul.title, prs.ratings_count, prs.overall_score, pac.completed_lends, pac.completed_borrows;

-- Vue pour le leaderboard
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
  gs.profile_id,
  p.full_name,
  p.avatar_url,
  gs.level,
  gs.points,
  gs.title,
  gs.badges_count,
  ROW_NUMBER() OVER (ORDER BY gs.points DESC, gs.total_transactions DESC) as position
FROM public.gamification_stats gs
JOIN public.profiles p ON p.id = gs.profile_id
ORDER BY gs.points DESC, gs.total_transactions DESC;

-- Insérer des badges de base
INSERT INTO public.badges (slug, name, description, icon, color, rarity, requirements) VALUES
('first_transaction', 'Premier Pas', 'Effectuer votre première transaction', 'Star', 'brand', 'common', '{"completed_transactions": 1}'),
('super_lender', 'Super Prêteur', 'Effectuer 10 prêts avec une excellente réputation', 'Trophy', 'success', 'rare', '{"completed_lends": 10, "min_rating": 4.5}'),
('reliable_neighbor', 'Voisin Fiable', 'Recevoir 5 évaluations avec un score élevé', 'Shield', 'info', 'rare', '{"ratings_count": 5, "min_rating": 4.2}'),
('active_borrower', 'Emprunteur Actif', 'Effectuer 10 emprunts', 'Users', 'warning', 'common', '{"completed_borrows": 10}'),
('community_champion', 'Champion Communautaire', 'Effectuer 20 prêts avec une réputation excellente', 'Crown', 'warning', 'epic', '{"completed_lends": 20, "min_rating": 4.8}'),
('rating_champion', 'Champion des Évaluations', 'Recevoir 10 évaluations 5 étoiles', 'Star', 'success', 'rare', '{"five_star_ratings": 10}'),
('early_adopter', 'Pionnier', 'Être actif pendant 6 mois', 'Calendar', 'info', 'rare', '{"active_months": 6}'),
('category_expert', 'Expert Catégorie', 'Aider dans 5 catégories différentes', 'Award', 'brand', 'rare', '{"categories_helped": 5}');

-- Trigger pour mettre à jour automatiquement les niveaux
CREATE OR REPLACE FUNCTION public.update_user_level()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour le niveau quand les points changent
  UPDATE public.user_levels 
  SET 
    level = public.calculate_user_level(NEW.points),
    title = public.get_level_title(public.calculate_user_level(NEW.points)),
    updated_at = now()
  WHERE profile_id = NEW.profile_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_level
  AFTER UPDATE OF points ON public.user_levels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_level();

-- Fonction pour vérifier et attribuer automatiquement les badges
CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_profile_id UUID)
RETURNS VOID AS $$
DECLARE
  badge_record RECORD;
  user_stats RECORD;
BEGIN
  -- Récupérer les statistiques de l'utilisateur
  SELECT * INTO user_stats FROM public.gamification_stats WHERE profile_id = p_profile_id;
  
  -- Vérifier chaque badge
  FOR badge_record IN 
    SELECT * FROM public.badges WHERE is_active = true
  LOOP
    -- Vérifier si l'utilisateur a déjà ce badge
    IF NOT EXISTS (
      SELECT 1 FROM public.user_badges 
      WHERE profile_id = p_profile_id AND badge_id = badge_record.id
    ) THEN
      -- Vérifier les critères du badge
      CASE badge_record.slug
        WHEN 'first_transaction' THEN
          IF user_stats.total_transactions >= 1 THEN
            INSERT INTO public.user_badges (profile_id, badge_id, source_type)
            VALUES (p_profile_id, badge_record.id, 'automatic');
          END IF;
          
        WHEN 'super_lender' THEN
          IF user_stats.completed_lends >= 10 AND user_stats.overall_score >= 4.5 THEN
            INSERT INTO public.user_badges (profile_id, badge_id, source_type)
            VALUES (p_profile_id, badge_record.id, 'automatic');
          END IF;
          
        WHEN 'reliable_neighbor' THEN
          IF user_stats.ratings_count >= 5 AND user_stats.overall_score >= 4.2 THEN
            INSERT INTO public.user_badges (profile_id, badge_id, source_type)
            VALUES (p_profile_id, badge_record.id, 'automatic');
          END IF;
          
        WHEN 'active_borrower' THEN
          IF user_stats.completed_borrows >= 10 THEN
            INSERT INTO public.user_badges (profile_id, badge_id, source_type)
            VALUES (p_profile_id, badge_record.id, 'automatic');
          END IF;
          
        WHEN 'community_champion' THEN
          IF user_stats.completed_lends >= 20 AND user_stats.overall_score >= 4.8 THEN
            INSERT INTO public.user_badges (profile_id, badge_id, source_type)
            VALUES (p_profile_id, badge_record.id, 'automatic');
          END IF;
      END CASE;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
