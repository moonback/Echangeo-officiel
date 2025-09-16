import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import type { Request } from '../types';

export function useRequests() {
  return useQuery({
    queryKey: ['requests'],
    queryFn: async () => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          requester:profiles!requests_requester_id_fkey(*),
          item:items(*, owner:profiles(*))
        `)
        .or(`requester_id.eq.${user.data.user.id},item.owner_id.eq.${user.data.user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Request[];
    },
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      item_id: string;
      message?: string;
      requested_from?: string;
      requested_to?: string;
    }) => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      const { data: request, error } = await supabase
        .from('requests')
        .insert({
          ...data,
          requester_id: user.data.user.id,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return request;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
}

export function useUpdateRequestStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; status: string }) => {
      const { error } = await supabase
        .from('requests')
        .update({ 
          status: data.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
}