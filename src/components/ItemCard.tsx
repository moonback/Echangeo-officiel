import React, { memo, useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Star, 
  Heart, 
  Trash2, 
  Building2, 
  ArrowUpRight,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';
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
  priority?: boolean; // Pour le lazy loading
  showOwnerActions?: boolean; // Contrôle l'affichage des actions propriétaire
  isLoading?: boolean; // Pour afficher un skeleton loader
}

// Constantes pour les animations - optimisées pour de meilleures performances
const ANIMATION_VARIANTS = {
  card: {
    hover: { y: -12, scale: 1.03 },
    tap: { scale: 0.97 }
  },
  image: {
    hover: { scale: 1.02 },
    tap: { scale: 0.98 }
  },
  button: {
    hover: { scale: 1.1 },
    tap: { scale: 0.9 }
  },
  favoriteAnimation: {
    scale: [1, 1.2, 1] as [number, number, number],
    transition: { duration: 0.3 }
  }
} as const;

const CARD_TRANSITION = { duration: 0.3, ease: "easeOut" } as const;

// Constantes pour les séparateurs d'objets désirés (évite la recréation de regex)
const DESIRED_ITEMS_SEPARATORS = /[,;\n]/g;

const ItemCard: React.FC<ItemCardProps> = memo(({ 
  item, 
  className = '', 
  priority = false,
  showOwnerActions = true,
  isLoading = false
}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toggle: toggleFavorite } = useFavorites();
  const { data: isFavorited = false } = useIsItemFavorited(item.id);
  const deleteItem = useDeleteItem();
  
  // État pour le popup du propriétaire
  const [showOwnerPopup, setShowOwnerPopup] = useState(false);
  
  // Optimisation: mise en cache des icônes
  const CategoryIcon = useMemo(() => getCategoryIcon(item.category), [item.category]);
  const OfferTypeIcon = useMemo(() => getOfferTypeIcon(item.offer_type), [item.offer_type]);
  
  // Récupérer les informations de la communauté seulement si nécessaire
  const { data: community } = useCommunity(item.community_id || '');
  
  // Optimisation: mise en cache de la liste des objets désirés avec memoization plus fine
  const desiredItemsList = useMemo(() => {
    if (item.offer_type !== 'trade' || !item.desired_items) {
      return { items: [] as string[], total: 0 };
    }
    
    const allItems = item.desired_items
      .split(DESIRED_ITEMS_SEPARATORS)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
      
    return {
      items: allItems.slice(0, 6),
      total: allItems.length
    };
  }, [item.offer_type, item.desired_items]);
  
  // Vérifications mises en cache
  const isOwner = useMemo(() => user?.id === item.owner_id, [user?.id, item.owner_id]);
  const hasVerifiedProfile = useMemo(() => 
    item.owner?.avatar_url && item.owner?.full_name && item.owner?.phone,
    [item.owner]
  );

  // Handlers optimisés avec useCallback
  const handleToggleFavorite = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      await toggleFavorite(item.id);
    } catch (error) {
      console.error('Erreur lors de la gestion des favoris:', error);
      // TODO: Remplacer par un système de toast/notification
      alert('Erreur lors de la gestion des favoris. Veuillez réessayer.');
    }
  }, [user, navigate, toggleFavorite, item.id]);

  const handleDeleteItem = useCallback(async (e: React.MouseEvent) => {
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
  }, [user, isOwner, deleteItem, item.id, item.title]);

  const handleOwnerClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/profile/${item.owner_id}`);
  }, [navigate, item.owner_id]);

  // Handlers pour le popup du propriétaire
  const handleOwnerMouseEnter = useCallback(() => {
    setShowOwnerPopup(true);
  }, []);

  const handleOwnerMouseLeave = useCallback(() => {
    setShowOwnerPopup(false);
  }, []);

  // Optimisation des classes CSS
  const cardClasses = useMemo(() => 
    `h-full ${className}`,
    [className]
  );

  // Plus besoin de ces classes CSS mémorisées avec le nouveau design

  // Skeleton loader compact
  if (isLoading) {
    return (
      <div className={`h-full ${className}`}>
        <Card className="relative overflow-hidden p-0 group h-full flex flex-col bg-white/95 backdrop-blur-sm border border-gray-200/60 shadow-lg rounded-xl">
          {/* Skeleton Image compact */}
          <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden rounded-t-xl animate-pulse" style={{ aspectRatio: '16 / 10' }}>
            <div className="w-full h-full bg-gray-200" />
            <div className="absolute top-2 left-2">
              <div className="h-5 w-16 bg-gray-300 rounded-full mb-1" />
              <div className="h-5 w-12 bg-gray-300 rounded-full" />
            </div>
            <div className="absolute top-2 right-2">
              <div className="h-7 w-7 bg-gray-300 rounded-full mb-1" />
              <div className="h-7 w-7 bg-gray-300 rounded-full" />
            </div>
          </div>
          
          {/* Skeleton Content compact */}
          <div className="p-3 flex-1 flex flex-col">
            <div className="flex items-start justify-between mb-2">
              <div className="h-4 bg-gray-200 rounded flex-1 mr-2 animate-pulse" />
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-3 bg-gray-200 rounded mb-3 w-2/3 animate-pulse" />
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-5 w-12 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <motion.div 
      variants={ANIMATION_VARIANTS.card}
      whileHover="hover"
      whileTap="tap" 
      transition={CARD_TRANSITION}
      className={cardClasses}
    >
      <Link 
        to={`/items/${item.id}`} 
        className="h-full block"
        aria-label={`Voir les détails de ${item.title}`}
      >
        <Card className="relative overflow-hidden p-0 group h-full flex flex-col bg-white/95 backdrop-blur-sm border border-gray-200/60 shadow-lg hover:shadow-2xl transition-all duration-300 card-hover rounded-xl">
          
          {/* Image Container compact */}
          <motion.div 
            className="relative bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden rounded-t-xl" 
            style={{ aspectRatio: '16 / 10' }}
            variants={ANIMATION_VARIANTS.image}
            whileHover="hover"
            whileTap="tap"
          >
            {item.images && item.images.length > 0 ? (
              <img
                src={item.images[0].url}
                alt={`Image de ${item.title}`}
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-115 group-hover:brightness-110"
                loading={priority ? "eager" : "lazy"}
                decoding="async"
                onError={(e) => {
                  // Fallback vers l'icône de catégorie en cas d'erreur de chargement
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) {
                    fallback.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            
            {/* Fallback toujours présent mais caché par défaut */}
            <div 
              className="hidden items-center justify-center h-full bg-gradient-to-br from-brand-50 to-purple-50"
              role="img"
              aria-label={`Icône pour la catégorie ${getCategoryLabel(item.category)}`}
            >
              <CategoryIcon className="w-16 h-16 text-gray-400 group-hover:scale-110 group-hover:text-brand-500 transition-all duration-300" />
            </div>
            
            {(!item.images || item.images.length === 0) && (
              <div 
                className="flex items-center justify-center h-full bg-gradient-to-br from-brand-50 to-purple-50"
                role="img"
                aria-label={`Icône pour la catégorie ${getCategoryLabel(item.category)}`}
              >
                <CategoryIcon className="w-16 h-16 text-gray-400 group-hover:scale-110 group-hover:text-brand-500 transition-all duration-300" />
              </div>
            )}
            
            {/* Overlays optimisés */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
            
            {/* Badges compacts superposés */}
            <div className="absolute top-2 left-2 flex flex-col gap-1.5">
              {/* Category Badge compact */}
              <Badge 
                variant="neutral" 
                size="sm"
                className="bg-white/95 backdrop-blur-md text-gray-700 shadow-lg border border-white/30 group-hover:bg-white group-hover:shadow-xl transition-all duration-300"
              >
                <CategoryIcon className="w-3 h-3 mr-1 group-hover:scale-110 transition-transform duration-200" />
                {getCategoryLabel(item.category)}
              </Badge>
              
              {/* Offer Type Badge compact */}
              <Badge 
                variant={item.offer_type === 'trade' ? 'warning' : 'info'}
                size="sm"
                className="shadow-lg backdrop-blur-md group-hover:shadow-xl transition-all duration-300"
              >
                <OfferTypeIcon className="w-3 h-3 mr-1 group-hover:scale-110 transition-transform duration-200" />
                {getOfferTypeLabel(item.offer_type)}
              </Badge>
            </div>
            
            {/* Action Buttons compacts */}
            <div className="absolute top-2 right-2 flex flex-col gap-1.5">
              {/* Favorite Button compact */}
              <motion.button
                onClick={handleToggleFavorite}
                aria-label={isFavorited ? `Retirer ${item.title} des favoris` : `Ajouter ${item.title} aux favoris`}
                aria-pressed={isFavorited}
                className={`inline-flex items-center justify-center w-7 h-7 rounded-full border backdrop-blur-md shadow-lg transition-all hover:scale-110 hover:shadow-xl ${
                  isFavorited
                    ? 'bg-red-500 text-white border-red-400 hover:bg-red-600'
                    : 'bg-white/95 text-gray-700 border-gray-200 hover:bg-white'
                }`}
                variants={ANIMATION_VARIANTS.button}
                whileHover="hover"
                whileTap="tap"
                animate={isFavorited ? ANIMATION_VARIANTS.favoriteAnimation : false}
                disabled={!user}
              >
                <Heart size={14} className={isFavorited ? 'fill-current' : ''} />
              </motion.button>
              
              {/* Delete Button compact - seulement pour le propriétaire */}
              {showOwnerActions && isOwner && (
                <motion.button
                  onClick={handleDeleteItem}
                  aria-label={`Supprimer ${item.title}`}
                  className="inline-flex items-center justify-center w-7 h-7 rounded-full border backdrop-blur-md shadow-lg transition-all bg-red-500 text-white border-red-400 hover:bg-red-600 hover:scale-110 opacity-0 group-hover:opacity-100 hover:shadow-xl focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  variants={ANIMATION_VARIANTS.button}
                  whileHover="hover"
                  whileTap="tap"
                  disabled={deleteItem.isPending}
                >
                  <Trash2 size={12} />
                </motion.button>
              )}
            </div>

            {/* Status et rating optimisés */}
            {!item.is_available && (
              <div className="absolute bottom-3 left-3">
                <Badge variant="danger" className="shadow-xl backdrop-blur-md">
                  Indisponible
                </Badge>
              </div>
            )}
            
            {typeof item.average_rating === 'number' && (item.ratings_count || 0) > 0 && (
              <div className="absolute bottom-3 right-3">
                <div className="flex items-center bg-white/95 backdrop-blur-md rounded-full px-2.5 py-1 shadow-xl border border-white/30 group-hover:shadow-2xl transition-all duration-300">
                  <Star className="w-3.5 h-3.5 text-yellow-500 mr-1 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-xs font-semibold text-gray-800">
                    {item.average_rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-600 ml-1">
                    ({item.ratings_count || 0})
                  </span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Content compact */}
          <div className="p-3 flex-1 flex flex-col">
            {/* Titre avec icône de navigation */}
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-gray-900 line-clamp-2 text-sm group-hover:text-brand-600 transition-colors duration-300 flex-1 pr-2">
                {item.title}
              </h3>
              <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-brand-500 transition-colors duration-300 flex-shrink-0" />
            </div>
            
            {/* Description compacte */}
            {item.description && (
              <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                {item.description}
              </p>
            )}
            
            {/* Section échange compacte */}
            {desiredItemsList.items.length > 0 && (
              <div className="mb-3 p-2 bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-lg border border-orange-200 group-hover:from-orange-100 group-hover:to-orange-200/50 transition-all duration-300">
                <div className="flex items-center gap-1.5 mb-1.5 text-orange-800">
                  <OfferTypeIcon className="w-3 h-3" />
                  <span className="text-[10px] font-semibold tracking-wide">Échange</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {desiredItemsList.items.slice(0, 3).map((desiredItem, index) => (
                    <span 
                      key={`${desiredItem}-${index}`} 
                      className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-white/90 text-orange-700 border border-orange-200"
                    >
                      {desiredItem}
                    </span>
                  ))}
                  {desiredItemsList.total > 3 && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-orange-200 text-orange-800 border border-orange-300">
                      +{desiredItemsList.total - 3}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {/* Footer compact avec icônes */}
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
              {/* Propriétaire compact avec popup */}
              <div className="flex items-center gap-2 relative">
                <button
                  onClick={handleOwnerClick}
                  onMouseEnter={handleOwnerMouseEnter}
                  onMouseLeave={handleOwnerMouseLeave}
                  className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 rounded-full"
                  aria-label={`Voir le profil de ${item.owner?.full_name || 'ce propriétaire'}`}
                >
                  <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gradient-to-br from-brand-400 to-brand-600 border border-white shadow-md hover:shadow-lg hover:scale-110 transition-all duration-300">
                    {item.owner?.avatar_url ? (
                      <img
                        src={item.owner.avatar_url}
                        alt={`Avatar de ${item.owner.full_name || 'Propriétaire'}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-3 h-3 text-white" />
                      </div>
                    )}
                    
                    {/* Indicateur de profil vérifié */}
                    {hasVerifiedProfile && (
                      <div 
                        className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 border border-white rounded-full shadow-sm" 
                        title="Profil vérifié"
                        aria-label="Profil vérifié"
                      />
                    )}
                  </div>
                </button>
                <button
                  onClick={handleOwnerClick}
                  onMouseEnter={handleOwnerMouseEnter}
                  onMouseLeave={handleOwnerMouseLeave}
                  className="text-xs font-medium text-gray-600 hover:text-brand-600 transition-colors duration-300 cursor-pointer focus:outline-none focus:text-brand-600 truncate max-w-20"
                >
                  {item.owner?.full_name || 'Anonyme'}
                </button>

                {/* Popup d'informations du propriétaire */}
                <AnimatePresence>
                  {showOwnerPopup && item.owner && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: 10 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute bottom-full left-0 mb-2 z-50"
                      onMouseEnter={handleOwnerMouseEnter}
                      onMouseLeave={handleOwnerMouseLeave}
                    >
                      <div className="bg-white/95 backdrop-blur-md border border-gray-200/60 rounded-xl shadow-xl p-4 min-w-[280px] max-w-[320px]">
                        {/* Header du popup */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-brand-400 to-brand-600 border border-white shadow-lg">
                            {item.owner.avatar_url ? (
                              <img
                                src={item.owner.avatar_url}
                                alt={`Avatar de ${item.owner.full_name || 'Propriétaire'}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <User className="w-6 h-6 text-white" />
                              </div>
                            )}
                            {hasVerifiedProfile && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border border-white rounded-full shadow-sm">
                                <CheckCircle className="w-2 h-2 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-sm truncate">
                              {item.owner.full_name || 'Anonyme'}
                            </h4>
                            {hasVerifiedProfile && (
                              <div className="flex items-center gap-1 mt-1">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span className="text-xs text-green-600 font-medium">Profil vérifié</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Informations détaillées */}
                        <div className="space-y-2">
                          {item.owner.email && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <span className="truncate">{item.owner.email}</span>
                            </div>
                          )}
                          
                          {item.owner.phone && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span>{item.owner.phone}</span>
                            </div>
                          )}
                          
                          {item.owner.address && (
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span className="truncate">{item.owner.address}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span>Membre depuis {new Date(item.owner.created_at).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}</span>
                          </div>
                        </div>

                        {/* Footer avec bouton d'action */}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <button
                            onClick={handleOwnerClick}
                            className="w-full bg-brand-500 hover:bg-brand-600 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                          >
                            <User className="w-3 h-3" />
                            Voir le profil complet
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Quartier compact */}
              {community && (
                <div className="flex items-center text-xs text-gray-500 bg-gradient-to-r from-blue-50/90 to-blue-100/90 rounded-full px-2 py-1 backdrop-blur-sm border border-blue-200/50 group-hover:from-blue-100/90 group-hover:to-blue-200/90 group-hover:border-blue-300/50 transition-all duration-300">
                  <Building2 className="w-3 h-3 mr-1 group-hover:text-blue-600 transition-colors duration-300" />
                  <span className="font-medium group-hover:text-blue-700 transition-colors duration-300 truncate max-w-16">
                    {community.name}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Enhanced Hover Effects */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-400/0 via-brand-500/0 to-brand-600/0 group-hover:from-brand-400/8 group-hover:via-brand-500/8 group-hover:to-brand-600/8 transition-all duration-500 pointer-events-none" />
          <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-brand-200/30 transition-all duration-500 pointer-events-none" />
        </Card>
      </Link>
    </motion.div>
  );
});

// Optimisation: nom d'affichage pour le debugging
ItemCard.displayName = 'ItemCard';

export default ItemCard;