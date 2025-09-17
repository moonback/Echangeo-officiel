import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, User, Star, Heart } from 'lucide-react';
import type { Item } from '../types';
import { getCategoryIcon, getCategoryLabel } from '../utils/categories';
import { getOfferTypeIcon, getOfferTypeLabel } from '../utils/offerTypes';
import Card from './ui/Card';
import Badge from './ui/Badge';
import { useFavorites, useIsItemFavorited } from '../hooks/useFavorites';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

interface ItemCardProps {
  item: Item;
  className?: string;
  userLocation?: { lat: number; lng: number };
}

const ItemCard: React.FC<ItemCardProps> = ({ item, className = '', userLocation }) => {
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
  
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toggle } = useFavorites();
  const { data: isFavorited = false, isLoading } = useIsItemFavorited(item.id);

  const onToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    try {
      await toggle(item.id);
    } catch {}
  };

  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }} 
      whileTap={{ scale: 0.98 }} 
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={className}
    >
      <Link to={`/items/${item.id}`}>
        <Card className="relative overflow-hidden p-0 group">
          {/* Image Container with Gradient Overlay */}
          <div className="relative bg-gradient-to-br from-gray-100 to-gray-200" style={{ aspectRatio: '4 / 3' }}>
            {item.images && item.images.length > 0 ? (
              <img
                src={item.images[0].url}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <CategoryIcon className="w-16 h-16 text-gray-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Category Badge */}
            <div className="absolute top-3 left-3">
              <Badge className="bg-white/95 backdrop-blur-sm text-gray-700 shadow-lg border border-white/20">
                <CategoryIcon className="w-3 h-3 mr-1.5" />
                {getCategoryLabel(item.category)}
              </Badge>
            </div>
            
            {/* Offer Type Badge */}
            <div className="absolute top-3 left-3 mt-8">
              <Badge 
                className={`shadow-lg border border-white/20 ${
                  item.offer_type === 'trade' 
                    ? 'bg-orange-100/95 text-orange-700' 
                    : 'bg-blue-100/95 text-blue-700'
                } backdrop-blur-sm`}
              >
                <OfferTypeIcon className="w-3 h-3 mr-1.5" />
                {getOfferTypeLabel(item.offer_type)}
              </Badge>
            </div>
            
            {/* Availability Status */}
            {!item.is_available && (
              <div className="absolute top-3 right-3">
                <Badge variant="danger" className="shadow-lg">Indisponible</Badge>
              </div>
            )}

            {/* Favorite Button */}
            <div className="absolute top-3 right-3">
              <button
                onClick={onToggleFavorite}
                aria-label={isFavorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                aria-pressed={isFavorited}
                className={`inline-flex items-center justify-center w-9 h-9 rounded-full border backdrop-blur-sm shadow-soft transition-all ${
                  isFavorited
                    ? 'bg-red-500 text-white border-red-400 hover:bg-red-600'
                    : 'bg-white/90 text-gray-700 border-gray-200 hover:bg-white'
                }`}
                title="Favori"
              >
                <Heart size={18} className={isFavorited ? 'fill-current' : ''} />
              </button>
            </div>
            
            {/* Rating Overlay */}
            {typeof item.average_rating === 'number' && item.ratings_count ? (
              <div className="absolute bottom-3 right-3">
                <div className="flex items-center bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-lg">
                  <Star className="w-3.5 h-3.5 text-yellow-500 mr-1" />
                  <span className="text-xs font-semibold text-gray-800">{item.average_rating.toFixed(1)}</span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-lg group-hover:text-brand-600 transition-colors duration-200">
              {item.title}
            </h3>
            
            {item.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">{item.description}</p>
            )}
            
            {item.offer_type === 'trade' && item.desired_items && (
              <div className="mb-4 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-200">
                <p className="text-xs font-medium text-orange-700 mb-1">Recherche en échange :</p>
                <p className="text-sm text-orange-600 line-clamp-2">{item.desired_items}</p>
              </div>
            )}
            
            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center mr-2">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-medium">{item.owner?.full_name || 'Anonyme'}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-500 bg-gray-50/80 rounded-full px-2.5 py-1">
                <MapPin className="w-3.5 h-3.5 mr-1" />
                <span className="font-medium">
                  {distanceKm != null ? `${distanceKm.toFixed(1)} km` : 'À proximité'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Hover Glow Effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-brand-400/0 via-brand-500/0 to-brand-600/0 group-hover:from-brand-400/5 group-hover:via-brand-500/5 group-hover:to-brand-600/5 transition-all duration-300 pointer-events-none" />
        </Card>
      </Link>
    </motion.div>
  );
};

export default ItemCard;