import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, RefreshCw, Eye, EyeOff, Users, ArrowLeft, Filter, X, SlidersHorizontal } from 'lucide-react';
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
  title?: string;
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
  title = 'Autour de moi',
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
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [viewMode, setViewMode] = useState<'communities' | 'items'>('communities');
  
  // États pour les filtres de la sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [maxDistance, setMaxDistance] = useState<number>(10); // km

  const { data: items, isLoading, refetch } = useItems({
    isAvailable: true,
    hasImages: showOnlyWithImages || undefined
  });

  const { data: communities } = useCommunities();
  const { data: communityItems, isLoading: communityItemsLoading } = useCommunityItems(selectedCommunity?.id || '');

  // Géolocalisation de l'utilisateur
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }

    const getLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationError(null);
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          setLocationError('Impossible d\'obtenir votre position');
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
        data: community
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
      data: item
      };
    });
  }, [filteredItems, userLoc]);

  // Statistiques
  const stats = useMemo(() => {
    const sourceItems = selectedCommunity ? communityItems : items;
    if (!sourceItems) return { total: 0, withLocation: 0, withImages: 0, communities: 0 };
    
    return {
      total: sourceItems.length,
      withLocation: sourceItems.filter(item => item.latitude && item.longitude).length,
      withImages: sourceItems.filter(item => item.images && item.images.length > 0).length,
      communities: communities?.length || 0
    };
  }, [items, communityItems, selectedCommunity, communities]);

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
      className={`${className} ${isSidebarOpen ? 'flex' : ''}`}
    >
      {/* Sidebar des filtres */}
      {showSidebar && isSidebarOpen && (
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-80 bg-white border-r border-gray-200 flex-shrink-0"
        >
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Filter size={20} />
                Filtres
              </h3>
              <Button
                onClick={() => setIsSidebarOpen(false)}
                variant="ghost"
                size="sm"
                className="p-1"
              >
                <X size={16} />
              </Button>
            </div>
            
            <Button
              onClick={resetFilters}
              variant="ghost"
              size="sm"
              className="w-full text-gray-500"
            >
              Réinitialiser les filtres
            </Button>
          </div>

          <div className="p-4 space-y-6 overflow-y-auto" style={{ height: 'calc(100vh - 200px)' }}>
            {viewMode === 'communities' ? (
              <>
                {/* Filtres pour les communautés */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Distance maximale: {maxDistance}km
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1km</span>
                    <span>50km</span>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showOnlyWithImages}
                      onChange={(e) => setShowOnlyWithImages(e.target.checked)}
                      className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Quartiers avec objets seulement
                    </span>
                  </label>
                </div>
              </>
            ) : (
              <>
                {/* Filtres pour les objets */}
                {/* Filtre par catégorie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="">Toutes les catégories</option>
                    <option value="tools">Outils</option>
                    <option value="electronics">Électronique</option>
                    <option value="books">Livres</option>
                    <option value="sports">Sport</option>
                    <option value="kitchen">Cuisine</option>
                    <option value="garden">Jardin</option>
                    <option value="toys">Jouets</option>
                    <option value="fashion">Mode</option>
                    <option value="furniture">Meubles</option>
                    <option value="music">Musique</option>
                    <option value="baby">Bébé</option>
                    <option value="art">Art</option>
                    <option value="beauty">Beauté</option>
                    <option value="auto">Auto</option>
                    <option value="office">Bureau</option>
                    <option value="services">Services</option>
                    <option value="other">Autres</option>
                  </select>
                </div>

                {/* Filtre par condition */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    État
                  </label>
                  <select
                    value={selectedCondition}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="">Tous les états</option>
                    <option value="new">Neuf</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Bon</option>
                    <option value="fair">Correct</option>
                    <option value="poor">Usé</option>
                  </select>
                </div>

                {/* Filtre par distance */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Distance maximale: {maxDistance}km
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1km</span>
                    <span>50km</span>
                  </div>
                </div>

                {/* Filtre par type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type d'échange
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="">Tous les types</option>
                    <option value="loan">Prêt</option>
                    <option value="trade">Échange</option>
                  </select>
                </div>

                {/* Filtre par images */}
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showOnlyWithImages}
                      onChange={(e) => setShowOnlyWithImages(e.target.checked)}
                      className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Avec photos seulement
                    </span>
                  </label>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}

      <Card className={`p-0 glass ${className.includes('h-full') ? 'h-full flex flex-col' : ''} ${className.includes('w-full') ? 'w-full' : ''} ${isSidebarOpen ? 'flex-1' : ''}`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-100 rounded-lg">
                {viewMode === 'communities' ? (
                  <Users className="w-5 h-5 text-brand-600" />
                ) : (
                  <MapPin className="w-5 h-5 text-brand-600" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedCommunity ? selectedCommunity.name : title}
                  </h2>
                  {selectedCommunity && (
                    <Badge variant="info" size="sm">
                      Quartier
                    </Badge>
                  )}
                </div>
                {locationError && (
                  <p className="text-xs text-red-500 mt-1">{locationError}</p>
                )}
                {selectedCommunity && (
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedCommunity.city} • {selectedCommunity.stats?.total_items || 0} objets
                  </p>
                )}
              </div>
            </div>
            
            {showControls && (
              <div className="flex items-center gap-2">
                {/* Bouton retour aux quartiers */}
                {selectedCommunity && (
                  <Button
                    onClick={handleBackToCommunities}
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft size={16} />
                    Retour aux quartiers
                  </Button>
                )}

                {/* Bouton d'actualisation */}
                <Button
                  onClick={handleRefresh}
                  variant="ghost"
                  size="sm"
                  disabled={isRefreshing}
                  className="flex items-center gap-2"
                >
                  <RefreshCw 
                    size={16} 
                    className={isRefreshing ? 'animate-spin' : ''} 
                  />
                  Actualiser
                </Button>

                {/* Bouton de filtres */}
                {showSidebar && (
                <Button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  variant="ghost"
                  size="sm"
                    className={`flex items-center gap-2 ${
                      activeFiltersCount > 0 ? 'text-brand-600' : 'text-gray-500'
                    }`}
                  >
                    <SlidersHorizontal size={16} />
                    Filtres
                    {activeFiltersCount > 0 && (
                      <Badge variant="brand" size="sm">
                        {activeFiltersCount}
                      </Badge>
                    )}
                </Button>
                )}
              </div>
            )}
          </div>

          {/* Statistiques */}
          {showStats && (
            <div className="flex items-center gap-4 text-sm">
              {viewMode === 'communities' ? (
                <>
                  <div className="flex items-center gap-2">
                    <Badge variant="brand" size="sm">
                      {stats.communities} quartiers
                    </Badge>
                    <span className="text-gray-500">actifs</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="info" size="sm">
                      {stats.total} objets
                    </Badge>
                    <span className="text-gray-500">au total</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Badge variant="neutral" size="sm">
                      {stats.total} objets
                    </Badge>
                    <span className="text-gray-500">dans ce quartier</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="info" size="sm">
                      {stats.withLocation} localisés
                    </Badge>
                    <span className="text-gray-500">sur la carte</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="success" size="sm">
                      {stats.withImages} avec photos
                    </Badge>
                  </div>
                </>
              )}

              {/* Filtre images */}
              {viewMode === 'items' && (
                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    onClick={() => setShowOnlyWithImages(!showOnlyWithImages)}
                    variant="ghost"
                    size="sm"
                    className={`flex items-center gap-2 ${
                      showOnlyWithImages ? 'text-brand-600' : 'text-gray-500'
                    }`}
                  >
                    {showOnlyWithImages ? <Eye size={16} /> : <EyeOff size={16} />}
                    {showOnlyWithImages ? 'Avec photos' : 'Tous'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Carte */}
        <div className={`relative ${className.includes('h-full') ? 'flex-1' : ''} ${className.includes('w-full') ? 'w-full' : ''}`}>
          {(isLoading || (viewMode === 'items' && communityItemsLoading)) ? (
            <div 
              className={`flex items-center justify-center bg-gray-50 ${className.includes('h-full') ? 'h-full' : ''}`}
              style={className.includes('h-full') ? {} : { height: height }}
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="inline-block mb-4"
                >
                  <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-500 rounded-full" />
                </motion.div>
                <p className="text-sm text-gray-600">
                  {viewMode === 'communities' ? 'Chargement des quartiers...' : 'Chargement des objets...'}
                </p>
              </div>
            </div>
          ) : (viewMode === 'communities' ? communityMarkers.length > 0 : filteredItems.length > 0) ? (
            <MapboxMap
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
          ) : (
            <div 
              className={`flex items-center justify-center bg-gray-50 ${className.includes('h-full') ? 'h-full' : ''}`}
              style={className.includes('h-full') ? {} : { height: height }}
            >
              <EmptyState
                icon={viewMode === 'communities' ? <Users className="w-12 h-12" /> : <MapPin className="w-12 h-12" />}
                title={viewMode === 'communities' ? 'Aucun quartier trouvé' : 'Aucun objet localisé'}
                description={viewMode === 'communities' 
                  ? 'Aucun quartier actif avec des objets n\'a été trouvé dans votre région.'
                  : 'Aucun objet avec localisation n\'a été trouvé dans ce quartier.'
                }
                action={
                  <Button
                    onClick={handleRefresh}
                    variant="primary"
                    leftIcon={<RefreshCw size={16} />}
                  >
                    Actualiser
                  </Button>
                }
              />
            </div>
          )}

          {/* Indicateur de position utilisateur */}
          {userLoc && (
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700">Votre position</span>
              </div>
            </div>
          )}

          {/* Légende */}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
            <div className="text-xs text-gray-600 space-y-1">
              {viewMode === 'communities' ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-brand-500 rounded-full"></div>
                    <span>Quartiers actifs</span>
                  </div>
                  {userLoc && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Votre position</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Objets disponibles</span>
                  </div>
                  {userLoc && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Votre position</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default NearbyItemsMap;
