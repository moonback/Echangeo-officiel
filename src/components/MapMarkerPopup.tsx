import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, User, Star, Heart, Calendar, Eye, ArrowRight } from 'lucide-react';
import { getCategoryIcon, getCategoryLabel } from '../utils/categories';
import { getOfferTypeIcon, getOfferTypeLabel } from '../utils/offerTypes';
import Card from './ui/Card';
import Badge from './ui/Badge';
import type { Item } from '../types';

interface MapMarkerPopupProps {
  item: Item;
  onClose: () => void;
  onItemClick?: (itemId: string) => void;
  userLocation?: { lat: number; lng: number };
}

const MapMarkerPopup: React.FC<MapMarkerPopupProps> = ({ 
  item, 
  onClose, 
  onItemClick,
  userLocation 
}) => {
  const CategoryIcon = getCategoryIcon(item.category);
  const OfferTypeIcon = getOfferTypeIcon(item.offer_type);
  
  const distanceKm = React.useMemo(() => {
    if (!userLocation || item.latitude === undefined || item.longitude === undefined) return null;
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(item.latitude - userLocation.lat);
    const dLon = toRad(item.longitude - userLocation.lng);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(userLocation.lat)) * Math.cos(toRad(item.latitude)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, [userLocation, item.latitude, item.longitude]);

  const desiredItemsList = React.useMemo(() => {
    if (item.offer_type !== 'trade' || !item.desired_items) return { items: [] as string[], total: 0 };
    const allItems = item.desired_items
      .split(/[,;\n]/g)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    return {
      items: allItems.slice(0, 3), // Limiter à 3 pour le popup
      total: allItems.length
    };
  }, [item.offer_type, item.desired_items]);

  const handleClick = () => {
    if (onItemClick) {
      onItemClick(item.id);
    } else {
      window.location.href = `/items/${item.id}`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 10 }}
      transition={{ duration: 0.2 }}
      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <Card className="w-80 p-4 shadow-2xl border border-gray-200/50 bg-white/95 backdrop-blur-sm">
        {/* Header avec image et infos principales */}
        <div className="flex gap-3 mb-3">
          {/* Image */}
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            {item.images && item.images.length > 0 ? (
              <img
                src={typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url || ''}
                alt={item.title || 'Objet'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <CategoryIcon className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>

          {/* Infos principales */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-tight">
                {item.title}
              </h3>
              <button
                onClick={onClose}
                className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="neutral" size="sm" className="text-xs">
                <CategoryIcon className="w-3 h-3 mr-1" />
                {getCategoryLabel(item.category)}
              </Badge>
              <Badge 
                variant={item.offer_type === 'donation' ? 'success' : 
                        item.offer_type === 'trade' ? 'warning' : 'info'} 
                size="sm" 
                className="text-xs"
              >
                <OfferTypeIcon className="w-3 h-3 mr-1" />
                {getOfferTypeLabel(item.offer_type)}
              </Badge>
            </div>

            {/* Propriétaire et distance */}
            <div className="flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span className="truncate">{item.owner?.full_name || item.owner?.email || 'Anonyme'}</span>
              </div>
              {distanceKm && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{distanceKm.toFixed(1)} km</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-sm text-gray-700 mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Objets recherchés (pour les échanges) */}
        {item.offer_type === 'trade' && desiredItemsList.items.length > 0 && (
          <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-1 mb-1">
              <Heart className="w-3 h-3 text-blue-600" />
              <span className="text-xs font-medium text-blue-800">Recherche :</span>
            </div>
            <div className="text-xs text-blue-700">
              {desiredItemsList.items.join(', ')}
              {desiredItemsList.total > 3 && (
                <span className="text-blue-600"> +{desiredItemsList.total - 3} autres</span>
              )}
            </div>
          </div>
        )}

        {/* Footer avec date et action */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>
              {new Date(item.created_at).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short'
              })}
            </span>
          </div>
          
          <button
            onClick={handleClick}
            className="flex items-center gap-1 px-3 py-1.5 bg-brand-600 text-white text-xs font-medium rounded-lg hover:bg-brand-700 transition-colors"
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

export default MapMarkerPopup;
