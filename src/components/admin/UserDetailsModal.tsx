import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Calendar, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '../../services/supabase';
import type { UserManagement } from '../../types/admin';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserManagement | null;
}

interface UserDetailsData extends UserManagement {
  ban_history: Array<{
    id: string;
    reason: string;
    ban_type: string;
    created_at: string;
    expires_at: string | null;
    banned_by_name: string;
  }>;
  recent_activity: Array<{
    type: string;
    description: string;
    created_at: string;
  }>;
  reputation_details: {
    total_ratings: number;
    avg_communication: number;
    avg_punctuality: number;
    avg_care: number;
    overall_score: number;
  };
}

export default function UserDetailsModal({ isOpen, onClose, user }: UserDetailsModalProps) {
  const [userDetails, setUserDetails] = useState<UserDetailsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'bans'>('overview');

  useEffect(() => {
    if (isOpen && user) {
      fetchUserDetails();
    }
  }, [isOpen, user]);

  const fetchUserDetails = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Récupérer l'historique des bannissements
      const { data: banHistory } = await supabase
        .from('user_bans')
        .select(`
          id,
          reason,
          ban_type,
          created_at,
          expires_at,
          profiles!user_bans_banned_by_fkey(full_name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Récupérer l'activité récente
      const [itemsData, requestsData, messagesData] = await Promise.all([
        supabase
          .from('items')
          .select('id, title, created_at')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('requests')
          .select('id, status, created_at')
          .eq('requester_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('messages')
          .select('id, content, created_at')
          .eq('sender_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      // Récupérer les détails de réputation
      const { data: reputationData } = await supabase
        .from('profile_reputation_stats')
        .select('*')
        .eq('profile_id', user.id)
        .single();

      // Construire l'activité récente
      const recentActivity = [
        ...(itemsData.data || []).map(item => ({
          type: 'item',
          description: `A créé l'objet "${item.title}"`,
          created_at: item.created_at
        })),
        ...(requestsData.data || []).map(req => ({
          type: 'request',
          description: `Nouvelle demande (${req.status})`,
          created_at: req.created_at
        })),
        ...(messagesData.data || []).map(msg => ({
          type: 'message',
          description: `Message envoyé`,
          created_at: msg.created_at
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
       .slice(0, 10);

      setUserDetails({
        ...user,
        ban_history: (banHistory || []).map(ban => ({
          id: ban.id,
          reason: ban.reason,
          ban_type: ban.ban_type,
          created_at: ban.created_at,
          expires_at: ban.expires_at,
          banned_by_name: ban.profiles?.full_name || 'Administrateur'
        })),
        recent_activity: recentActivity,
        reputation_details: reputationData || {
          total_ratings: 0,
          avg_communication: 0,
          avg_punctuality: 0,
          avg_care: 0,
          overall_score: 0
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des détails:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-12xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {user.full_name || 'Utilisateur sans nom'}
                </h2>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status Badge */}
          <div className="px-6 py-3 border-b">
            <div className="flex items-center space-x-2">
              {user.is_banned ? (
                <>
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <span className="text-red-600 font-medium">Utilisateur banni</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-600 font-medium">Utilisateur actif</span>
                </>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            {[
              { id: 'overview', label: 'Vue d\'ensemble' },
              { id: 'activity', label: 'Activité récente' },
              { id: 'bans', label: 'Historique des bannissements' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-96">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && userDetails && (
                  <div className="space-y-6">
                    {/* Informations de base */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Informations générales</h3>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{user.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">
                              Membre depuis {new Date(user.created_at).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Statistiques</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Objets créés:</span>
                            <span className="text-sm font-medium">{user.total_items}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Demandes:</span>
                            <span className="text-sm font-medium">{user.total_requests}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Communautés:</span>
                            <span className="text-sm font-medium">{user.communities_count}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Réputation */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Réputation</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-gray-600">Score global</div>
                            <div className="text-2xl font-bold text-blue-600">
                              {userDetails.reputation_details.overall_score.toFixed(1)}/5
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Évaluations</div>
                            <div className="text-lg font-semibold">
                              {userDetails.reputation_details.total_ratings}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Communication</span>
                            <span>{userDetails.reputation_details.avg_communication.toFixed(1)}/5</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Ponctualité</span>
                            <span>{userDetails.reputation_details.avg_punctuality.toFixed(1)}/5</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Soin des objets</span>
                            <span>{userDetails.reputation_details.avg_care.toFixed(1)}/5</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'activity' && userDetails && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-4">Activité récente</h3>
                    {userDetails.recent_activity.length > 0 ? (
                      <div className="space-y-3">
                        {userDetails.recent_activity.map((activity, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">{activity.description}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(activity.created_at).toLocaleString('fr-FR')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-8">
                        Aucune activité récente
                      </p>
                    )}
                  </div>
                )}

                {activeTab === 'bans' && userDetails && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-4">Historique des bannissements</h3>
                    {userDetails.ban_history.length > 0 ? (
                      <div className="space-y-3">
                        {userDetails.ban_history.map((ban) => (
                          <div key={ban.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <Shield className="w-4 h-4 text-red-500" />
                                <span className="text-sm font-medium text-red-600">
                                  {ban.ban_type === 'permanent' ? 'Bannissement permanent' : 'Bannissement temporaire'}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(ban.created_at).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{ban.reason}</p>
                            <div className="text-xs text-gray-500">
                              Banni par: {ban.banned_by_name}
                              {ban.expires_at && (
                                <span className="ml-4">
                                  Expire le: {new Date(ban.expires_at).toLocaleDateString('fr-FR')}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-8">
                        Aucun bannissement dans l'historique
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
