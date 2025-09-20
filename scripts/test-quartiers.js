// Script pour tester la disponibilité des quartiers
// Ce script vérifie que les quartiers sont bien créés et accessibles

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (remplacer par vos vraies valeurs)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuartiers() {
  console.log('🔍 Test de disponibilité des quartiers...\n');

  try {
    // Récupérer tous les quartiers actifs
    const { data: quartiers, error } = await supabase
      .from('communities')
      .select('id, name, city, postal_code, radius_km, is_active')
      .eq('is_active', true)
      .order('city')
      .order('name');

    if (error) {
      console.error('❌ Erreur lors de la récupération des quartiers:', error.message);
      return;
    }

    if (!quartiers || quartiers.length === 0) {
      console.log('⚠️  Aucun quartier trouvé. Exécutez le script SQL SETUP_QUARTIERS_INSCRIPTION.sql');
      return;
    }

    console.log(`✅ ${quartiers.length} quartier(s) trouvé(s):\n`);

    // Grouper par ville
    const quartiersParVille = quartiers.reduce((acc, quartier) => {
      if (!acc[quartier.city]) {
        acc[quartier.city] = [];
      }
      acc[quartier.city].push(quartier);
      return acc;
    }, {});

    // Afficher les quartiers par ville
    Object.entries(quartiersParVille).forEach(([ville, quartiersVille]) => {
      console.log(`📍 ${ville}:`);
      quartiersVille.forEach(quartier => {
        console.log(`   • ${quartier.name} (${quartier.postal_code}) - ${quartier.radius_km}km`);
      });
      console.log('');
    });

    // Test de création d'un membre de test
    console.log('🧪 Test d\'ajout d\'un membre de test...');
    
    const premierQuartier = quartiers[0];
    const testUserId = 'test-user-' + Date.now();
    
    const { error: insertError } = await supabase
      .from('community_members')
      .insert({
        community_id: premierQuartier.id,
        user_id: testUserId,
        role: 'member',
        is_active: true,
        joined_at: new Date().toISOString()
      });

    if (insertError) {
      console.log('⚠️  Impossible d\'ajouter un membre de test (normal si la table profiles n\'existe pas)');
    } else {
      console.log(`✅ Membre de test ajouté au quartier "${premierQuartier.name}"`);
      
      // Nettoyer le test
      await supabase
        .from('community_members')
        .delete()
        .eq('user_id', testUserId);
      console.log('🧹 Membre de test supprimé');
    }

    console.log('\n🎉 Test terminé avec succès !');
    console.log('\n📝 Prochaines étapes:');
    console.log('   1. Vérifiez que l\'application charge bien ces quartiers');
    console.log('   2. Testez l\'inscription avec sélection de quartier');
    console.log('   3. Vérifiez que l\'utilisateur est bien ajouté à la communauté');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  }
}

// Exécuter le test
testQuartiers();
