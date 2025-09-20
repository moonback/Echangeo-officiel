// Utilitaire de géocodage pour convertir les adresses en coordonnées GPS
// Utilise l'API Nominatim d'OpenStreetMap (gratuite)

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  address: string;
  confidence: number;
}

export interface GeocodingError {
  error: string;
  message: string;
}

/**
 * Convertit une adresse en coordonnées GPS
 * @param address - L'adresse à géocoder
 * @returns Promise avec les coordonnées ou une erreur
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult | GeocodingError> {
  if (!address || address.trim().length === 0) {
    return {
      error: 'INVALID_ADDRESS',
      message: 'L\'adresse ne peut pas être vide'
    };
  }

  try {
    // Encoder l'adresse pour l'URL
    const encodedAddress = encodeURIComponent(address.trim());
    
    // Appel à l'API Nominatim d'OpenStreetMap
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1&countrycodes=fr`,
      {
        headers: {
          'User-Agent': 'TrocAll-App/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return {
        error: 'NO_RESULTS',
        message: 'Aucun résultat trouvé pour cette adresse'
      };
    }

    const result = data[0];
    
    // Vérifier la qualité des résultats
    const importance = parseFloat(result.importance) || 0;
    const confidence = Math.min(importance * 10, 100); // Convertir importance en pourcentage

    if (confidence < 15) {
      return {
        error: 'LOW_CONFIDENCE',
        message: 'Confiance faible dans la localisation'
      };
    }

    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      address: result.display_name,
      confidence: Math.round(confidence)
    };

  } catch (error) {
    console.error('Erreur de géocodage:', error);
    return {
      error: 'GEOCODING_FAILED',
      message: 'Erreur lors du géocodage de l\'adresse'
    };
  }
}

/**
 * Géocode une adresse avec retry et fallback
 * @param address - L'adresse à géocoder
 * @param maxRetries - Nombre maximum de tentatives (défaut: 3)
 * @returns Promise avec les coordonnées ou null
 */
export async function geocodeWithRetry(
  address: string, 
  maxRetries: number = 3
): Promise<GeocodingResult | null> {
  const strategies = [
    address, // Adresse complète
    cleanAddress(address), // Adresse nettoyée
    address.split(',').slice(0, 3).join(','), // Adresse simplifiée (3 premiers éléments)
    address.split(',')[0] + ', Aubergenville, France', // Juste la rue + ville
    'Aubergenville, France' // Fallback sur la ville
  ];

  for (const strategy of strategies) {
    console.log(`🔄 Stratégie de géocodage:`, strategy);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Tentative ${attempt}/${maxRetries} pour:`, strategy);
        
        const result = await geocodeAddress(strategy);
        
        if ('error' in result) {
          console.warn(`Erreur de géocodage (tentative ${attempt}):`, result.message);
          
          if (attempt === maxRetries) {
            continue; // Essayer la stratégie suivante
          }
          
          // Attendre avant de réessayer
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }
        
        console.log(`✅ Géocodage réussi:`, {
          strategy,
          address: result.address,
          coordinates: [result.longitude, result.latitude],
          confidence: result.confidence
        });
        
        return result;
        
      } catch (error) {
        console.error(`Erreur lors de la tentative ${attempt}:`, error);
        
        if (attempt === maxRetries) {
          continue; // Essayer la stratégie suivante
        }
        
        // Attendre avant de réessayer
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  
  // Fallback final : coordonnées par défaut pour Aubergenville
  if (address.toLowerCase().includes('aubergenville')) {
    console.log('📍 Utilisation des coordonnées par défaut pour Aubergenville');
    return {
      latitude: 48.9564,
      longitude: 1.8553,
      address: 'Aubergenville, Yvelines, France',
      confidence: 100
    };
  }
  
  console.warn('⚠️ Toutes les stratégies de géocodage ont échoué');
  return null;
}

/**
 * Nettoie et normalise une adresse avant géocodage
 * @param address - L'adresse brute
 * @returns Adresse nettoyée
 */
export function cleanAddress(address: string): string {
  if (!address) return '';
  
  return address
    .trim()
    // Corriger les fautes communes
    .replace(/rue des source/gi, 'rue des sources')
    .replace(/rue de la source/gi, 'rue de la source')
    .replace(/avenue de la division leclerc/gi, 'avenue de la Division Leclerc')
    // Supprimer les codes postaux en début/fin
    .replace(/^\d{5}\s*,?\s*/, '')
    .replace(/,\s*\d{5}\s*$/, '')
    // Normaliser les espaces
    .replace(/\s+/g, ' ')
    // Simplifier l'adresse pour le géocodage
    .replace(/,\s*France métropolitaine,?\s*/g, ', ')
    .replace(/,\s*Île-de-France,?\s*/g, ', ')
    .replace(/,\s*Yvelines,?\s*/g, ', ')
    // Ajouter "France" si pas présent
    .replace(/^(?!.*France).*$/, (match) => `${match}, France`);
}
