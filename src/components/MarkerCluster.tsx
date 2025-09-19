import React, { useMemo } from 'react';
import type { MapboxMarker } from './MapboxMap';

interface ClusterPoint {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  markers: MapboxMarker[];
}

interface MarkerClusterProps {
  markers: MapboxMarker[];
  radius: number; // Rayon de clustering en pixels
  minZoom: number; // Zoom minimum pour le clustering
  maxZoom: number; // Zoom maximum pour le clustering
  currentZoom: number;
}

/**
 * Fonction pour calculer la distance entre deux points en pixels
 */
function getPixelDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number, 
  zoom: number
): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distanceKm = R * c;
  
  // Convertir en pixels (approximation)
  const pixelsPerKm = Math.pow(2, zoom) * 256 / 40075; // 40075 km = circonférence de la Terre
  return distanceKm * pixelsPerKm;
}

/**
 * Algorithme de clustering simple et efficace
 */
function clusterMarkers(
  markers: MapboxMarker[], 
  radius: number, 
  zoom: number
): ClusterPoint[] {
  if (markers.length === 0) return [];
  
  const clusters: ClusterPoint[] = [];
  const processed = new Set<string>();
  
  for (const marker of markers) {
    if (processed.has(marker.id)) continue;
    
    const cluster: ClusterPoint = {
      id: `cluster-${marker.id}`,
      latitude: marker.latitude,
      longitude: marker.longitude,
      count: 1,
      markers: [marker]
    };
    
    // Trouver les marqueurs proches
    for (const otherMarker of markers) {
      if (otherMarker.id === marker.id || processed.has(otherMarker.id)) continue;
      
      const distance = getPixelDistance(
        marker.latitude,
        marker.longitude,
        otherMarker.latitude,
        otherMarker.longitude,
        zoom
      );
      
      if (distance <= radius) {
        cluster.markers.push(otherMarker);
        cluster.count++;
        processed.add(otherMarker.id);
      }
    }
    
    // Calculer le centre du cluster
    if (cluster.count > 1) {
      const avgLat = cluster.markers.reduce((sum, m) => sum + m.latitude, 0) / cluster.count;
      const avgLng = cluster.markers.reduce((sum, m) => sum + m.longitude, 0) / cluster.count;
      cluster.latitude = avgLat;
      cluster.longitude = avgLng;
    }
    
    clusters.push(cluster);
    processed.add(marker.id);
  }
  
  return clusters;
}

/**
 * Hook pour le clustering des marqueurs
 */
export function useMarkerClustering(
  markers: MapboxMarker[],
  radius: number = 50,
  minZoom: number = 8,
  maxZoom: number = 16,
  currentZoom: number = 12
) {
  const clusteredMarkers = useMemo(() => {
    // Ne pas clusteriser si le zoom est trop élevé ou trop bas
    if (currentZoom < minZoom || currentZoom > maxZoom) {
      return markers.map(marker => ({
        id: marker.id,
        latitude: marker.latitude,
        longitude: marker.longitude,
        count: 1,
        markers: [marker]
      }));
    }
    
    return clusterMarkers(markers, radius, currentZoom);
  }, [markers, radius, minZoom, maxZoom, currentZoom]);
  
  return clusteredMarkers;
}

/**
 * Composant pour afficher un cluster de marqueurs
 */
export const ClusterMarker: React.FC<{
  cluster: ClusterPoint;
  onClick?: (cluster: ClusterPoint) => void;
}> = ({ cluster, onClick }) => {
  const size = Math.min(60, Math.max(30, 20 + cluster.count * 2));
  const fontSize = Math.min(16, Math.max(12, 10 + cluster.count));
  
  return (
    <div
      className="cluster-marker"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: '#3B82F6',
        border: '3px solid white',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        fontSize: `${fontSize}px`,
        fontWeight: 'bold',
        color: 'white',
        position: 'relative',
      }}
      onClick={() => onClick?.(cluster)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.zIndex = '1000';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.zIndex = '1';
      }}
    >
      {cluster.count}
      
      {/* Effet de brillance */}
      <div
        style={{
          position: 'absolute',
          top: '2px',
          left: '2px',
          right: '2px',
          height: '50%',
          background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.3), transparent)',
          borderRadius: '50% 50% 0 0',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default useMarkerClustering;
