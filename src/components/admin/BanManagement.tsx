import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { supabase } from '../../services/supabase';

interface BanStats {
  total_bans: number;
  active_bans: number;
  expired_bans: number;
  permanent_bans: number;
}

interface ExpiredBan {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  reason: string;
  expires_at: string;
  created_at: string;
}

export default function BanManagement() {
  const [stats, setStats] = useState<BanStats | null>(null);
  const [expiredBans, setExpiredBans] = useState<ExpiredBan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Récupérer les statistiques
      const { data: statsData } = await supabase.rpc('get_ban_stats');
      if (statsData) {
        setStats(statsData[0]);
      }

      // Récupérer les bannissements expirés
      const { data: expiredData } = await supabase
        .from('user_bans')
        .select(`
          id,
          user_id,
          reason,
          expires_at,
          created_at,
          profiles!user_bans_user_id_fkey(email, full_name)
        `)
        .eq('is_active', true)
        .not('expires_at', 'is', null)
        .lt('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: false });

      if (expiredData) {
        setExpiredBans(
          expiredData.map(ban => ({
            id: ban.id,
            user_id: ban.user_id,
            user_email: ban.profiles?.email || 'Email inconnu',
            user_name: ban.profiles?.full_name || 'Nom inconnu',
            reason: ban.reason,
            expires_at: ban.expires_at,
            created_at: ban.created_at
          }))
        );
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanExpiredBans = async () => {
    try {
      setRefreshing(true);
      const { data, error } = await supabase.rpc('check_expired_bans');
      
      if (error) {
        console.error('Erreur lors du nettoyage:', error);
        return;
      }

      // Actualiser les données
      await fetchData();
      
      alert(`${data} bannissements expirés ont été automatiquement désactivés.`);
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-lg border border-gray-200"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total bannissements</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total_bans || 0}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-4 rounded-lg border border-gray-200"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Bannissements actifs</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.active_bans || 0}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-4 rounded-lg border border-gray-200"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Bannissements expirés</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.expired_bans || 0}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-4 rounded-lg border border-gray-200"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Bannissements permanents</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.permanent_bans || 0}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Actions */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Nettoyage automatique</h3>
            <p className="text-sm text-gray-500">
              Désactive automatiquement tous les bannissements expirés
            </p>
          </div>
          <button
            onClick={handleCleanExpiredBans}
            disabled={refreshing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Nettoyage...' : 'Nettoyer'}</span>
          </button>
        </div>
      </div>

      {/* Liste des bannissements expirés */}
      {expiredBans.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Bannissements expirés ({expiredBans.length})
            </h3>
            <p className="text-sm text-gray-500">
              Ces bannissements ont expiré mais sont encore marqués comme actifs
            </p>
          </div>
          <div className="divide-y divide-gray-200">
            {expiredBans.map((ban) => (
              <div key={ban.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Clock className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {ban.user_name} ({ban.user_email})
                        </p>
                        <p className="text-sm text-gray-500">{ban.reason}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      Expiré le {new Date(ban.expires_at).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-xs text-gray-400">
                      Créé le {new Date(ban.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {expiredBans.length === 0 && (
        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun bannissement expiré
          </h3>
          <p className="text-gray-500">
            Tous les bannissements sont à jour
          </p>
        </div>
      )}
    </div>
  );
}
