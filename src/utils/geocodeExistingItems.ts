// Utilitaire pour géocoder les items existants qui n'ont pas de coordonnées
import { supabase } from '../services/supabase';
import { geocodeWithRetry, cleanAddress } from './geocoding';

/**
 * Géocode tous les items qui ont un location_hint mais pas de coordonnées
 */
export async function geocodeExistingItems() {
  console.log('🔄 Recherche des items à géocoder...');
  
  try {
    // Récupérer les items sans coordonnées mais avec location_hint
    const { data: items, error } = await supabase
      .from('items')
      .select('id, title, location_hint, latitude, longitude')
      .or('latitude.is.null,longitude.is.null')
      .not('location_hint', 'is', null);

    if (error) {
      console.error('❌ Erreur lors de la récupération des items:', error);
      return { success: false, error: error.message };
    }

    if (!items || items.length === 0) {
      console.log('✅ Aucun item à géocoder trouvé');
      return { success: true, processed: 0 };
    }

    console.log(`📍 ${items.length} items à géocoder trouvés`);

    let successCount = 0;
    let errorCount = 0;

    for (const item of items) {
      try {
        console.log(`🔄 Géocodage de: ${item.title} (${item.location_hint})`);
        
        const cleanedAddress = cleanAddress(item.location_hint!);
        const geocodeResult = await geocodeWithRetry(cleanedAddress);
        
        if (geocodeResult) {
          // Mettre à jour l'item avec les coordonnées
          const { error: updateError } = await supabase
            .from('items')
            .update({
              latitude: geocodeResult.latitude,
              longitude: geocodeResult.longitude,
              updated_at: new Date().toISOString()
            })
            .eq('id', item.id);

          if (updateError) {
            console.error(`❌ Erreur lors de la mise à jour de ${item.title}:`, updateError);
            errorCount++;
          } else {
            console.log(`✅ Géocodage réussi pour ${item.title}:`, {
              coordinates: [geocodeResult.longitude, geocodeResult.latitude],
              confidence: geocodeResult.confidence
            });
            successCount++;
          }
        } else {
          console.warn(`⚠️ Géocodage échoué pour ${item.title}`);
          errorCount++;
        }

        // Pause entre les requêtes pour éviter de surcharger l'API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Erreur lors du géocodage de ${item.title}:`, error);
        errorCount++;
      }
    }

    console.log(`✅ Géocodage terminé: ${successCount} succès, ${errorCount} échecs`);
    
    return {
      success: true,
      processed: items.length,
      successCount,
      errorCount
    };

  } catch (error) {
    console.error('❌ Erreur générale lors du géocodage:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
  }
}

/**
 * Géocode un item spécifique par son ID
 */
export async function geocodeItem(itemId: string) {
  console.log(`🔄 Géocodage de l'item ${itemId}...`);
  
  try {
    // Récupérer l'item
    const { data: item, error: fetchError } = await supabase
      .from('items')
      .select('id, title, location_hint, latitude, longitude')
      .eq('id', itemId)
      .single();

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération de l\'item:', fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!item.location_hint) {
      console.warn('⚠️ L\'item n\'a pas de location_hint');
      return { success: false, error: 'Pas de location_hint' };
    }

    if (item.latitude && item.longitude) {
      console.log('✅ L\'item a déjà des coordonnées');
      return { success: true, alreadyGeocoded: true };
    }

    // Géocoder l'item
    const cleanedAddress = cleanAddress(item.location_hint);
    const geocodeResult = await geocodeWithRetry(cleanedAddress);
    
    if (!geocodeResult) {
      console.warn('⚠️ Géocodage échoué');
      return { success: false, error: 'Géocodage échoué' };
    }

    // Mettre à jour l'item
    const { error: updateError } = await supabase
      .from('items')
      .update({
        latitude: geocodeResult.latitude,
        longitude: geocodeResult.longitude,
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId);

    if (updateError) {
      console.error('❌ Erreur lors de la mise à jour:', updateError);
      return { success: false, error: updateError.message };
    }

    console.log('✅ Géocodage réussi:', {
      item: item.title,
      coordinates: [geocodeResult.longitude, geocodeResult.latitude],
      confidence: geocodeResult.confidence
    });

    return {
      success: true,
      coordinates: {
        latitude: geocodeResult.latitude,
        longitude: geocodeResult.longitude
      },
      confidence: geocodeResult.confidence
    };

  } catch (error) {
    console.error('❌ Erreur lors du géocodage:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
  }
}
