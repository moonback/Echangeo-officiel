import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import type { Message } from '../types';

export function useConversation(withUserId?: string) {
  return useQuery({
    queryKey: ['messages', withUserId],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const currentUserId = userData.user?.id;
      if (!currentUserId || !withUserId) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${currentUserId},receiver_id.eq.${withUserId}),and(sender_id.eq.${withUserId},receiver_id.eq.${currentUserId})`
        )
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!withUserId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { receiver_id: string; content: string; request_id?: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      const currentUserId = userData.user?.id;
      if (!currentUserId) throw new Error('Not authenticated');

      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUserId,
          receiver_id: data.receiver_id,
          content: data.content,
          request_id: data.request_id,
        })
        .select()
        .single();

      if (error) throw error;
      return message as Message;
    },
    onSuccess: (_message, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.receiver_id] });
    },
  });
}


