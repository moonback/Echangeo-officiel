import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAdminItems } from '../../hooks/useAdmin';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminTable from '../../components/admin/AdminTable';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { ItemManagement } from '../../types/admin';

export default function AdminItemsPage() {
  const { items, loading, error, refetch, suspendItem, deleteItem } = useAdminItems();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredItems = items.filter(item => {
    const matchesSearch = !searchTerm || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.owner_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleSuspendItem = async (itemId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir suspendre cet objet ?')) {
      try {
        await suspendItem(itemId, 'Suspendu par l\'administrateur');
      } catch (error) {
        console.error('Erreur lors de la suspension:', error);
        alert('Erreur lors de la suspension de l\'objet');
      }
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer définitivement cet objet ? Cette action est irréversible.')) {
      try {
        await deleteItem(itemId);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de l\'objet');
      }
    }
  };

  const categories = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'tools', label: 'Outils' },
    { value: 'electronics', label: 'Électronique' },
    { value: 'books', label: 'Livres' },
    { value: 'sports', label: 'Sport' },
    { value: 'kitchen', label: 'Cuisine' },
    { value: 'garden', label: 'Jardin' },
    { value: 'toys', label: 'Jouets' },
    { value: 'services', label: 'Services' },
    { value: 'other', label: 'Autre' }
  ];

  const statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'active', label: 'Actif' },
    { value: 'suspended', label: 'Suspendu' },
    { value: 'reported', label: 'Signalé' },
    { value: 'deleted', label: 'Supprimé' }
  ];

  const columns = [
    {
      key: 'item_info',
      title: 'Objet',
      render: (value: any, item: ItemManagement) => (
        <div>
          <p className="font-medium text-gray-900">{item.title}</p>
          <p className="text-sm text-gray-500 capitalize">{item.category}</p>
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
      key: 'status',
      title: 'Statut',
      render: (value: string) => {
        const colors = {
          active: 'bg-green-100 text-green-800',
          suspended: 'bg-red-100 text-red-800',
          reported: 'bg-yellow-100 text-yellow-800',
          deleted: 'bg-gray-100 text-gray-800'
        };
        const labels = {
          active: 'Actif',
          suspended: 'Suspendu',
          reported: 'Signalé',
          deleted: 'Supprimé'
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[value as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
            {labels[value as keyof typeof labels] || value}
          </span>
        );
      }
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
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Gestion des objets</h1>
            <p className="text-gray-600 mt-2">
              {items.length} objet{items.length > 1 ? 's' : ''} au total
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher un objet
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  id="search"
                  placeholder="Titre ou propriétaire..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                id="category"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Statut
              </label>
              <select
                id="status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Items Table */}
        <AdminTable
          data={filteredItems}
          columns={columns}
          loading={loading}
          emptyMessage="Aucun objet trouvé"
          actions={(item: ItemManagement) => (
            <div className="flex space-x-2">
              {item.status === 'active' && (
                <button
                  onClick={() => handleSuspendItem(item.id)}
                  className="px-3 py-1 text-xs font-medium text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-md hover:bg-yellow-100 transition-colors"
                >
                  Suspendre
                </button>
              )}
              <button
                onClick={() => handleDeleteItem(item.id)}
                className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
              >
                Supprimer
              </button>
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
