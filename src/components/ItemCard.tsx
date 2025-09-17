import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, User, Star } from 'lucide-react';
import type { Item } from '../types';
import { getCategoryIcon, getCategoryLabel } from '../utils/categories';
import Card from './ui/Card';
import Badge from './ui/Badge';

interface ItemCardProps {
  item: Item;
  className?: string;
  userLocation?: { lat: number; lng: number };
}

const ItemCard: React.FC<ItemCardProps> = ({ item, className = '', userLocation }) => {
  const CategoryIcon = getCategoryIcon(item.category);
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
  
  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className={className}>
      <Link to={`/items/${item.id}`}>
        <Card className="relative overflow-hidden p-0">
          <div className="bg-gray-100" style={{ aspectRatio: '4 / 3' }}>
          {item.images && item.images.length > 0 ? (
            <img
              src={item.images[0].url}
              alt={item.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <CategoryIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}
          <div className="absolute top-2 left-2">
            <Badge className="bg-white/90 text-gray-700">
              <CategoryIcon className="w-3 h-3 mr-1" />
              {getCategoryLabel(item.category)}
            </Badge>
          </div>
          {!item.is_available && (
            <div className="absolute top-2 right-2">
              <Badge variant="danger">Indisponible</Badge>
            </div>
          )}
          </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
          {typeof item.average_rating === 'number' && item.ratings_count ? (
            <div className="flex items-center text-xs text-gray-600 mb-2">
              <Star className="w-4 h-4 text-yellow-500 mr-1" />
              <span className="font-medium">{item.average_rating.toFixed(1)}</span>
              <span className="ml-1">({item.ratings_count})</span>
            </div>
          ) : null}
          
          {item.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              <span>{item.owner?.full_name || 'Anonyme'}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{distanceKm != null ? `${distanceKm.toFixed(1)} km` : 'À proximité'}</span>
            </div>
          </div>
        </div>
        </Card>
      </Link>
    </motion.div>
  );
};

export default ItemCard;