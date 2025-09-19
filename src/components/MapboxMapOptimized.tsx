import React, { useCallback, useMemo, useRef, useEffect, memo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Types optimisés
export interface MapboxMarker {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  imageUrl?: string;
  category?: string;
  type?: 'item' | 'community' | 'user' | 'event';
  color?: string;
  description?: string;
  owner?: string;
  condition?: string;
  price?: number;
  distance?: number;
  createdAt?: string;
  offerType?: string;
  data?: Record<string, unknown>;
}

interface MapboxMapProps {
  accessToken?: string;
  center: { lat: number; lng: number };
  zoom?: number;
  height?: number | string;
  markers?: MapboxMarker[];
  onMarkerClick?: (id: string) => void;
  autoFit?: boolean;
  userLocation?: { lat: number; lng: number };
  showUserLocation?: boolean;
  showPopup?: boolean;
  enableClustering?: boolean;
  maxMarkersBeforeClustering?: number;
}

// Cache pour les calculs de distance
const distanceCache = new Map<string, number>();

// Fonction optimisée de calcul de distance avec cache
const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const key = `${lat1},${lng1},${lat2},${lng2}`;
  
  if (distanceCache.has(key)) {
    return distanceCache.get(key)!;
  }

  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Limiter la taille du cache
  if (distanceCache.size > 1000) {
    const firstKey = distanceCache.keys().next().value;
    distanceCache.delete(firstKey);
  }
  
  distanceCache.set(key, distance);
  return distance;
};

// Cache pour les popups HTML
const popupCache = new Map<string, string>();

// Fonction optimisée de création de popup avec cache
const createOptimizedPopup = memo((marker: MapboxMarker): string => {
  const cacheKey = `${marker.id}-${marker.title}-${marker.category}-${marker.distance}`;
  
  if (popupCache.has(cacheKey)) {
    return popupCache.get(cacheKey)!;
  }

  const categoryInfo = getCategoryInfo(marker.category);
  
  const popupHTML = `
    <div class="compact-floating-popup" style="
      background: linear-gradient(135deg, ${categoryInfo.gradient});
      color: white;
      padding: 20px;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      border: 2px solid rgba(255, 255, 255, 0.2);
      min-width: 280px;
      max-width: 320px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      backdrop-filter: blur(20px);
      position: relative;
      overflow: hidden;
    ">
      <div class="popup-header" style="margin-bottom: 16px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
          ${categoryInfo.icon}
          <span style="
            background: rgba(255, 255, 255, 0.2);
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            backdrop-filter: blur(10px);
          ">${categoryInfo.label}</span>
        </div>
        <h3 style="
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: white;
          line-height: 1.3;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        ">${marker.title || 'Objet'}</h3>
      </div>

      <div class="popup-info" style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 16px;
      ">
        ${marker.owner ? createInfoItem('user', marker.owner) : ''}
        ${marker.distance !== undefined ? createInfoItem('location', `${marker.distance.toFixed(1)} km`) : ''}
        ${marker.condition ? createInfoItem('condition', marker.condition) : ''}
        ${marker.price ? createInfoItem('price', `${marker.price}€`) : ''}
      </div>

      <button onclick="window.location.href='/items/${marker.id}'" style="
        width: 100%;
        background: rgba(255, 255, 255, 0.95);
        color: #1f2937;
        padding: 12px 20px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        border: none;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      " onmouseover="this.style.background='rgba(255,255,255,1)'; this.style.transform='translateY(-2px)'"
         onmouseout="this.style.background='rgba(255,255,255,0.95)'; this.style.transform='translateY(0)'">
        Voir les détails
      </button>
    </div>
  `;

  // Limiter la taille du cache
  if (popupCache.size > 100) {
    const firstKey = popupCache.keys().next().value;
    popupCache.delete(firstKey);
  }
  
  popupCache.set(cacheKey, popupHTML);
  return popupHTML;
});

// Fonctions utilitaires optimisées
const getCategoryInfo = (category?: string) => {
  const categoryMap: Record<string, { label: string; gradient: string; icon: string }> = {
    tools: {
      label: 'Outils',
      gradient: '#EF4444, #DC2626',
      icon: '<svg width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>'
    },
    electronics: {
      label: 'Électronique',
      gradient: '#3B82F6, #2563EB',
      icon: '<svg width="16" height="16" fill="white" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>'
    },
    books: {
      label: 'Livres',
      gradient: '#8B5CF6, #7C3AED',
      icon: '<svg width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>'
    },
    sports: {
      label: 'Sport',
      gradient: '#10B981, #059669',
      icon: '<svg width="16" height="16" fill="white" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>'
    }
  };

  return categoryMap[category || 'other'] || {
    label: 'Autre',
    gradient: '#6B7280, #4B5563',
    icon: '<svg width="16" height="16" fill="white" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/></svg>'
  };
};

