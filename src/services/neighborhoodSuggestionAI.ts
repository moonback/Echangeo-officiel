import type { Community, NearbyCommunity } from '../types';

export interface NeighborhoodSuggestion {
  name: string;
  description: string;
  postalCode?: string;
  city: string;
  department: string;
  region: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  confidence: number;
  alternatives?: NeighborhoodSuggestion[];
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Suggère des quartiers basés sur un code postal ou une ville en utilisant l'API Gemini
 */
export const suggestNeighborhoods = async (
  input: string,
  existingCommunities: Community[] = []
): Promise<NeighborhoodSuggestion[]> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Clé API Gemini manquante. Ajoutez VITE_GEMINI_API_KEY dans votre fichier .env.local');
  }

  try {
    const prompt = `Vous êtes un expert en géographie française et en quartiers urbains. 
    
Basé sur l'entrée "${input}" (qui peut être un code postal ou une ville), suggérez 3-5 quartiers ou zones spécifiques de cette localité qui seraient pertinents pour une application d'économie collaborative locale.

CONTEXTE :
- Il s'agit d'une application de troc et d'échange d'objets entre voisins
- Les utilisateurs veulent rejoindre des quartiers spécifiques pour faciliter les échanges
- Les quartiers doivent être des zones géographiques bien définies et reconnaissables

QUARTIERS EXISTANTS DANS L'APPLICATION :
${existingCommunities.map(c => `- ${'community_name' in c ? c.community_name : c.name} (${'city' in c ? c.city : 'N/A'}, ${'postal_code' in c ? c.postal_code : 'N/A'})`).join('\n')}

INSTRUCTIONS :
1. Si l'entrée est un code postal, identifiez la ville correspondante et ses quartiers
2. Si l'entrée est une ville, identifiez ses principaux quartiers/arrondissements/zones
3. Évitez de suggérer des quartiers déjà existants dans l'application
4. Privilégiez les quartiers avec une identité forte et des limites claires
5. Incluez des quartiers résidentiels, commerciaux, et mixtes
6. Pour Paris, utilisez les arrondissements et quartiers officiels
7. Pour les autres villes, utilisez les quartiers administratifs ou les zones géographiques reconnues

Retournez UNIQUEMENT un JSON valide avec ce format :

{
  "suggestions": [
    {
      "name": "Nom du quartier",
      "description": "Description courte du quartier (caractéristiques, ambiance, localisation)",
      "postalCode": "Code postal principal du quartier",
      "city": "Ville",
      "department": "Département",
      "region": "Région",
      "coordinates": {
        "latitude": 48.8566,
        "longitude": 2.3522
      },
      "confidence": 0.9
    }
  ]
}

EXEMPLES DE QUARTIERS PERTINENTS :
- Quartiers résidentiels : "Belleville", "Montmartre", "Le Marais"
- Quartiers commerciaux : "Châtelet-Les Halles", "Opéra", "République"
- Quartiers universitaires : "Quartier Latin", "Cité Universitaire"
- Quartiers d'affaires : "La Défense", "Bercy", "Montparnasse"
- Quartiers populaires : "Belleville", "Ménilmontant", "Barbès"

Pour les villes autres que Paris :
- Utilisez les quartiers administratifs officiels
- Incluez les zones géographiques reconnues localement
- Évitez les subdivisions trop petites ou trop grandes

Répondez UNIQUEMENT avec le JSON, sans texte supplémentaire.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 1500,
          temperature: 0.3, // Température modérée pour équilibrer créativité et précision
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      if (response.status === 429) {
        throw new Error(`Limite de taux dépassée. Veuillez réessayer dans quelques instants.`);
      }
      
      throw new Error(`Erreur API Gemini: ${response.status} - ${errorText}`);
    }

    const result: GeminiResponse = await response.json();
    const content = result.candidates[0]?.content?.parts[0]?.text;

    if (!content) {
      throw new Error('Réponse vide de l\'API Gemini');
    }

    // Parser le JSON retourné par Gemini
    let suggestions: NeighborhoodSuggestion[];
    try {
      // Nettoyer le contenu au cas où il y aurait du texte supplémentaire
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      const parsed = JSON.parse(jsonString);
      suggestions = parsed.suggestions || [];
    } catch (parseError) {
      console.error('Erreur de parsing JSON:', parseError, 'Contenu:', content);
      throw new Error('Format de réponse invalide de l\'IA');
    }

    // Validation et nettoyage des données
    suggestions = suggestions.map(suggestion => ({
      name: (suggestion.name || '').trim(),
      description: (suggestion.description || '').trim(),
      postalCode: suggestion.postalCode?.toString().trim(),
      city: (suggestion.city || '').trim(),
      department: (suggestion.department || '').trim(),
      region: (suggestion.region || '').trim(),
      coordinates: suggestion.coordinates ? {
        latitude: Math.max(-90, Math.min(90, suggestion.coordinates.latitude || 0)),
        longitude: Math.max(-180, Math.min(180, suggestion.coordinates.longitude || 0))
      } : undefined,
      confidence: Math.max(0, Math.min(1, suggestion.confidence || 0.5))
    })).filter(suggestion => 
      suggestion.name && 
      suggestion.name.length > 0 &&
      suggestion.city && 
      suggestion.city.length > 0 &&
      suggestion.confidence > 0.3
    );

    return suggestions;

  } catch (error) {
    console.error('Erreur lors de la suggestion de quartiers:', error);
    throw error;
  }
};

/**
 * Valide si un quartier suggéré est suffisamment différent des quartiers existants
 */
export const validateNeighborhoodUniqueness = (
  suggestion: NeighborhoodSuggestion,
  existingCommunities: (Community | NearbyCommunity)[]
): boolean => {
  const suggestionName = suggestion.name?.toLowerCase() || '';
  const suggestionCity = suggestion.city?.toLowerCase() || '';
  
  return !existingCommunities.some(community => {
    // Gérer les deux types : Community (avec 'name') et NearbyCommunity (avec 'community_name')
    const existingName = ('community_name' in community ? community.community_name : community.name)?.toLowerCase() || '';
    const existingCity = ('city' in community ? community.city : '')?.toLowerCase() || '';
    
    // Vérifier si le nom est trop similaire
    if (suggestionName.includes(existingName) || existingName.includes(suggestionName)) {
      return true;
    }
    
    // Vérifier si c'est dans la même ville avec un nom très similaire (seulement si la communauté a une ville)
    if (existingCity && suggestionCity === existingCity && 
        (suggestionName.includes(existingName.split(' ')[0]) || 
         existingName.includes(suggestionName.split(' ')[0]))) {
      return true;
    }
    
    return false;
  });
};

/**
 * Filtre les suggestions pour éviter les doublons avec les quartiers existants
 */
export const filterUniqueNeighborhoods = (
  suggestions: NeighborhoodSuggestion[],
  existingCommunities: (Community | NearbyCommunity)[]
): NeighborhoodSuggestion[] => {
  // Filtrer les communautés existantes pour s'assurer qu'elles ont les propriétés nécessaires
  const validExistingCommunities = existingCommunities.filter(community => 
    community && 
    (('community_name' in community && community.community_name) || ('name' in community && community.name)) &&
    ('city' in community ? community.city : true) // NearbyCommunity n'a pas de city, mais c'est OK
  );
  
  return suggestions.filter(suggestion => 
    validateNeighborhoodUniqueness(suggestion, validExistingCommunities)
  );
};
