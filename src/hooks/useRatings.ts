import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../store/authStore';

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


