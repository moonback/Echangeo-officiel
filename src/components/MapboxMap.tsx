import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Cache global optimisé (garde pour futures optimisations)

// Types
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
}

// Fonctions de popup supprimées pour simplifier

// Fonction améliorée pour créer le contenu HTML des marqueurs
function createMarkerContent(marker: MapboxMarker): string {
  const markerColors = {
    community: '#8B5CF6',
    user: '#10B981',
    event: '#F59E0B',
    item: {
      tools: '#EF4444',
      electronics: '#3B82F6',
      books: '#8B5CF6',
      sports: '#10B981',
      kitchen: '#F59E0B',
      garden: '#22C55E',
      toys: '#EC4899',
      fashion: '#A855F7',
      furniture: '#6B7280',
      music: '#F97316',
      other: '#6B7280',
    }
  };

  let color = '#6B7280';
  let size = '34px';
  let borderSize = '4px';

  if (marker.type === 'community') {
    color = markerColors.community;
    size = '42px';
    borderSize = '5px';
  } else if (marker.type === 'item') {
    color = marker.color || markerColors.item[marker.category as keyof typeof markerColors.item] || markerColors.item.other;
  }

  // Icônes améliorées avec plus de détails
  const icons = {
    community: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="m22 21-3-3"></path>
    </svg>`,
    tools: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
    </svg>`,
    electronics: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
      <line x1="8" y1="21" x2="16" y2="21"></line>
      <line x1="12" y1="17" x2="12" y2="21"></line>
    </svg>`,
    books: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    </svg>`,
    sports: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M8.5 8.5 12 12l3.5-3.5"></path>
      <path d="M8.5 15.5 12 12l3.5 3.5"></path>
    </svg>`,
    kitchen: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <path d="M3 2h18l-2 7H5L3 2Z"></path>
      <path d="m3 9 2 13h14l2-13"></path>
      <circle cx="9" cy="9" r="1"></circle>
      <circle cx="15" cy="9" r="1"></circle>
    </svg>`,
    garden: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <path d="M12 22c7-5 11-10 8-16-1.5-3-4-4-8 0-4-4-6.5-3-8 0-3 6 1 11 8 16z"></path>
    </svg>`,
    toys: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"></polygon>
    </svg>`,
    fashion: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <path d="M6 2h12l4 6-10 13L2 8l4-6z"></path>
      <path d="M11 2 8 8l4 13"></path>
    </svg>`,
    furniture: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <rect x="3" y="8" width="18" height="4" rx="1"></rect>
      <path d="M21 12v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <path d="M6 12V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4"></path>
    </svg>`,
    music: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <path d="M9 18V5l12-2v13"></path>
      <circle cx="6" cy="18" r="3"></circle>
      <circle cx="18" cy="16" r="3"></circle>
    </svg>`,
    other: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33"></path>
    </svg>`
  };

  const icon = marker.type === 'community' ? icons.community : 
               icons[marker.category as keyof typeof icons] || icons.other;

  return `
    <div class="enhanced-marker" style="
      width: ${size};
      height: ${size};
      position: relative;
      cursor: pointer;
      filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.25));
      z-index: 1;
      pointer-events: auto;
      display: inline-block;
      transform-origin: center;
    ">
      <!-- Effet de pulsation pour les communautés -->
      ${marker.type === 'community' ? `
      <div style="
        position: absolute;
          inset: -8px;
          border-radius: 50%;
          background: ${color}40;
          animation: communityPulse 3s ease-in-out infinite;
      "></div>
      ` : ''}
      
      <!-- Cercle de base avec dégradé -->
      <div style="
        width: 100%;
        height: 100%;
        background: linear-gradient(145deg, ${color}, ${color}DD);
        border-radius: 50%;
        border: ${borderSize} solid white;
        position: relative;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      ">
        <!-- Effet de lumière interne -->
      <div style="
        position: absolute;
          top: 2px;
          left: 2px;
          right: 2px;
          height: 40%;
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1));
          border-radius: 50% 50% 0 0;
          pointer-events: none;
      "></div>
        
        <!-- Reflet glassmorphism -->
      <div style="
        position: absolute;
          top: 15%;
          left: 15%;
          width: 25%;
          height: 25%;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          filter: blur(2px);
          pointer-events: none;
      "></div>

        <!-- Icône avec effet -->
    <div style="
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          position: relative;
          z-index: 2;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        ">
          ${icon}
        </div>
      </div>
      
      <!-- Anneau d'activité pour les objets récents -->
      ${marker.createdAt && new Date().getTime() - new Date(marker.createdAt).getTime() < 24 * 60 * 60 * 1000 ? `
              <div style="
          position: absolute;
          inset: -6px;
          border: 2px solid #10B981;
                border-radius: 50%;
          border-top-color: transparent;
          border-right-color: transparent;
          animation: newItemRotate 2s linear infinite;
        "></div>
          ` : ''}
          
      <!-- Badge pour le type d'offre -->
      ${marker.offerType ? `
              <div style="
          position: absolute;
          top: -6px;
          right: -6px;
          width: 16px;
          height: 16px;
          background: ${marker.offerType === 'loan' ? 'linear-gradient(135deg, #3B82F6, #1E40AF)' : 'linear-gradient(135deg, #8B5CF6, #7C3AED)'};
          border: 2px solid white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
          font-size: 8px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        ">
          <span style="color: white; font-weight: bold;">
            ${marker.offerType === 'loan' ? '📤' : '🔄'}
        </span>
      </div>
          ` : ''}
          
      <!-- Indicateur de distance (si proche) -->
      ${marker.distance !== undefined && marker.distance < 0.5 ? `
              <div style="
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #10B981, #059669);
                color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 8px;
          border: 1px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          animation: bounce 2s ease-in-out infinite;
        ">
          ${Math.round(marker.distance * 1000)}m
      </div>
          ` : ''}
  </div>
  `;
}

