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
  neighborhood?: string; // Ajout pour le clustering par quartier
}

export interface Cluster {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  markers: MapboxMarker[];
  neighborhood?: string;
}

interface MapboxMapProps {
  accessToken?: string;
  center: { lat: number; lng: number };
  zoom?: number;
  height?: number | string;
  markers?: MapboxMarker[];
  onMarkerClick?: (id: string) => void;
  onMarkerHover?: (id: string, position: { x: number; y: number }) => void;
  onMarkerLeave?: () => void;
  onClusterClick?: (cluster: Cluster) => void;
  autoFit?: boolean;
  userLocation?: { lat: number; lng: number };
  showUserLocation?: boolean;
  enableClustering?: boolean;
  clusterRadius?: number;
  clusterMaxZoom?: number;
}

// Fonctions de popup supprimées pour simplifier

// Fonction améliorée pour créer le contenu HTML des marqueurs
function createMarkerContent(marker: MapboxMarker): string {
  const size = '80px';

  // Gérer différents types de marqueurs
  let iconContent = '';
  
  if (marker.type === 'item' && marker.imageUrl) {
    // Utiliser l'image du produit avec popup au survol
    iconContent = `
      <div style="position: relative;">
        <img 
          src="${marker.imageUrl}" 
          alt="${marker.title || 'Produit'}"
          style="
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 50%;
            border: 3px solid #ffffff;
            box-shadow: 
              0 4px 8px rgba(0, 0, 0, 0.15),
              0 2px 4px rgba(0, 0, 0, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.8),
              inset 0 -1px 0 rgba(0, 0, 0, 0.1);
            cursor: pointer;
          "
        />
      </div>
    `;
  } else if (marker.type === 'community') {
    // Marqueur de quartier/communauté
    iconContent = `
      <div style="position: relative;">
        <!-- Marqueur principal de communauté -->
        <div style="
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #8B5CF6, #7C3AED);
          border-radius: 50%;
          border: 3px solid #ffffff;
          box-shadow: 
            0 4px 12px rgba(139, 92, 246, 0.3),
            0 2px 6px rgba(0, 0, 0, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.8),
            inset 0 -1px 0 rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
          cursor: pointer;
          animation: communityPulse 2s ease-in-out infinite;
        ">
          🏘️
        </div>
        
        <!-- Étiquette du quartier -->
        <div style="
          position: absolute;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          z-index: 5;
        ">
          ${marker.title || marker.neighborhood || 'Quartier'}
        </div>
      </div>
    `;
  } else {
    // Ne pas afficher de marqueur si pas d'image et pas de quartier
    iconContent = '';
  }

  // Ne pas afficher de marqueur si pas d'image
  if (!iconContent) {
    return '';
  }

  // Marqueur simplifié
  return `
    <div class="enhanced-marker" style="
      width: ${size};
      height: ${size};
      position: relative;
      cursor: pointer;
      z-index: 2;
      pointer-events: auto;
      display: inline-block;
    ">
      ${iconContent}


      <!-- Indicateur de distance (si proche) -->
      ${marker.distance !== undefined && marker.distance < 0.5 ? `
        <div style="
          position: absolute;
          bottom: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #10B981 60%, #059669 100%);
          color: white;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 10px;
          border: 1.5px solid #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.18);
          animation: bounce 1.8s cubic-bezier(.4,0,.2,1) infinite;
          z-index: 5;
          letter-spacing: 0.5px;
        ">
          ${Math.round(marker.distance * 1000)}m
        </div>
      ` : ''}
    </div>
  `;
}

