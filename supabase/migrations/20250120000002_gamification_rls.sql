-- Migration pour ajouter les permissions RLS aux tables de gamification

-- Activer RLS sur toutes les tables de gamification
ALTER TABLE public.user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Politiques pour user_levels
CREATE POLICY "Users can view their own level" ON public.user_levels
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can view other users' levels" ON public.user_levels
  FOR SELECT USING (true);

CREATE POLICY "System can insert user levels" ON public.user_levels
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update user levels" ON public.user_levels
  FOR UPDATE USING (true);

-- Politiques pour user_points_history
CREATE POLICY "Users can view their own points history" ON public.user_points_history
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "System can insert points history" ON public.user_points_history
  FOR INSERT WITH CHECK (true);

-- Politiques pour challenges
CREATE POLICY "Anyone can view active challenges" ON public.challenges
  FOR SELECT USING (is_active = true);

CREATE POLICY "System can manage challenges" ON public.challenges
  FOR ALL USING (true);

-- Politiques pour user_challenges
CREATE POLICY "Users can view their own challenges" ON public.user_challenges
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can update their own challenges" ON public.user_challenges
  FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "System can insert user challenges" ON public.user_challenges
  FOR INSERT WITH CHECK (true);

-- Politiques pour badges
CREATE POLICY "Anyone can view badges" ON public.badges
  FOR SELECT USING (is_active = true);

CREATE POLICY "System can manage badges" ON public.badges
  FOR ALL USING (true);

-- Politiques pour user_badges
CREATE POLICY "Users can view their own badges" ON public.user_badges
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can view other users' badges" ON public.user_badges
  FOR SELECT USING (true);

CREATE POLICY "System can insert user badges" ON public.user_badges
  FOR INSERT WITH CHECK (true);

-- Permissions pour les vues
GRANT SELECT ON public.gamification_stats TO authenticated;
GRANT SELECT ON public.leaderboard TO authenticated;

-- Permissions pour les fonctions
GRANT EXECUTE ON FUNCTION public.calculate_user_level(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_level_title(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_user_points(UUID, INTEGER, TEXT, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_award_badges(UUID) TO authenticated;

-- Créer un niveau par défaut pour tous les utilisateurs existants
INSERT INTO public.user_levels (profile_id, level, points, title)
SELECT 
  id as profile_id,
  1 as level,
  0 as points,
  'Nouveau membre' as title
FROM public.profiles
WHERE id NOT IN (SELECT profile_id FROM public.user_levels)
ON CONFLICT (profile_id) DO NOTHING;
