import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Layers, 
  Search, 
  Filter, 
  X, 
  Settings,
  Eye,
  EyeOff,
  Users,
  Star,
  RotateCcw,
  Plus,
  Minus,
  Compass,
  Target
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

interface MapboxFullscreenMapProps {
  onClose: () => void;
  onItemClick?: (item: Item) => void;
  onCommunityClick?: (community: Community) => void;
  initialCenter?: [number, number];
  initialZoom?: number;
}

// Interface supprimée car non utilisée

const MapboxFullscreenMap: React.FC<MapboxFullscreenMapProps> = ({
  onClose,
  onItemClick,
  onCommunityClick,
  initialCenter,
  initialZoom = 12
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [toolbarTimeout, setToolbarTimeout] = useState<NodeJS.Timeout | null>(null);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'dark' | 'outdoors'>('streets');
  const [showLegend, setShowLegend] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [offerTypeFilter, setOfferTypeFilter] = useState<string>('');
  const [radiusFilter, setRadiusFilter] = useState<number>(10);
  const [showItems, setShowItems] = useState(true);
  const [showCommunities, setShowCommunities] = useState(true);
  const [isRotating, setIsRotating] = useState(false);
  // Variable de rotation supprimée car non utilisée
  
  const { userLocation, getCurrentLocation } = useGeolocation();
  const { data: items } = useItems();
  const { data: communities } = useCommunities();

  // Catégories avec couleurs et icônes - optimisé avec useMemo
  const categoryConfig = useMemo(() => ({
    'tools': { color: '#FF6B6B', icon: '🔨' },
    'electronics': { color: '#96CEB4', icon: '💻' },
    'books': { color: '#FFEAA7', icon: '📚' },
    'sports': { color: '#98D8C8', icon: '⚽' },
    'kitchen': { color: '#BB8FCE', icon: '🍳' },
    'garden': { color: '#F7DC6F', icon: '🌱' },
    'toys': { color: '#F8C471', icon: '🧸' },
    'fashion': { color: '#DDA0DD', icon: '👕' },
    'furniture': { color: '#AED6F1', icon: '🪑' },
    'music': { color: '#F1948A', icon: '🎵' },
    'baby': { color: '#FFB6C1', icon: '👶' },
    'art': { color: '#DDA0DD', icon: '🎨' },
    'beauty': { color: '#FFC0CB', icon: '💄' },
    'auto': { color: '#4ECDC4', icon: '🚗' },
    'office': { color: '#85C1E9', icon: '🏢' },
    'services': { color: '#98D8C8', icon: '🔧' },
    'other': { color: '#AAB7B8', icon: '📦' }
  }), []);

  // Initialisation de la carte
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const center = initialCenter || (userLocation ? [userLocation.lng, userLocation.lat] : [2.3522, 48.8566]);

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: `mapbox://styles/mapbox/${mapStyle}-v11`,
      center: center,
      zoom: initialZoom,
      pitch: 60,
      bearing: -17.6,
      antialias: true,
      projection: 'globe'
    });

    map.current.on('load', () => {
      setIsMapLoaded(true);
      setupMapSources();
      setupMapLayers();
      addMarkers();
      setupGlobeLighting();
    });

    map.current.on('style.load', () => {
      setupMapSources();
      setupMapLayers();
      setupGlobeLighting();
    });

    // Gestionnaire pour fermer avec Escape
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCenter, initialZoom, mapStyle, onClose, userLocation]);


  // Configuration de l'éclairage du globe
  const setupGlobeLighting = useCallback(() => {
    if (!map.current || !isMapLoaded) return;

    map.current.setConfigProperty('basemap', 'lightPreset', 'day');
    map.current.setConfigProperty('basemap', 'showPointOfInterestLabels', true);
    map.current.setConfigProperty('basemap', 'showTransitLabels', true);
  }, [isMapLoaded]);

  // Mise à jour du style de carte
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;
    
    map.current.setStyle(`mapbox://styles/mapbox/${mapStyle}-v11`);
  }, [mapStyle, isMapLoaded]);

  // Debug: afficher les données reçues (une seule fois)
  useEffect(() => {
    if (items && items.length > 0) {
      console.log('Debug Mapbox - Items:', items.length, 'Communities:', communities?.length || 0);
      console.log('Premier item:', items[0]);
      console.log('Coordonnées item:', {
        latitude: items[0].latitude,
        longitude: items[0].longitude,
        center_latitude: (items[0] as any).center_latitude,
        center_longitude: (items[0] as any).center_longitude
      });
    }
    if (communities && communities.length > 0) {
      console.log('Première communauté:', communities[0]);
    }
  }, [items, communities]);

  // Filtrage des données avec useMemo pour optimiser les performances
  const filteredItems = useMemo(() => {
    const filtered = items?.filter(item => {
      if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedCategory && item.category !== selectedCategory) return false;
      if (offerTypeFilter && item.offer_type !== offerTypeFilter) return false;
      return true;
    }) || [];
    console.log('Items filtrés:', filtered.length, 'sur', items?.length || 0);
    return filtered;
  }, [items, searchQuery, selectedCategory, offerTypeFilter]);

  const filteredCommunities = useMemo(() => {
    const filtered = communities?.filter(community => {
      if (!community.center_latitude || !community.center_longitude) return false;
      if (searchQuery && !community.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    }) || [];
    console.log('Communautés filtrées:', filtered.length, 'sur', communities?.length || 0);
    return filtered;
  }, [communities, searchQuery]);

  // Effet pour mettre à jour la carte quand les données changent
  useEffect(() => {
    if (isMapLoaded && map.current) {
      console.log('Mise à jour de la carte - Items:', filteredItems.length, 'Communautés:', filteredCommunities.length);
      
      // Force la mise à jour des sources et couches
      const updateMap = () => {
        console.log('Exécution de updateMap');
        setupMapSources();
        setupMapLayers();
        addMarkers();
      };
      
      // Petit délai pour s'assurer que la carte est prête
      const timeoutId = setTimeout(updateMap, 100);
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredItems, filteredCommunities, isMapLoaded]);

  // Configuration des sources de données
  const setupMapSources = useCallback(() => {
    if (!map.current || !isMapLoaded) return;

    console.log('setupMapSources - Items:', filteredItems.length, 'Communautés:', filteredCommunities.length);

    // Source pour les items
    if (map.current.getSource('items')) {
      map.current.removeSource('items');
    }
    
    if (filteredItems.length > 0) {
      console.log('Ajout de la source items avec', filteredItems.length, 'éléments');
      const features = filteredItems.map(item => {
        // Utiliser les coordonnées de l'item ou des coordonnées par défaut (Paris)
        const longitude = item.longitude || 2.3522;
        const latitude = item.latitude || 48.8566;
        
        const feature = {
          type: 'Feature' as const,
          properties: {
            id: item.id,
            title: item.title,
            category: item.category,
            offer_type: item.offer_type,
            estimated_value: item.estimated_value,
            owner: item.owner?.full_name || 'Anonyme',
            images: item.images?.length || 0,
            is_available: item.is_available,
            has_coordinates: !!(item.longitude && item.latitude)
          },
          geometry: {
            type: 'Point' as const,
            coordinates: [longitude, latitude] as [number, number]
          }
        };
        console.log('Feature item:', item.title, 'coords:', [longitude, latitude], 'has_coords:', !!(item.longitude && item.latitude));
        return feature;
      });

      map.current.addSource('items', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: features
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });
    } else {
      console.log('Aucun item à ajouter à la carte');
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
    const layersToRemove = [
      'items-circle', 'items-label', 'items-cluster', 'items-cluster-count',
      'communities-circle', 'communities-label'
    ];
    
    layersToRemove.forEach(layerId => {
      if (map.current?.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
    });

    // Couche des clusters d'items
    if (showItems && filteredItems.length > 0) {
      map.current.addLayer({
        id: 'items-cluster',
        type: 'circle',
        source: 'items',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#51bbd6',
            100,
            '#f1f075',
            750,
            '#f28cb1'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20,
            100,
            30,
            750,
            40
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      map.current.addLayer({
        id: 'items-cluster-count',
        type: 'symbol',
        source: 'items',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        }
      });

      // Couche des items individuels
      map.current.addLayer({
        id: 'items-circle',
        type: 'circle',
        source: 'items',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'match',
            ['get', 'category'],
            ...Object.entries(categoryConfig).flatMap(([category, config]) => [category, config.color]),
            '#AAB7B8'
          ],
          'circle-radius': [
            'case',
            ['get', 'is_available'],
            12,
            8
          ],
          'circle-stroke-width': [
            'case',
            ['get', 'has_coordinates'],
            3,
            2
          ],
          'circle-stroke-color': [
            'case',
            ['get', 'has_coordinates'],
            '#ffffff',
            '#ff6b6b'
          ],
          'circle-opacity': [
            'case',
            ['get', 'has_coordinates'],
            0.9,
            0.7
          ],
          'circle-stroke-opacity': 1
        }
      });

      map.current.addLayer({
        id: 'items-label',
        type: 'symbol',
        source: 'items',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'text-field': ['get', 'title'],
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-offset': [0, 2],
          'text-anchor': 'top',
          'text-size': 12,
          'text-max-width': 10
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
          'circle-radius': 16,
          'circle-stroke-width': 4,
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
          'text-offset': [0, 2.5],
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
    map.current.on('click', 'items-cluster', (e) => {
      const features = map.current?.queryRenderedFeatures(e.point, { layers: ['items-cluster'] });
      if (features && features[0]) {
        const clusterId = features[0].properties?.cluster_id;
        const source = map.current?.getSource('items') as mapboxgl.GeoJSONSource;
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          
        const coordinates = (features[0].geometry as unknown as { coordinates: [number, number] }).coordinates;
        map.current?.easeTo({
          center: coordinates,
          zoom: zoom
        });
        });
      }
    });

    map.current.on('click', 'items-circle', (e) => {
      if (e.features && e.features[0]) {
        const itemId = e.features[0].properties?.id;
        const item = filteredItems.find(i => i.id === itemId);
        if (item) {
          setSelectedItem(item);
          setSelectedCommunity(null);
          if (onItemClick) onItemClick(item);
        }
      }
    });

    map.current.on('click', 'communities-circle', (e) => {
      if (e.features && e.features[0]) {
        const communityId = e.features[0].properties?.id;
        const community = filteredCommunities.find(c => c.id === communityId);
        if (community) {
          setSelectedCommunity(community);
          setSelectedItem(null);
          if (onCommunityClick) onCommunityClick(community);
        }
      }
    });

    // Changer le curseur au survol
    const cursorHandlers = [
      'items-cluster', 'items-circle', 'communities-circle'
    ];

    cursorHandlers.forEach(layerId => {
      map.current?.on('mouseenter', layerId, () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current?.on('mouseleave', layerId, () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
    });

  }, [showItems, showCommunities, filteredItems, filteredCommunities, isMapLoaded, onItemClick, onCommunityClick, categoryConfig]);

  // Ajouter les marqueurs
  const addMarkers = useCallback(() => {
    if (!map.current || !isMapLoaded) return;

    // Marqueur de position utilisateur
    if (userLocation) {
      const userMarker = new mapboxgl.Marker({
        color: '#EF4444',
        scale: 1.5
      })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map.current);

      // Popup pour la position utilisateur
      const userPopup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div class="p-3">
            <div class="flex items-center gap-3">
              <div class="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              <div>
                <div class="font-semibold text-sm">Votre position</div>
                <div class="text-xs text-gray-600">Vous êtes ici</div>
              </div>
            </div>
          </div>
        `);
      
      userMarker.setPopup(userPopup);
    }
  }, [userLocation, isMapLoaded]);

  // Recentrer sur la position utilisateur
  const centerOnUser = useCallback(() => {
    if (!map.current || !userLocation) {
      getCurrentLocation().then(() => {
        if (map.current && userLocation) {
          map.current.flyTo({
            center: [userLocation.lng, userLocation.lat],
            zoom: 15,
            duration: 2000,
            pitch: 60,
            bearing: 0
          });
        }
      });
    } else {
      map.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 15,
        duration: 2000,
        pitch: 60,
        bearing: 0
      });
    }
  }, [userLocation, getCurrentLocation]);

  // Rotation automatique
  const toggleRotation = useCallback(() => {
    if (!map.current) return;
    
    setIsRotating(!isRotating);
    if (!isRotating) {
      const rotateCamera = () => {
        if (isRotating && map.current) {
          // Rotation automatique de la caméra
          map.current.easeTo({
            bearing: map.current.getBearing() + 0.5,
            duration: 100
          });
          requestAnimationFrame(rotateCamera);
        }
      };
      requestAnimationFrame(rotateCamera);
    } else {
      map.current.easeTo({
        bearing: 0,
        duration: 1000
      });
    }
  }, [isRotating]);

  // Zoom controls
  const zoomIn = useCallback(() => {
    if (map.current) {
      map.current.zoomIn();
    }
  }, []);

  const zoomOut = useCallback(() => {
    if (map.current) {
      map.current.zoomOut();
    }
  }, []);

  // Reset view
  const resetView = useCallback(() => {
    if (map.current) {
      map.current.easeTo({
        center: userLocation ? [userLocation.lng, userLocation.lat] : [2.3522, 48.8566],
        zoom: initialZoom,
        pitch: 60,
        bearing: -17.6,
        duration: 2000
      });
      setIsRotating(false);
    }
  }, [userLocation, initialZoom]);

  // Gestion de l'auto-masquage de la barre d'outils
  const handleToolbarInteraction = useCallback(() => {
    setShowToolbar(true);
    if (toolbarTimeout) {
      clearTimeout(toolbarTimeout);
    }
    const timeout = setTimeout(() => setShowToolbar(false), 5000);
    setToolbarTimeout(timeout);
  }, [toolbarTimeout]);

  // Types d'offres
  const offerTypes = [
    { key: '', label: 'Tous', icon: '🔄' },
    { key: 'loan', label: 'Prêt', icon: '🤝' },
    { key: 'trade', label: 'Échange', icon: '🔄' },
    { key: 'donation', label: 'Don', icon: '🎁' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Conteneur de la carte */}
      <div 
        ref={mapContainer} 
        className="w-full h-full"
        onMouseMove={handleToolbarInteraction}
        onMouseEnter={handleToolbarInteraction}
      />

      {/* Barre d'outils supérieure */}
      <AnimatePresence>
        {showToolbar && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-4 right-4 z-10"
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-gray-900">Carte Interactive</h2>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">En ligne</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
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
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                  >
                    <Filter size={16} />
                    Filtres
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onClose}
                    className="flex items-center gap-2"
                  >
                    <X size={16} />
                    Fermer
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bouton flottant pour réafficher la barre d'outils */}
      {!showToolbar && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
          onClick={() => setShowToolbar(true)}
        >
          <Settings size={20} />
        </motion.button>
      )}

      {/* Indicateur de survol */}
      <div className="absolute top-0 left-0 right-0 h-20 z-5 pointer-events-none">
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/20 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
          Survolez pour afficher les outils
        </div>
      </div>

      {/* Contrôles de la carte */}
      <div className="absolute bottom-4 right-4 z-10 space-y-3">
        {/* Contrôles de navigation */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-3 shadow-lg border border-white/20 space-y-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={centerOnUser}
            className="w-full flex items-center justify-center gap-2"
            disabled={!userLocation}
          >
            <Target size={16} />
            Ma position
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={resetView}
            className="w-full flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} />
            Reset
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleRotation}
            className={`w-full flex items-center justify-center gap-2 ${
              isRotating ? 'bg-blue-500 text-white' : ''
            }`}
          >
            <Compass size={16} />
            Rotation
          </Button>
        </div>

        {/* Contrôles de zoom */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-3 shadow-lg border border-white/20 space-y-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={zoomIn}
            className="w-full flex items-center justify-center"
          >
            <Plus size={16} />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={zoomOut}
            className="w-full flex items-center justify-center"
          >
            <Minus size={16} />
          </Button>
        </div>

        {/* Sélecteur de style de carte */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-3 shadow-lg border border-white/20">
          <div className="grid grid-cols-2 gap-1">
            {[
              { key: 'streets', label: 'Rues', icon: '🗺️' },
              { key: 'satellite', label: 'Satellite', icon: '🛰️' },
              { key: 'dark', label: 'Sombre', icon: '🌙' },
              { key: 'outdoors', label: 'Nature', icon: '🌲' }
            ].map((style) => (
              <button
                key={style.key}
                onClick={() => setMapStyle(style.key as 'streets' | 'satellite' | 'dark' | 'outdoors')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${
                  mapStyle === style.key
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={style.label}
              >
                <span>{style.icon}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Contrôles de visibilité */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-3 shadow-lg border border-white/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Objets</span>
            <button
              onClick={() => setShowItems(!showItems)}
              className={`p-2 rounded-lg transition-colors ${
                showItems ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {showItems ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Quartiers</span>
            <button
              onClick={() => setShowCommunities(!showCommunities)}
              className={`p-2 rounded-lg transition-colors ${
                showCommunities ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {showCommunities ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Panneau de filtres */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-20 left-4 z-10"
          >
            <Card className="bg-white/90 backdrop-blur-xl border border-white/20 p-4 w-80">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Filtres</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Recherche */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recherche</label>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Catégorie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Toutes les catégories</option>
                    {Object.keys(categoryConfig).map(category => (
                      <option key={category} value={category}>
                        {categoryConfig[category as keyof typeof categoryConfig].icon} {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type d'offre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type d'offre</label>
                  <div className="space-y-2">
                    {offerTypes.map((type) => (
                      <button
                        key={type.key}
                        onClick={() => setOfferTypeFilter(type.key)}
                        className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                          offerTypeFilter === type.key
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <span>{type.icon}</span>
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rayon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rayon: {radiusFilter} km
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={radiusFilter}
                    onChange={(e) => setRadiusFilter(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Légende */}
      <AnimatePresence>
        {showLegend && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute bottom-4 left-4 z-10"
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
                  <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
                  <span className="text-sm text-gray-700">Votre position</span>
                </div>

                {/* Clusters */}
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-300 rounded-full border-2 border-white"></div>
                  <span className="text-sm text-gray-700">Groupes d'objets</span>
                </div>

                {/* Catégories d'objets */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-700">Objets par catégorie:</h5>
                  <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                    {Object.entries(categoryConfig).map(([category, config]) => (
                      <div key={category} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full border border-white"
                          style={{ backgroundColor: config.color }}
                        ></div>
                        <span className="text-xs text-gray-600 capitalize">{config.icon} {category}</span>
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
      <div className="absolute top-20 right-4 z-10">
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

      {/* Détails de l'item sélectionné */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 z-10"
          >
            <Card className="bg-white/95 backdrop-blur-xl border border-white/20 p-4 shadow-2xl max-w-sm">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-lg">{selectedItem.title}</h3>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={14} />
                  <span>{selectedItem.location_hint || 'Position non spécifiée'}</span>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {categoryConfig[selectedItem.category as keyof typeof categoryConfig]?.icon} {selectedItem.category}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    {selectedItem.offer_type}
                  </span>
                </div>

                {selectedItem.description && (
                  <p className="text-sm text-gray-600 line-clamp-3">{selectedItem.description}</p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users size={14} />
                    <span>{selectedItem.owner?.full_name || 'Anonyme'}</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      window.location.href = `/items/${selectedItem.id}`;
                    }}
                  >
                    Voir détails
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Détails de la communauté sélectionnée */}
      <AnimatePresence>
        {selectedCommunity && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 z-10"
          >
            <Card className="bg-white/95 backdrop-blur-xl border border-white/20 p-4 shadow-2xl max-w-sm">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-lg">{selectedCommunity.name}</h3>
                <button
                  onClick={() => setSelectedCommunity(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={14} />
                  <span>{selectedCommunity.city}</span>
                </div>
                
                {selectedCommunity.description && (
                  <p className="text-sm text-gray-600 line-clamp-3">{selectedCommunity.description}</p>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users size={14} />
                  <span>{(selectedCommunity as CommunityWithLocation).member_count || 0} membres</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <Star size={14} className="text-yellow-500" />
                    <span className="text-sm text-gray-600">Communauté active</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      window.location.href = `/communities/${selectedCommunity.id}`;
                    }}
                  >
                    Voir communauté
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading overlay */}
      {!isMapLoaded && (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">Chargement de la carte...</h3>
            <p className="text-sm text-gray-300">Initialisation des données et de l'interface</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapboxFullscreenMap;
