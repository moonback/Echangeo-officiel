import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import mapboxgl from 'mapbox-gl';
import { 
  MapPin, 
  RefreshCw, 
  Eye, 
  Users, 
  ArrowLeft, 
  Filter, 
  X, 
  SlidersHorizontal,
  Navigation,
  Layers,
  Grid3X3,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react';
import { useItems } from '../hooks/useItems';
import { useCommunities, useCommunityItems } from '../hooks/useCommunities';
import MapboxMap from './MapboxMap';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import EmptyState from './EmptyState';
import type { Community } from '../types';

interface NearbyItemsMapProps {
  className?: string;
  showStats?: boolean;
  showControls?: boolean;
  height?: number;
  zoom?: number;
  autoFit?: boolean;
  maxItems?: number;
  onItemClick?: (itemId: string) => void;
  showCommunities?: boolean;
  onCommunityClick?: (communityId: string) => void;
  showSidebar?: boolean;
}

const NearbyItemsMap: React.FC<NearbyItemsMapProps> = ({
  className = '',
  showStats = true,
  showControls = true,
  height = 360,
  zoom = 12,
  autoFit = true,
  maxItems,
  onItemClick,
  showCommunities = true,
  onCommunityClick,
  showSidebar = true
}) => {
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [showOnlyWithImages, setShowOnlyWithImages] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [viewMode, setViewMode] = useState<'communities' | 'items'>('communities');
  
  // États pour les filtres de la sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [maxDistance, setMaxDistance] = useState<number>(10); // km
  
  // Nouveaux états pour l'amélioration du design
  const [showLegend, setShowLegend] = useState(false);
  const [showCarousel, setShowCarousel] = useState(false);
  
  // Référence pour la carte
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const { data: items, isLoading, refetch } = useItems({
    isAvailable: true,
    hasImages: showOnlyWithImages || undefined
  });

  const { data: communities } = useCommunities();
  const { data: communityItems, isLoading: communityItemsLoading } = useCommunityItems(selectedCommunity?.id || '');

  // Géolocalisation de l'utilisateur
  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    const getLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    };

    getLocation();
  }, []);

  // Filtrer et limiter les objets
  const filteredItems = useMemo(() => {
    const sourceItems = selectedCommunity ? communityItems : items;
    if (!sourceItems) return [];
    
    let filtered = sourceItems.filter((item) => {
      // Filtre de base : géolocalisation
      if (typeof item.latitude !== 'number' || typeof item.longitude !== 'number') {
        return false;
      }

      // Filtre par catégorie
      if (selectedCategory && item.category !== selectedCategory) {
        return false;
      }

      // Filtre par condition
      if (selectedCondition && item.condition !== selectedCondition) {
        return false;
      }

      // Filtre par type (prêt ou échange)
      if (selectedType && item.offer_type !== selectedType) {
        return false;
      }

      // Filtre par distance
      if (userLoc && maxDistance < 1000) { // Si maxDistance < 1000, on considère que c'est en km
        const R = 6371; // Rayon de la Terre en km
        const dLat = (item.latitude - userLoc.lat) * Math.PI / 180;
        const dLon = (item.longitude - userLoc.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(userLoc.lat * Math.PI / 180) * Math.cos(item.latitude * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        if (distance > maxDistance) {
          return false;
        }
      }

      return true;
    });

    if (maxItems) {
      filtered = filtered.slice(0, maxItems);
    }

    return filtered;
  }, [items, communityItems, selectedCommunity, maxItems, selectedCategory, selectedCondition, selectedType, maxDistance, userLoc]);

  // Préparer les marqueurs de communautés
  const communityMarkers = useMemo(() => {
    if (!communities || !showCommunities) return [];
    
    return communities
      .filter(community => 
        community.center_latitude && 
        community.center_longitude &&
        community.stats?.total_items && 
        community.stats.total_items > 0
      )
      .map(community => ({
        id: `community-${community.id}`,
        latitude: community.center_latitude as number,
        longitude: community.center_longitude as number,
        title: community.name,
        type: 'community' as const,
        data: community as Record<string, unknown>
      }));
  }, [communities, showCommunities]);

  // Préparer les marqueurs d'objets
  const itemMarkers = useMemo(() => {
    return filteredItems.map((item) => {
      // Calculer la distance si on a la position utilisateur
      let distance: number | undefined;
      if (userLoc && item.latitude && item.longitude) {
        const R = 6371; // Rayon de la Terre en km
        const dLat = (item.latitude - userLoc.lat) * Math.PI / 180;
        const dLon = (item.longitude - userLoc.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(userLoc.lat * Math.PI / 180) * Math.cos(item.latitude * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        distance = R * c;
      }

      return {
      id: item.id,
      latitude: item.latitude as number,
      longitude: item.longitude as number,
      title: item.title,
        description: item.description,
      imageUrl: item.images && item.images.length > 0 ? item.images[0].url : undefined,
      category: item.category,
      type: 'item' as const,
        owner: item.owner?.full_name || item.owner?.email || 'Propriétaire anonyme',
        condition: item.condition,
        price: item.estimated_value,
        distance: distance,
        createdAt: item.created_at,
        offerType: item.offer_type,
      data: item as Record<string, unknown>
      };
    });
  }, [filteredItems, userLoc]);


  // Actualiser les données
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Gérer le clic sur un marqueur
  const handleMarkerClick = (id: string) => {
    if (id.startsWith('community-')) {
      const communityId = id.replace('community-', '');
      const community = communities?.find(c => c.id === communityId);
      if (community) {
        setSelectedCommunity(community);
        setViewMode('items');
        if (onCommunityClick) {
          onCommunityClick(communityId);
        }
      }
    } else {
      if (onItemClick) {
        onItemClick(id);
      } else {
        window.location.href = `/items/${id}`;
      }
    }
  };

  // Retour à la vue des communautés
  const handleBackToCommunities = () => {
    setSelectedCommunity(null);
    setViewMode('communities');
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedCondition('');
    setSelectedType('');
    setMaxDistance(10);
    setShowOnlyWithImages(false);
  };

  // Compter les filtres actifs
  const activeFiltersCount = [
    selectedCategory,
    selectedCondition,
    selectedType,
    maxDistance < 10,
    showOnlyWithImages
  ].filter(Boolean).length;

  // Coordonnées par défaut (Paris)
  const defaultCenter = { lat: 48.8566, lng: 2.3522 };
  const mapCenter = userLoc || defaultCenter;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${className} ${isSidebarOpen ? 'flex' : ''} relative`}
    >
      {/* Sidebar des filtres améliorée */}
      <AnimatePresence>
      {showSidebar && isSidebarOpen && (
        <motion.div
            initial={{ x: -400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ 
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1]
            }}
            className="w-96 bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-xl border-r border-gray-200/60 flex-shrink-0 shadow-2xl"
          >
            {/* Header de la sidebar */}
            <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-brand-50/50 to-blue-50/50">
            <div className="flex items-center justify-between mb-4">
                <motion.h3 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xl font-bold text-gray-900 flex items-center gap-3"
                >
                  <div className="p-2 bg-gradient-to-r from-brand-500 to-blue-500 rounded-xl shadow-lg">
                    <Filter size={20} className="text-white" />
                  </div>
                  Filtres avancés
                </motion.h3>
              <Button
                onClick={() => setIsSidebarOpen(false)}
                variant="ghost"
                size="sm"
                  className="p-2 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                  <X size={18} />
              </Button>
            </div>
            
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
            <Button
              onClick={resetFilters}
              variant="ghost"
              size="sm"
                  className="w-full text-gray-600 hover:text-brand-600 hover:bg-brand-50/50 transition-all"
                  leftIcon={<Zap size={16} />}
            >
                  Réinitialiser tous les filtres
            </Button>
              </motion.div>
          </div>

            {/* Contenu des filtres */}
            <div className="p-6 space-y-8 overflow-y-auto" style={{ height: 'calc(100vh - 200px)' }}>
            {viewMode === 'communities' ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-6"
                >
                  {/* Filtre de distance avec design amélioré */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Target size={18} className="text-brand-600" />
                      <label className="text-sm font-semibold text-gray-700">
                        Rayon de recherche
                  </label>
                    </div>
                    <div className="bg-gradient-to-r from-brand-50 to-blue-50 rounded-2xl p-4 border border-brand-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-brand-700">{maxDistance} km</span>
                        <Badge variant="brand" size="sm">
                          <Navigation size={12} className="mr-1" />
                          Rayon
                        </Badge>
                      </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(Number(e.target.value))}
                        className="w-full h-2 bg-gradient-to-r from-brand-200 to-blue-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>1km</span>
                    <span>50km</span>
                      </div>
                  </div>
                </div>

                  {/* Filtre avec photos */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Eye size={18} className="text-brand-600" />
                      <label className="text-sm font-semibold text-gray-700">
                        Affichage
                      </label>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50">
                      <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={showOnlyWithImages}
                      onChange={(e) => setShowOnlyWithImages(e.target.checked)}
                          className="w-5 h-5 rounded-lg border-2 border-gray-300 text-brand-600 focus:ring-brand-500 focus:ring-2 transition-all"
                    />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-brand-700 transition-colors">
                      Quartiers avec objets seulement
                    </span>
                  </label>
                </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-6"
                >
                  {/* Filtre par catégorie avec design amélioré */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Grid3X3 size={18} className="text-brand-600" />
                      <label className="text-sm font-semibold text-gray-700">
                    Catégorie
                  </label>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 overflow-hidden">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full p-4 bg-transparent border-none focus:ring-0 focus:outline-none text-gray-700 font-medium"
                  >
                    <option value="">Toutes les catégories</option>
                        <option value="tools">🔨 Outils</option>
                        <option value="electronics">📱 Électronique</option>
                        <option value="books">📚 Livres</option>
                        <option value="sports">⚽ Sport</option>
                        <option value="kitchen">🍳 Cuisine</option>
                        <option value="garden">🌱 Jardin</option>
                        <option value="toys">🧸 Jouets</option>
                        <option value="fashion">👗 Mode</option>
                        <option value="furniture">🪑 Meubles</option>
                        <option value="music">🎵 Musique</option>
                        <option value="baby">👶 Bébé</option>
                        <option value="art">🎨 Art</option>
                        <option value="beauty">💄 Beauté</option>
                        <option value="auto">🚗 Auto</option>
                        <option value="office">💼 Bureau</option>
                        <option value="services">🛠️ Services</option>
                        <option value="other">📦 Autres</option>
                  </select>
                    </div>
                </div>

                {/* Filtre par condition */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={18} className="text-brand-600" />
                      <label className="text-sm font-semibold text-gray-700">
                        État de l'objet
                  </label>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 overflow-hidden">
                  <select
                    value={selectedCondition}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                        className="w-full p-4 bg-transparent border-none focus:ring-0 focus:outline-none text-gray-700 font-medium"
                  >
                    <option value="">Tous les états</option>
                        <option value="new">✨ Neuf</option>
                        <option value="excellent">⭐ Excellent</option>
                        <option value="good">👍 Bon</option>
                        <option value="fair">✅ Correct</option>
                        <option value="poor">⚠️ Usé</option>
                  </select>
                    </div>
                </div>

                {/* Filtre par distance */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Target size={18} className="text-brand-600" />
                      <label className="text-sm font-semibold text-gray-700">
                        Distance maximale
                  </label>
                    </div>
                    <div className="bg-gradient-to-r from-brand-50 to-blue-50 rounded-2xl p-4 border border-brand-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-brand-700">{maxDistance} km</span>
                        <Badge variant="brand" size="sm">
                          <Navigation size={12} className="mr-1" />
                          Rayon
                        </Badge>
                      </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(Number(e.target.value))}
                        className="w-full h-2 bg-gradient-to-r from-brand-200 to-blue-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>1km</span>
                    <span>50km</span>
                      </div>
                  </div>
                </div>

                {/* Filtre par type */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Layers size={18} className="text-brand-600" />
                      <label className="text-sm font-semibold text-gray-700">
                    Type d'échange
                  </label>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 overflow-hidden">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full p-4 bg-transparent border-none focus:ring-0 focus:outline-none text-gray-700 font-medium"
                  >
                    <option value="">Tous les types</option>
                        <option value="loan">📤 Prêt</option>
                        <option value="trade">🔄 Échange</option>
                  </select>
                    </div>
                </div>

                {/* Filtre par images */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Eye size={18} className="text-brand-600" />
                      <label className="text-sm font-semibold text-gray-700">
                        Affichage
                      </label>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50">
                      <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={showOnlyWithImages}
                      onChange={(e) => setShowOnlyWithImages(e.target.checked)}
                          className="w-5 h-5 rounded-lg border-2 border-gray-300 text-brand-600 focus:ring-brand-500 focus:ring-2 transition-all"
                    />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-brand-700 transition-colors">
                      Avec photos seulement
                    </span>
                  </label>
                </div>
                  </div>
                </motion.div>
            )}
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      <Card className={`p-0 glass ${className.includes('h-full') ? 'h-full flex flex-col' : ''} ${className.includes('w-full') ? 'w-full' : ''} ${isSidebarOpen ? 'flex-1' : ''}`}>
        {/* Carte sans header */}
                  
        {/* Carte améliorée */}
        <div className={`relative overflow-hidden ${className.includes('h-full') ? 'flex-1' : ''} ${className.includes('w-full') ? 'w-full' : ''}`}>
          
          {/* Éléments flottants au-dessus de la carte */}
          <div className="absolute top-4 right-4 z-30">
            {/* Contrôles flottants */}
            {showControls && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2"
              >
                  {/* Bouton retour aux quartiers */}
                  {selectedCommunity && (
                    <Button
                      onClick={handleBackToCommunities}
                      variant="ghost"
                      size="sm"
                      className="bg-white/95 backdrop-blur-xl shadow-lg hover:bg-white hover:shadow-xl transition-all border border-gray-200/50"
                      leftIcon={<ArrowLeft size={14} />}
                    >
                      Retour
                    </Button>
                  )}

                  {/* Bouton d'actualisation */}
                  <Button
                    onClick={handleRefresh}
                    variant="ghost"
                    size="sm"
                    disabled={isRefreshing}
                    className="bg-white/95 backdrop-blur-xl shadow-lg hover:bg-white hover:shadow-xl transition-all border border-gray-200/50"
                    leftIcon={
                      <RefreshCw 
                        size={14} 
                        className={isRefreshing ? 'animate-spin' : ''} 
                      />
                    }
                  >
                    Actualiser
                  </Button>

                  {/* Bouton de filtres */}
                  {showSidebar && (
                    <Button
                      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                      variant="ghost"
                      size="sm"
                      className={`bg-white/95 backdrop-blur-xl shadow-lg hover:bg-white hover:shadow-xl transition-all border border-gray-200/50 relative ${
                        activeFiltersCount > 0 
                          ? 'text-brand-600' 
                          : 'text-gray-600'
                      }`}
                      leftIcon={<SlidersHorizontal size={14} />}
                    >
                      Filtres
                      {activeFiltersCount > 0 && (
                        <Badge 
                          variant="brand" 
                          size="sm"
                          className="absolute -top-1 -right-1 animate-pulse"
                        >
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  )}
              </motion.div>
            )}
          </div>
          {(isLoading || (viewMode === 'items' && communityItemsLoading)) ? (
            <div 
              className={`flex items-center justify-center bg-gradient-to-br from-gray-50 via-brand-50/30 to-blue-50/30 ${className.includes('h-full') ? 'h-full' : ''}`}
              style={className.includes('h-full') ? {} : { height: height }}
            >
                <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <motion.div
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="inline-block mb-6"
                >
                  <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-500 rounded-full shadow-lg" />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg font-semibold text-gray-800 mb-2"
                >
                  {viewMode === 'communities' ? 'Exploration des quartiers...' : 'Recherche des objets...'}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm text-gray-600"
                >
                  {viewMode === 'communities' 
                    ? 'Nous analysons les communautés actives autour de vous' 
                    : 'Nous localisons tous les objets disponibles dans cette zone'
                  }
                </motion.p>
              </motion.div>
            </div>
          ) : (viewMode === 'communities' ? communityMarkers.length > 0 : filteredItems.length > 0) ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative h-full"
            >
            <MapboxMap
              ref={mapRef}
              center={mapCenter}
              zoom={zoom}
              height={className.includes('h-full') ? '100%' : height}
              autoFit={autoFit}
              showUserLocation={!!userLoc}
              userLocation={userLoc || undefined}
              markers={viewMode === 'communities' ? communityMarkers : itemMarkers}
              onMarkerClick={handleMarkerClick}
              showPopup={true}
            />
            </motion.div>
          ) : (
            <div 
              className={`flex items-center justify-center bg-gradient-to-br from-gray-50 via-brand-50/30 to-blue-50/30 ${className.includes('h-full') ? 'h-full' : ''}`}
              style={className.includes('h-full') ? {} : { height: height }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
              <EmptyState
                  icon={viewMode === 'communities' ? <Users className="w-16 h-16 text-brand-500" /> : <MapPin className="w-16 h-16 text-brand-500" />}
                  title={viewMode === 'communities' ? 'Aucun quartier trouvé' : 'Aucun objet localisé'}
                description={viewMode === 'communities' 
                  ? 'Recherchez le quartier où vous habitez pour voir les offres disponibles.'
                  : 'Aucun objet avec localisation n\'a été trouvé dans ce quartier.'
                }
                action={
                  <Button
                    onClick={handleRefresh}
                    variant="primary"
                    leftIcon={<RefreshCw size={16} />}
                      className="shadow-lg"
                  >
                      Actualiser la recherche
                  </Button>
                }
              />
              </motion.div>
            </div>
          )}


          {/* Légende améliorée */}
          {showLegend && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute top-20 right-4 bg-white/95 backdrop-blur-xl rounded-2xl px-3 py-3 shadow-2xl border border-gray-200/50 max-w-xs z-10"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <Layers size={16} className="text-brand-600" />
                  Légende
                </h4>
                <Button
                  onClick={() => setShowLegend(false)}
                  variant="ghost"
                  size="sm"
                  className="p-1 hover:bg-gray-100"
                >
                  <X size={14} />
                </Button>
              </div>
              
              <div className="text-xs text-gray-600 space-y-3">
              {viewMode === 'communities' ? (
                <>
                    <div className="flex items-center gap-3 p-2 bg-brand-50/50 rounded-xl">
                      <div className="w-4 h-4 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full shadow-sm"></div>
                      <span className="font-medium">Quartiers actifs</span>
                  </div>
                  {userLoc && (
                      <div className="flex items-center gap-3 p-2 bg-green-50/50 rounded-xl">
                        <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="font-medium">Votre position</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                    <div className="flex items-center gap-3 p-2 bg-blue-50/50 rounded-xl">
                      <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-sm"></div>
                      <span className="font-medium">Objets disponibles</span>
                  </div>
                  {userLoc && (
                      <div className="flex items-center gap-3 p-2 bg-green-50/50 rounded-xl">
                        <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="font-medium">Votre position</span>
                    </div>
                  )}
                  
                    {/* Légende des catégories améliorée */}
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <Grid3X3 size={12} />
                        Catégories d'objets
                      </div>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                        {[
                          { color: '#EF4444', name: 'Outils', icon: '🔨' },
                          { color: '#3B82F6', name: 'Électronique', icon: '📱' },
                          { color: '#8B5CF6', name: 'Livres', icon: '📚' },
                          { color: '#10B981', name: 'Sport', icon: '⚽' },
                          { color: '#F59E0B', name: 'Cuisine', icon: '🍳' },
                          { color: '#22C55E', name: 'Jardin', icon: '🌱' },
                          { color: '#EC4899', name: 'Jouets', icon: '🧸' },
                          { color: '#A855F7', name: 'Mode', icon: '👗' },
                          { color: '#6B7280', name: 'Meubles', icon: '🪑' },
                          { color: '#F97316', name: 'Musique', icon: '🎵' },
                          { color: '#FBBF24', name: 'Bébé', icon: '👶' },
                          { color: '#8B5CF6', name: 'Art', icon: '🎨' },
                          { color: '#EC4899', name: 'Beauté', icon: '💄' },
                          { color: '#374151', name: 'Auto', icon: '🚗' },
                          { color: '#1F2937', name: 'Bureau', icon: '💼' },
                          { color: '#6366F1', name: 'Services', icon: '🛠️' },
                          { color: '#6B7280', name: 'Autres', icon: '📦' }
                        ].map((category, index) => (
                          <motion.div 
                            key={category.name}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 * index }}
                            className="flex items-center gap-2 p-1.5 bg-white/60 rounded-lg hover:bg-white/80 transition-colors"
                          >
                            <div 
                              className="w-3 h-3 rounded-full shadow-sm" 
                              style={{ backgroundColor: category.color }}
                            ></div>
                            <span className="text-xs font-medium text-gray-700 truncate">
                              {category.icon} {category.name}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                      </div>
                </>
                )}
                      </div>
            </motion.div>
          )}

          {/* Bouton pour afficher/masquer la légende */}
          {!showLegend && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-20 right-4 z-10"
            >
              <Button
                onClick={() => setShowLegend(true)}
                variant="ghost"
                size="sm"
                className="bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white hover:shadow-xl transition-all"
                leftIcon={<Layers size={16} />}
              >
                Légende
              </Button>
            </motion.div>
          )}

          {/* Bouton pour afficher/masquer le carrousel */}
          {!showCarousel && showStats && filteredItems.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bottom-4 left-4 z-10"
            >
              <Button
                onClick={() => setShowCarousel(true)}
                variant="ghost"
                size="sm"
                className="bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white hover:shadow-xl transition-all"
                leftIcon={<Zap size={16} />}
              >
                Objets
              </Button>
            </motion.div>
          )}
                      </div>

        {/* Carrousel d'images flottant au-dessus de la carte */}
        {showStats && filteredItems.length > 0 && showCarousel && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
            className="absolute bottom-24 left-6 right-6 z-20 pointer-events-none"
          >
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 p-3 pointer-events-auto max-h-32 w-1/2 min-w-[350px] ml-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-r from-brand-100 to-brand-200 rounded-lg">
                    <Zap size={14} className="text-brand-600" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-gray-800">Objets disponibles</h3>
                    <p className="text-xs text-gray-500">
                      {viewMode === 'communities' ? 'dans la région' : 'dans ce quartier'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="neutral" className="bg-brand-100 text-brand-700 text-xs px-2 py-1">
                    {filteredItems.length}
                  </Badge>
                  <Button
                    onClick={() => setShowCarousel(false)}
                    variant="ghost"
                    size="sm"
                    className="p-1 hover:bg-gray-100"
                  >
                    <X size={12} />
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                 <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                   {filteredItems.slice(0, 7).map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + (index * 0.03) }}
                      whileHover={{ scale: 1.05 }}
                      className="flex-shrink-0 relative group cursor-pointer"
                      onClick={() => {
                        // Ouvrir la page de l'objet
                        if (onItemClick) {
                          onItemClick(item.id);
                        } else {
                          window.location.href = `/items/${item.id}`;
                        }
                      }}
                      onMouseEnter={() => {
                        if (item.latitude && item.longitude) {
                          // Zoom sur l'objet au survol
                          const mapInstance = mapRef.current;
                          if (mapInstance) {
                            mapInstance.flyTo({
                              center: [item.longitude, item.latitude],
                              zoom: 16,
                              duration: 800
                            });
                          }
                        }
                      }}
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-white shadow-md group-hover:shadow-lg transition-all duration-300">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url || ''}
                            alt={item.title || 'Objet'}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCAyMEMzMi4yNjggMjAgMjYgMjYuMjY4IDI2IDM0QzI2IDQxLjczMiAzMi4yNjggNDggNDAgNDhDNDcuNzMyIDQ4IDU0IDQxLjczMiA1NCAzNEM1NCAyNi4yNjggNDcuNzMyIDIwIDQwIDIwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMjAgNjBMMjAgNTJDMTguMzQ0IDUyIDE3IDUzLjM0NCAxNyA1NUwxNyA2M0MxNyA2NC42NTYgMTguMzQ0IDY2IDIwIDY2SDE4LjVMMjAgNjBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik02MCA2MEw2MS41IDYwSDYwQzYxLjY1NiA2MCA2MyA2MS4zNDQgNjMgNjNWNTVDNjMgNTMuMzQ0IDYxLjY1NiA1MiA2MCA1Mkw2MCA2MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <div className="text-gray-400 text-xs text-center p-2">
                              <div className="text-2xl mb-1">📦</div>
                              <div className="font-medium truncate">{item.title?.substring(0, 8) || 'Objet'}</div>
                      </div>
                      </div>
                        )}
                      </div>
                      
                      {/* Badge de catégorie */}
                      <div className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-white rounded-full shadow-sm flex items-center justify-center border border-gray-200">
                        <span className="text-xs">
                          {item.category === 'tools' ? '🔨' :
                           item.category === 'electronics' ? '📱' :
                           item.category === 'books' ? '📚' :
                           item.category === 'sports' ? '⚽' :
                           item.category === 'kitchen' ? '🍳' :
                           item.category === 'garden' ? '🌱' :
                           item.category === 'toys' ? '🧸' :
                           item.category === 'fashion' ? '👗' :
                           item.category === 'furniture' ? '🪑' :
                           item.category === 'music' ? '🎵' :
                           item.category === 'baby' ? '👶' :
                           item.category === 'art' ? '🎨' :
                           item.category === 'beauty' ? '💄' :
                           item.category === 'auto' ? '🚗' :
                           item.category === 'office' ? '💼' :
                           item.category === 'services' ? '🛠️' : '📦'}
                        </span>
                      </div>

                      {/* Overlay au survol */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="text-white text-xs font-medium bg-black/50 px-1 py-0.5 rounded backdrop-blur-sm">
                          {item.title?.substring(0, 8) || 'Objet'}
                      </div>
                      </div>
                    </motion.div>
                  ))}
                      </div>
                
                 {filteredItems.length > 7 && (
                   <div className="text-center mt-1">
                     <span className="text-xs text-gray-500">
                       +{filteredItems.length - 7} autres
                     </span>
                   </div>
              )}
            </div>
          </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

export default NearbyItemsMap;

// Styles CSS personnalisés pour améliorer l'apparence
const customStyles = `
  .slider {
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
    cursor: pointer;
  }

  .slider::-webkit-slider-track {
    background: linear-gradient(to right, #fbbf24, #3b82f6);
    height: 8px;
    border-radius: 4px;
  }

  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    background: linear-gradient(to right, #3b82f6, #1d4ed8);
    height: 20px;
    width: 20px;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
    transition: all 0.2s ease;
  }

  .slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 12px rgba(59, 130, 246, 0.4);
  }

  .slider::-moz-range-track {
    background: linear-gradient(to right, #fbbf24, #3b82f6);
    height: 8px;
    border-radius: 4px;
    border: none;
  }

  .slider::-moz-range-thumb {
    background: linear-gradient(to right, #3b82f6, #1d4ed8);
    height: 20px;
    width: 20px;
    border-radius: 50%;
    cursor: pointer;
    border: none;
    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
    transition: all 0.2s ease;
  }

  .slider::-moz-range-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 12px rgba(59, 130, 246, 0.4);
  }

  /* Animation pour les cartes */
  .hover-lift {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }

  /* Effet glass morphism amélioré */
  .glass {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  /* Animation pour les badges */
  @keyframes pulse-glow {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
    }
    50% {
      box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
    }
  }

  .pulse-glow {
    animation: pulse-glow 2s infinite;
  }
`;

// Injection des styles dans le document
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = customStyles;
  document.head.appendChild(styleElement);
}
