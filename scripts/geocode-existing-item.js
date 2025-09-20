// Script pour géocoder l'item existant dans la base de données
// Usage: node scripts/geocode-existing-item.js

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://rwrzvefwfdveauvfhmhk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3cnp2ZWZ3ZmR2ZWF1dmZobWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4NzQwNzIsImV4cCI6MjA1MDQ1MDA3Mn0.zJhHjHjHjHjHjHjHjHjHjHjHjHjHjHjHjHjHjHjHjH'; // Remplacez par votre clé
const supabase = createClient(supabaseUrl, supabaseKey);

// Fonction de géocodage
async function geocodeAddress(address) {
  if (!address || address.trim().length === 0) {
    return null;
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
      return null;
    }

    const result = data[0];
    const importance = parseFloat(result.importance) || 0;
    const confidence = Math.min(importance * 10, 100);

    if (confidence < 30) {
      console.warn(`Confiance faible (${confidence}%) pour: ${address}`);
      return null;
    }

    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      address: result.display_name,
      confidence: Math.round(confidence)
    };

  } catch (error) {
    console.error('Erreur de géocodage:', error);
    return null;
  }
}

// Fonction principale
async function main() {
  console.log('🔄 Géocodage de l\'item existant...');
  
  try {
    // Récupérer l'item spécifique
    const { data: item, error } = await supabase
      .from('items')
      .select('id, title, location_hint, latitude, longitude')
      .eq('id', 'c73b7e51-2a85-452d-b1e5-3066e852f050')
      .single();

    if (error) {
      console.error('❌ Erreur lors de la récupération de l\'item:', error);
      return;
    }

    console.log('📍 Item trouvé:', {
      id: item.id,
      title: item.title,
      location_hint: item.location_hint,
      hasCoordinates: !!(item.latitude && item.longitude)
    });

    if (!item.location_hint) {
      console.warn('⚠️ L\'item n\'a pas de location_hint');
      return;
    }

    if (item.latitude && item.longitude) {
      console.log('✅ L\'item a déjà des coordonnées');
      return;
    }

    // Géocoder l'adresse
    console.log('🔄 Géocodage de:', item.location_hint);
    const geocodeResult = await geocodeAddress(item.location_hint);
    
    if (!geocodeResult) {
      console.error('❌ Géocodage échoué');
      return;
    }

    console.log('✅ Géocodage réussi:', {
      original: item.location_hint,
      found: geocodeResult.address,
      coordinates: [geocodeResult.longitude, geocodeResult.latitude],
      confidence: geocodeResult.confidence
    });

    // Mettre à jour l'item dans la base de données
    const { error: updateError } = await supabase
      .from('items')
      .update({
        latitude: geocodeResult.latitude,
        longitude: geocodeResult.longitude,
        updated_at: new Date().toISOString()
      })
      .eq('id', item.id);

    if (updateError) {
      console.error('❌ Erreur lors de la mise à jour:', updateError);
      return;
    }

    console.log('✅ Item mis à jour avec succès dans la base de données');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le script
main();
