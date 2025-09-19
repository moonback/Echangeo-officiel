import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, TrendingUp, Calendar, MessageCircle, ArrowRight, Eye } from 'lucide-react';
import Card from './ui/Card';
import Badge from './ui/Badge';
import type { Community } from '../types';

interface CommunityMarkerPopupProps {
  community: Community;
  onClose: () => void;
  onCommunityClick?: (communityId: string) => void;
}

const CommunityMarkerPopup: React.FC<CommunityMarkerPopupProps> = ({ 
  community, 
  onClose, 
  onCommunityClick 
}) => {
  const getActivityColor = (level: string) => {
    switch (level) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'inactive': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getActivityLabel = (level: string) => {
    switch (level) {
      case 'active': return 'Actif';
      case 'moderate': return 'Modéré';
      case 'inactive': return 'Inactif';
      default: return 'Inconnu';
    }
  };

  const handleClick = () => {
    if (onCommunityClick) {
      onCommunityClick(community.id);
    } else {
      window.location.href = `/communities/${community.id}`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 10 }}
      transition={{ duration: 0.2 }}
      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50"
      onClick={onClose}
    >
      <Card className="w-72 p-3 shadow-2xl border border-gray-200/50 bg-white/95 backdrop-blur-sm">
        {/* Header compact */}
        <div className="flex gap-2 mb-2">
          {/* Icône du quartier plus petite */}
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500 to-blue-500 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-white" />
          </div>

          {/* Infos principales compactes */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 leading-tight">
                {community.name}
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="ml-1 p-0.5 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Badges compacts */}
            <div className="flex items-center gap-1 mb-1">
              <Badge 
                variant="neutral" 
                size="sm" 
                className={`text-xs px-1.5 py-0.5 border ${getActivityColor(community.activity_level)}`}
              >
                {getActivityLabel(community.activity_level)}
              </Badge>
              <Badge variant="info" size="sm" className="text-xs px-1.5 py-0.5">
                <MapPin className="w-2.5 h-2.5 mr-1" />
                {community.city}
              </Badge>
            </div>
          </div>
        </div>

        {/* Description compacte */}
        {community.description && (
          <p className="text-xs text-gray-700 mb-2 line-clamp-1">
            {community.description}
          </p>
        )}

        {/* Statistiques compactes en ligne */}
        <div className="flex gap-2 mb-2">
          <div className="flex items-center gap-1 bg-blue-50 rounded px-2 py-1 border border-blue-100">
            <Users className="w-3 h-3 text-blue-600" />
            <span className="text-xs font-bold text-blue-900">{community.stats?.total_members || 0}</span>
          </div>

          <div className="flex items-center gap-1 bg-green-50 rounded px-2 py-1 border border-green-100">
            <TrendingUp className="w-3 h-3 text-green-600" />
            <span className="text-xs font-bold text-green-900">{community.stats?.total_items || 0}</span>
          </div>

          <div className="flex items-center gap-1 bg-purple-50 rounded px-2 py-1 border border-purple-100">
            <MessageCircle className="w-3 h-3 text-purple-600" />
            <span className="text-xs font-bold text-purple-900">{community.stats?.total_exchanges || 0}</span>
          </div>

          <div className="flex items-center gap-1 bg-orange-50 rounded px-2 py-1 border border-orange-100">
            <Calendar className="w-3 h-3 text-orange-600" />
            <span className="text-xs font-bold text-orange-900">{community.stats?.total_events || 0}</span>
          </div>
        </div>

        {/* Dernière activité compacte */}
        {community.stats?.last_activity && (
          <div className="mb-2 p-1.5 bg-gray-50 rounded border border-gray-100">
            <div className="text-xs text-gray-600">
              <span className="font-medium">Dernière activité : </span>
              {typeof community.stats.last_activity === 'string'
                ? new Date(community.stats.last_activity).toLocaleDateString('fr-FR')
                : 'Jamais'
              }
            </div>
          </div>
        )}

        {/* Footer compact */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Quartier actif
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="flex items-center gap-1 px-2 py-1 bg-brand-600 text-white text-xs font-medium rounded hover:bg-brand-700 transition-colors"
          >
            <Eye className="w-3 h-3" />
            Voir
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </Card>
    </motion.div>
  );
};

export default CommunityMarkerPopup;
