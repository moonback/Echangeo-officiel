import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAdminCommunities } from '../../hooks/useAdmin';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminTable from '../../components/admin/AdminTable';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { CommunityManagement } from '../../types/admin';

export default function AdminCommunitiesPage() {
  const { communities, loading, error, refetch } = useAdminCommunities();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [filterActivity, setFilterActivity] = useState<string>('all');

  const filteredCommunities = communities.filter(community => {
    const matchesSearch = !searchTerm || 
      community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCountry = filterCountry === 'all' || community.country === filterCountry;
    const matchesActivity = filterActivity === 'all' || community.activity_level === filterActivity;
    
    return matchesSearch && matchesCountry && matchesActivity;
  });

  // Extraire les pays uniques pour le filtre
  const countries = Array.from(new Set(communities.map(c => c.country))).sort();

  const columns = [
    {
      key: 'community_info',
      title: 'Communauté',
      render: (value: any, community: CommunityManagement) => (
        <div>
          <p className="font-medium text-gray-900">{community.name}</p>
          <p className="text-sm text-gray-500">{community.city}, {community.country}</p>
        </div>
      )
    },
    {
      key: 'total_members',
      title: 'Membres',
      render: (value: number) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value.toLocaleString()}
        </span>
      )
    },
    {
      key: 'activity_level',
      title: 'Activité',
      render: (value: string) => {
        const colors = {
          high: 'bg-green-100 text-green-800',
          medium: 'bg-yellow-100 text-yellow-800',
          low: 'bg-red-100 text-red-800'
        };
        const labels = {
          high: 'Élevée',
          medium: 'Modérée',
          low: 'Faible'
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[value as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
            {labels[value as keyof typeof labels] || value}
          </span>
        );
      }
    },
    {
      key: 'created_at',
      title: 'Créée',
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {formatDistanceToNow(new Date(value), { addSuffix: true, locale: fr })}
        </span>
      )
    },
    {
      key: 'reports_count',
      title: 'Signalements',
      render: (value: number) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'is_active',
      title: 'Statut',
      render: (value: boolean) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des communautés</h1>
            <p className="text-gray-600 mt-2">
              {communities.length} communauté{communities.length > 1 ? 's' : ''} au total
            </p>
          </div>
          <button
            onClick={refetch}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Actualisation...' : 'Actualiser'}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{communities.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-50 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Actives</p>
                <p className="text-2xl font-bold text-gray-900">
                  {communities.filter(c => c.is_active).length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <div className="flex items-center">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Très actives</p>
                <p className="text-2xl font-bold text-gray-900">
                  {communities.filter(c => c.activity_level === 'high').length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg border border-gray-200 p-4"
          >
            <div className="flex items-center">
              <div className="p-2 bg-purple-50 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Membres total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {communities.reduce((sum, c) => sum + c.total_members, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher une communauté
              </label>
              <input
                type="text"
                id="search"
                placeholder="Nom ou ville..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                Pays
              </label>
              <select
                id="country"
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les pays</option>
                {countries.map(country => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="activity" className="block text-sm font-medium text-gray-700 mb-2">
                Niveau d'activité
              </label>
              <select
                id="activity"
                value={filterActivity}
                onChange={(e) => setFilterActivity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les niveaux</option>
                <option value="high">Élevée</option>
                <option value="medium">Modérée</option>
                <option value="low">Faible</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Communities Table */}
        <AdminTable
          data={filteredCommunities}
          columns={columns}
          loading={loading}
          emptyMessage="Aucune communauté trouvée"
          actions={(community: CommunityManagement) => (
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors">
                Détails
              </button>
              <button className="px-3 py-1 text-xs font-medium text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-md hover:bg-yellow-100 transition-colors">
                Modérer
              </button>
              {!community.is_active && (
                <button className="px-3 py-1 text-xs font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors">
                  Réactiver
                </button>
              )}
            </div>
          )}
        />
      </div>
    </AdminLayout>
  );
}
