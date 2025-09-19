import { useState, useCallback } from 'react';

interface Location {
  lat: number;
  lng: number;
}

interface UseGeolocationReturn {
  userLocation: Location | null;
  isLocating: boolean;
  detectedAddress: string;
  getCurrentLocation: () => Promise<void>;
  getAddressFromCoordinates: (lat: number, lng: number) => Promise<string | null>;
}

export const useGeolocation = (): UseGeolocationReturn => {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [detectedAddress, setDetectedAddress] = useState('');

  const getAddressFromCoordinates = useCallback(async (lat: number, lng: number): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'fr',
            'User-Agent': 'Échangeo App (contact@example.com)'
          }
        }
      );
      
      const data = await response.json();
      
      if (data && data.address) {
        // Construire l'adresse à partir des composants disponibles
        const address = data.address;
        const parts = [];
        
        if (address.postcode) parts.push(address.postcode);
        if (address.city || address.town || address.village) {
          parts.push(address.city || address.town || address.village);
        }
        
        return parts.length > 0 ? parts.join(', ') : null;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'adresse:', error);
      return null;
    }
  }, []);

  const getCurrentLocation = useCallback(async (): Promise<void> => {
    if (!navigator.geolocation) {
      throw new Error('La géolocalisation n\'est pas supportée par votre navigateur');
    }

    setIsLocating(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      setUserLocation(location);
      
      // Obtenir l'adresse à partir des coordonnées
      const address = await getAddressFromCoordinates(location.lat, location.lng);
      if (address) {
        setDetectedAddress(address);
      }
      
    } catch (error) {
      console.error('Erreur de géolocalisation:', error);
      throw error;
    } finally {
      setIsLocating(false);
    }
  }, [getAddressFromCoordinates]);

  return {
    userLocation,
    isLocating,
    detectedAddress,
    getCurrentLocation,
    getAddressFromCoordinates,
  };
};
