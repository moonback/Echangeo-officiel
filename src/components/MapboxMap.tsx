import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Navigation, 
  Layers, 
  Search, 
  X, 
  Maximize2, 
  Minimize2,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';
import { useItems } from '../hooks/useItems';
import { useCommunities } from '../hooks/useCommunities';
import type { Item, Community } from '../types';

// Interface étendue pour Community avec géolocalisation
interface CommunityWithLocation extends Community {
  latitude?: number;
  longitude?: number;
  member_count?: number;
}
import Button from './ui/Button';
import Card from './ui/Card';

// Configuration Mapbox
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoibWF5c3N0cm9jYWxsIiwiYSI6ImNsdWJtZjZ1dDBuY2Uya3F5bGJ6Z2x6bGwifQ.xXjQYH8YQH8YQH8YQH8YQH8';

interface MapboxMapProps {
  className?: string;
  onItemClick?: (item: Item) => void;
  onCommunityClick?: (community: Community) => void;
  selectedItems?: string[];
  selectedCommunities?: string[];
  showItems?: boolean;
  showCommunities?: boolean;
  initialCenter?: [number, number];
  initialZoom?: number;
}

// Interface supprimée car non utilisée

const MapboxMap: React.FC<MapboxMapProps> = ({
  className = '',
  onItemClick,
  onCommunityClick,
  showItems = true,
  showCommunities = true,
  initialCenter,
  initialZoom = 12
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [toolbarTimeout, setToolbarTimeout] = useState<NodeJS.Timeout | null>(null);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'dark'>('streets');
  const [showLegend, setShowLegend] = useState(false);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [filteredCommunities, setFilteredCommunities] = useState<Community[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  const { userLocation, getCurrentLocation } = useGeolocation();
  const { data: items } = useItems();
  const { data: communities } = useCommunities();

  // Catégories avec couleurs - optimisé avec useMemo
  const categoryColors = useMemo(() => ({
    'tools': '#FF6B6B',
    'electronics': '#96CEB4',
    'books': '#FFEAA7',
    'sports': '#98D8C8',
    'kitchen': '#BB8FCE',
    'garden': '#F7DC6F',
    'toys': '#F8C471',
    'fashion': '#DDA0DD',
    'furniture': '#AED6F1',
    'music': '#F1948A',
    'baby': '#FFB6C1',
    'art': '#DDA0DD',
    'beauty': '#FFC0CB',
    'auto': '#4ECDC4',
    'office': '#85C1E9',
    'services': '#98D8C8',
    'other': '#AAB7B8'
  }), []);

  // Initialisation de la carte
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const center = initialCenter || (userLocation ? [userLocation.lng, userLocation.lat] : [2.3522, 48.8566]); // Paris par défaut

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: `mapbox://styles/mapbox/${mapStyle}-v11`,
      center: center,
      zoom: initialZoom,
      pitch: 45,
      bearing: -17.6,
      antialias: true
    });

    map.current.on('load', () => {
      setIsMapLoaded(true);
      setupMapSources();
      setupMapLayers();
      addMarkers();
    });

    map.current.on('style.load', () => {
      setupMapSources();
      setupMapLayers();
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mise à jour du style de carte
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;
    
    map.current.setStyle(`mapbox://styles/mapbox/${mapStyle}-v11`);
  }, [mapStyle, isMapLoaded]);

  // Configuration des sources de données
  const setupMapSources = useCallback(() => {
    if (!map.current || !isMapLoaded) return;

    // Source pour les items
    if (map.current.getSource('items')) {
      map.current.removeSource('items');
    }
    
    if (filteredItems.length > 0) {
      map.current.addSource('items', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: filteredItems.map(item => ({
            type: 'Feature',
            properties: {
              id: item.id,
              title: item.title,
              category: item.category,
              offer_type: item.offer_type,
              estimated_value: item.estimated_value,
              owner: item.owner?.full_name || 'Anonyme',
              images: item.images?.length || 0,
              is_available: item.is_available
            },
            geometry: {
              type: 'Point' as const,
              coordinates: [item.longitude || 0, item.latitude || 0] as [number, number]
            }
          }))
        }
      });
    }

    // Source pour les communautés
    if (map.current.getSource('communities')) {
      map.current.removeSource('communities');
    }
    
    if (filteredCommunities.length > 0) {
      map.current.addSource('communities', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: filteredCommunities.map(community => ({
            type: 'Feature',
            properties: {
              id: community.id,
              name: community.name,
              description: community.description,
              member_count: (community as CommunityWithLocation).member_count || 0,
              city: community.city
            },
            geometry: {
              type: 'Point' as const,
              coordinates: [community.center_longitude || 0, community.center_latitude || 0] as [number, number]
            }
          }))
        }
      });
    }
  }, [filteredItems, filteredCommunities, isMapLoaded]);

  // Configuration des couches de rendu
  const setupMapLayers = useCallback(() => {
    if (!map.current || !isMapLoaded) return;

    // Supprimer les anciennes couches
    if (map.current.getLayer('items-circle')) map.current.removeLayer('items-circle');
    if (map.current.getLayer('items-label')) map.current.removeLayer('items-label');
    if (map.current.getLayer('communities-circle')) map.current.removeLayer('communities-circle');
    if (map.current.getLayer('communities-label')) map.current.removeLayer('communities-label');

    // Couche des items
    if (showItems && filteredItems.length > 0) {
      map.current.addLayer({
        id: 'items-circle',
        type: 'circle',
        source: 'items',
        paint: {
          'circle-color': [
            'match',
            ['get', 'category'],
            ...Object.entries(categoryColors).flat(),
            '#AAB7B8' // couleur par défaut
          ],
          'circle-radius': [
            'case',
            ['get', 'is_available'],
            8,
            6
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.8
        }
      });

      map.current.addLayer({
        id: 'items-label',
        type: 'symbol',
        source: 'items',
        layout: {
          'text-field': ['get', 'title'],
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-offset': [0, 1.5],
          'text-anchor': 'top',
          'text-size': 12
        },
        paint: {
          'text-color': '#333333',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2
        }
      });
    }

    // Couche des communautés
    if (showCommunities && filteredCommunities.length > 0) {
      map.current.addLayer({
        id: 'communities-circle',
        type: 'circle',
        source: 'communities',
        paint: {
          'circle-color': '#3B82F6',
          'circle-radius': 12,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9
        }
      });

      map.current.addLayer({
        id: 'communities-label',
        type: 'symbol',
        source: 'communities',
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-offset': [0, 2],
          'text-anchor': 'top',
          'text-size': 14
        },
        paint: {
          'text-color': '#1E40AF',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2
        }
      });
    }

    // Ajouter les événements de clic
    map.current.on('click', 'items-circle', (e) => {
      if (e.features && e.features[0]) {
        const itemId = e.features[0].properties?.id;
        const item = filteredItems.find(i => i.id === itemId);
        if (item && onItemClick) {
          onItemClick(item);
        }
      }
    });

    map.current.on('click', 'communities-circle', (e) => {
      if (e.features && e.features[0]) {
        const communityId = e.features[0].properties?.id;
        const community = filteredCommunities.find(c => c.id === communityId);
        if (community && onCommunityClick) {
          onCommunityClick(community);
        }
      }
    });

    // Changer le curseur au survol
    map.current.on('mouseenter', 'items-circle', () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', 'items-circle', () => {
      if (map.current) map.current.getCanvas().style.cursor = '';
    });

    map.current.on('mouseenter', 'communities-circle', () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', 'communities-circle', () => {
      if (map.current) map.current.getCanvas().style.cursor = '';
    });

  }, [showItems, showCommunities, filteredItems, filteredCommunities, isMapLoaded, onItemClick, onCommunityClick, categoryColors]);

  // Ajouter les marqueurs
  const addMarkers = useCallback(() => {
    if (!map.current || !isMapLoaded) return;

    // Marqueur de position utilisateur
    if (userLocation) {
      const userMarker = new mapboxgl.Marker({
        color: '#EF4444',
        scale: 1.2
      })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map.current);

      // Popup pour la position utilisateur
      const userPopup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div class="p-2">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-red-500 rounded-full"></div>
              <span class="font-semibold text-sm">Votre position</span>
            </div>
          </div>
        `);
      
      userMarker.setPopup(userPopup);
    }
  }, [userLocation, isMapLoaded]);

  // Filtrage des données
  useEffect(() => {
    if (!items || !communities) return;

    const filteredItemsData = items.filter(item => {
      if (!item.latitude || !item.longitude) return false;
      if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedCategory && item.category !== selectedCategory) return false;
      return true;
    });

    const filteredCommunitiesData = communities.filter(community => {
      if (!community.latitude || !community.longitude) return false;
      if (searchQuery && !community.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });

    setFilteredItems(filteredItemsData);
    setFilteredCommunities(filteredCommunitiesData);
  }, [items, communities, searchQuery, selectedCategory]);

  // Recentrer sur la position utilisateur
  const centerOnUser = useCallback(() => {
    if (!map.current || !userLocation) {
      getCurrentLocation().then(() => {
        if (map.current && userLocation) {
          map.current.flyTo({
            center: [userLocation.lng, userLocation.lat],
            zoom: 15,
            duration: 2000
          });
        }
      });
    } else {
      map.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 15,
        duration: 2000
      });
    }
  }, [userLocation, getCurrentLocation]);

  // Basculer en plein écran
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isFullscreen]);

  // Gestion de l'auto-masquage de la barre d'outils
  const handleToolbarInteraction = useCallback(() => {
    setShowToolbar(true);
    if (toolbarTimeout) {
      clearTimeout(toolbarTimeout);
    }
    if (isFullscreen) {
      const timeout = setTimeout(() => setShowToolbar(false), 5000);
      setToolbarTimeout(timeout);
    }
  }, [isFullscreen, toolbarTimeout]);

  // Catégories disponibles
  const categories = Object.keys(categoryColors);

  return (
    <div className={`relative ${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Conteneur de la carte */}
      <div 
        ref={mapContainer} 
        className="w-full h-full rounded-2xl overflow-hidden shadow-2xl"
        onMouseMove={handleToolbarInteraction}
        onMouseEnter={handleToolbarInteraction}
      />

      {/* Barre d'outils en mode plein écran */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`absolute top-4 left-4 right-4 z-10 transition-opacity duration-300 ${
              showToolbar ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-white/20">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">Carte interactive</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">En ligne</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowLegend(!showLegend)}
                    className="flex items-center gap-2"
                  >
                    <Layers size={16} />
                    Légende
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="flex items-center gap-2"
                  >
                    <Minimize2 size={16} />
                    Sortir
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bouton flottant pour réafficher la barre d'outils */}
      {isFullscreen && !showToolbar && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
          onClick={() => setShowToolbar(true)}
        >
          <Settings size={20} />
        </motion.button>
      )}

      {/* Indicateur de survol pour les outils */}
      {isFullscreen && (
        <div className="absolute top-0 left-0 right-0 h-20 z-5 pointer-events-none">
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/20 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
            Survolez pour afficher les outils
          </div>
        </div>
      )}

      {/* Contrôles de la carte */}
      <div className={`absolute ${isFullscreen ? 'bottom-4 left-4' : 'top-4 right-4'} z-10 space-y-3`}>
        {/* Contrôles de base */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-3 shadow-lg border border-white/20 space-y-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={centerOnUser}
            className="w-full flex items-center justify-center gap-2"
            disabled={!userLocation}
          >
            <Navigation size={16} />
            Ma position
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleFullscreen}
            className="w-full flex items-center justify-center gap-2"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            {isFullscreen ? 'Sortir' : 'Plein écran'}
          </Button>
        </div>

        {/* Sélecteur de style de carte */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-3 shadow-lg border border-white/20">
          <div className="flex gap-1">
            {[
              { key: 'streets', label: 'Rues', icon: '🗺️' },
              { key: 'satellite', label: 'Satellite', icon: '🛰️' },
              { key: 'dark', label: 'Sombre', icon: '🌙' }
            ].map((style) => (
              <button
                key={style.key}
                onClick={() => setMapStyle(style.key as 'streets' | 'satellite' | 'dark')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  mapStyle === style.key
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={style.label}
              >
                <span className="mr-1">{style.icon}</span>
                {!isFullscreen && style.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contrôles de visibilité */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-3 shadow-lg border border-white/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Objets</span>
            <button
              onClick={() => {/* Toggle items visibility */}}
              className={`p-1 rounded ${showItems ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
            >
              {showItems ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Quartiers</span>
            <button
              onClick={() => {/* Toggle communities visibility */}}
              className={`p-1 rounded ${showCommunities ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
            >
              {showCommunities ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className={`absolute ${isFullscreen ? 'top-20 left-4 right-4' : 'top-4 left-4'} z-10`}>
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-white/20">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Barre de recherche */}
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher objets ou quartiers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
              />
            </div>

            {/* Filtre par catégorie */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm min-w-[150px]"
            >
              <option value="">Toutes les catégories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Légende */}
      <AnimatePresence>
        {showLegend && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`absolute ${isFullscreen ? 'bottom-4 right-4' : 'bottom-4 left-4'} z-10`}
          >
            <Card className="bg-white/90 backdrop-blur-xl border border-white/20 p-4 max-w-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">Légende</h4>
                <button
                  onClick={() => setShowLegend(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="space-y-3">
                {/* Quartiers */}
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                  <span className="text-sm text-gray-700">Quartiers</span>
                </div>

                {/* Position utilisateur */}
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                  <span className="text-sm text-gray-700">Votre position</span>
                </div>

                {/* Catégories d'objets */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-700">Objets par catégorie:</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(categoryColors).slice(0, 8).map(([category, color]) => (
                      <div key={category} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full border border-white"
                          style={{ backgroundColor: color as string }}
                        ></div>
                        <span className="text-xs text-gray-600 capitalize">{category}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statistiques en temps réel */}
      <div className={`absolute ${isFullscreen ? 'bottom-4 left-4' : 'bottom-4 right-4'} z-10`}>
        <Card className="bg-white/90 backdrop-blur-xl border border-white/20 p-3">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">{filteredCommunities.length} quartiers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">{filteredItems.length} objets</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Loading overlay */}
      {!isMapLoaded && (
        <div className="absolute inset-0 bg-gray-100 rounded-2xl flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Chargement de la carte...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapboxMap;
