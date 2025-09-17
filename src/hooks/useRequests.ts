import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import type { Request } from '../types';

export function useRequests() {
  return useQuery({
    queryKey: ['requests'],
    queryFn: async () => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      // Query A: requests where I am the requester
      const queryA = supabase
        .from('requests')
        .select(`
          *,
          requester:profiles!requests_requester_id_fkey(*),
          item:items(*, owner:profiles(*))
        `)
        .eq('requester_id', user.data.user.id);

      // Query B: requests on items that I own (filter on foreign table scope)
      const queryB = supabase
        .from('requests')
        .select(`
          *,
          requester:profiles!requests_requester_id_fkey(*),
          item:items!inner(*, owner:profiles(*))
        `)
        .filter('items.owner_id', 'eq', user.data.user.id);

      const [{ data: a, error: errorA }, { data: b, error: errorB }] = await Promise.all([queryA, queryB]);
      if (errorA) throw errorA;
      if (errorB) throw errorB;

      const combined = [...(a ?? []), ...(b ?? [])];
      // De-duplicate by id (a request can appear in both if requester is also owner)
      const dedupedMap = new Map<string, Request>();
      for (const req of combined as Request[]) {
        dedupedMap.set((req as any).id, req);
      }
      const result = Array.from(dedupedMap.values());
      // Sort by created_at desc (client-side)
      result.sort((r1: any, r2: any) => new Date(r2.created_at).getTime() - new Date(r1.created_at).getTime());
      return result;
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
