/**
 * Test de débogage pour la fonctionnalité de suggestion de quartiers
 * 
 * Ce fichier aide à identifier et résoudre les erreurs de la fonctionnalité
 * de suggestion de quartiers avec IA.
 */

import { suggestNeighborhoods, filterUniqueNeighborhoods, validateNeighborhoodUniqueness } from '../services/neighborhoodSuggestionAI';
import type { Community, NearbyCommunity, NeighborhoodSuggestion } from '../types';

// Données de test pour déboguer
const mockCommunities: Community[] = [
  {
    id: '1',
    name: 'Belleville',
    city: 'Paris',
    postal_code: '75011',
    country: 'France',
    radius_km: 2,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'République',
    city: 'Paris',
    postal_code: '75003',
    country: 'France',
    radius_km: 1.5,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const mockNearbyCommunities: NearbyCommunity[] = [
  {
    community_id: '1',
    community_name: 'Belleville',
    distance_km: 0.5,
    member_count: 25
  },
  {
    community_id: '2',
    community_name: 'République',
    distance_km: 1.2,
    member_count: 18
  }
];

// Test de validation de l'unicité
export const testValidateUniqueness = () => {
  console.log('🧪 Test de validation de l\'unicité');
  
  const testSuggestion: NeighborhoodSuggestion = {
    name: 'Belleville',
    description: 'Quartier populaire de Paris',
    city: 'Paris',
    department: 'Paris',
    region: 'Île-de-France',
    confidence: 0.9
  };
  
  try {
    // Test avec Community[]
    const result1 = validateNeighborhoodUniqueness(testSuggestion, mockCommunities);
    console.log('✅ Test avec Community[]:', result1);
    
    // Test avec NearbyCommunity[]
    const result2 = validateNeighborhoodUniqueness(testSuggestion, mockNearbyCommunities);
    console.log('✅ Test avec NearbyCommunity[]:', result2);
    
    // Test avec un mélange
    const mixedCommunities = [...mockCommunities, ...mockNearbyCommunities];
    const result3 = validateNeighborhoodUniqueness(testSuggestion, mixedCommunities);
    console.log('✅ Test avec mélange:', result3);
    
  } catch (error) {
    console.error('❌ Erreur dans testValidateUniqueness:', error);
  }
};

// Test de filtrage
export const testFilterUnique = () => {
  console.log('🧪 Test de filtrage des quartiers uniques');
  
  const testSuggestions: NeighborhoodSuggestion[] = [
    {
      name: 'Belleville',
      description: 'Quartier populaire',
      city: 'Paris',
      department: 'Paris',
      region: 'Île-de-France',
      confidence: 0.9
    },
    {
      name: 'Montmartre',
      description: 'Quartier artistique',
      city: 'Paris',
      department: 'Paris',
      region: 'Île-de-France',
      confidence: 0.8
    }
  ];
  
  try {
    const result = filterUniqueNeighborhoods(testSuggestions, mockCommunities);
    console.log('✅ Quartiers uniques trouvés:', result.length);
    result.forEach((suggestion, index) => {
      console.log(`${index + 1}. ${suggestion.name} - ${suggestion.city}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur dans testFilterUnique:', error);
  }
};

// Test avec des données invalides
export const testInvalidData = () => {
  console.log('🧪 Test avec des données invalides');
  
  const invalidCommunities = [
    { id: '1', name: 'Belleville', city: 'Paris' }, // OK
    { id: '2', name: '', city: 'Paris' }, // Nom vide
    { id: '3', name: 'République', city: '' }, // Ville vide
    { id: '4', name: null, city: 'Paris' }, // Nom null
    { id: '5', name: 'Montmartre', city: null }, // Ville null
    null, // Communauté null
    undefined // Communauté undefined
  ];
  
  const testSuggestion: NeighborhoodSuggestion = {
    name: 'Test',
    description: 'Test',
    city: 'Paris',
    department: 'Paris',
    region: 'Île-de-France',
    confidence: 0.9
  };
  
  try {
    const result = validateNeighborhoodUniqueness(testSuggestion, invalidCommunities as any);
    console.log('✅ Test avec données invalides:', result);
    
  } catch (error) {
    console.error('❌ Erreur dans testInvalidData:', error);
  }
};

// Test de suggestion complète (nécessite une clé API)
export const testFullSuggestion = async () => {
  console.log('🧪 Test de suggestion complète');
  
  try {
    const suggestions = await suggestNeighborhoods('75011', mockCommunities);
    console.log('✅ Suggestions trouvées:', suggestions.length);
    
    suggestions.forEach((suggestion, index) => {
      console.log(`${index + 1}. ${suggestion.name} - ${suggestion.city} (${suggestion.confidence})`);
    });
    
    const uniqueSuggestions = filterUniqueNeighborhoods(suggestions, mockCommunities);
    console.log('✅ Suggestions uniques:', uniqueSuggestions.length);
    
  } catch (error) {
    console.error('❌ Erreur dans testFullSuggestion:', error);
  }
};

// Fonction de débogage principale
export const debugNeighborhoodSuggestion = () => {
  console.log('🔍 Débogage de la fonctionnalité de suggestion de quartiers');
  console.log('================================================');
  
  testValidateUniqueness();
  console.log('');
  
  testFilterUnique();
  console.log('');
  
  testInvalidData();
  console.log('');
  
  // Test complet seulement si une clé API est disponible
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (apiKey) {
    testFullSuggestion();
  } else {
    console.log('⚠️ Clé API Gemini non disponible, test complet ignoré');
  }
  
  console.log('================================================');
  console.log('✅ Débogage terminé');
};

// Export par défaut
export default {
  testValidateUniqueness,
  testFilterUnique,
  testInvalidData,
  testFullSuggestion,
  debugNeighborhoodSuggestion
};
