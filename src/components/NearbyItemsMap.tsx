import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, RefreshCw, Eye, EyeOff, Users, ArrowLeft } from 'lucide-react';
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
  onCommunityClick
}) => {
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [showOnlyWithImages, setShowOnlyWithImages] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [viewMode, setViewMode] = useState<'communities' | 'items'>('communities');

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
    
    let filtered = sourceItems.filter((item) => 
      typeof item.latitude === 'number' && 
      typeof item.longitude === 'number'
    );

    if (maxItems) {
      filtered = filtered.slice(0, maxItems);
    }

    return filtered;
  }, [items, communityItems, selectedCommunity, maxItems]);

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

  // Coordonnées par défaut (Paris)
  const defaultCenter = { lat: 48.8566, lng: 2.3522 };
  const mapCenter = userLoc || defaultCenter;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className={`p-0 glass ${className.includes('h-full') ? 'h-full flex flex-col' : ''} ${className.includes('w-full') ? 'w-full' : ''}`}>
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
