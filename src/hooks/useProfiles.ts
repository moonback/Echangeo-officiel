import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import type { Profile, Item } from '../types';

export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;
      return data as Profile[];
    },
  });
}

export function useNeighbours() {
  return useQuery({
    queryKey: ['neighbours'],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const currentUserId = userData.user?.id;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', currentUserId ?? '');

      if (error) throw error;
      return data as Profile[];
    },
  });
}

export function useProfile(id?: string) {
  return useQuery({
    queryKey: ['profile', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!id,
  });
}

export function useItemsByOwner(ownerId?: string) {
  return useQuery({
    queryKey: ['items', 'owner', ownerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('items')
        .select(`*, images:item_images(*)`)
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Item[];
    },
    enabled: !!ownerId,
  });
}


