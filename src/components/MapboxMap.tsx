import React from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export interface MapboxMarker {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  imageUrl?: string;
  category?: string;
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

const MapboxMap: React.FC<MapboxMapProps> = ({
  accessToken = import.meta.env.VITE_MAPBOX_TOKEN || import.meta.env.VITE_MAPBOX_TOKEN,
  center,
  zoom = 11,
  height = 360,
  markers = [],
  onMarkerClick,
  autoFit = false,
  userLocation,
  showUserLocation = false,
}) => {
  const mapContainerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<mapboxgl.Map | null>(null);
  const markersRef = React.useRef<mapboxgl.Marker[]>([]);

  React.useEffect(() => {
    if (!accessToken) {
      console.warn('Token Mapbox manquant. Ajoutez VITE_MAPBOX_TOKEN dans votre .env.local');
      return;
    }
    if (!mapContainerRef.current) return;

    try {
      mapboxgl.accessToken = accessToken as string;
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [center.lng, center.lat],
        zoom,
        attributionControl: false,
      });
      mapRef.current = map;

      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }));

      map.on('load', () => {
        // Ajouter les marqueurs
        markers.forEach((marker) => {
          if (typeof marker.latitude === 'number' && typeof marker.longitude === 'number') {
            const el = document.createElement('div');
            el.className = 'marker';
            el.style.width = '20px';
            el.style.height = '20px';
            el.style.borderRadius = '50%';
            el.style.backgroundColor = '#2563eb';
            el.style.border = '2px solid white';
            el.style.cursor = 'pointer';
            el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

            const mapboxMarker = new mapboxgl.Marker(el)
              .setLngLat([marker.longitude, marker.latitude])
              .addTo(map);

            if (onMarkerClick) {
              el.addEventListener('click', () => {
                onMarkerClick(marker.id);
              });
            }

            markersRef.current.push(mapboxMarker);
          }
        });

        // Ajouter le marqueur utilisateur
        if (showUserLocation && userLocation) {
          const userEl = document.createElement('div');
          userEl.style.width = '16px';
          userEl.style.height = '16px';
          userEl.style.borderRadius = '50%';
          userEl.style.backgroundColor = '#2563eb';
          userEl.style.border = '2px solid white';
          userEl.style.boxShadow = '0 0 0 4px rgba(37,99,235,0.3)';
          userEl.style.animation = 'pulse 2s infinite';

          const userMarker = new mapboxgl.Marker(userEl)
            .setLngLat([userLocation.lng, userLocation.lat])
            .addTo(map);

          markersRef.current.push(userMarker);
        }

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
          map.fitBounds(bounds, { padding: 40, maxZoom: 14, duration: 600 });
        }
      });

    } catch (error) {
      console.error('Erreur lors de l\'initialisation de Mapbox:', error);
    }

    return () => {
      // Nettoyer les marqueurs
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      
      // Nettoyer la carte
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [accessToken, center.lat, center.lng, zoom, markers, onMarkerClick, autoFit, showUserLocation, userLocation]);

  // Mettre à jour les marqueurs quand ils changent
  React.useEffect(() => {
    if (!mapRef.current) return;

    // Supprimer les anciens marqueurs
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Ajouter les nouveaux marqueurs
    markers.forEach((marker) => {
      if (typeof marker.latitude === 'number' && typeof marker.longitude === 'number') {
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = '#2563eb';
        el.style.border = '2px solid white';
        el.style.cursor = 'pointer';
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';

        const mapboxMarker = new mapboxgl.Marker(el)
          .setLngLat([marker.longitude, marker.latitude])
          .addTo(mapRef.current!);

        if (onMarkerClick) {
          el.addEventListener('click', () => {
            onMarkerClick(marker.id);
          });
        }

        markersRef.current.push(mapboxMarker);
      }
    });
  }, [markers, onMarkerClick]);

  // Mettre à jour le marqueur utilisateur
  React.useEffect(() => {
    if (!mapRef.current) return;

    // Supprimer l'ancien marqueur utilisateur
    const userMarkers = markersRef.current.filter(marker => 
      marker.getElement().style.animation === 'pulse 2s infinite'
    );
    userMarkers.forEach(marker => marker.remove());

    // Ajouter le nouveau marqueur utilisateur
    if (showUserLocation && userLocation) {
      const userEl = document.createElement('div');
      userEl.style.width = '16px';
      userEl.style.height = '16px';
      userEl.style.borderRadius = '50%';
      userEl.style.backgroundColor = '#2563eb';
      userEl.style.border = '2px solid white';
      userEl.style.boxShadow = '0 0 0 4px rgba(37,99,235,0.3)';
      userEl.style.animation = 'pulse 2s infinite';

      const userMarker = new mapboxgl.Marker(userEl)
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(mapRef.current);

      markersRef.current.push(userMarker);
    }
  }, [showUserLocation, userLocation]);

  if (!accessToken) {
    return (
      <div className="p-4 rounded-xl border border-yellow-300 bg-yellow-50 text-yellow-800 text-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
          <span className="font-medium">Carte temporairement indisponible</span>
        </div>
        <p className="text-sm">
          Pour activer les cartes interactives, ajoutez votre clé Mapbox dans le fichier <code className="bg-yellow-100 px-1 rounded">.env.local</code> :
        </p>
        <code className="block mt-2 p-2 bg-yellow-100 rounded text-xs">
          VITE_MAPBOX_TOKEN=pk.eyJ1...
        </code>
        <p className="text-xs mt-2 text-yellow-700">
          Obtenez une clé gratuite sur <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="underline">mapbox.com</a>
        </p>
      </div>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
      className="rounded-xl overflow-hidden border border-gray-200"
    />
  );
};

export default MapboxMap;
