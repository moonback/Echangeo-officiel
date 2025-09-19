import { useState, useEffect, useCallback, useRef } from 'react';

// Configuration de performance pour la géolocalisation
const GEOLOCATION_CONFIG = {
  cacheTime: 5 * 60 * 1000, // 5 minutes
  timeout: 10000, // 10 secondes
  enableHighAccuracy: true,
  maximumAge: 300000, // 5 minutes
};

interface GeolocationState {
  position: { lat: number; lng: number } | null;
  error: GeolocationPositionError | null;
  isLoading: boolean;
  accuracy: number | null;
  timestamp: number | null;
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  cacheTime?: number;
}

/**
 * Hook optimisé pour la géolocalisation avec cache et gestion d'erreurs
 */
export function useGeolocation(options: GeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    isLoading: false,
    accuracy: null,
    timestamp: null,
  });

  const cacheRef = useRef<{
    position: { lat: number; lng: number };
    timestamp: number;
  } | null>(null);

  const watchIdRef = useRef<number | null>(null);

  const config = {
    ...GEOLOCATION_CONFIG,
    ...options,
  };

  // Fonction pour obtenir la position avec cache
  const getCurrentPosition = useCallback(async (): Promise<{ lat: number; lng: number } | null> => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: new GeolocationPositionError('Geolocation not supported', 0, 'Geolocation not supported'),
        isLoading: false,
      }));
      return null;
    }

    // Vérifier le cache
    const now = Date.now();
    if (cacheRef.current && (now - cacheRef.current.timestamp) < config.cacheTime!) {
      setState(prev => ({
        ...prev,
        position: cacheRef.current!.position,
        isLoading: false,
        timestamp: cacheRef.current!.timestamp,
      }));
      return cacheRef.current.position;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          // Mettre à jour le cache
          cacheRef.current = {
            position: newPosition,
            timestamp: now,
          };

          setState({
            position: newPosition,
            error: null,
            isLoading: false,
            accuracy: position.coords.accuracy,
            timestamp: now,
          });

          resolve(newPosition);
        },
        (error) => {
          setState({
            position: null,
            error,
            isLoading: false,
            accuracy: null,
            timestamp: null,
          });
          resolve(null);
        },
        {
          enableHighAccuracy: config.enableHighAccuracy,
          timeout: config.timeout,
          maximumAge: config.maximumAge,
        }
      );
    });
  }, [config]);

  // Fonction pour démarrer la surveillance de la position
  const startWatching = useCallback(() => {
    if (!navigator.geolocation || watchIdRef.current) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        const now = Date.now();
        cacheRef.current = {
          position: newPosition,
          timestamp: now,
        };

        setState(prev => ({
          ...prev,
          position: newPosition,
          error: null,
          accuracy: position.coords.accuracy,
          timestamp: now,
        }));
      },
      (error) => {
        setState(prev => ({
          ...prev,
          error,
        }));
      },
      {
        enableHighAccuracy: config.enableHighAccuracy,
        timeout: config.timeout,
        maximumAge: config.maximumAge,
      }
    );
  }, [config]);

  // Fonction pour arrêter la surveillance
  const stopWatching = useCallback(() => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Fonction pour vider le cache
  const clearCache = useCallback(() => {
    cacheRef.current = null;
  }, []);

  // Fonction pour obtenir les informations de localisation
  const getLocationInfo = useCallback(async (lat: number, lng: number) => {
    try {
      // Essayer d'abord avec Nominatim (OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=fr&zoom=18`
      );
      const data = await response.json();
      
      if (data.address) {
        const neighborhood = 
          data.address.suburb || 
          data.address.neighbourhood || 
          data.address.quarter || 
          data.address.district ||
          data.address.ward ||
          data.address.hamlet ||
          data.address.road ||
          data.address.pedestrian ||
          data.address.postcode;
        
        const city = 
          data.address.city || 
          data.address.town || 
          data.address.village || 
          data.address.municipality ||
          data.address.county ||
          data.address.state ||
          data.address.region;
        
        return { neighborhood, city };
      }
    } catch (error) {
      console.warn('Erreur lors de la récupération des informations de localisation:', error);
    }
    
    return null;
  }, []);

  // Initialisation automatique
  useEffect(() => {
    getCurrentPosition();
    
    return () => {
      stopWatching();
    };
  }, [getCurrentPosition, stopWatching]);

  return {
    ...state,
    getCurrentPosition,
    startWatching,
    stopWatching,
    clearCache,
    getLocationInfo,
  };
}

export default useGeolocation;
