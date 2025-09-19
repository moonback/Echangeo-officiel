import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Cache global optimisé (garde pour futures optimisations)

// Cache pour les popups HTML (optimisation majeure)
const popupCache = new Map<string, string>();
const MAX_POPUP_CACHE_SIZE = 100;

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
  showPopup?: boolean;
}

// La fonction de calcul de distance est maintenant dans le cache des popups

// Fonction optimisée pour créer le contenu HTML du popup avec cache
function createOptimizedPopup(marker: MapboxMarker): string {
  const cacheKey = `popup-${marker.id}-${marker.title}-${marker.category}-${marker.distance?.toFixed(1)}`;
  
  if (popupCache.has(cacheKey)) {
    return popupCache.get(cacheKey)!;
  }

  // Labels des catégories avec icônes SVG et couleurs
  const categoryLabels: Record<string, {label: string, color: string, icon: string}> = {
    tools: {
      label: 'Outils', 
      color: '#EF4444',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`
    },
    electronics: {
      label: 'Électronique', 
      color: '#3B82F6',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`
    },
    books: {
      label: 'Livres', 
      color: '#8B5CF6',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`
    },
    sports: {
      label: 'Sport', 
      color: '#10B981',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M8 12h8"></path><path d="M12 8v8"></path></svg>`
    },
    kitchen: {
      label: 'Cuisine', 
      color: '#F59E0B',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 2h7l4 4v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"></path><path d="M9 2v4"></path></svg>`
    },
    garden: {
      label: 'Jardin', 
      color: '#22C55E',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>`
    },
    toys: {
      label: 'Jouets', 
      color: '#EC4899',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>`
    },
    fashion: {
      label: 'Mode', 
      color: '#A855F7',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2h12l4 6-10 13L2 8l4-6z"></path></svg>`
    },
    furniture: {
      label: 'Meubles', 
      color: '#6B7280',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>`
    },
    music: {
      label: 'Musique', 
      color: '#F97316',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>`
    },
    community: {
      label: 'Communauté', 
      color: '#8B5CF6',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>`
    },
    other: {
      label: 'Autres', 
      color: '#6B7280',
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect></svg>`
    },
  };

  const category = categoryLabels[marker.category || 'other'] || categoryLabels.other;

  const content = `
    <div class="compact-floating-popup" style="
      width: 320px;
      height: 380px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.3);
      position: relative;
    ">
      ${marker.imageUrl ? `
        <div style="
          position: absolute;
          inset: 0;
          background-image: url('${marker.imageUrl}');
          background-size: cover;
          background-position: center;
          background-color: #f3f4f6;
        "></div>
        <div style="
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, transparent 80%);
        "></div>
        <div style="
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, ${category.color}20 0%, transparent 70%);
        "></div>
      ` : ''}

      <div style="
        position: relative;
        z-index: 10;
        height: 100%;
        display: flex;
        flex-direction: column;
        padding: 20px;
      ">
        <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
          <div style="
            background: linear-gradient(135deg, ${category.color}E6, ${category.color}CC);
            backdrop-filter: blur(12px);
            padding: 8px 16px;
            border-radius: 25px;
            font-size: 13px;
            font-weight: 700;
            color: white;
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            gap: 6px;
          ">
            <span>${category.icon}</span>
            ${category.label}
          </div>
          
          ${marker.offerType ? `
            <div style="
              padding: 8px 16px;
              border-radius: 25px;
              font-size: 13px;
              font-weight: 700;
              box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
              border: 1px solid rgba(255, 255, 255, 0.2);
              ${marker.offerType === 'loan' 
                ? 'background: linear-gradient(135deg, #3B82F6E6, #1D4ED8CC); color: white;' 
                : 'background: linear-gradient(135deg, #8B5CF6E6, #7C3AEDCC); color: white;'}
            ">
              ${marker.offerType === 'loan' ? '📤 PRÊT' : '🔄 ÉCHANGE'}
            </div>
          ` : ''}
        </div>
        
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
          <h3 style="
            font-size: 22px;
            font-weight: 800;
            color: white;
            margin: 0 0 12px 0;
            line-height: 1.2;
            text-shadow: 0 3px 6px rgba(0, 0, 0, 0.6);
          ">
            ${marker.title || 'Objet sans titre'}
          </h3>
          
          ${marker.description ? `
            <p style="
              font-size: 15px;
              color: rgba(255, 255, 255, 0.95);
              margin: 0 0 20px 0;
              line-height: 1.5;
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
              display: -webkit-box;
              -webkit-line-clamp: 3;
              -webkit-box-orient: vertical;
              overflow: hidden;
            ">
              ${marker.description}
            </p>
          ` : ''}
          
          <div style="
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 20px;
          ">
            ${marker.owner ? `
              <div style="
                background: rgba(255, 255, 255, 0.25);
                backdrop-filter: blur(12px);
                border-radius: 12px;
                padding: 10px;
                display: flex;
                align-items: center;
                gap: 8px;
                border: 1px solid rgba(255, 255, 255, 0.1);
              ">
                <div style="
                  width: 24px;
                  height: 24px;
                  background: linear-gradient(135deg, #10B981, #059669);
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                ">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <span style="font-size: 12px; color: white; font-weight: 600;">${marker.owner}</span>
              </div>
            ` : ''}
            
            ${marker.distance !== undefined ? `
              <div style="
                background: rgba(255, 255, 255, 0.25);
                backdrop-filter: blur(12px);
                border-radius: 12px;
                padding: 10px;
                display: flex;
                align-items: center;
                gap: 8px;
                border: 1px solid rgba(255, 255, 255, 0.1);
              ">
                <div style="
                  width: 24px;
                  height: 24px;
                  background: linear-gradient(135deg, #22C55E, #16A34A);
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                ">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <span style="font-size: 12px; color: white; font-weight: 600;">
                  ${marker.distance < 1 ? `${Math.round(marker.distance * 1000)}m` : `${marker.distance.toFixed(1)}km`}
                </span>
              </div>
            ` : ''}
          </div>
        </div>
        
        <button onclick="window.location.href='/items/${marker.id || ''}'" style="
          width: 100%;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9));
          backdrop-filter: blur(16px);
          color: #1f2937;
          padding: 14px 20px;
          border-radius: 16px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        ">
          Voir les détails
        </button>
      </div>
    </div>
  `;

  // Mise en cache du popup (optimisation)
  if (popupCache.size >= MAX_POPUP_CACHE_SIZE) {
    const firstKey = popupCache.keys().next().value;
    if (firstKey) {
      popupCache.delete(firstKey);
    }
  }
  
  popupCache.set(cacheKey, content);
  return content;
}

// Fonction pour créer le contenu HTML du popup de communauté
function createCommunityHoverPopup(marker: MapboxMarker): string {
  return `
    <div style="
      background: linear-gradient(135deg, #8B5CF6, #7C3AED);
      color: white;
      padding: 12px 16px;
      border-radius: 12px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.2);
      min-width: 200px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <h3 style="font-size: 16px; font-weight: 700; margin: 0 0 8px 0;">
        ${marker.title || 'Quartier'}
      </h3>
      ${marker.description ? `
        <p style="font-size: 13px; color: rgba(255, 255, 255, 0.9); margin: 0 0 8px 0;">
          ${marker.description}
        </p>
      ` : ''}
      <button onclick="window.location.href='/communities/${marker.id ? marker.id.replace('community-', '') : ''}'" style="
        width: 100%;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 8px;
        padding: 8px 12px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
      ">
        Voir la communauté
      </button>
    </div>
  `;
}

// Fonction principale pour créer le contenu du popup
function createPopupContent(marker: MapboxMarker): string {
  if (marker.type === 'item') {
    return createOptimizedPopup(marker);
  }
  return createCommunityHoverPopup(marker);
}

// Fonction pour créer le contenu HTML des marqueurs
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
  let size = '28px';

  if (marker.type === 'community') {
    color = markerColors.community;
    size = '32px';
  } else if (marker.type === 'item') {
    color = marker.color || markerColors.item[marker.category as keyof typeof markerColors.item] || markerColors.item.other;
  }

  const icons = {
    community: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>`,
    tools: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`,
    electronics: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
    other: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle></svg>`
  };

  const icon = marker.type === 'community' ? icons.community : 
               icons[marker.category as keyof typeof icons] || icons.other;

  return `
    <div style="
      width: ${size};
      height: ${size};
      background: ${color};
      border-radius: 50%;
      border: 4px solid white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4), 0 0 0 2px rgba(255, 255, 255, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
    ">
      <div style="
        position: absolute;
        top: 2px;
        left: 2px;
        right: 2px;
        height: 50%;
        background: linear-gradient(to bottom, rgba(255, 255, 255, 0.3), transparent);
        border-radius: 50% 50% 0 0;
        pointer-events: none;
      "></div>
      
      <div style="
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        position: relative;
        z-index: 1;
      ">
        ${icon}
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
  showUserLocation = false,
  showPopup = true
}, ref) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const [hoveredCommunity, setHoveredCommunity] = React.useState<MapboxMarker | null>(null);
  const [isCommunityPopupOpen, setIsCommunityPopupOpen] = React.useState(false);
  const [isMapLoaded, setIsMapLoaded] = React.useState(false);

  // Fonction pour fermer le popup de communauté
  const closeCommunityPopup = useCallback(() => {
    setIsCommunityPopupOpen(false);
    setHoveredCommunity(null);
  }, []);

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
        el.innerHTML = createMarkerContent(marker);
        
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          
          // Fermer le popup existant
          if (popupRef.current) {
            popupRef.current.remove();
          }
          
          if (showPopup) {
            // Créer le nouveau popup au clic
            const popup = new mapboxgl.Popup({
              closeButton: true,
              closeOnClick: false,
              closeOnMove: true,
              offset: 15,
              className: 'custom-popup'
            })
              .setLngLat([marker.longitude, marker.latitude])
              .setHTML(createPopupContent(marker))
              .addTo(mapRef.current!);
            
            popupRef.current = popup;
          }

          onMarkerClick?.(marker.id);
        });

        // Ajouter les événements de survol pour les communautés
        if (marker.type === 'community') {
          el.addEventListener('mouseenter', () => {
            if (!isCommunityPopupOpen) {
              setHoveredCommunity(marker);
            }
          });

          el.addEventListener('mouseleave', () => {
            if (!isCommunityPopupOpen) {
              setTimeout(() => {
                setHoveredCommunity(null);
              }, 150);
            }
          });

          el.addEventListener('click', () => {
            setIsCommunityPopupOpen(true);
            setHoveredCommunity(marker);
          });
        }

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
  }, [markers, isMapLoaded, autoFit, showUserLocation, userLocation, showPopup, onMarkerClick, isCommunityPopupOpen]);

  // Gérer le clic sur le bouton de fermeture
  useEffect(() => {
    const handleCloseClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target && target.id === 'close-community-popup') {
        closeCommunityPopup();
      }
    };

    if (isCommunityPopupOpen) {
      document.addEventListener('click', handleCloseClick);
      return () => document.removeEventListener('click', handleCloseClick);
    }
  }, [isCommunityPopupOpen, closeCommunityPopup]);

  // Initialisation de la carte (optimisée)
  useEffect(() => {
    if (!accessToken) {
      console.warn('Token Mapbox manquant. Ajoutez VITE_MAPBOX_TOKEN dans votre .env.local');
      return;
    }
    if (!mapContainerRef.current) return;

    // Copier les références pour le cleanup
    const currentMarkersRef = markersRef.current;
    const currentPopupRef = popupRef;

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
      if (currentPopupRef.current) {
        currentPopupRef.current.remove();
        currentPopupRef.current = null;
      }
      
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
        // Créer le marqueur utilisateur
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
          .custom-popup .mapboxgl-popup-content {
            padding: 0;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
            border: 1px solid rgba(255, 255, 255, 0.2);
            background: transparent;
            max-width: none !important;
          }
          
          .custom-popup .mapboxgl-popup-tip {
            border-top-color: white;
            border-bottom-color: white;
          }
          
          .custom-popup .mapboxgl-popup-close-button {
            background: rgba(255, 255, 255, 0.9);
            color: #374151;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            font-size: 14px;
            line-height: 1;
            top: 8px;
            right: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          }

          .compact-floating-popup {
            animation: popupScaleInEnhanced 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          @keyframes popupScaleInEnhanced {
            0% {
              opacity: 0;
              transform: scale(0.8) translateY(-20px) rotateX(15deg);
            }
            50% {
              opacity: 0.8;
              transform: scale(1.02) translateY(-5px) rotateX(5deg);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateY(0) rotateX(0deg);
            }
          }

          .compact-floating-popup .action-button:hover {
            background: linear-gradient(135deg, rgba(255, 255, 255, 1), rgba(248, 250, 252, 0.95)) !important;
            transform: translateY(-2px) scale(1.02);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.25) !important;
          }

          .marker {
            transition: all 0.3s ease;
          }

          .marker:hover {
            transform: scale(1.15);
            z-index: 1000;
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
      >
        {/* Popup de survol pour les communautés */}
        {hoveredCommunity && (
          <div 
            className="absolute top-4 left-4 z-50"
            style={{
              animation: 'fadeInSlide 0.3s ease-out'
            }}
          >
            <div dangerouslySetInnerHTML={{ 
              __html: createCommunityHoverPopup(hoveredCommunity) 
            }} />
          </div>
        )}
      </div>
    </>
  );
});

MapboxMap.displayName = 'MapboxMap';

export default MapboxMap;