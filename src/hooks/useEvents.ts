import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import type { CommunityEvent, EventParticipant } from '../types';

// ===== QUERIES =====

/**
 * Hook pour récupérer tous les événements d'un utilisateur (toutes communautés)
 */
export function useUserEvents(userId?: string) {
  return useQuery({
    queryKey: ['userEvents', userId],
    queryFn: async (): Promise<CommunityEvent[]> => {
      if (!userId) return [];

      // Récupérer les communautés de l'utilisateur
      const { data: userCommunities, error: communitiesError } = await supabase
        .from('community_members')
        .select('community_id')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (communitiesError) throw communitiesError;

      if (!userCommunities || userCommunities.length === 0) {
        return [];
      }

      const communityIds = userCommunities.map(uc => uc.community_id);

      // Récupérer tous les événements des communautés de l'utilisateur
      const { data, error } = await supabase
        .from('community_events')
        .select(`
          *,
          community:communities(id, name, city),
          creator:profiles(*),
          participants:event_participants(
            *,
            user:profiles(*)
          )
        `)
        .in('community_id', communityIds)
        .eq('is_active', true)
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook pour récupérer les événements à venir d'un utilisateur
 */
export function useUpcomingUserEvents(userId?: string) {
  const { data: allEvents, ...rest } = useUserEvents(userId);
  
  const upcomingEvents = allEvents?.filter(event => {
    const now = new Date();
    const startDate = new Date(event.start_date);
    return startDate > now;
  }) || [];

  return {
    data: upcomingEvents,
    ...rest
  };
}

/**
 * Hook pour récupérer les événements passés d'un utilisateur
 */
export function usePastUserEvents(userId?: string) {
  const { data: allEvents, ...rest } = useUserEvents(userId);
  
  const pastEvents = allEvents?.filter(event => {
    const now = new Date();
    const endDate = event.end_date ? new Date(event.end_date) : new Date(event.start_date);
    return endDate < now;
  }) || [];

  return {
    data: pastEvents,
    ...rest
  };
}

/**
 * Hook pour récupérer les événements où l'utilisateur participe
 */
export function useUserParticipatingEvents(userId?: string) {
  const { data: allEvents, ...rest } = useUserEvents(userId);
  
  const participatingEvents = allEvents?.filter(event => 
    event.participants?.some(p => p.user_id === userId)
  ) || [];

  return {
    data: participatingEvents,
    ...rest
  };
}

/**
 * Hook pour récupérer les événements créés par l'utilisateur
 */
export function useUserCreatedEvents(userId?: string) {
  return useQuery({
    queryKey: ['userCreatedEvents', userId],
    queryFn: async (): Promise<CommunityEvent[]> => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('community_events')
        .select(`
          *,
          community:communities(id, name, city),
          creator:profiles(*),
          participants:event_participants(
            *,
            user:profiles(*)
          )
        `)
        .eq('created_by', userId)
        .eq('is_active', true)
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Hook pour récupérer les événements proches géographiquement
 */
export function useNearbyEvents(
  latitude: number, 
  longitude: number, 
  radiusKm: number = 10
) {
  return useQuery({
    queryKey: ['nearbyEvents', latitude, longitude, radiusKm],
    queryFn: async (): Promise<CommunityEvent[]> => {
      try {
        // Essayer d'abord la fonction PostgreSQL
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .rpc('find_nearby_events', {
            p_latitude: latitude,
            p_longitude: longitude,
            p_radius_km: radiusKm
          });

        if (error) throw error;
        return data || [];
      } catch {
        // Fallback : calcul côté client
        console.warn('Fonction PostgreSQL non disponible, calcul côté client');
        
        const { data: events, error } = await supabase
          .from('community_events')
          .select(`
            *,
            community:communities(id, name, city, center_latitude, center_longitude),
            creator:profiles(*),
            participants:event_participants(
              *,
              user:profiles(*)
            )
          `)
          .eq('is_active', true)
          .not('latitude', 'is', null)
          .not('longitude', 'is', null);

        if (error) throw error;

        // Calculer les distances côté client
        const nearbyEvents = events
          ?.map(event => {
            const eventData = event as any;
            const distance = calculateDistance(
              latitude,
              longitude,
              eventData.latitude,
              eventData.longitude
            );
            return { ...eventData, distance };
          })
          .filter(event => event.distance <= radiusKm)
          .sort((a, b) => a.distance - b.distance) || [];

        return nearbyEvents;
      }
    },
    enabled: !!latitude && !!longitude,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Fonction utilitaire pour calculer la distance entre deux points
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c;
}

// ===== MUTATIONS =====

/**
 * Hook pour quitter un événement
 */
export function useLeaveEvent() {
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
      const { error } = await (supabase as any)
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityEvents'] });
      queryClient.invalidateQueries({ queryKey: ['userEvents'] });
      queryClient.invalidateQueries({ queryKey: ['userParticipatingEvents'] });
    },
  });
}

/**
 * Hook pour mettre à jour le statut d'un participant
 */
export function useUpdateParticipantStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      participantId, 
      status 
    }: { 
      participantId: string; 
      status: 'registered' | 'confirmed' | 'cancelled'; 
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('event_participants')
        .update({ status })
        .eq('id', participantId)
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
 * Hook pour modifier un événement
 */
export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventData: {
      id: string;
      title?: string;
      description?: string;
      event_type?: 'meetup' | 'swap' | 'workshop' | 'social' | 'other';
      location?: string;
      latitude?: number;
      longitude?: number;
      start_date?: string;
      end_date?: string;
      max_participants?: number;
    }) => {
      const { id, ...updates } = eventData;
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('community_events')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data: { community_id: string } | null) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['communityEvents', data.community_id] });
        queryClient.invalidateQueries({ queryKey: ['userCreatedEvents'] });
      }
    },
  });
}

