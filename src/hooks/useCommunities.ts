import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import type { 
  Community, 
  CommunityMember, 
  CommunityEvent, 
  CommunityDiscussion,
  NearbyCommunity,
  CommunityOverview,
  Item
} from '../types';

// Note: Utilisation de (supabase as any) pour les tables de communautés
// car elles ne sont pas encore dans les types générés de Supabase

// ===== QUERIES =====

/**
 * Hook pour récupérer toutes les communautés actives
 */
export function useCommunities() {
  return useQuery({
    queryKey: ['communities'],
    queryFn: async (): Promise<CommunityOverview[]> => {
      const { data, error } = await supabase
        .from('communities')
        .select(`
          *,
          stats:community_stats(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook pour récupérer une communauté spécifique avec ses détails
 */
export function useCommunity(communityId: string) {
  return useQuery({
    queryKey: ['community', communityId],
    queryFn: async (): Promise<Community | null> => {
      const { data, error } = await supabase
        .from('communities')
        .select(`
          *,
          stats:community_stats(*),
          members:community_members(
            *,
            user:profiles(*)
          ),
          events:community_events(
            *,
            creator:profiles(*)
          ),
          discussions:community_discussions(
            *,
            author:profiles(*)
          )
        `)
        .eq('id', communityId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!communityId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook pour trouver les communautés proches d'une position
 */
export function useNearbyCommunities(
  latitude: number, 
  longitude: number, 
  radiusKm: number = 10
) {
  return useQuery({
    queryKey: ['nearbyCommunities', latitude, longitude, radiusKm],
    queryFn: async (): Promise<NearbyCommunity[]> => {
      try {
        // Essayer d'abord la fonction PostgreSQL
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .rpc('find_nearby_communities', {
            p_latitude: latitude,
            p_longitude: longitude,
            p_radius_km: radiusKm
          });

        if (error) throw error;
        return data || [];
      } catch {
        // Fallback : calcul côté client si la fonction PostgreSQL n'est pas disponible
        console.warn('Fonction PostgreSQL non disponible, calcul côté client');
        
        const { data: communities, error } = await supabase
          .from('communities')
          .select(`
            id,
            name,
            center_latitude,
            center_longitude,
            stats:community_stats(total_members, total_items)
          `)
          .eq('is_active', true)
          .not('center_latitude', 'is', null)
          .not('center_longitude', 'is', null);

        if (error) throw error;

        // Calculer les distances côté client
        const nearbyCommunities = communities
          ?.map(community => {
            const communityData = community as {
              id: string;
              name: string;
              center_latitude: number;
              center_longitude: number;
              stats?: { total_members: number; total_items: number };
            };
            
            const distance = calculateDistance(
              latitude,
              longitude,
              communityData.center_latitude,
              communityData.center_longitude
            );
            return {
              community_id: communityData.id,
              community_name: communityData.name,
              distance_km: distance,
              member_count: communityData.stats?.total_members || 0,
              items_count: communityData.stats?.total_items || 0
            };
          })
          .filter(community => community.distance_km <= radiusKm)
          .sort((a, b) => a.distance_km - b.distance_km) || [];

        return nearbyCommunities;
      }
    },
    enabled: !!latitude && !!longitude,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Fonction utilitaire pour calculer la distance entre deux points (formule de Haversine)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c;
}

/**
 * Hook pour récupérer les communautés d'un utilisateur
 */
export function useUserCommunities(userId?: string) {
  return useQuery({
    queryKey: ['userCommunities', userId],
    queryFn: async (): Promise<Community[]> => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('community_members')
        .select(`
          community:communities(*)
        `)
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) throw error;
      return data?.map((item: { community: Community }) => item.community).filter(Boolean) || [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook pour récupérer le quartier d'inscription de l'utilisateur (le premier quartier rejoint)
 */
export function useUserSignupCommunity(userId?: string) {
  return useQuery({
    queryKey: ['userSignupCommunity', userId],
    queryFn: async (): Promise<Community | null> => {
      if (!userId) return null;

      // Récupérer le premier quartier rejoint par l'utilisateur (chronologiquement)
      const { data, error } = await supabase
        .from('community_members')
        .select(`
          community:communities(*)
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('joined_at', { ascending: true })
        .limit(1);

      if (error) throw error;
      const firstCommunity = data?.[0]?.community;
      return firstCommunity || null;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 10, // Cache plus long car le quartier d'inscription ne change pas
  });
}

/**
 * Hook pour récupérer les membres d'une communauté
 */
export function useCommunityMembers(communityId: string) {
  return useQuery({
    queryKey: ['communityMembers', communityId],
    queryFn: async (): Promise<CommunityMember[]> => {
      const { data, error } = await supabase
        .from('community_members')
        .select(`
          *,
          user:profiles(*)
        `)
        .eq('community_id', communityId)
        .eq('is_active', true)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!communityId,
    staleTime: 1000 * 60 * 3,
  });
}

/**
 * Hook pour récupérer les événements d'une communauté
 */
export function useCommunityEvents(communityId: string) {
  return useQuery({
    queryKey: ['communityEvents', communityId],
    queryFn: async (): Promise<CommunityEvent[]> => {
      const { data, error } = await supabase
        .from('community_events')
        .select(`
          *,
          creator:profiles(*),
          participants:event_participants(
            *,
            user:profiles(*)
          )
        `)
        .eq('community_id', communityId)
        .eq('is_active', true)
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!communityId,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Hook pour récupérer les discussions d'une communauté
 */
export function useCommunityDiscussions(communityId: string) {
  return useQuery({
    queryKey: ['communityDiscussions', communityId],
    queryFn: async (): Promise<CommunityDiscussion[]> => {
      const { data, error } = await supabase
        .from('community_discussions')
        .select(`
          *,
          author:profiles(*),
          replies:discussion_replies(
            *,
            author:profiles(*)
          )
        `)
        .eq('community_id', communityId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!communityId,
    staleTime: 1000 * 60 * 1, // 1 minute pour les discussions
  });
}

// ===== MUTATIONS =====

/**
 * Hook pour rejoindre une communauté
 */
export function useJoinCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      communityId, 
      userId, 
      role = 'member' 
    }: { 
      communityId: string; 
      userId: string; 
      role?: 'member' | 'moderator' | 'admin' 
    }) => {
      // Vérifier d'abord si l'utilisateur est déjà membre
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existingMember } = await (supabase as any)
        .from('community_members')
        .select('id')
        .eq('community_id', communityId)
        .eq('user_id', userId)
        .single();

      if (existingMember) {
        // Mettre à jour le membre existant
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from('community_members')
          .update({
            role,
            is_active: true,
            joined_at: new Date().toISOString()
          })
          .eq('id', existingMember.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Créer un nouveau membre
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from('community_members')
          .insert({
            community_id: communityId,
            user_id: userId,
            role,
            is_active: true,
            joined_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
            onSuccess: (data: { user_id: string; community_id: string } | null) => {
              // Invalider les caches concernés
              if (data) {
                queryClient.invalidateQueries({ queryKey: ['userCommunities', data.user_id] });
                queryClient.invalidateQueries({ queryKey: ['communityMembers', data.community_id] });
                queryClient.invalidateQueries({ queryKey: ['community', data.community_id] });
                queryClient.invalidateQueries({ queryKey: ['communities'] });
              }
            },
  });
}

/**
 * Hook pour quitter une communauté
 */
export function useLeaveCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      communityId, 
      userId 
    }: { 
      communityId: string; 
      userId: string; 
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('community_members')
        .update({ is_active: false })
        .eq('community_id', communityId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      // Invalider les caches concernés
      queryClient.invalidateQueries({ queryKey: ['userCommunities', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['communityMembers', variables.communityId] });
      queryClient.invalidateQueries({ queryKey: ['community', variables.communityId] });
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
  });
}

/**
 * Hook pour créer un événement communautaire
 */
export function useCreateCommunityEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventData: {
      community_id: string;
      title: string;
      description?: string;
      event_type: 'meetup' | 'swap' | 'workshop' | 'social' | 'other';
      location?: string;
      latitude?: number;
      longitude?: number;
      start_date: string;
      end_date?: string;
      max_participants?: number;
      created_by: string;
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('community_events')
        .insert(eventData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data: { community_id: string } | null) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['communityEvents', data.community_id] });
        queryClient.invalidateQueries({ queryKey: ['community', data.community_id] });
      }
    },
  });
}

/**
 * Hook pour s'inscrire à un événement
 */
export function useJoinEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      eventId, 
      userId 
    }: { 
      eventId: string; 
      userId: string; 
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('event_participants')
        .insert({
          event_id: eventId,
          user_id: userId,
          status: 'registered'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityEvents'] });
    },
  });
}

