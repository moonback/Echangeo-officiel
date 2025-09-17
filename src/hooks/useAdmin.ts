import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../store/authStore';
import type {
  AdminStats,
  UserManagement,
  ItemManagement,
  CommunityManagement,
  ReportManagement,
  SystemLog,
  AdminAction,
  AdminDashboardData,
  AdminRole,
  AdminPermissions
} from '../types/admin';
import { ADMIN_PERMISSIONS } from '../types/admin';

// ID de l'administrateur principal
const ADMIN_USER_ID = '3341d50d-778a-47fb-8668-6cbab95482d4';

export function useAdminAuth() {
  const { user, profile } = useAuthStore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [permissions, setPermissions] = useState<AdminPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setAdminRole(null);
      setPermissions(null);
      setLoading(false);
      return;
    }

    // Vérifier si l'utilisateur est l'admin principal
    if (user.id === ADMIN_USER_ID) {
      setIsAdmin(true);
      setAdminRole('super_admin');
      setPermissions(ADMIN_PERMISSIONS.super_admin);
      setLoading(false);
      return;
    }

    // Vérifier dans la base de données pour d'autres admins
    checkAdminStatus(user.id);
  }, [user]);

  const checkAdminStatus = async (userId: string) => {
    try {
      // Pour l'instant, nous utilisons une approche simple
      // Dans le futur, vous pourrez ajouter une table admin_users
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erreur lors de la vérification du statut admin:', error);
        setIsAdmin(false);
        setAdminRole(null);
        setPermissions(null);
      } else {
        // Pour l'instant, seul l'utilisateur spécifique est admin
        setIsAdmin(false);
        setAdminRole(null);
        setPermissions(null);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut admin:', error);
      setIsAdmin(false);
      setAdminRole(null);
      setPermissions(null);
    } finally {
      setLoading(false);
    }
  };

  return { isAdmin, adminRole, permissions, loading };
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les statistiques en parallèle
      const [
        usersResult,
        itemsResult,
        communitiesResult,
        requestsResult,
        messagesResult
      ] = await Promise.all([
        supabase.from('profiles').select('id, created_at', { count: 'exact' }),
        supabase.from('items').select('id, created_at', { count: 'exact' }),
        supabase.from('communities').select('id, created_at', { count: 'exact' }),
        supabase.from('requests').select('id, created_at', { count: 'exact' }),
        supabase.from('messages').select('id, created_at', { count: 'exact' })
      ]);

      // Calculer les utilisateurs actifs (derniers 30 jours)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: activeUsersCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .gte('updated_at', thirtyDaysAgo.toISOString());

      const adminStats: AdminStats = {
        totalUsers: usersResult.count || 0,
        activeUsers: activeUsersCount || 0,
        totalItems: itemsResult.count || 0,
        totalCommunities: communitiesResult.count || 0,
        totalRequests: requestsResult.count || 0,
        totalMessages: messagesResult.count || 0,
        pendingReports: 0, // À implémenter avec une table reports
        systemHealth: 'excellent' // À calculer selon les métriques
      };

      setStats(adminStats);
    } catch (err) {
      console.error('Erreur lors de la récupération des statistiques:', err);
      setError('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
}

export function useAdminUsers() {
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          avatar_url,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (fetchError) throw fetchError;

      // Enrichir les données avec les statistiques
      const enrichedUsers: UserManagement[] = await Promise.all(
        (data || []).map(async (user) => {
          const [itemsCount, requestsCount, communitiesCount] = await Promise.all([
            supabase.from('items').select('id', { count: 'exact' }).eq('owner_id', user.id),
            supabase.from('requests').select('id', { count: 'exact' }).eq('requester_id', user.id),
            supabase.from('community_members').select('id', { count: 'exact' }).eq('user_id', user.id)
          ]);

          return {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            avatar_url: user.avatar_url,
            created_at: user.created_at,
            last_active: user.updated_at,
            is_active: true, // À calculer selon l'activité récente
            is_banned: false, // À implémenter avec une table bans
            total_items: itemsCount.count || 0,
            total_requests: requestsCount.count || 0,
            communities_count: communitiesCount.count || 0,
            reputation_score: 4.5 // À calculer depuis les ratings
          };
        })
      );

      setUsers(enrichedUsers);
    } catch (err) {
      console.error('Erreur lors de la récupération des utilisateurs:', err);
      setError('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const banUser = async (userId: string, reason?: string) => {
    try {
      // Implémenter la logique de bannissement
      console.log('Bannir utilisateur:', userId, reason);
      // Actualiser la liste
      fetchUsers();
    } catch (err) {
      console.error('Erreur lors du bannissement:', err);
      throw err;
    }
  };

  const unbanUser = async (userId: string) => {
    try {
      // Implémenter la logique de débannissement
      console.log('Débannir utilisateur:', userId);
      // Actualiser la liste
      fetchUsers();
    } catch (err) {
      console.error('Erreur lors du débannissement:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, error, refetch: fetchUsers, banUser, unbanUser };
}

export function useAdminItems() {
  const [items, setItems] = useState<ItemManagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('items')
        .select(`
          id,
          title,
          category,
          owner_id,
          is_available,
          created_at,
          profiles!items_owner_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (fetchError) throw fetchError;

      const enrichedItems: ItemManagement[] = (data || []).map((item) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        owner_id: item.owner_id,
        owner_name: item.profiles?.full_name,
        is_available: item.is_available,
        created_at: item.created_at,
        reports_count: 0, // À implémenter avec une table reports
        status: item.is_available ? 'active' : 'suspended'
      }));

      setItems(enrichedItems);
    } catch (err) {
      console.error('Erreur lors de la récupération des objets:', err);
      setError('Erreur lors du chargement des objets');
    } finally {
      setLoading(false);
    }
  };

  const suspendItem = async (itemId: string, reason?: string) => {
    try {
      const { error } = await supabase
        .from('items')
        .update({ is_available: false })
        .eq('id', itemId);

      if (error) throw error;
      fetchItems();
    } catch (err) {
      console.error('Erreur lors de la suspension:', err);
      throw err;
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      fetchItems();
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return { items, loading, error, refetch: fetchItems, suspendItem, deleteItem };
}

export function useAdminCommunities() {
  const [communities, setCommunities] = useState<CommunityManagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('communities')
        .select(`
          id,
          name,
          city,
          country,
          is_active,
          created_at,
          created_by,
          community_stats(total_members)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const enrichedCommunities: CommunityManagement[] = (data || []).map((community) => ({
        id: community.id,
        name: community.name,
        city: community.city,
        country: community.country,
        is_active: community.is_active,
        created_at: community.created_at,
        created_by: community.created_by,
        total_members: community.community_stats?.[0]?.total_members || 0,
        activity_level: 'medium', // À calculer selon l'activité
        reports_count: 0 // À implémenter avec une table reports
      }));

      setCommunities(enrichedCommunities);
    } catch (err) {
      console.error('Erreur lors de la récupération des communautés:', err);
      setError('Erreur lors du chargement des communautés');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  return { communities, loading, error, refetch: fetchCommunities };
}

export function useAdminDashboard() {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { stats } = useAdminStats();
  const { users } = useAdminUsers();
  const { items } = useAdminItems();
  const { communities } = useAdminCommunities();

  useEffect(() => {
    if (stats && users && items && communities) {
      const data: AdminDashboardData = {
        stats,
        recentUsers: users.slice(0, 5),
        recentItems: items.slice(0, 5),
        pendingReports: [], // À implémenter
        systemLogs: [], // À implémenter
        recentActions: [] // À implémenter
      };
      
      setDashboardData(data);
      setLoading(false);
    }
  }, [stats, users, items, communities]);

  return { dashboardData, loading, error };
}