/**
 * Hook pour supprimer un événement
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      eventId 
    }: { 
      eventId: string; 
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('community_events')
        .update({ is_active: false })
        .eq('id', eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityEvents'] });
      queryClient.invalidateQueries({ queryKey: ['userCreatedEvents'] });
      queryClient.invalidateQueries({ queryKey: ['userEvents'] });
    },
  });
}

/**
 * Hook pour envoyer des notifications d'événement
 */
export function useSendEventNotification() {
  return useMutation({
    mutationFn: async ({
      eventId,
      type,
      message,
      recipientIds
    }: {
      eventId: string;
      type: 'reminder' | 'update' | 'cancellation';
      message?: string;
      recipientIds?: string[];
    }) => {
      // TODO: Implémenter l'envoi de notifications
      // Pour l'instant, on simule l'envoi
      console.log('Sending notification:', { eventId, type, message, recipientIds });
      
      // Simulation d'un délai d'envoi
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true, sentCount: recipientIds?.length || 0 };
    },
  });
}

/**
 * Hook pour récupérer les statistiques d'un événement
 */
export function useEventStats(eventId: string) {
  return useQuery({
    queryKey: ['eventStats', eventId],
    queryFn: async () => {
      const { data: event, error } = await supabase
        .from('community_events')
        .select(`
          *,
          participants:event_participants(
            *,
            user:profiles(*)
          )
        `)
        .eq('id', eventId)
        .single();

      if (error) throw error;
      if (!event) return null;

      const participants = event.participants || [];
      const now = new Date();
      const startDate = new Date(event.start_date);
      const endDate = event.end_date ? new Date(event.end_date) : startDate;

      return {
        totalParticipants: participants.length,
        confirmedParticipants: participants.filter(p => p.status === 'confirmed').length,
        registeredParticipants: participants.filter(p => p.status === 'registered').length,
        cancelledParticipants: participants.filter(p => p.status === 'cancelled').length,
        confirmationRate: participants.length > 0 
          ? Math.round((participants.filter(p => p.status === 'confirmed').length / participants.length) * 100)
          : 0,
        isUpcoming: now < startDate,
        isOngoing: now >= startDate && now <= endDate,
        isPast: now > endDate,
        daysUntilStart: Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        capacity: event.max_participants || null,
        capacityUsed: event.max_participants 
          ? Math.round((participants.length / event.max_participants) * 100)
          : null
      };
    },
    enabled: !!eventId,
    staleTime: 1000 * 60 * 1, // 1 minute
  });
}