// Fonction de clustering par quartier (pour les objets seulement)
function createClusters(markers: MapboxMarker[], radius: number = 0.001): Cluster[] {
  const clusters: Cluster[] = [];
  const processed = new Set<string>();

  // Filtrer seulement les marqueurs d'objets
  const itemMarkers = markers.filter(marker => marker.type === 'item');

  itemMarkers.forEach(marker => {
    if (processed.has(marker.id)) return;

    const cluster: Cluster = {
      id: `cluster-${marker.id}`,
      latitude: marker.latitude,
      longitude: marker.longitude,
      count: 1,
      markers: [marker],
      neighborhood: marker.neighborhood
    };

    // Trouver les marqueurs proches dans le même quartier
    itemMarkers.forEach(otherMarker => {
      if (processed.has(otherMarker.id) || marker.id === otherMarker.id) return;
      
      const distance = Math.sqrt(
        Math.pow(marker.latitude - otherMarker.latitude, 2) + 
        Math.pow(marker.longitude - otherMarker.longitude, 2)
      );

      // Regrouper si dans le même quartier et proche
      if (distance <= radius && marker.neighborhood === otherMarker.neighborhood) {
        cluster.markers.push(otherMarker);
        cluster.count++;
        processed.add(otherMarker.id);
      }
    });

    // Calculer le centre du cluster
    if (cluster.count > 1) {
      cluster.latitude = cluster.markers.reduce((sum, m) => sum + m.latitude, 0) / cluster.count;
      cluster.longitude = cluster.markers.reduce((sum, m) => sum + m.longitude, 0) / cluster.count;
    }

    clusters.push(cluster);
    processed.add(marker.id);
  });

  return clusters;
}

