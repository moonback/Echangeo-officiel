import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, MessageCircle, TrendingUp } from 'lucide-react';
import { useItems } from '../hooks/useItems';
import { useRequests } from '../hooks/useRequests';
import ItemCard from '../components/ItemCard';
import { ItemCardSkeleton } from '../components/SkeletonLoader';

const HomePage: React.FC = () => {
  const { data: items, isLoading: itemsLoading } = useItems();
  const { data: requests, isLoading: requestsLoading } = useRequests();

  const recentItems = items?.slice(0, 4) || [];
  const pendingRequests = requests?.filter(r => r.status === 'pending') || [];

  const stats = [
    {
      label: 'Objets disponibles',
      value: items?.length || 0,
      icon: Search,
      color: 'bg-blue-500',
    },
    {
      label: 'Demandes en attente',
      value: pendingRequests.length,
      icon: MessageCircle,
      color: 'bg-orange-500',
    },
    {
      label: 'Échanges réussis',
      value: requests?.filter(r => r.status === 'completed').length || 0,
      icon: TrendingUp,
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Bonjour ! 👋
        </h1>
        <p className="text-gray-600">
          Découvrez ce que vos voisins ont à partager
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-4 mb-8"
      >
        <Link
          to="/create"
          className="bg-blue-600 text-white rounded-xl p-4 flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span className="font-medium">Ajouter un objet</span>
        </Link>
        <Link
          to="/items"
          className="bg-white border-2 border-blue-600 text-blue-600 rounded-xl p-4 flex items-center justify-center space-x-2 hover:bg-blue-50 transition-colors"
        >
          <Search size={20} />
          <span className="font-medium">Parcourir</span>
        </Link>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
      >
        {stats.map((stat, index) => (
          <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${stat.color} text-white`}>
                <stat.icon size={20} />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Recent Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Objets récemment ajoutés
          </h2>
          <Link 
            to="/items" 
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Voir tout
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {itemsLoading ? (
            <ItemCardSkeleton count={4} />
          ) : recentItems.length > 0 ? (
            recentItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))
          ) : (
            <div className="col-span-full bg-white rounded-xl p-8 text-center border border-gray-200">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun objet disponible
              </h3>
              <p className="text-gray-600 mb-4">
                Soyez le premier à partager un objet avec vos voisins !
              </p>
              <Link
                to="/create"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} className="mr-2" />
                Ajouter un objet
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default HomePage;