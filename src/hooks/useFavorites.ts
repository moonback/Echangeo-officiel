import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../store/authStore';

const FAVORITES_KEY = (userId?: string | null) => ['favorites', userId];
const FAVORITE_ITEM_KEY = (userId?: string | null, itemId?: string) => ['favorite', userId, itemId];

export const useFavorites = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const userId = user?.id;

  const { data: count = 0, isLoading, refetch } = useQuery({
    queryKey: FAVORITES_KEY(userId),
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return 0;
      const { count, error } = await supabase
        .from('favorites')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);
      if (error) throw error;
      return count || 0;
    },
  });

  const toggle = useMutation({
    mutationFn: async (itemId: string) => {
      if (!userId) throw new Error('Not authenticated');
      // Check if exists
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('item_id', itemId)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      if (data?.id) {
        const { error: delError } = await supabase.from('favorites').delete().eq('id', data.id);
        if (delError) throw delError;
        return { action: 'removed' as const };
      } else {
        const { error: insError } = await supabase.from('favorites').insert({ user_id: userId, item_id: itemId });
        if (insError) throw insError;
        return { action: 'added' as const };
      }
    },
    onSuccess: (_res, itemId) => {
      queryClient.invalidateQueries({ queryKey: FAVORITES_KEY(userId) });
      queryClient.invalidateQueries({ queryKey: FAVORITE_ITEM_KEY(userId, itemId) });
    },
  });

  const refresh = useCallback(() => refetch(), [refetch]);

  return {
    count,
    isLoading,
    toggle: toggle.mutateAsync,
    refresh,
  };
};

export const useIsItemFavorited = (itemId?: string) => {
  const { user } = useAuthStore();
  const userId = user?.id;
  const query = useQuery({
    queryKey: FAVORITE_ITEM_KEY(userId, itemId),
    enabled: !!userId && !!itemId,
    queryFn: async () => {
      if (!userId || !itemId) return false;
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('item_id', itemId)
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return !!data?.id;
    },
  });
  return query;
};


