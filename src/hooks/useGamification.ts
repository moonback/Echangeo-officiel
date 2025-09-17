import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../store/authStore';

// Types pour la gamification
export interface UserLevel {
  id: string;
  profile_id: string;
  level: number;
  points: number;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface GamificationStats {
  profile_id: string;
  level: number;
  points: number;
  title: string;
  ratings_count: number;
  overall_score: number;
  completed_lends: number;
  completed_borrows: number;
  total_transactions: number;
  badges_count: number;
}

export interface LeaderboardEntry {
  profile_id: string;
  full_name: string;
  avatar_url?: string;
  level: number;
  points: number;
  title: string;
  badges_count: number;
  position: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  target_value: number;
  reward_points: number;
  reward_badge?: string;
  reward_title?: string;
  is_active: boolean;
}

export interface UserChallenge {
  id: string;
  profile_id: string;
  challenge_id: string;
  progress: number;
  is_completed: boolean;
  completed_at?: string;
  claimed_at?: string;
  challenge?: Challenge;
}

export interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon?: string;
  color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirements: Record<string, any>;
  is_active: boolean;
}

export interface UserBadge {
  id: string;
  profile_id: string;
  badge_id: string;
  earned_at: string;
  source_type?: string;
  source_id?: string;
  badge?: Badge;
}

// Hook pour récupérer les statistiques de gamification d'un utilisateur
export function useGamificationStats(profileId?: string) {
  const { user } = useAuthStore();
  const targetId = profileId || user?.id;

  return useQuery({
    queryKey: ['gamificationStats', targetId],
    queryFn: async (): Promise<GamificationStats | null> => {
      if (!targetId) return null;

      const { data, error } = await supabase
        .from('gamification_stats')
        .select('*')
        .eq('profile_id', targetId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Pas de données
        throw error;
      }

      return data;
    },
    enabled: !!targetId,
  });
}

// Hook pour récupérer le niveau d'un utilisateur
export function useUserLevel(profileId?: string) {
  const { user } = useAuthStore();
  const targetId = profileId || user?.id;

  return useQuery({
    queryKey: ['userLevel', targetId],
    queryFn: async (): Promise<UserLevel | null> => {
      if (!targetId) return null;

      const { data, error } = await supabase
        .from('user_levels')
        .select('*')
        .eq('profile_id', targetId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Pas de données
        throw error;
      }

      return data;
    },
    enabled: !!targetId,
  });
}

// Hook pour récupérer les badges d'un utilisateur
export function useUserBadges(profileId?: string) {
  const { user } = useAuthStore();
  const targetId = profileId || user?.id;

  return useQuery({
    queryKey: ['userBadges', targetId],
    queryFn: async (): Promise<UserBadge[]> => {
      if (!targetId) return [];

      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge:badges(*)
        `)
        .eq('profile_id', targetId)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!targetId,
  });
}

// Hook pour récupérer le leaderboard
export function useLeaderboard(limit: number = 50) {
  return useQuery({
    queryKey: ['leaderboard', limit],
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
  });
}

// Hook pour récupérer les défis disponibles
export function useChallenges(type?: 'daily' | 'weekly' | 'monthly') {
  return useQuery({
    queryKey: ['challenges', type],
    queryFn: async (): Promise<Challenge[]> => {
      let query = supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true);

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}

// Hook pour récupérer les défis de l'utilisateur
export function useUserChallenges() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['userChallenges', user?.id],
    queryFn: async (): Promise<UserChallenge[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_challenges')
        .select(`
          *,
          challenge:challenges(*)
        `)
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

// Hook pour ajouter des points à un utilisateur
export function useAddPoints() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (params: {
      points: number;
      reason: string;
      sourceType?: string;
      sourceId?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.rpc('add_user_points', {
        p_profile_id: user.id,
        p_points: params.points,
        p_reason: params.reason,
        p_source_type: params.sourceType || 'manual',
        p_source_id: params.sourceId || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalider les caches liés à la gamification
      queryClient.invalidateQueries({ queryKey: ['gamificationStats'] });
      queryClient.invalidateQueries({ queryKey: ['userLevel'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['userBadges'] });
    },
  });
}

// Hook pour récupérer une récompense de défi
export function useClaimChallengeReward() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (challengeId: string) => {
      if (!user) throw new Error('Not authenticated');

      // Marquer le défi comme récupéré
      const { error } = await supabase
        .from('user_challenges')
        .update({ claimed_at: new Date().toISOString() })
        .eq('profile_id', user.id)
        .eq('challenge_id', challengeId)
        .eq('is_completed', true);

      if (error) throw error;

      // Récupérer les détails du défi pour ajouter les points
      const { data: challengeData } = await supabase
        .from('challenges')
        .select('reward_points, title')
        .eq('id', challengeId)
        .single();

      if (challengeData) {
        // Ajouter les points de récompense
        const { error: pointsError } = await supabase.rpc('add_user_points', {
          p_profile_id: user.id,
          p_points: challengeData.reward_points,
          p_reason: `Récompense défi: ${challengeData.title}`,
          p_source_type: 'challenge',
          p_source_id: challengeId,
        });

        if (pointsError) throw pointsError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userChallenges'] });
      queryClient.invalidateQueries({ queryKey: ['gamificationStats'] });
      queryClient.invalidateQueries({ queryKey: ['userLevel'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}

// Hook pour vérifier et attribuer automatiquement les badges
export function useCheckBadges() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.rpc('check_and_award_badges', {
        p_profile_id: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBadges'] });
      queryClient.invalidateQueries({ queryKey: ['gamificationStats'] });
    },
  });
}

// Fonction utilitaire pour calculer les points gagnés lors d'une transaction
export function calculateTransactionPoints(
  type: 'lend' | 'borrow',
  rating?: number
): number {
  const basePoints = type === 'lend' ? 50 : 30;
  
  if (rating && rating >= 4.5) {
    return basePoints + 20; // Bonus pour excellente évaluation
  }
  
  return basePoints;
}

// Fonction utilitaire pour obtenir la couleur du niveau
export function getLevelColor(level: number): string {
  if (level >= 10) return 'text-purple-600';
  if (level >= 7) return 'text-blue-600';
  if (level >= 5) return 'text-green-600';
  if (level >= 3) return 'text-yellow-600';
  return 'text-gray-600';
}

// Fonction utilitaire pour obtenir l'icône du niveau
export function getLevelIcon(level: number): string {
  if (level >= 10) return 'Crown';
  if (level >= 7) return 'Award';
  if (level >= 5) return 'Trophy';
  if (level >= 3) return 'Star';
  return 'Users';
}
