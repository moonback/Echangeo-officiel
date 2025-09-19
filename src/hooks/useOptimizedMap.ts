import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { MapboxMarker } from '../components/MapboxMapOptimized';

interface UseOptimizedMapProps {
  markers: MapboxMarker[];
  center: { lat: number; lng: number };
  zoom: number;
  enableClustering?: boolean;
  clusterRadius?: number;
  maxMarkersBeforeClustering?: number;
  debounceMs?: number;
}

interface ClusterData {
  markers: MapboxMarker[];
  center: { lat: number; lng: number };
  count: number;
}

// Cache global pour les calculs de distance
const distanceCache = new Map<string, number>();
const MAX_CACHE_SIZE = 10000;

// Fonction optimisée de calcul de distance avec cache LRU
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const key = `${lat1.toFixed(6)},${lng1.toFixed(6)},${lat2.toFixed(6)},${lng2.toFixed(6)}`;
  
  if (distanceCache.has(key)) {
    // Déplacer vers la fin (LRU)
    const value = distanceCache.get(key)!;
    distanceCache.delete(key);
    distanceCache.set(key, value);
    return value;
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

  // Gérer la taille du cache (LRU)
  if (distanceCache.size >= MAX_CACHE_SIZE) {
    const firstKey = distanceCache.keys().next().value;
    distanceCache.delete(firstKey);
  }
  
  distanceCache.set(key, distance);
  return distance;
};

// Fonction de clustering optimisée avec spatial indexing
const createClusters = (
  markers: MapboxMarker[], 
  zoom: number, 
  clusterRadius: number
): MapboxMarker[] => {
  if (markers.length <= 10 || zoom > 15) {
    return markers;
  }

  // Calculer le rayon de clustering basé sur le zoom
  const radius = clusterRadius / Math.pow(2, zoom - 10);
  
  const clustered: MapboxMarker[] = [];
  const processed = new Set<string>();
  
  // Trier les marqueurs par latitude pour optimiser la recherche
  const sortedMarkers = [...markers].sort((a, b) => a.latitude - b.latitude);

  for (const marker of sortedMarkers) {
    if (processed.has(marker.id)) continue;

    const cluster: MapboxMarker[] = [marker];
    processed.add(marker.id);

    // Chercher les marqueurs proches uniquement dans une plage raisonnable
    for (const otherMarker of sortedMarkers) {
      if (processed.has(otherMarker.id)) continue;
      
      // Optimisation : arrêter si on est trop loin en latitude
      if (Math.abs(otherMarker.latitude - marker.latitude) > radius) {
        continue;
      }
      
      const distance = calculateDistance(
        marker.latitude,
        marker.longitude,
        otherMarker.latitude,
        otherMarker.longitude
      );

      if (distance <= radius) {
        cluster.push(otherMarker);
        processed.add(otherMarker.id);
      }
    }

    if (cluster.length > 1) {
      // Créer un marqueur de cluster
      const avgLat = cluster.reduce((sum, m) => sum + m.latitude, 0) / cluster.length;
      const avgLng = cluster.reduce((sum, m) => sum + m.longitude, 0) / cluster.length;
      
      clustered.push({
        id: `cluster-${marker.id}-${cluster.length}`,
        latitude: avgLat,
        longitude: avgLng,
        title: `${cluster.length} objets`,
        type: 'cluster',
        category: 'cluster',
        data: { 
          items: cluster,
          count: cluster.length,
          center: { lat: avgLat, lng: avgLng }
        }
      } as MapboxMarker);
    } else {
      clustered.push(marker);
    }
  }

  return clustered;
};

