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
  accessToken = import.meta.env.VITE_MAPBOX_TOKEN,
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
  const hoverPopupRef = React.useRef<mapboxgl.Popup | null>(null);
  const userMarkerRef = React.useRef<mapboxgl.Marker | null>(null);

  React.useEffect(() => {
    if (!accessToken) return; // Do not init without token
    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = accessToken as string;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [center.lng, center.lat],
      zoom,
    });
    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }));

    map.on('load', () => {
      // Fallback for missing sprite images referenced by the style
      map.on('styleimagemissing', (e: any) => {
        const id = e?.id;
        if (!id || map.hasImage(id)) return;
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 2;
          canvas.height = 2;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          ctx.clearRect(0, 0, 2, 2);
          const imageData = ctx.getImageData(0, 0, 2, 2);
          map.addImage(id, { width: 2, height: 2, data: imageData.data } as any, { pixelRatio: 1 });
        } catch {}
      });
      // Initialize an empty clustered source; data will be set by the markers effect
      if (!map.getSource('items')) {
        map.addSource('items', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        } as any);

        // Cluster circles
        map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'items',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#93c5fd',
              10,
              '#60a5fa',
              25,
              '#3b82f6',
              50,
              '#2563eb',
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              14,
              10,
              18,
              25,
              22,
              50,
              26,
            ],
          },
        });

        // Cluster count labels
        map.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'items',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': ['get', 'point_count_abbreviated'],
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12,
          },
          paint: { 'text-color': '#ffffff' },
        });

        // Unclustered points
        map.addLayer({
          id: 'unclustered-point',
          type: 'circle',
          source: 'items',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': '#2563eb',
            'circle-radius': 6,
            'circle-stroke-width': 2,
            'circle-stroke-color': 'rgba(37,99,235,0.25)',
          },
        });

        // Interactions
        map.on('click', 'clusters', (e) => {
          const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
          const clusterId = features[0].properties && (features[0].properties as any).cluster_id;
          const source = map.getSource('items') as mapboxgl.GeoJSONSource;
          if (!source) return;
          source.getClusterExpansionZoom(clusterId, (err, zoomLevel) => {
            if (err) return;
            const coords = (features[0].geometry as any).coordinates as [number, number];
            map.easeTo({ center: coords, zoom: zoomLevel });
          });
        });

        map.on('click', 'unclustered-point', (e) => {
          const features = map.queryRenderedFeatures(e.point, { layers: ['unclustered-point'] });
          const feature = features[0];
          if (!feature) return;
          const id = feature.properties && (feature.properties as any).id;
          const title = feature.properties && (feature.properties as any).title;
          const coords = (feature.geometry as any).coordinates as [number, number];

          const imageUrl = feature.properties && (feature.properties as any).imageUrl;
          const category = feature.properties && (feature.properties as any).category;
          const wrapper = document.createElement('div');
          wrapper.innerHTML = `<div style="min-width:220px">`
            + (imageUrl ? `<div style="margin-bottom:8px;overflow:hidden;border-radius:8px;"><img src="${imageUrl}" alt="${title || ''}" style="width:100%;height:120px;object-fit:cover;display:block;" /></div>` : '')
            + `<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;">
                 <div style="font-weight:600;color:#111827;">${title || 'Objet'}</div>
                 ${category ? `<span style="background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:9999px;padding:2px 8px;font-size:12px;">${category}</span>` : ''}
               </div>
               <button id="popup-open-item" style="display:inline-flex;align-items:center;gap:6px;background:#2563eb;color:white;border:none;border-radius:8px;padding:6px 10px;cursor:pointer">Voir</button>
             </div>`;

          const popup = new mapboxgl.Popup({ offset: 12 })
            .setDOMContent(wrapper)
            .setLngLat(coords)
            .addTo(map);

          const btn = wrapper.querySelector('#popup-open-item');
          if (btn && id) {
            btn.addEventListener('click', () => {
              popup.remove();
              if (onMarkerClick) onMarkerClick(String(id));
            });
          }
        });

        // Hover tooltip (title)
        map.on('mouseenter', 'unclustered-point', (e) => {
          map.getCanvas().style.cursor = 'pointer';
          const features = map.queryRenderedFeatures(e.point, { layers: ['unclustered-point'] });
          const feature = features[0];
          if (!feature) return;
          const title = feature.properties && (feature.properties as any).title;
          const coords = (feature.geometry as any).coordinates as [number, number];
          if (!title) return;
          if (hoverPopupRef.current) {
            hoverPopupRef.current.remove();
            hoverPopupRef.current = null;
          }
          const hoverPopup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false, offset: 8 })
            .setLngLat(coords)
            .setHTML(`<div style="font-size:12px;font-weight:600;color:#111827;padding:4px 6px;background:#ffffff;border:1px solid #e5e7eb;border-radius:6px;box-shadow:0 4px 10px rgba(0,0,0,0.08);">${String(title)}</div>`)
            .addTo(map);
          hoverPopupRef.current = hoverPopup;
        });
        map.on('mouseleave', 'unclustered-point', () => {
          map.getCanvas().style.cursor = '';
          if (hoverPopupRef.current) {
            hoverPopupRef.current.remove();
            hoverPopupRef.current = null;
          }
        });

        map.on('mouseenter', 'clusters', () => (map.getCanvas().style.cursor = 'pointer'));
        map.on('mouseleave', 'clusters', () => (map.getCanvas().style.cursor = ''));
        map.on('mouseenter', 'unclustered-point', () => (map.getCanvas().style.cursor = 'pointer'));
        map.on('mouseleave', 'unclustered-point', () => (map.getCanvas().style.cursor = ''));
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [accessToken]);

  React.useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setCenter([center.lng, center.lat]);
  }, [center.lat, center.lng]);

  React.useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const source = map.getSource('items') as mapboxgl.GeoJSONSource | undefined;
    if (!source) return;

    const features = (markers || [])
      .filter((m) => typeof m.latitude === 'number' && typeof m.longitude === 'number')
      .map((m) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [m.longitude, m.latitude] },
        properties: { id: m.id, title: m.title || '', imageUrl: m.imageUrl || '', category: m.category || '' },
      }));

    const data: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: features as any,
    };

    source.setData(data as any);

    // Auto-fit to markers (and optionally user location)
    if (autoFit && features.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      for (const f of features as any[]) {
        bounds.extend(f.geometry.coordinates as [number, number]);
      }
      if (showUserLocation && userLocation) {
        bounds.extend([userLocation.lng, userLocation.lat]);
      }
      map.fitBounds(bounds, { padding: 40, maxZoom: 14, duration: 600 });
    }
  }, [markers]);

  // User location marker (pulsing)
  React.useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    if (!showUserLocation || !userLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      return;
    }
    const el = document.createElement('div');
    el.style.width = '16px';
    el.style.height = '16px';
    el.style.borderRadius = '9999px';
    el.style.background = '#2563eb';
    el.style.boxShadow = '0 0 0 0 rgba(37,99,235,0.7)';
    el.style.animation = 'pulseMapUser 2s infinite';

    // Inject keyframes once
    const styleId = 'map-user-pulse-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `@keyframes pulseMapUser { 0% { box-shadow: 0 0 0 0 rgba(37,99,235,0.7);} 70% { box-shadow: 0 0 0 16px rgba(37,99,235,0);} 100% { box-shadow: 0 0 0 0 rgba(37,99,235,0);} }`;
      document.head.appendChild(style);
    }

    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat([userLocation.lng, userLocation.lat]);
    } else {
      userMarkerRef.current = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map);
    }
  }, [showUserLocation, userLocation?.lat, userLocation?.lng]);

  if (!accessToken) {
    return (
      <div className="p-4 rounded-xl border border-yellow-300 bg-yellow-50 text-yellow-800 text-sm">
        Clé Mapbox manquante. Ajoutez VITE_MAPBOX_TOKEN dans votre fichier .env.local pour afficher la carte.
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


