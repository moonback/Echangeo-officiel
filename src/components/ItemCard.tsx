import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Star, Heart, Trash2, Building2 } from 'lucide-react';
import type { Item } from '../types';
import { getCategoryIcon, getCategoryLabel } from '../utils/categories';
import { getOfferTypeIcon, getOfferTypeLabel } from '../utils/offerTypes';
import Card from './ui/Card';
import Badge from './ui/Badge';
import { useFavorites, useIsItemFavorited } from '../hooks/useFavorites';
import { useDeleteItem } from '../hooks/useItems';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { useCommunity } from '../hooks/useCommunities';

interface ItemCardProps {
  item: Item;
  className?: string;
  userLocation?: { lat: number; lng: number };
}

const ItemCard: React.FC<ItemCardProps> = ({ item, className = '' }) => {
  const CategoryIcon = getCategoryIcon(item.category);
  const OfferTypeIcon = getOfferTypeIcon(item.offer_type);
  
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toggle } = useFavorites();
  const { data: isFavorited = false } = useIsItemFavorited(item.id);
  const deleteItem = useDeleteItem();
  
  // Récupérer les informations de la communauté si l'objet en a une
  const { data: community } = useCommunity(item.community_id || '');
  
  const desiredItemsList = React.useMemo(() => {
    if (item.offer_type !== 'trade' || !item.desired_items) return { items: [] as string[], total: 0 };
    const allItems = item.desired_items
      .split(/[,;\n]/g)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    return {
      items: allItems.slice(0, 6),
      total: allItems.length
    };
  }, [item.offer_type, item.desired_items]);
  
  // Vérifier si l'utilisateur est le propriétaire de l'objet
  const isOwner = user?.id === item.owner_id;

  const onToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    try {
      await toggle(item.id);
    } catch {
      // Erreur silencieuse pour les favoris
    }
  };

  const onDeleteItem = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user || !isOwner) return;
    
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer "${item.title}" ? Cette action est irréversible.`
    );
    
    if (!confirmed) return;
    
    try {
      await deleteItem.mutateAsync(item.id);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'objet. Veuillez réessayer.');
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -12, scale: 1.03 }} 
      whileTap={{ scale: 0.97 }} 
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`h-full ${className}`}
    >
      <Link to={`/items/${item.id}`} className="h-full block">
        <Card className="relative overflow-hidden p-0 group h-full flex flex-col bg-white/95 backdrop-blur-sm border border-gray-200/60 shadow-lg hover:shadow-2xl transition-all duration-300 card-hover">
          {/* Image Container with Enhanced Gradient Overlay */}
          <motion.div 
            className="relative bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden" 
            style={{ aspectRatio: '4 / 3' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {item.images && item.images.length > 0 ? (
              <img
                src={item.images[0].url}
                alt={item.title}
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-115 group-hover:brightness-110"
                loading="lazy"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-brand-50 to-purple-50">
                <CategoryIcon className="w-16 h-16 text-gray-400 group-hover:scale-110 group-hover:text-brand-500 transition-all duration-300" />
              </div>
            )}
            
            {/* Enhanced Gradient Overlays */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            />
            <motion.div 
              className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            />
            
          {/* Subtle shine effect */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          />
            
            {/* Category Badge */}
            <motion.div 
              className="absolute top-3 left-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Badge className="bg-white/95 backdrop-blur-md text-gray-700 shadow-xl border border-white/30 group-hover:bg-white group-hover:shadow-2xl transition-all duration-300">
                <CategoryIcon className="w-3 h-3 mr-1.5 group-hover:scale-110 transition-transform duration-200" />
                {getCategoryLabel(item.category)}
              </Badge>
            </motion.div>
            
            {/* Offer Type Badge */}
            <motion.div 
              className="absolute top-3 left-3 mt-8"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Badge 
                className={`shadow-xl border border-white/30 backdrop-blur-md group-hover:shadow-2xl transition-all duration-300 ${
                  item.offer_type === 'trade' 
                    ? 'bg-orange-100/95 text-orange-700 group-hover:bg-orange-200/95' 
                    : 'bg-blue-100/95 text-blue-700 group-hover:bg-blue-200/95'
                }`}
              >
                <OfferTypeIcon className="w-3 h-3 mr-1.5 group-hover:scale-110 transition-transform duration-200" />
                {getOfferTypeLabel(item.offer_type)}
              </Badge>
            </motion.div>
            
            {/* Action Buttons */}
            <motion.div 
              className="absolute top-3 right-3 flex gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Delete Button (seulement pour le propriétaire) */}
              {isOwner && (
                <motion.button
                  onClick={onDeleteItem}
                  aria-label="Supprimer l'objet"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full border backdrop-blur-md shadow-xl transition-all bg-red-500 text-white border-red-400 hover:bg-red-600 hover:scale-110 opacity-0 group-hover:opacity-100 hover:shadow-2xl"
                  title="Supprimer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 size={16} />
                </motion.button>
              )}
              
              {/* Favorite Button */}
              <motion.button
                onClick={onToggleFavorite}
                aria-label={isFavorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                aria-pressed={isFavorited}
                className={`inline-flex items-center justify-center w-9 h-9 rounded-full border backdrop-blur-md shadow-xl transition-all hover:scale-110 hover:shadow-2xl ${
                  isFavorited
                    ? 'bg-red-500 text-white border-red-400 hover:bg-red-600'
                    : 'bg-white/95 text-gray-700 border-gray-200 hover:bg-white'
                }`}
                title="Favori"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                animate={isFavorited ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Heart size={18} className={isFavorited ? 'fill-current' : ''} />
              </motion.button>
            </motion.div>

            {/* Availability Status */}
            {!item.is_available && (
              <motion.div 
                className="absolute bottom-3 left-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge variant="danger" className="shadow-xl backdrop-blur-md">Indisponible</Badge>
              </motion.div>
            )}
            
            {/* Rating Overlay */}
            {typeof item.average_rating === 'number' && item.ratings_count ? (
              <motion.div 
                className="absolute bottom-3 right-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center bg-white/95 backdrop-blur-md rounded-full px-2.5 py-1 shadow-xl border border-white/30 group-hover:shadow-2xl transition-all duration-300">
                  <Star className="w-3.5 h-3.5 text-yellow-500 mr-1 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-xs font-semibold text-gray-800">{item.average_rating.toFixed(1)}</span>
                </div>
              </motion.div>
            ) : null}
          </motion.div>

          {/* Content */}
          <motion.div 
            className="p-5 flex-1 flex flex-col"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <motion.h3 
              className="font-bold text-gray-900 mb-2 line-clamp-2 text-lg group-hover:text-brand-600 transition-colors duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {item.title}
            </motion.h3>
            
            {item.description && (
              <motion.p 
                className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed group-hover:text-gray-700 transition-colors duration-300"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {item.description}
              </motion.p>
            )}
            
            {desiredItemsList.items.length > 0 && (
              <motion.div 
                className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-lg border border-orange-200 group-hover:from-orange-100 group-hover:to-orange-200/50 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2 mb-2 text-orange-800">
                  <OfferTypeIcon className="w-4 h-4" />
                  <span className="text-xs font-semibold tracking-wide">Recherche en échange</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {desiredItemsList.items.map((d, i) => (
                    <span key={`${d}-${i}`} className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/90 text-orange-700 border border-orange-200">
                      {d}
                    </span>
                  ))}
                  {desiredItemsList.total > desiredItemsList.items.length && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-orange-200 text-orange-800 border border-orange-300">
                      +{desiredItemsList.total - desiredItemsList.items.length}
                    </span>
                  )}
                </div>
              </motion.div>
            )}
            
            {/* Footer */}
            <motion.div 
              className="flex items-center justify-between mt-auto"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center text-sm text-gray-500">
                <motion.div 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/profile/${item.owner_id}`);
                  }}
                  className="block mr-2 cursor-pointer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <div className="relative w-7 h-7 rounded-full overflow-hidden bg-gradient-to-br from-brand-400 to-brand-600 border border-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300">
                    {item.owner?.avatar_url ? (
                      <img
                        src={item.owner.avatar_url}
                        alt={`Avatar de ${item.owner.full_name || 'Propriétaire'}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    
                    {/* Indicateur de profil vérifié */}
                    {item.owner?.avatar_url && item.owner?.full_name && item.owner?.phone && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border border-white rounded-full shadow-lg" 
                           title="Profil vérifié" />
                    )}
                  </div>
                </motion.div>
                <motion.span 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/profile/${item.owner_id}`);
                  }}
                  className="font-medium hover:text-brand-600 transition-colors duration-300 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.owner?.full_name || 'Anonyme'}
                </motion.span>
              </div>
              
              {/* Quartier */}
              {community && (
                <motion.div 
                  className="flex items-center text-sm text-gray-500 bg-gradient-to-r from-blue-50/90 to-blue-100/90 rounded-full px-2.5 py-1 backdrop-blur-sm border border-blue-200/50 group-hover:from-blue-100/90 group-hover:to-blue-200/90 group-hover:border-blue-300/50 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Building2 className="w-3.5 h-3.5 mr-1 group-hover:text-blue-600 transition-colors duration-300" />
                  <span className="font-medium group-hover:text-blue-700 transition-colors duration-300">
                    {community.name}
                    {community.city && ` • ${community.city}`}
                  </span>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
          
          {/* Enhanced Hover Glow Effect */}
          <motion.div 
            className="absolute inset-0 rounded-3xl bg-gradient-to-r from-brand-400/0 via-brand-500/0 to-brand-600/0 group-hover:from-brand-400/8 group-hover:via-brand-500/8 group-hover:to-brand-600/8 transition-all duration-500 pointer-events-none"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          />
          
          {/* Subtle border glow */}
          <motion.div 
            className="absolute inset-0 rounded-3xl border border-transparent group-hover:border-brand-200/30 transition-all duration-500 pointer-events-none"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          />
        </Card>
      </Link>
    </motion.div>
  );
};

export default ItemCard;
