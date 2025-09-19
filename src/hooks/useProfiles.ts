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

      // Récupérer les profils avec le nombre d'objets
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', currentUserId ?? '');

      if (error) throw error;

      // Enrichir avec le nombre d'objets pour chaque profil
      if (profiles && profiles.length > 0) {
        const profileIds = profiles.map(p => p.id);
        
        // Compter les objets par propriétaire
        const { data: itemCounts } = await supabase
          .from('items')
          .select('owner_id, id')
          .in('owner_id', profileIds)
          .eq('is_available', true); // Seulement les objets disponibles

        // Créer un map des compteurs
        const countsMap = new Map<string, number>();
        if (itemCounts) {
          for (const item of itemCounts) {
            const ownerId = (item as any).owner_id;
            countsMap.set(ownerId, (countsMap.get(ownerId) || 0) + 1);
          }
        }

        // Enrichir les profils avec les compteurs
        return profiles.map(profile => ({
          ...profile,
          items_count: countsMap.get(profile.id) || 0,
        })) as (Profile & { items_count: number })[];
      }

      return profiles as Profile[];
    },
  });
}

export function useProfile(id?: string) {
  return useQuery({
    queryKey: ['profile', id],
    queryFn: async () => {
      // Base profile
      const { data: base, error } = await supabase
        .from('profiles')
        .select(`*`)
        .eq('id', id)
        .single();
      if (error) throw error;

      // Parallel counts (items owned, completed borrow requests made by the user)
      const [itemsCountRes, completedBorrowsRes] = await Promise.all([
        supabase.from('items').select('*', { count: 'exact', head: true }).eq('owner_id', id),
        supabase.from('requests').select('*', { count: 'exact', head: true }).eq('requester_id', id).eq('status', 'completed'),
      ]);

      const profile: any = { ...base };
      profile.items_count = itemsCountRes.count ?? 0;
      profile.completed_borrows = completedBorrowsRes.count ?? 0;
      return profile as Profile;
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

export function useBorrowHistory(userId?: string) {
  return useQuery({
    queryKey: ['borrow-history', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('requests')
        .select(`*, item:items(*), owner:items(owner:profiles(*))`)
        .eq('requester_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!userId,
  });
}

export function useLendHistory(userId?: string) {
  return useQuery({
    queryKey: ['lend-history', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('requests')
        .select(`*, item:items!inner(*), requester:profiles(*)`)
        .eq('item.owner_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!userId,
  });
}

export function useTransactions(userId?: string) {
  return useQuery({
    queryKey: ['transactions', userId],
    queryFn: async () => {
      const [asBorrower, asLender] = await Promise.all([
        supabase
          .from('requests')
          .select(`*, item:items(*, owner:profiles(*))`)
          .eq('requester_id', userId),
        supabase
          .from('requests')
          .select(`*, item:items!inner(*), requester:profiles!requests_requester_id_fkey(*)`)
          .eq('items.owner_id', userId),
      ]);

      const a = (asBorrower.data ?? []).map((r: any) => ({ ...r, role: 'borrower' as const }));
      const b = (asLender.data ?? []).map((r: any) => ({ ...r, role: 'lender' as const }));
      const merged = [...a, ...b].sort((r1: any, r2: any) => new Date(r2.created_at).getTime() - new Date(r1.created_at).getTime());
      return merged;
    },
    enabled: !!userId,
  });
}