// Fonction pour créer un marqueur utilisateur amélioré
function createUserMarkerContent(): string {
  return `
    <div class="user-marker" style="
              width: 24px;
              height: 24px;
      position: relative;
      filter: drop-shadow(0 4px 12px rgba(37, 99, 235, 0.4));
      display: inline-block;
      transform-origin: center;
    ">
      <!-- Cercle pulsant externe -->
      <div style="
        position: absolute;
        inset: -12px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(37, 99, 235, 0.3) 0%, rgba(37, 99, 235, 0.1) 50%, transparent 100%);
        animation: userPulse 2s ease-in-out infinite;
      "></div>
      
      <!-- Anneau animé -->
        <div style="
        position: absolute;
        inset: -8px;
        border: 2px solid #3B82F6;
          border-radius: 50%;
        border-top-color: transparent;
        animation: userRotate 3s linear infinite;
        opacity: 0.6;
        "></div>
      
      <!-- Marqueur principal -->
      <div style="
        width: 100%;
        height: 100%;
        background: linear-gradient(145deg, #2563eb, #1d4ed8);
        border: 3px solid white;
      border-radius: 50%;
      position: relative;
        overflow: hidden;
    ">
        <!-- Effet de lumière -->
      <div style="
        position: absolute;
          top: 1px;
          left: 1px;
          right: 1px;
        height: 50%;
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0.6), transparent);
        border-radius: 50% 50% 0 0;
      "></div>
      
        <!-- Point central -->
      <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 6px;
          height: 6px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
        "></div>
      </div>
    </div>
  `;
}