// Fonction de debouncing optimisée
const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook principal optimisé
export const useOptimizedMap = ({
  markers,
  center,
  zoom,
  enableClustering = true,
  clusterRadius = 0.05,
  maxMarkersBeforeClustering = 50,
  debounceMs = 100
}: UseOptimizedMapProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const processingRef = useRef(false);

  // Debouncer les changements de marqueurs et de zoom
  const debouncedMarkers = useDebounce(markers, debounceMs);
  const debouncedZoom = useDebounce(zoom, debounceMs);

  // Mémoriser le hash des marqueurs pour éviter les recalculs inutiles
  const markersHash = useMemo(() => {
    return JSON.stringify(
      debouncedMarkers
        .map(m => ({ id: m.id, lat: m.latitude, lng: m.longitude, type: m.type }))
        .sort((a, b) => a.id.localeCompare(b.id))
    );
  }, [debouncedMarkers]);

  // Traitement optimisé des marqueurs
  const processedMarkers = useMemo(() => {
    if (processingRef.current) return debouncedMarkers;
    
    processingRef.current = true;
    setIsLoading(true);

    let result = debouncedMarkers;

    if (enableClustering && debouncedMarkers.length > maxMarkersBeforeClustering) {
      result = createClusters(debouncedMarkers, debouncedZoom, clusterRadius);
    }

    // Simulation d'un traitement asynchrone pour éviter de bloquer l'UI
    setTimeout(() => {
      setIsLoading(false);
      processingRef.current = false;
    }, 0);

    return result;
  }, [markersHash, debouncedZoom, enableClustering, clusterRadius, maxMarkersBeforeClustering]);

  // Statistiques de performance
  const stats = useMemo(() => {
    const clusterCount = processedMarkers.filter(m => m.type === 'cluster').length;
    const itemCount = processedMarkers.filter(m => m.type !== 'cluster').length;
    const totalOriginal = debouncedMarkers.length;
    const totalProcessed = processedMarkers.length;
    const reductionPercentage = totalOriginal > 0 
      ? Math.round(((totalOriginal - totalProcessed) / totalOriginal) * 100)
      : 0;

    return {
      originalCount: totalOriginal,
      processedCount: totalProcessed,
      clusterCount,
      itemCount,
      reductionPercentage,
      cacheSize: distanceCache.size
    };
  }, [debouncedMarkers.length, processedMarkers.length]);

  // Fonction pour obtenir les détails d'un cluster
  const getClusterDetails = useCallback((clusterId: string): ClusterData | null => {
    const cluster = processedMarkers.find(m => m.id === clusterId && m.type === 'cluster');
    if (!cluster || !cluster.data) return null;

    return {
      markers: cluster.data.items as MapboxMarker[],
      center: cluster.data.center as { lat: number; lng: number },
      count: cluster.data.count as number
    };
  }, [processedMarkers]);

  // Fonction pour nettoyer le cache
  const clearCache = useCallback(() => {
    distanceCache.clear();
  }, []);

  // Fonction pour forcer le recalcul
  const forceRecalculation = useCallback(() => {
    processingRef.current = false;
    clearCache();
  }, [clearCache]);

  // Nettoyage automatique du cache toutes les 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (distanceCache.size > MAX_CACHE_SIZE * 0.8) {
        // Supprimer les entrées les plus anciennes (25% du cache)
        const keysToDelete = Array.from(distanceCache.keys()).slice(0, Math.floor(MAX_CACHE_SIZE * 0.25));
        keysToDelete.forEach(key => distanceCache.delete(key));
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  return {
    processedMarkers,
    isLoading,
    stats,
    getClusterDetails,
    clearCache,
    forceRecalculation,
    // Fonctions utilitaires
    calculateDistance: useCallback(calculateDistance, [])
  };
};

// Hook pour la gestion des popups optimisée
export const useOptimizedPopups = () => {
  const popupCache = useRef(new Map<string, string>());
  const [activePopupId, setActivePopupId] = useState<string | null>(null);

  const createCachedPopup = useCallback((marker: MapboxMarker): string => {
    const cacheKey = `${marker.id}-${marker.title}-${marker.category}-${marker.distance?.toFixed(1)}`;
    
    if (popupCache.current.has(cacheKey)) {
      return popupCache.current.get(cacheKey)!;
    }

    // Générer le HTML du popup (fonction simplifiée)
    const popupHTML = `
      <div class="optimized-popup-content" data-marker-id="${marker.id}">
        <h3>${marker.title || 'Objet'}</h3>
        <p>Catégorie: ${marker.category || 'Non spécifiée'}</p>
        ${marker.distance ? `<p>Distance: ${marker.distance.toFixed(1)} km</p>` : ''}
        <button onclick="window.location.href='/items/${marker.id}'">
          Voir les détails
        </button>
      </div>
    `;

    // Limiter la taille du cache
    if (popupCache.current.size > 100) {
      const firstKey = popupCache.current.keys().next().value;
      popupCache.current.delete(firstKey);
    }
    
    popupCache.current.set(cacheKey, popupHTML);
    return popupHTML;
  }, []);

  const clearPopupCache = useCallback(() => {
    popupCache.current.clear();
  }, []);

  const setActivePopup = useCallback((markerId: string | null) => {
    setActivePopupId(markerId);
  }, []);

  return {
    createCachedPopup,
    clearPopupCache,
    activePopupId,
    setActivePopup,
    cacheSize: popupCache.current.size
  };
};

export default useOptimizedMap;
