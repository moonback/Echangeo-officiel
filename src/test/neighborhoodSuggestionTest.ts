/**
 * Test de la fonctionnalité de suggestion de quartiers avec IA
 * 
 * Ce fichier contient des tests et exemples pour la fonctionnalité
 * de suggestion de quartiers basée sur l'API Gemini.
 */

import { suggestNeighborhoods, filterUniqueNeighborhoods } from '../services/neighborhoodSuggestionAI';
import type { Community, NeighborhoodSuggestion } from '../types';

// Exemples de quartiers existants pour les tests
const mockExistingCommunities: Community[] = [
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

// Fonction de test pour la suggestion de quartiers
export const testNeighborhoodSuggestion = async () => {
  console.log('🧪 Test de la suggestion de quartiers avec IA');
  
  try {
    // Test 1: Code postal parisien
    console.log('\n📍 Test 1: Code postal 75011 (Paris)');
    const suggestions1 = await suggestNeighborhoods('75011', mockExistingCommunities);
    console.log('Suggestions trouvées:', suggestions1.length);
    suggestions1.forEach((suggestion, index) => {
      console.log(`${index + 1}. ${suggestion.name} - ${suggestion.city} (${suggestion.confidence})`);
    });

    // Test 2: Ville de Lyon
    console.log('\n🏙️ Test 2: Ville de Lyon');
    const suggestions2 = await suggestNeighborhoods('Lyon', mockExistingCommunities);
    console.log('Suggestions trouvées:', suggestions2.length);
    suggestions2.forEach((suggestion, index) => {
      console.log(`${index + 1}. ${suggestion.name} - ${suggestion.city} (${suggestion.confidence})`);
    });

    // Test 3: Code postal marseillais
    console.log('\n🌊 Test 3: Code postal 13001 (Marseille)');
    const suggestions3 = await suggestNeighborhoods('13001', mockExistingCommunities);
    console.log('Suggestions trouvées:', suggestions3.length);
    suggestions3.forEach((suggestion, index) => {
      console.log(`${index + 1}. ${suggestion.name} - ${suggestion.city} (${suggestion.confidence})`);
    });

    // Test 4: Filtrage des doublons
    console.log('\n🔍 Test 4: Filtrage des doublons');
    const allSuggestions = [...suggestions1, ...suggestions2, ...suggestions3];
    const uniqueSuggestions = filterUniqueNeighborhoods(allSuggestions, mockExistingCommunities);
    console.log(`Suggestions totales: ${allSuggestions.length}`);
    console.log(`Suggestions uniques: ${uniqueSuggestions.length}`);
    console.log(`Doublons filtrés: ${allSuggestions.length - uniqueSuggestions.length}`);

    console.log('\n✅ Tests terminés avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
};

// Fonction de validation des suggestions
export const validateSuggestion = (suggestion: NeighborhoodSuggestion): boolean => {
  const errors: string[] = [];
  
  if (!suggestion.name || suggestion.name.trim().length === 0) {
    errors.push('Le nom du quartier est requis');
  }
  
  if (!suggestion.city || suggestion.city.trim().length === 0) {
    errors.push('La ville est requise');
  }
  
  if (suggestion.confidence < 0 || suggestion.confidence > 1) {
    errors.push('Le score de confiance doit être entre 0 et 1');
  }
  
  if (suggestion.coordinates) {
    if (suggestion.coordinates.latitude < -90 || suggestion.coordinates.latitude > 90) {
      errors.push('La latitude doit être entre -90 et 90');
    }
    if (suggestion.coordinates.longitude < -180 || suggestion.coordinates.longitude > 180) {
      errors.push('La longitude doit être entre -180 et 180');
    }
  }
  
  if (errors.length > 0) {
    console.warn('⚠️ Erreurs de validation:', errors);
    return false;
  }
  
  return true;
};

// Exemples d'utilisation pour les développeurs
export const examples = {
  // Exemple de suggestion pour Paris
  parisExample: async () => {
    const suggestions = await suggestNeighborhoods('75001', []);
    return suggestions;
  },
  
  // Exemple de suggestion pour une ville
  cityExample: async () => {
    const suggestions = await suggestNeighborhoods('Toulouse', []);
    return suggestions;
  },
  
  // Exemple avec quartiers existants
  withExistingCommunities: async () => {
    const suggestions = await suggestNeighborhoods('75011', mockExistingCommunities);
    return suggestions;
  }
};

// Interface pour les tests automatisés
export interface NeighborhoodTestResult {
  input: string;
  suggestionsCount: number;
  hasCoordinates: boolean;
  averageConfidence: number;
  uniqueSuggestions: number;
  errors: string[];
}

export const runAutomatedTest = async (inputs: string[]): Promise<NeighborhoodTestResult[]> => {
  const results: NeighborhoodTestResult[] = [];
  
  for (const input of inputs) {
    try {
      const suggestions = await suggestNeighborhoods(input, mockExistingCommunities);
      const uniqueSuggestions = filterUniqueNeighborhoods(suggestions, mockExistingCommunities);
      
      const result: NeighborhoodTestResult = {
        input,
        suggestionsCount: suggestions.length,
        hasCoordinates: suggestions.some(s => s.coordinates !== undefined),
        averageConfidence: suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length,
        uniqueSuggestions: uniqueSuggestions.length,
        errors: []
      };
      
      results.push(result);
      
    } catch (error: any) {
      results.push({
        input,
        suggestionsCount: 0,
        hasCoordinates: false,
        averageConfidence: 0,
        uniqueSuggestions: 0,
        errors: [error.message]
      });
    }
  }
  
  return results;
};

// Tests prédéfinis
export const predefinedTests = [
  '75001', // Paris 1er
  '75011', // Paris 11e
  '69001', // Lyon 1er
  '13001', // Marseille 1er
  '31000', // Toulouse
  '33000', // Bordeaux
  '59000', // Lille
  '67000', // Strasbourg
];

// Fonction principale de test (à appeler depuis la console)
export const runAllTests = async () => {
  console.log('🚀 Lancement de tous les tests de suggestion de quartiers');
  
  // Test manuel
  await testNeighborhoodSuggestion();
  
  // Tests automatisés
  console.log('\n🤖 Tests automatisés');
  const results = await runAutomatedTest(predefinedTests);
  
  console.table(results.map(r => ({
    Input: r.input,
    Suggestions: r.suggestionsCount,
    Coordonnées: r.hasCoordinates ? '✅' : '❌',
    Confiance: r.averageConfidence.toFixed(2),
    Uniques: r.uniqueSuggestions,
    Erreurs: r.errors.length
  })));
  
  console.log('\n📊 Résumé des tests:');
  console.log(`- Total des tests: ${results.length}`);
  console.log(`- Tests réussis: ${results.filter(r => r.errors.length === 0).length}`);
  console.log(`- Tests échoués: ${results.filter(r => r.errors.length > 0).length}`);
  console.log(`- Moyenne des suggestions: ${(results.reduce((sum, r) => sum + r.suggestionsCount, 0) / results.length).toFixed(1)}`);
};

// Export par défaut pour faciliter l'import
export default {
  testNeighborhoodSuggestion,
  validateSuggestion,
  examples,
  runAutomatedTest,
  runAllTests,
  predefinedTests
};