const createInfoItem = (type: string, value: string): string => {
  const icons = {
    user: '<svg width="12" height="12" fill="white" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    location: '<svg width="12" height="12" fill="white" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    condition: '<svg width="12" height="12" fill="white" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
    price: '<svg width="12" height="12" fill="white" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>'
  };

  return `
    <div style="
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      border-radius: 8px;
      padding: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    ">
      <div style="
        width: 20px;
        height: 20px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        ${icons[type as keyof typeof icons] || icons.user}
      </div>
      <span style="font-size: 11px; font-weight: 600; color: white;">${value}</span>
    </div>
  `;
};

// Fonction optimisée pour créer les marqueurs
const createOptimizedMarker = (marker: MapboxMarker): HTMLElement => {
  const el = document.createElement('div');
  el.className = 'optimized-marker';
  el.dataset.markerId = marker.id;
  
  const categoryInfo = getCategoryInfo(marker.category);
  
  el.innerHTML = `
    <div style="
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, ${categoryInfo.gradient});
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    ">
      ${categoryInfo.icon}
      ${marker.type === 'community' ? `
        <div style="
          position: absolute;
          top: -2px;
          right: -2px;
          width: 12px;
          height: 12px;
          background: #10B981;
          border-radius: 50%;
          border: 2px solid white;
        "></div>
      ` : ''}
    </div>
  `;

  return el;
};

// Fonction de clustering simple
const clusterMarkers = (markers: MapboxMarker[], zoom: number): MapboxMarker[] => {
  if (markers.length <= 50 || zoom > 12) {
    return markers;
  }

  const clustered: MapboxMarker[] = [];
  const processed = new Set<string>();
  const clusterRadius = Math.max(0.01, 0.1 / Math.pow(2, zoom - 8));

  markers.forEach(marker => {
    if (processed.has(marker.id)) return;

    const cluster = [marker];
    processed.add(marker.id);

    markers.forEach(otherMarker => {
      if (processed.has(otherMarker.id)) return;
      
      const distance = calculateDistance(
        marker.latitude,
        marker.longitude,
        otherMarker.latitude,
        otherMarker.longitude
      );

      if (distance < clusterRadius) {
        cluster.push(otherMarker);
        processed.add(otherMarker.id);
      }
    });

    if (cluster.length > 1) {
      // Créer un marqueur de cluster
      const avgLat = cluster.reduce((sum, m) => sum + m.latitude, 0) / cluster.length;
      const avgLng = cluster.reduce((sum, m) => sum + m.longitude, 0) / cluster.length;
      
      clustered.push({
        id: `cluster-${marker.id}`,
        latitude: avgLat,
        longitude: avgLng,
        title: `${cluster.length} objets`,
        type: 'cluster',
        data: { items: cluster }
      } as MapboxMarker);
    } else {
      clustered.push(marker);
    }
  });

  return clustered;
};

