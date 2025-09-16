import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, User } from 'lucide-react';
import type { Item } from '../types';
import { getCategoryIcon, getCategoryLabel } from '../utils/categories';

interface ItemCardProps {
  item: Item;
  className?: string;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, className = '' }) => {
  const CategoryIcon = getCategoryIcon(item.category);
  
  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}
    >
      <Link to={`/items/${item.id}`}>
        <div className="aspect-video bg-gray-100 relative overflow-hidden">
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
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-700">
              <CategoryIcon className="w-3 h-3 mr-1" />
              {getCategoryLabel(item.category)}
            </span>
          </div>
          {!item.is_available && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Non disponible
              </span>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
          
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
              <span>À proximité</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ItemCard;