// Fonction pour créer le contenu HTML d'un cluster
function createClusterContent(cluster: Cluster): string {
  const size = Math.min(60 + cluster.count * 5, 120); // Taille basée sur le nombre d'éléments
  
  return `
    <div class="cluster-marker" style="
      width: ${size}px;
      height: ${size}px;
      position: relative;
      cursor: pointer;
      z-index: 2;
      pointer-events: auto;
      display: inline-block;
    ">
      <!-- Cercle du cluster -->
      <div style="
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #3B82F6, #1E40AF);
        border-radius: 50%;
        border: 3px solid #ffffff;
        box-shadow: 
          0 4px 12px rgba(59, 130, 246, 0.3),
          0 2px 6px rgba(0, 0, 0, 0.15),
          inset 0 1px 0 rgba(255, 255, 255, 0.8),
          inset 0 -1px 0 rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${Math.min(14 + cluster.count, 20)}px;
      ">
        ${cluster.count}
      </div>
      
      <!-- Étiquette du quartier -->
      ${cluster.neighborhood ? `
        <div style="
          position: absolute;
          bottom: -20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 600;
          white-space: nowrap;
          z-index: 5;
        ">
          ${cluster.neighborhood}
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
  onMarkerHover,
  onMarkerLeave,
  onClusterClick,
  autoFit = false,
  userLocation,
  showUserLocation = false,
  enableClustering = false,
  clusterRadius = 0.001,
  clusterMaxZoom = 14
}, ref) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const [isMapLoaded, setIsMapLoaded] = React.useState(false);

  // Références stables pour les callbacks
  const onMarkerClickRef = useRef(onMarkerClick);
  const onMarkerHoverRef = useRef(onMarkerHover);
  const onMarkerLeaveRef = useRef(onMarkerLeave);
  const onClusterClickRef = useRef(onClusterClick);

  // Mettre à jour les références quand les props changent
  React.useEffect(() => {
    onMarkerClickRef.current = onMarkerClick;
  }, [onMarkerClick]);

  React.useEffect(() => {
    onMarkerHoverRef.current = onMarkerHover;
  }, [onMarkerHover]);

  React.useEffect(() => {
    onMarkerLeaveRef.current = onMarkerLeave;
  }, [onMarkerLeave]);

  React.useEffect(() => {
    onClusterClickRef.current = onClusterClick;
  }, [onClusterClick]);

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

    // Supprimer tous les marqueurs existants (sauf user-location)
    markersRef.current.forEach((marker, id) => {
      if (id !== 'user-location') {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Séparer les marqueurs de quartiers des marqueurs d'objets
    const communityMarkers = markers.filter(marker => marker.type === 'community');
    const itemMarkers = markers.filter(marker => marker.type === 'item');

    // Appliquer le clustering si activé et zoom suffisant
    const currentZoom = mapRef.current.getZoom();
    const shouldCluster = enableClustering && currentZoom < clusterMaxZoom;

    if (shouldCluster) {
      // Créer des clusters pour les objets seulement
      const clusters = createClusters(itemMarkers, clusterRadius);
      
      clusters.forEach(cluster => {
        const el = document.createElement('div');
        el.className = 'cluster-marker';
        el.innerHTML = createClusterContent(cluster);

        // Ajouter un décalage basé sur l'ID pour éviter la superposition
        const hash = cluster.id.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);
        const offsetLng = (hash % 100 - 50) * 0.00001;
        const offsetLat = ((hash >> 8) % 100 - 50) * 0.00001;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onClusterClickRef.current?.(cluster);
        });

        const mapboxMarker = new mapboxgl.Marker(el)
          .setLngLat([cluster.longitude + offsetLng, cluster.latitude + offsetLat])
          .addTo(mapRef.current!);
          
        markersRef.current.set(cluster.id, mapboxMarker);
      });
    }

    // Toujours afficher les marqueurs de quartiers (communautés)
    communityMarkers.forEach(marker => {
      if (typeof marker.latitude !== 'number' || typeof marker.longitude !== 'number' ||
          isNaN(marker.latitude) || isNaN(marker.longitude) ||
          marker.latitude < -90 || marker.latitude > 90 ||
          marker.longitude < -180 || marker.longitude > 180) {
        return;
      }

      let mapboxMarker = markersRef.current.get(marker.id);
      
      if (!mapboxMarker) {
        // Créer un nouveau marqueur de quartier
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

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onMarkerClickRef.current?.(marker.id);
        });

        // Ajouter les événements de survol
        el.addEventListener('mouseenter', (e) => {
          e.stopPropagation();
          const rect = el.getBoundingClientRect();
          const containerRect = mapContainerRef.current?.getBoundingClientRect();
          if (containerRect) {
            const position = {
              x: rect.left + rect.width / 2,
              y: rect.top
            };
            onMarkerHoverRef.current?.(marker.id, position);
          }
        });

        el.addEventListener('mouseleave', (e) => {
          e.stopPropagation();
          onMarkerLeaveRef.current?.();
        });

        // Ajouter un décalage basé sur l'ID pour éviter la superposition
        const hash = marker.id.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);
        const offsetLng = (hash % 100 - 50) * 0.00001;
        const offsetLat = ((hash >> 8) % 100 - 50) * 0.00001;

        mapboxMarker = new mapboxgl.Marker(el)
          .setLngLat([marker.longitude + offsetLng, marker.latitude + offsetLat])
          .addTo(mapRef.current!);
          
        markersRef.current.set(marker.id, mapboxMarker);
      } else {
        // Mettre à jour la position si nécessaire
        const currentLngLat = mapboxMarker.getLngLat();
        const hash = marker.id.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);
        const offsetLng = (hash % 100 - 50) * 0.00001;
        const offsetLat = ((hash >> 8) % 100 - 50) * 0.00001;
        
        if (currentLngLat.lng !== marker.longitude + offsetLng || currentLngLat.lat !== marker.latitude + offsetLat) {
          mapboxMarker.setLngLat([marker.longitude + offsetLng, marker.latitude + offsetLat]);
        }
      }
    });

    // Afficher les marqueurs d'objets individuels si pas de clustering
    if (!shouldCluster) {
      itemMarkers.forEach(marker => {
      if (typeof marker.latitude !== 'number' || typeof marker.longitude !== 'number' ||
          isNaN(marker.latitude) || isNaN(marker.longitude) ||
          marker.latitude < -90 || marker.latitude > 90 ||
          marker.longitude < -180 || marker.longitude > 180) {
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

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          
          // Animation de clic simple
          el.style.transform = 'scale(0.95) translateZ(0)';
          setTimeout(() => {
            el.style.transform = 'scale(1) translateZ(0)';
          }, 150);

          // Appeler seulement la fonction de callback
          onMarkerClickRef.current?.(marker.id);
        });

        // Ajouter les événements de survol
        el.addEventListener('mouseenter', (e) => {
          e.stopPropagation();
          const rect = el.getBoundingClientRect();
          const containerRect = mapContainerRef.current?.getBoundingClientRect();
          if (containerRect) {
            const position = {
              x: rect.left + rect.width, // Position à droite du marqueur
              y: rect.top + rect.height / 2 // Centré verticalement
            };
            onMarkerHoverRef.current?.(marker.id, position);
          }
        });

        el.addEventListener('mouseleave', (e) => {
          e.stopPropagation();
          onMarkerLeaveRef.current?.();
        });

        // Ajouter un décalage basé sur l'ID pour éviter la superposition
        const hash = marker.id.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);
        const offsetLng = (hash % 100 - 50) * 0.00001; // ~5m de décalage
        const offsetLat = ((hash >> 8) % 100 - 50) * 0.00001;
        
        mapboxMarker = new mapboxgl.Marker(el)
          .setLngLat([marker.longitude + offsetLng, marker.latitude + offsetLat])
          .addTo(mapRef.current!);
          
        markersRef.current.set(marker.id, mapboxMarker);
      } else {
        // Mettre à jour la position si nécessaire (avec le même décalage)
        const currentLngLat = mapboxMarker.getLngLat();
        const hash = marker.id.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);
        const offsetLng = (hash % 100 - 50) * 0.00001;
        const offsetLat = ((hash >> 8) % 100 - 50) * 0.00001;
        
        if (currentLngLat.lng !== marker.longitude + offsetLng || currentLngLat.lat !== marker.latitude + offsetLat) {
          mapboxMarker.setLngLat([marker.longitude + offsetLng, marker.latitude + offsetLat]);
        }
      }
    });

        // Auto-fit si demandé
        if (autoFit && markers.length > 0) {
          const bounds = new mapboxgl.LngLatBounds();
          let validMarkersCount = 0;
          
          markers.forEach((marker) => {
            if (typeof marker.latitude === 'number' && typeof marker.longitude === 'number' && 
                !isNaN(marker.latitude) && !isNaN(marker.longitude) &&
                marker.latitude >= -90 && marker.latitude <= 90 &&
                marker.longitude >= -180 && marker.longitude <= 180) {
              bounds.extend([marker.longitude, marker.latitude]);
              validMarkersCount++;
            }
          });
          
          if (showUserLocation && userLocation && 
              !isNaN(userLocation.lat) && !isNaN(userLocation.lng) &&
              userLocation.lat >= -90 && userLocation.lat <= 90 &&
              userLocation.lng >= -180 && userLocation.lng <= 180) {
            bounds.extend([userLocation.lng, userLocation.lat]);
            validMarkersCount++;
          }
          
          // Ne faire le fitBounds que s'il y a au moins un marqueur valide
          if (validMarkersCount > 0) {
            try {
              // Vérifier que bounds est valide avant d'appeler fitBounds
              const boundsArray = bounds.toArray();
              if (boundsArray && boundsArray.length === 2 && 
                  boundsArray[0] && boundsArray[1] &&
                  !isNaN(boundsArray[0][0]) && !isNaN(boundsArray[0][1]) &&
                  !isNaN(boundsArray[1][0]) && !isNaN(boundsArray[1][1])) {
                mapRef.current!.fitBounds(bounds, { padding: 40, maxZoom: 14, duration: 600 });
              }
            } catch (error) {
              console.warn('Erreur lors du fitBounds:', error);
            }
          }
        }
    }
  }, [markers, isMapLoaded, autoFit, showUserLocation, userLocation, enableClustering, clusterRadius, clusterMaxZoom]);

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
      
      // Valider le centre de la carte
      const validCenter = {
        lat: isNaN(center.lat) || center.lat < -90 || center.lat > 90 ? 48.8566 : center.lat,
        lng: isNaN(center.lng) || center.lng < -180 || center.lng > 180 ? 2.3522 : center.lng
      };
      
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [validCenter.lng, validCenter.lat],
        zoom,
        attributionControl: false,
      });
      mapRef.current = map;

      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }));

      map.on('load', () => {
        setIsMapLoaded(true);
      });

      // Listener pour recalculer les clusters lors du changement de zoom
      if (enableClustering) {
        map.on('zoomend', () => {
          // Utiliser un timeout pour éviter les appels trop fréquents
          setTimeout(() => {
            if (mapRef.current && isMapLoaded) {
              updateMarkers();
            }
          }, 100);
        });
      }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, center.lat, center.lng, zoom, enableClustering]);

  // Mise à jour optimisée des marqueurs basée sur le hash (optimisation majeure)
  useEffect(() => {
    if (isMapLoaded) {
      updateMarkers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markersHash, isMapLoaded]);

  // Recalculer les clusters lors du changement de zoom
  useEffect(() => {
    if (enableClustering && mapRef.current && isMapLoaded) {
      updateMarkers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableClustering, isMapLoaded]);

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
            cursor: pointer !important;
          }
          
          /* S'assurer que les marqueurs n'interfèrent pas avec les interactions de la carte */
          .marker img {
            pointer-events: auto !important;
            cursor: pointer !important;
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
