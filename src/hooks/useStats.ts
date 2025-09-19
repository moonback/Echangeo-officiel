import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';

export interface AppStats {
  totalUsers: number;
  totalItems: number;
  totalExchanges: number;
  totalCommunities: number;
  recentItemsCount: number;
  activeUsersCount: number;
}

export function useAppStats() {
  return useQuery({
    queryKey: ['appStats'],
    queryFn: async (): Promise<AppStats> => {
      try {
        // Récupérer les statistiques de base avec des requêtes GET normales
        const [
          usersResult,
          itemsResult,
          recentItemsResult
        ] = await Promise.all([
          // Nombre total d'utilisateurs
          supabase
            .from('profiles')
            .select('id')
            .limit(1000), // Limite pour éviter les timeouts
          
          // Nombre total d'objets disponibles
          supabase
            .from('items')
            .select('id')
            .eq('is_available', true)
            .limit(1000),
          
          // Objets ajoutés dans les 30 derniers jours
          supabase
            .from('items')
            .select('id')
            .eq('is_available', true)
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
            .limit(1000)
        ]);

        // Essayer de récupérer les autres statistiques avec gestion d'erreur
        let exchangesCount = 0;
        let communitiesCount = 0;

        try {
          const exchangesQuery = await supabase
            .from('requests')
            .select('id')
            .eq('status', 'completed')
            .limit(1000);
          exchangesCount = exchangesQuery.data?.length || 0;
        } catch (error) {
          console.warn('Table requests non disponible:', error);
        }

        try {
          const communitiesQuery = await supabase
            .from('communities')
            .select('id')
            .eq('is_active', true)
            .limit(1000);
          communitiesCount = communitiesQuery.data?.length || 0;
        } catch (error) {
          console.warn('Table communities non disponible:', error);
        }

        return {
          totalUsers: usersResult.data?.length || 0,
          totalItems: itemsResult.data?.length || 0,
          totalExchanges: exchangesCount,
          totalCommunities: communitiesCount,
          recentItemsCount: recentItemsResult.data?.length || 0,
          activeUsersCount: usersResult.data?.length || 0 // Utiliser le total des utilisateurs comme approximation
        };
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        // Retourner des valeurs par défaut en cas d'erreur
        return {
          totalUsers: 0,
          totalItems: 0,
          totalExchanges: 0,
          totalCommunities: 0,
          recentItemsCount: 0,
          activeUsersCount: 0
        };
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Refetch toutes les 10 minutes
  });
}

// Hook pour les statistiques de l'utilisateur connecté
export function useUserStats(userId?: string) {
  return useQuery({
    queryKey: ['userStats', userId],
    queryFn: async () => {
      if (!userId) return null;

      try {
        // Récupérer les statistiques de base de l'utilisateur
        const userItemsResult = await supabase
          .from('items')
          .select('id')
          .eq('owner_id', userId)
          .eq('is_available', true)
          .limit(1000);

        // Essayer de récupérer les autres statistiques avec gestion d'erreur
        let userExchangesCount = 0;
        let userFavoritesCount = 0;
        let userCommunitiesCount = 0;

        try {
          const exchangesQuery = await supabase
            .from('requests')
            .select('id')
            .or(`requester_id.eq.${userId},owner_id.eq.${userId}`)
            .eq('status', 'completed')
            .limit(1000);
          userExchangesCount = exchangesQuery.data?.length || 0;
        } catch (error) {
          console.warn('Table requests non disponible pour les statistiques utilisateur:', error);
        }

        try {
          const favoritesQuery = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', userId)
            .limit(1000);
          userFavoritesCount = favoritesQuery.data?.length || 0;
        } catch (error) {
          console.warn('Table favorites non disponible:', error);
        }

        try {
          const communitiesQuery = await supabase
            .from('community_members')
            .select('id')
            .eq('user_id', userId)
            .eq('is_active', true)
            .limit(1000);
          userCommunitiesCount = communitiesQuery.data?.length || 0;
        } catch (error) {
          console.warn('Table community_members non disponible:', error);
        }

        return {
          itemsPublished: userItemsResult.data?.length || 0,
          exchangesCompleted: userExchangesCount,
          favoritesCount: userFavoritesCount,
          communitiesJoined: userCommunitiesCount
        };
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques utilisateur:', error);
        return null;
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}
