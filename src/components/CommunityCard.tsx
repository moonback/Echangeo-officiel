import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, Calendar, MessageCircle, TrendingUp, UserPlus } from 'lucide-react';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Button from './ui/Button';
import ConfirmDialog from './ui/ConfirmDialog';
import { useJoinCommunity, useLeaveCommunity, useUserCommunities } from '../hooks/useCommunities';
import { useAuthStore } from '../store/authStore';
import type { CommunityOverview } from '../types';

interface CommunityCardProps {
  community: CommunityOverview;
  showDistance?: boolean;
  distance?: number;
  viewMode?: 'grid' | 'list';
}

const CommunityCard: React.FC<CommunityCardProps> = ({ 
  community, 
  showDistance = false, 
  distance,
  viewMode = 'grid'
}) => {
  const { user } = useAuthStore();
  const { data: userCommunities } = useUserCommunities(user?.id);
  const joinCommunity = useJoinCommunity();
  const leaveCommunity = useLeaveCommunity();
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const isMember = userCommunities?.some(uc => uc.id === community.id) || false;
  const isJoining = joinCommunity.isPending;
  const isLeaving = leaveCommunity.isPending;

  const handleJoinCommunity = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) return;
    
    try {
      await joinCommunity.mutateAsync({
        communityId: community.id,
        userId: user.id,
        role: 'member'
      });
    } catch (error) {
      console.error('Erreur lors de la rejointe de la communauté:', error);
    }
  };

  const handleLeaveCommunity = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowLeaveConfirm(true);
  };

  const confirmLeaveCommunity = async () => {
    if (!user) return;
    
    try {
      await leaveCommunity.mutateAsync({
        communityId: community.id,
        userId: user.id
      });
      setShowLeaveConfirm(false);
    } catch (error) {
      console.error('Erreur lors de la sortie de la communauté:', error);
    }
  };
  const getActivityColor = (level: string) => {
    switch (level) {
      case 'active': return 'bg-gradient-to-r from-green-500 to-green-600 text-white border-0';
      case 'moderate': return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0';
      case 'inactive': return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0';
    }
  };

  const getActivityLabel = (level: string) => {
    switch (level) {
      case 'active': return 'Très actif';
      case 'moderate': return 'Modérément actif';
      case 'inactive': return 'Peu actif';
      default: return 'Inconnu';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <Card className={`hover:shadow-xl transition-all duration-300 cursor-pointer group-hover:scale-[1.02] border-2 hover:border-brand-200 ${
        viewMode === 'list' ? 'p-4' : 'p-6'
      }`}>
        <div 
          className="block"
          onClick={() => window.location.href = `/communities/${community.id}`}
        >
          {viewMode === 'list' ? (
            /* List View */
            <div className="flex items-center gap-6">
              {/* Main Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-600 transition-colors">
                      {community.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{community.city}</span>
                      {community.postal_code && (
                        <span className="text-gray-400">• {community.postal_code}</span>
                      )}
                      {showDistance && distance && (
                        <span className="text-brand-600 font-medium">
                          • {distance.toFixed(1)} km
                        </span>
                      )}
                    </div>
                  </div>
                  <span 
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getActivityColor(community.activity_level)}`}
                  >
                    {getActivityLabel(community.activity_level)}
                  </span>
                </div>
                
                {community.description && (
                  <p className="text-gray-600 text-sm mb-2 line-clamp-1">
                    {community.description}
                  </p>
                )}

                {/* Stats in one line */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-700 font-medium">{community.stats?.total_members || 0}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-green-700 font-medium">{community.stats?.total_exchanges || 0}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span className="text-purple-700 font-medium">{community.stats?.total_events || 0}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full">
                    <MessageCircle className="w-4 h-4 text-orange-600" />
                    <span className="text-orange-700 font-medium">{community.stats?.total_items || 0}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center gap-3">
                <div className="text-xs text-gray-500 text-right">
                  <div>Dernière activité:</div>
                  <div>
                    {community.stats?.last_activity && typeof community.stats.last_activity === 'string'
                      ? new Date(community.stats.last_activity).toLocaleDateString('fr-FR')
                      : 'Jamais'
                    }
                  </div>
                </div>
                {isMember ? (
                  <Button
                    onClick={handleLeaveCommunity}
                    disabled={isLeaving}
                    variant="danger"
                    size="sm"
                  >
                    {isLeaving ? 'Sortie...' : 'Quitter'}
                  </Button>
                ) : (
                  <Button
                    onClick={handleJoinCommunity}
                    disabled={isJoining || !user}
                    size="sm"
                    className="bg-brand-600 hover:bg-brand-700"
                  >
                    {isJoining ? (
                      'Rejoindre...'
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-1" />
                        Rejoindre
                      </>
                    )}
                  </Button>
                )}
                <span className="text-sm font-medium text-brand-600 hover:text-brand-700">
                  Voir →
                </span>
              </div>
            </div>
          ) : (
            /* Grid View */
            <>
              {/* Header avec badge d'activité */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-brand-600 transition-colors line-clamp-1">
                    {community.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <MapPin className="w-3 h-3" />
                    <span className="line-clamp-1">{community.city}</span>
                    {community.postal_code && (
                      <span className="text-gray-400">• {community.postal_code}</span>
                    )}
                  </div>
                </div>
                
                <span 
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityColor(community.activity_level)}`}
                >
                  {getActivityLabel(community.activity_level)}
                </span>
              </div>

              {/* Description compacte */}
              {community.description && (
                <p className="text-gray-600 text-xs mb-3 line-clamp-2 leading-relaxed">
                  {community.description}
                </p>
              )}

              {/* Stats compactes en 2x2 */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-3 h-3 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{community.stats?.total_members || 0}</div>
                    <div className="text-xs text-gray-600">membres</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                  <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-3 h-3 text-green-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{community.stats?.total_exchanges || 0}</div>
                    <div className="text-xs text-gray-600">échanges</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                  <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-3 h-3 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{community.stats?.total_events || 0}</div>
                    <div className="text-xs text-gray-600">événements</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                  <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-3 h-3 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{community.stats?.total_items || 0}</div>
                    <div className="text-xs text-gray-600">objets</div>
                  </div>
                </div>
              </div>

              {/* Footer compact */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  {community.stats?.last_activity && typeof community.stats.last_activity === 'string'
                    ? new Date(community.stats.last_activity).toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'short' 
                      })
                    : 'Jamais'
                  }
                </div>
                <div className="flex items-center gap-2">
                  {isMember ? (
                    <Button
                      onClick={handleLeaveCommunity}
                      disabled={isLeaving}
                      variant="danger"
                      size="sm"
                      className="text-xs px-2 py-1"
                    >
                      {isLeaving ? '...' : 'Quitter'}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleJoinCommunity}
                      disabled={isJoining || !user}
                      size="sm"
                      className="bg-brand-600 hover:bg-brand-700 text-xs px-2 py-1"
                    >
                      {isJoining ? (
                        '...'
                      ) : (
                        <>
                          <UserPlus className="w-3 h-3 mr-1" />
                          Rejoindre
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Dialog de confirmation pour quitter le quartier */}
      <ConfirmDialog
        isOpen={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={confirmLeaveCommunity}
        title="Quitter le quartier"
        message={`Êtes-vous sûr de vouloir quitter le quartier "${community.name}" ? Vous perdrez l'accès aux fonctionnalités réservées aux membres.`}
        confirmText="Quitter le quartier"
        cancelText="Annuler"
        variant="danger"
        isLoading={isLeaving}
      />
    </motion.div>
  );
};

export default CommunityCard;