// Composant principal optimisé
const MapboxMapOptimized = React.forwardRef<mapboxgl.Map, MapboxMapProps>(({
  accessToken = import.meta.env.VITE_MAPBOX_TOKEN,
  center,
  zoom = 11,
  height = 360,
  markers = [],
  onMarkerClick,
  autoFit = false,
  userLocation,
  showUserLocation = false,
  showPopup = true,
  enableClustering = true,
  maxMarkersBeforeClustering = 50
}, ref) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const [isMapLoaded, setIsMapLoaded] = React.useState(false);

  // Mémorisation des marqueurs traités
  const processedMarkers = useMemo(() => {
    if (!enableClustering || markers.length <= maxMarkersBeforeClustering) {
      return markers;
    }
    return clusterMarkers(markers, zoom);
  }, [markers, enableClustering, maxMarkersBeforeClustering, zoom]);

  // Mémorisation du hash des marqueurs pour éviter les re-renders
  const markersHash = useMemo(() => {
    return JSON.stringify(processedMarkers.map(m => ({ id: m.id, lat: m.latitude, lng: m.longitude })));
  }, [processedMarkers]);

  // Exposer la référence de la carte
  React.useImperativeHandle(ref, () => mapRef.current as mapboxgl.Map);

  // Fonction optimisée de gestion du clic sur marqueur
  const handleMarkerClick = useCallback((marker: MapboxMarker, element: HTMLElement) => {
    // Fermer le popup existant
    if (popupRef.current) {
      popupRef.current.remove();
    }

    if (showPopup) {
      const popup = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: false,
        closeOnMove: true,
        offset: 15,
        className: 'optimized-popup',
        maxWidth: '350px'
      })
        .setLngLat([marker.longitude, marker.latitude])
        .setHTML(createOptimizedPopup(marker))
        .addTo(mapRef.current!);
      
      popupRef.current = popup;
    }

    onMarkerClick?.(marker.id);
  }, [showPopup, onMarkerClick]);

  // Fonction optimisée de mise à jour des marqueurs
  const updateMarkers = useCallback(() => {
    if (!mapRef.current || !isMapLoaded) return;

    // Supprimer les marqueurs qui ne sont plus nécessaires
    const currentMarkerIds = new Set(processedMarkers.map(m => m.id));
    markersRef.current.forEach((marker, id) => {
      if (!currentMarkerIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Ajouter ou mettre à jour les marqueurs
    processedMarkers.forEach(marker => {
      if (typeof marker.latitude !== 'number' || typeof marker.longitude !== 'number') {
        return;
      }

      let mapboxMarker = markersRef.current.get(marker.id);
      
      if (!mapboxMarker) {
        // Créer un nouveau marqueur
        const el = createOptimizedMarker(marker);
        
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          handleMarkerClick(marker, el);
        });

        mapboxMarker = new mapboxgl.Marker(el)
          .setLngLat([marker.longitude, marker.latitude])
          .addTo(mapRef.current!);
          
        markersRef.current.set(marker.id, mapboxMarker);
      } else {
        // Mettre à jour la position si nécessaire
        const currentLngLat = mapboxMarker.getLngLat();
        if (currentLngLat.lng !== marker.longitude || currentLngLat.lat !== marker.latitude) {
          mapboxMarker.setLngLat([marker.longitude, marker.latitude]);
        }
      }
    });

    // Auto-fit si demandé
    if (autoFit && processedMarkers.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      processedMarkers.forEach(marker => {
        bounds.extend([marker.longitude, marker.latitude]);
      });
      
      if (showUserLocation && userLocation) {
        bounds.extend([userLocation.lng, userLocation.lat]);
      }
      
      mapRef.current!.fitBounds(bounds, { 
        padding: 40, 
        maxZoom: 14, 
        duration: 600 
      });
    }
  }, [processedMarkers, isMapLoaded, autoFit, showUserLocation, userLocation, handleMarkerClick]);

  // Initialisation de la carte
  useEffect(() => {
    if (!accessToken || !mapContainerRef.current) return;

    try {
      mapboxgl.accessToken = accessToken;
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [center.lng, center.lat],
        zoom,
        attributionControl: false,
      });

      mapRef.current = map;

      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }));

      map.on('load', () => {
        setIsMapLoaded(true);
      });

      // Ajouter le marqueur utilisateur
      if (showUserLocation && userLocation) {
        const userEl = document.createElement('div');
        userEl.style.cssText = `
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: #2563eb;
          border: 3px solid white;
          box-shadow: 0 0 0 6px rgba(37,99,235,0.3), 0 4px 12px rgba(0, 0, 0, 0.4);
          animation: pulse 2s infinite;
        `;

        const userMarker = new mapboxgl.Marker(userEl)
          .setLngLat([userLocation.lng, userLocation.lat])
          .addTo(map);

        markersRef.current.set('user-location', userMarker);
      }

    } catch (error) {
      console.error('Erreur lors de l\'initialisation de Mapbox:', error);
    }

    return () => {
      // Cleanup optimisé
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
      
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current.clear();
      
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [accessToken, center.lat, center.lng, zoom, showUserLocation, userLocation]);

  // Mise à jour des marqueurs quand nécessaire
  useEffect(() => {
    updateMarkers();
  }, [markersHash, updateMarkers]);

  if (!accessToken) {
    return (
      <div className="p-4 rounded-xl border border-yellow-300 bg-yellow-50 text-yellow-800 text-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
          <span className="font-medium">Carte temporairement indisponible</span>
        </div>
        <p className="text-sm">
          Pour activer les cartes interactives, ajoutez votre clé Mapbox dans le fichier{' '}
          <code className="bg-yellow-100 px-1 rounded">.env.local</code>
        </p>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          .optimized-popup .mapboxgl-popup-content {
            padding: 0;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            border: none;
            background: transparent;
            max-width: none !important;
          }
          
          .optimized-popup .mapboxgl-popup-tip {
            display: none;
          }
          
          .optimized-popup .mapboxgl-popup-close-button {
            background: rgba(255, 255, 255, 0.9);
            color: #374151;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            font-size: 14px;
            top: 8px;
            right: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          }

          .optimized-marker {
            transition: transform 0.2s ease;
            cursor: pointer;
          }

          .optimized-marker:hover {
            transform: scale(1.1);
            z-index: 1000;
          }

          .compact-floating-popup {
            animation: popupScaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          @keyframes popupScaleIn {
            0% {
              opacity: 0;
              transform: scale(0.8) translateY(-10px);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          @keyframes pulse {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.1);
              opacity: 0.7;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}
      </style>
      <div
        ref={mapContainerRef}
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
        className="rounded-xl overflow-hidden border border-gray-200 relative"
      />
    </>
  );
});

MapboxMapOptimized.displayName = 'MapboxMapOptimized';

export default MapboxMapOptimized;
