import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAdminUsers } from '../../hooks/useAdmin';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminTable from '../../components/admin/AdminTable';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { UserManagement } from '../../types/admin';

export default function AdminUsersPage() {
  const { users, loading, error, refetch, banUser, unbanUser } = useAdminUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'banned'>('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'active' && !user.is_banned) ||
      (filterStatus === 'banned' && user.is_banned);
    
    return matchesSearch && matchesFilter;
  });

  const handleBanUser = async (userId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir bannir cet utilisateur ?')) {
      try {
        await banUser(userId, 'Banni par l\'administrateur');
      } catch (error) {
        console.error('Erreur lors du bannissement:', error);
        alert('Erreur lors du bannissement de l\'utilisateur');
      }
    }
  };

  const handleUnbanUser = async (userId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir débannir cet utilisateur ?')) {
      try {
        await unbanUser(userId);
      } catch (error) {
        console.error('Erreur lors du débannissement:', error);
        alert('Erreur lors du débannissement de l\'utilisateur');
      }
    }
  };

  const columns = [
    {
      key: 'user_info',
      title: 'Utilisateur',
      render: (value: any, user: UserManagement) => (
        <div className="flex items-center space-x-3">
          <img
            src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.full_name}&background=random`}
            alt={user.full_name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-medium text-gray-900">{user.full_name || 'Sans nom'}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'created_at',
      title: 'Inscrit',
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {formatDistanceToNow(new Date(value), { addSuffix: true, locale: fr })}
        </span>
      )
    },
    {
      key: 'last_active',
      title: 'Dernière activité',
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {value ? formatDistanceToNow(new Date(value), { addSuffix: true, locale: fr }) : 'Jamais'}
        </span>
      )
    },
    {
      key: 'total_items',
      title: 'Objets',
      render: (value: number) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value}
        </span>
      )
    },
    {
      key: 'total_requests',
      title: 'Demandes',
      render: (value: number) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {value}
        </span>
      )
    },
    {
      key: 'reputation_score',
      title: 'Réputation',
      render: (value: number) => (
        <div className="flex items-center space-x-1">
          <span className="text-sm font-medium text-gray-900">{value?.toFixed(1) || 'N/A'}</span>
          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Statut',
      render: (value: any, user: UserManagement) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.is_banned
            ? 'bg-red-100 text-red-800'
            : user.is_active
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {user.is_banned ? 'Banni' : user.is_active ? 'Actif' : 'Inactif'}
        </span>
      )
    }
  ];

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Gestion des utilisateurs</h1>
            <p className="text-gray-600 mt-2">
              {users.length} utilisateur{users.length > 1 ? 's' : ''} au total
            </p>
          </div>
          <button
            onClick={refetch}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Actualisation...' : 'Actualiser'}
          </button>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 shadow-sm"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher un utilisateur
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  id="search"
                  placeholder="Nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="lg:w-48">
              <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filtrer par statut
              </label>
              <select
                id="filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous</option>
                <option value="active">Actifs</option>
                <option value="banned">Bannis</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Users Table */}
        <AdminTable
          data={filteredUsers}
          columns={columns}
          loading={loading}
          emptyMessage="Aucun utilisateur trouvé"
          actions={(user: UserManagement) => (
            <div className="flex space-x-2">
              {!user.is_banned ? (
                <button
                  onClick={() => handleBanUser(user.id)}
                  className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                >
                  Bannir
                </button>
              ) : (
                <button
                  onClick={() => handleUnbanUser(user.id)}
                  className="px-3 py-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
                >
                  Débannir
                </button>
              )}
              <button className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors">
                Détails
              </button>
            </div>
          )}
        />
      </div>
    </AdminLayout>
  );
}
