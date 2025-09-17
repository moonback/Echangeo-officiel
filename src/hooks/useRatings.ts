import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../store/authStore';
import type { UserRating, ProfileReputationStats, ProfileBadgeRow } from '../types';

export function useUpsertItemRating() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (params: { item_id: string; score: number; comment?: string }) => {
      if (!user) throw new Error('Not authenticated');
      const payload = {
        item_id: params.item_id,
        rater_id: user.id,
        score: params.score,
        comment: params.comment ?? null,
      };
      const { error } = await supabase.from('item_ratings').upsert(payload, { onConflict: 'item_id,rater_id' });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      // Refresh lists and detail to update rating stats
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['item', vars.item_id] });
    },
  });
}

// Create or update a user-to-user rating for a completed request
export function useUpsertUserRating() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (params: {
      request_id: string;
      rated_user_id: string;
      communication_score: number;
      punctuality_score: number;
      care_score: number;
      comment?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      const payload = {
        request_id: params.request_id,
        rater_id: user.id,
        rated_user_id: params.rated_user_id,
        communication_score: params.communication_score,
        punctuality_score: params.punctuality_score,
        care_score: params.care_score,
        comment: params.comment ?? null,
      };
      const { error } = await supabase
        .from('user_ratings')
        .upsert(payload, { onConflict: 'request_id,rater_id' });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['profileReputation', vars.rated_user_id] });
      queryClient.invalidateQueries({ queryKey: ['profileBadges', vars.rated_user_id] });
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
}

// Load aggregated reputation stats for a profile
export async function fetchProfileReputation(profileId: string): Promise<ProfileReputationStats | null> {
  const { data, error } = await supabase
    .from('profile_reputation_stats')
    .select('*')
    .eq('profile_id', profileId)
    .maybeSingle();
  if (error) return null;
  return (data as unknown) as ProfileReputationStats | null;
}

// Load badges for a profile
export async function fetchProfileBadges(profileId: string): Promise<ProfileBadgeRow[]> {
  const { data, error } = await supabase
    .from('profile_badges')
    .select('*')
    .eq('profile_id', profileId);
  if (error || !data) return [];
  return (data as unknown) as ProfileBadgeRow[];
}


