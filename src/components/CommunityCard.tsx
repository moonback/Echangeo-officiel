import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Users, Calendar, MessageCircle, TrendingUp, UserPlus, Check } from 'lucide-react';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Button from './ui/Button';
import { useJoinCommunity, useLeaveCommunity, useUserCommunities } from '../hooks/useCommunities';
import { useAuthStore } from '../store/authStore';
import type { CommunityOverview } from '../types';

interface CommunityCardProps {
  community: CommunityOverview;
  showDistance?: boolean;
  distance?: number;
}

const CommunityCard: React.FC<CommunityCardProps> = ({ 
  community, 
  showDistance = false, 
  distance 
}) => {
  const { user } = useAuthStore();
  const { data: userCommunities } = useUserCommunities(user?.id);
  const joinCommunity = useJoinCommunity();
  const leaveCommunity = useLeaveCommunity();

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
    
    if (!user) return;
    
    try {
      await leaveCommunity.mutateAsync({
        communityId: community.id,
        userId: user.id
      });
    } catch (error) {
      console.error('Erreur lors de la sortie de la communauté:', error);
    }
  };
  const getActivityColor = (level: string) => {
    switch (level) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'inactive': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
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
      <Card className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer">
        <div 
          className="block"
          onClick={() => window.location.href = `/communities/${community.id}`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors">
                {community.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
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
            
            <Badge 
              className={getActivityColor(community.activity_level)}
              variant="outline"
            >
              {getActivityLabel(community.activity_level)}
            </Badge>
          </div>

          {/* Description */}
          {community.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {community.description}
            </p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-brand-600" />
              <span className="text-gray-700">
                <span className="font-semibold">{community.total_members}</span> membres
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">
                <span className="font-semibold">{community.total_exchanges}</span> échanges
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-gray-700">
                <span className="font-semibold">{community.total_events}</span> événements
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MessageCircle className="w-4 h-4 text-purple-600" />
              <span className="text-gray-700">
                <span className="font-semibold">{community.total_items}</span> objets
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              Dernière activité: {
                community.last_activity 
                  ? new Date(community.last_activity).toLocaleDateString('fr-FR')
                  : 'Jamais'
              }
            </div>
            <div className="flex items-center gap-2">
              {isMember ? (
                <Button
                  onClick={handleLeaveCommunity}
                  disabled={isLeaving}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50"
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
        </div>
      </Card>
    </motion.div>
  );
};

export default CommunityCard;
