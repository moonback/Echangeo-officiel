import { motion } from 'framer-motion';
import { useAdminDashboard } from '../../hooks/useAdmin';
import AdminLayout from '../../components/admin/AdminLayout';
import StatsCard from '../../components/admin/StatsCard';
import AdminTable from '../../components/admin/AdminTable';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { UserManagement, ItemManagement } from '../../types/admin';

export default function AdminDashboardPage() {
  const { dashboardData, loading } = useAdminDashboard();

  const userColumns = [
    {
      key: 'full_name',
      title: 'Nom',
      render: (value: string, user: UserManagement) => (
        <div className="flex items-center space-x-3">
          <img
            src={user.avatar_url || `https://ui-avatars.com/api/?name=${value}&background=random`}
            alt={value}
            className="w-8 h-8 rounded-full"
          />
          <div>
            <p className="font-medium text-gray-900">{value || 'Sans nom'}</p>
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
      key: 'total_items',
      title: 'Objets',
      render: (value: number) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value}
        </span>
      )
    }
  ];

  const itemColumns = [
    {
      key: 'title',
      title: 'Titre',
      render: (value: string, item: ItemManagement) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{item.category}</p>
        </div>
      )
    },
    {
      key: 'owner_name',
      title: 'Propriétaire',
      render: (value: string) => (
        <span className="text-sm text-gray-600">{value || 'Inconnu'}</span>
      )
    },
    {
      key: 'created_at',
      title: 'Créé',
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {formatDistanceToNow(new Date(value), { addSuffix: true, locale: fr })}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Statut',
      render: (value: string) => {
        const colors = {
          active: 'bg-green-100 text-green-800',
          suspended: 'bg-red-100 text-red-800',
          reported: 'bg-yellow-100 text-yellow-800'
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[value as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
            {value}
          </span>
        );
      }
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600 mt-2">Vue d'ensemble de la plateforme Échangeo</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatsCard
            title="Utilisateurs totaux"
            value={dashboardData?.stats.totalUsers || 0}
            change={{ value: 12, type: 'increase' }}
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            }
            color="blue"
            loading={loading}
          />

          <StatsCard
            title="Utilisateurs actifs"
            value={dashboardData?.stats.activeUsers || 0}
            change={{ value: 8, type: 'increase' }}
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="green"
            loading={loading}
          />

          <StatsCard
            title="Objets totaux"
            value={dashboardData?.stats.totalItems || 0}
            change={{ value: 15, type: 'increase' }}
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
            color="purple"
            loading={loading}
          />

          <StatsCard
            title="Communautés"
            value={dashboardData?.stats.totalCommunities || 0}
            change={{ value: 5, type: 'increase' }}
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            color="yellow"
            loading={loading}
          />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
          {/* Recent Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Nouveaux utilisateurs</h2>
              <a
                href="/admin/users"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
              >
                Voir tout
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <AdminTable
              data={dashboardData?.recentUsers || []}
              columns={userColumns}
              loading={loading}
              emptyMessage="Aucun nouvel utilisateur"
            />
          </motion.div>

          {/* Recent Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Nouveaux objets</h2>
              <a
                href="/admin/items"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
              >
                Voir tout
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <AdminTable
              data={dashboardData?.recentItems || []}
              columns={itemColumns}
              loading={loading}
              emptyMessage="Aucun nouvel objet"
            />
          </motion.div>
        </div>

        {/* System Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">État du système</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Base de données</span>
              <span className="text-sm font-medium text-green-600">Opérationnelle</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">API</span>
              <span className="text-sm font-medium text-green-600">Opérationnelle</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Stockage</span>
              <span className="text-sm font-medium text-green-600">Opérationnel</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
