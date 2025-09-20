// Script pour tester le géocodage avec différentes stratégies
// Usage: node scripts/test-geocoding.js

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://rwrzvefwfdveauvfhmhk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3cnp2ZWZ3ZmR2ZWF1dmZobWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4NzQwNzIsImV4cCI6MjA1MDQ1MDA3Mn0.zJhHjHjHjHjHjHjHjHjHjHjHjHjHjHjHjHjHjHjHjH'; // Remplacez par votre clé
const supabase = createClient(supabaseUrl, supabaseKey);

// Fonction de nettoyage d'adresse
function cleanAddress(address) {
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

// Fonction de géocodage
async function geocodeAddress(address) {
  if (!address || address.trim().length === 0) {
    return { error: 'INVALID_ADDRESS', message: 'L\'adresse ne peut pas être vide' };
  }

  try {
    const encodedAddress = encodeURIComponent(address.trim());
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1&countrycodes=fr`,
      {
        headers: {
          'User-Agent': 'TrocAll-Script/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return { error: 'NO_RESULTS', message: 'Aucun résultat trouvé pour cette adresse' };
    }

    const result = data[0];
    const importance = parseFloat(result.importance) || 0;
    const confidence = Math.min(importance * 10, 100);

    if (confidence < 30) {
      return { error: 'LOW_CONFIDENCE', message: 'Confiance faible dans la localisation' };
    }

    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      address: result.display_name,
      confidence: Math.round(confidence)
    };

  } catch (error) {
    console.error('Erreur de géocodage:', error);
    return { error: 'GEOCODING_FAILED', message: 'Erreur lors du géocodage de l\'adresse' };
  }
}

// Fonction principale
async function main() {
  const testAddresses = [
    '12 rue des source Aubergenville, Mantes-la-Jolie, Yvelines, Île-de-France, France métropolitaine, 78410, France',
    'Avenue de la Division Leclerc, Aubergenville, Mantes-la-Jolie, Yvelines, Île-de-France, France métropolitaine, 78410, France'
  ];

  for (const originalAddress of testAddresses) {
    console.log('\n📍 Test de géocodage pour:', originalAddress);
    
    const strategies = [
      originalAddress, // Adresse complète
      cleanAddress(originalAddress), // Adresse nettoyée
      originalAddress.split(',').slice(0, 3).join(','), // Adresse simplifiée
      originalAddress.split(',')[0] + ', Aubergenville, France', // Juste la rue + ville
      'Aubergenville, France' // Fallback sur la ville
    ];

    for (const strategy of strategies) {
      console.log(`\n🔄 Stratégie: ${strategy}`);
      
      try {
        const result = await geocodeAddress(strategy);
        
        if ('error' in result) {
          console.log(`❌ Échec: ${result.message}`);
        } else {
          console.log(`✅ Succès:`, {
            address: result.address,
            coordinates: [result.longitude, result.latitude],
            confidence: result.confidence
          });
          break; // Arrêter si une stratégie fonctionne
        }
        
        // Pause entre les requêtes
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Erreur:`, error.message);
      }
    }
  }
}

// Exécuter le script
main().catch(console.error);
