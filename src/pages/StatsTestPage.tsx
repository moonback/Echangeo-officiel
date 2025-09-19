import React from 'react';
import { motion } from 'framer-motion';
import StatsDisplay from '../components/StatsDisplay';
import { useAppStats, useUserStats } from '../hooks/useStats';
import { useAuthStore } from '../store/authStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { testStatsQueries, testUserStats } from '../utils/testStats';

const StatsTestPage: React.FC = () => {
  const { user } = useAuthStore();
  const { data: appStats, isLoading: appStatsLoading, error: appStatsError } = useAppStats();
  const { data: userStats, isLoading: userStatsLoading, error: userStatsError } = useUserStats(user?.id);

  const handleTestStats = async () => {
    console.log('🧪 Test des statistiques...');
    const result = await testStatsQueries();
    console.log('📊 Résultats:', result);
    
    if (user?.id) {
      console.log('👤 Test des statistiques utilisateur...');
      const userResult = await testUserStats(user.id);
      console.log('📊 Résultats utilisateur:', userResult);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Test des Statistiques
          </h1>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Vérification des vraies données depuis Supabase
            </p>
            <Button 
              onClick={handleTestStats}
              variant="secondary"
              size="sm"
            >
              🧪 Tester en console
            </Button>
          </div>
        </motion.div>

        {/* Statistiques générales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Statistiques de l'application
          </h2>
          <StatsDisplay />
        </motion.div>

        {/* Détails des statistiques */}
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Détails des statistiques générales
              </h3>
              {appStatsLoading ? (
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              ) : appStatsError ? (
                <div className="text-red-600">
                  Erreur: {appStatsError.message}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Utilisateurs totaux:</span>
                    <span className="font-semibold">{appStats?.totalUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Utilisateurs actifs (30j):</span>
                    <span className="font-semibold">{appStats?.activeUsersCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Objets disponibles:</span>
                    <span className="font-semibold">{appStats?.totalItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Objets récents (30j):</span>
                    <span className="font-semibold">{appStats?.recentItemsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Échanges réussis:</span>
                    <span className="font-semibold">{appStats?.totalExchanges}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Communautés actives:</span>
                    <span className="font-semibold">{appStats?.totalCommunities}</span>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Mes statistiques personnelles
              </h3>
              {!user ? (
                <div className="text-gray-600">
                  Connectez-vous pour voir vos statistiques personnelles
                </div>
              ) : userStatsLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              ) : userStatsError ? (
                <div className="text-red-600">
                  Erreur: {userStatsError.message}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Objets publiés:</span>
                    <span className="font-semibold">{userStats?.itemsPublished}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Échanges complétés:</span>
                    <span className="font-semibold">{userStats?.exchangesCompleted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Favoris:</span>
                    <span className="font-semibold">{userStats?.favoritesCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Communautés rejointes:</span>
                    <span className="font-semibold">{userStats?.communitiesJoined}</span>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Informations de debug */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informations de debug
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Utilisateur connecté:</span> {user ? user.email : 'Non connecté'}
              </div>
              <div>
                <span className="font-medium">ID utilisateur:</span> {user?.id || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Timestamp:</span> {new Date().toLocaleString('fr-FR')}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default StatsTestPage;