/**
 * Hook pour créer une discussion communautaire
 */
export function useCreateDiscussion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (discussionData: {
      community_id: string;
      title: string;
      content?: string;
      author_id: string;
      category: 'general' | 'items' | 'events' | 'help' | 'announcements';
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('community_discussions')
        .insert(discussionData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data: { community_id: string } | null) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['communityDiscussions', data.community_id] });
        queryClient.invalidateQueries({ queryKey: ['community', data.community_id] });
      }
    },
  });
}

/**
 * Hook pour répondre à une discussion
 */
export function useReplyToDiscussion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (replyData: {
      discussion_id: string;
      author_id: string;
      content: string;
      parent_reply_id?: string;
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('discussion_replies')
        .insert(replyData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityDiscussions'] });
    },
  });
}

/**
 * Hook pour récupérer les objets d'une communauté
 */
export function useCommunityItems(communityId: string) {
  return useQuery({
    queryKey: ['communityItems', communityId],
    queryFn: async (): Promise<Item[]> => {
      if (!communityId) return [];

      // Récupérer d'abord les IDs des membres de la communauté
      const { data: members, error: membersError } = await supabase
        .from('community_members')
        .select('user_id')
        .eq('community_id', communityId)
        .eq('is_active', true);

      if (membersError) {
        console.error('Erreur lors de la récupération des membres:', membersError);
        throw membersError;
      }

      if (!members || members.length === 0) {
        return [];
      }

      // Extraire les IDs des membres
      const memberIds = members.map(member => member.user_id);

      // Récupérer tous les objets des membres de la communauté
      const { data, error } = await supabase
        .from('items')
        .select(`
          *,
          owner:profiles!items_owner_id_fkey(*),
          images:item_images(*)
        `)
        .eq('is_available', true)
        .eq('suspended_by_admin', false)
        .in('owner_id', memberIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des objets de la communauté:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!communityId,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

/**
 * Hook pour créer une nouvelle communauté
 */
export function useCreateCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (communityData: {
      name: string;
      description?: string;
      city: string;
      postal_code?: string;
      center_latitude?: number;
      center_longitude?: number;
      radius_km?: number;
      created_by: string;
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('communities')
        .insert({
          ...communityData,
          radius_km: communityData.radius_km || 5,
          country: 'France'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data: { id: string; created_by: string } | null) => {
      if (data) {
        // Ajouter le créateur comme admin de la communauté
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any)
          .from('community_members')
          .insert({
            community_id: data.id,
            user_id: data.created_by,
            role: 'admin',
            is_active: true
          });

        queryClient.invalidateQueries({ queryKey: ['communities'] });
        queryClient.invalidateQueries({ queryKey: ['userCommunities', data.created_by] });
      }
    },
  });
}