const MapboxMap = React.forwardRef<mapboxgl.Map, MapboxMapProps>(({
  accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '',
  center,
  zoom = 11,
  height = 360,
  markers = [],
  onMarkerClick,
  autoFit = false,
  userLocation,
  showUserLocation = false
}, ref) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const [isMapLoaded, setIsMapLoaded] = React.useState(false);

  // Fonctions de popup supprimées pour simplifier

  // Mémorisation du hash des marqueurs pour éviter les re-renders (optimisation majeure)
  const markersHash = useMemo(() => {
    return JSON.stringify(markers.map(m => ({ id: m.id, lat: m.latitude, lng: m.longitude })));
  }, [markers]);

  // Exposer la référence de la carte
  React.useImperativeHandle(ref, () => mapRef.current as mapboxgl.Map);

  // Fonction optimisée de mise à jour des marqueurs (optimisation majeure)
  const updateMarkers = useCallback(() => {
    if (!mapRef.current || !isMapLoaded) return;

    // Supprimer les marqueurs qui ne sont plus nécessaires
    const currentMarkerIds = new Set(markers.map(m => m.id));
    markersRef.current.forEach((marker, id) => {
      if (!currentMarkerIds.has(id) && id !== 'user-location') {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Ajouter ou mettre à jour les marqueurs
    markers.forEach(marker => {
      if (typeof marker.latitude !== 'number' || typeof marker.longitude !== 'number') {
      return;
    }

      let mapboxMarker = markersRef.current.get(marker.id);
      
      if (!mapboxMarker) {
        // Créer un nouveau marqueur
             const el = document.createElement('div');
             el.className = 'marker';
        el.style.cssText = `
          position: relative;
          width: auto;
          height: auto;
          display: inline-block;
          pointer-events: auto;
          z-index: 1;
        `;
             el.innerHTML = createMarkerContent(marker);

        // Pas d'interaction au survol, seulement au clic

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          
          // Animation de clic simple
          el.style.transform = 'scale(0.95) translateZ(0)';
                  setTimeout(() => {
            el.style.transform = 'scale(1) translateZ(0)';
                  }, 150);

          // Appeler seulement la fonction de callback
          onMarkerClick?.(marker.id);
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
        if (autoFit && markers.length > 0) {
          const bounds = new mapboxgl.LngLatBounds();
          markers.forEach((marker) => {
            if (typeof marker.latitude === 'number' && typeof marker.longitude === 'number') {
              bounds.extend([marker.longitude, marker.latitude]);
            }
          });
          if (showUserLocation && userLocation) {
            bounds.extend([userLocation.lng, userLocation.lat]);
          }
      mapRef.current!.fitBounds(bounds, { padding: 40, maxZoom: 14, duration: 600 });
    }
  }, [markers, isMapLoaded, autoFit, showUserLocation, userLocation, onMarkerClick]);

  // Gestion des popups supprimée

  // Initialisation de la carte (optimisée)
  useEffect(() => {
    if (!accessToken) {
      console.warn('Token Mapbox manquant. Ajoutez VITE_MAPBOX_TOKEN dans votre .env.local');
      return;
    }
    if (!mapContainerRef.current) return;

    // Copier les références pour le cleanup
    const currentMarkersRef = markersRef.current;

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

    } catch (error) {
      console.error('Erreur lors de l\'initialisation de Mapbox:', error);
    }

    return () => {
      // Cleanup optimisé avec références copiées
      currentMarkersRef.forEach(marker => marker.remove());
      currentMarkersRef.clear();
      
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [accessToken, center.lat, center.lng, zoom]);

  // Mise à jour optimisée des marqueurs basée sur le hash (optimisation majeure)
  useEffect(() => {
    updateMarkers();
  }, [markersHash, updateMarkers]);

  // Mettre à jour le marqueur utilisateur de manière optimisée
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return;

    // Gérer le marqueur utilisateur
    const existingUserMarker = markersRef.current.get('user-location');
    
    if (showUserLocation && userLocation) {
      if (existingUserMarker) {
        // Mettre à jour la position
        existingUserMarker.setLngLat([userLocation.lng, userLocation.lat]);
      } else {
        // Créer le marqueur utilisateur amélioré
      const userEl = document.createElement('div');
        userEl.innerHTML = createUserMarkerContent();

      const userMarker = new mapboxgl.Marker(userEl)
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(mapRef.current);

        markersRef.current.set('user-location', userMarker);
      }
    } else if (existingUserMarker) {
      // Supprimer le marqueur utilisateur s'il n'est plus nécessaire
      existingUserMarker.remove();
      markersRef.current.delete('user-location');
    }
  }, [showUserLocation, userLocation, isMapLoaded]);

  if (!accessToken) {
    return (
      <div className="p-4 rounded-xl border border-yellow-300 bg-yellow-50 text-yellow-800 text-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
          <span className="font-medium">Carte temporairement indisponible</span>
        </div>
        <p className="text-sm">
          Pour activer les cartes interactives, ajoutez votre clé Mapbox dans le fichier{' '}
          <code className="bg-yellow-100 px-1 rounded">.env.local</code> :
        </p>
        <code className="block mt-2 p-2 bg-yellow-100 rounded text-xs">
          VITE_MAPBOX_TOKEN=pk.eyJ1...
        </code>
        <p className="text-xs mt-2 text-yellow-700">
          Obtenez une clé gratuite sur{' '}
          <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="underline">
            mapbox.com
          </a>
        </p>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          /* Styles de popup supprimés */

          .enhanced-marker {
            position: relative;
            z-index: 1;
          }

          /* Assurer que les marqueurs restent visibles et bien positionnés */
          .marker {
            position: relative !important;
            z-index: 1 !important;
            pointer-events: auto !important;
            width: auto !important;
            height: auto !important;
            display: inline-block !important;
            transform-origin: center !important;
          }

          /* Pas d'interaction au survol */

          /* Corriger le positionnement des marqueurs Mapbox */
          .mapboxgl-marker {
            position: absolute !important;
            transform-origin: center bottom !important;
          }

          /* Animations pour les marqueurs de communauté */
          @keyframes communityPulse {
            0%, 100% {
              opacity: 0.6;
              transform: scale(1);
             }
             50% {
              opacity: 0.3;
              transform: scale(1.2);
            }
          }

          /* Animation pour les nouveaux objets */
          @keyframes newItemRotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          /* Animation pour les objets proches */
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateX(-50%) translateY(0);
            }
            40% {
              transform: translateX(-50%) translateY(-3px);
            }
            60% {
              transform: translateX(-50%) translateY(-1px);
            }
          }

          /* Animations pour le marqueur utilisateur */
          @keyframes userPulse {
            0%, 100% {
              opacity: 0.8;
              transform: scale(1);
            }
            50% {
              opacity: 0.4;
              transform: scale(1.5);
            }
          }

          @keyframes userRotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .user-marker {
            animation: userBob 2s ease-in-out infinite;
          }

          @keyframes userBob {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-2px); }
          }

          /* Amélioration des performances */
          .marker, .user-marker, .enhanced-marker {
            backface-visibility: hidden;
            perspective: 1000px;
          }

          /* Animations de popup supprimées */
        `}
      </style>
      <div
        ref={mapContainerRef}
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
        className="rounded-xl overflow-hidden border border-gray-200 relative"
      >
      </div>
    </>
  );
});

MapboxMap.displayName = 'MapboxMap';

export default MapboxMap;
