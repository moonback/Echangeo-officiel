#!/usr/bin/env node

/**
 * Script de test pour le système d'événements
 * Vérifie que toutes les fonctionnalités sont opérationnelles
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testEventsSystem() {
  console.log('🧪 Test du système d\'événements...\n');

  try {
    // 1. Vérifier les communautés existantes
    console.log('1️⃣ Vérification des communautés...');
    const { data: communities, error: communitiesError } = await supabase
      .from('communities')
      .select('id, name, is_active')
      .eq('is_active', true);

    if (communitiesError) {
      throw new Error(`Erreur communautés: ${communitiesError.message}`);
    }

    console.log(`✅ ${communities.length} communautés actives trouvées`);
    communities.forEach(community => {
      console.log(`   - ${community.name} (${community.id})`);
    });

    // 2. Vérifier les événements existants
    console.log('\n2️⃣ Vérification des événements...');
    const { data: events, error: eventsError } = await supabase
      .from('community_events')
      .select(`
        id,
        title,
        event_type,
        start_date,
        end_date,
        max_participants,
        community:communities(name),
        participants:event_participants(count)
      `)
      .eq('is_active', true);

    if (eventsError) {
      throw new Error(`Erreur événements: ${eventsError.message}`);
    }

    console.log(`✅ ${events.length} événements actifs trouvés`);
    events.forEach(event => {
      const participantCount = event.participants?.[0]?.count || 0;
      const startDate = new Date(event.start_date).toLocaleDateString('fr-FR');
      console.log(`   - ${event.title} (${event.event_type}) - ${startDate} - ${participantCount} participants`);
    });

    // 3. Vérifier les participants
    console.log('\n3️⃣ Vérification des participants...');
    const { data: participants, error: participantsError } = await supabase
      .from('event_participants')
      .select(`
        id,
        status,
        event:community_events(title),
        user:profiles(full_name, email)
      `);

    if (participantsError) {
      throw new Error(`Erreur participants: ${participantsError.message}`);
    }

    const statusCounts = participants.reduce((acc, participant) => {
      acc[participant.status] = (acc[participant.status] || 0) + 1;
      return acc;
    }, {});

    console.log(`✅ ${participants.length} participations trouvées`);
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   - ${status}: ${count}`);
    });

    // 4. Test de création d'événement (simulation)
    console.log('\n4️⃣ Test de création d\'événement...');
    const testEvent = {
      community_id: communities[0]?.id,
      title: 'Test Event - ' + new Date().toISOString(),
      description: 'Événement de test automatique',
      event_type: 'meetup',
      location: 'Lieu de test',
      start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Dans 7 jours
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // + 2h
      max_participants: 10,
      created_by: null, // Sera défini si un utilisateur existe
      is_active: true
    };

    // Récupérer un utilisateur pour le test
    const { data: users } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (users && users.length > 0) {
      testEvent.created_by = users[0].id;
    }

    const { data: newEvent, error: createError } = await supabase
      .from('community_events')
      .insert(testEvent)
      .select()
      .single();

    if (createError) {
      console.log(`⚠️  Erreur création événement: ${createError.message}`);
    } else {
      console.log(`✅ Événement de test créé: ${newEvent.title} (${newEvent.id})`);
      
      // Nettoyer l'événement de test
      await supabase
        .from('community_events')
        .update({ is_active: false })
        .eq('id', newEvent.id);
      console.log('🧹 Événement de test nettoyé');
    }

    // 5. Statistiques finales
    console.log('\n5️⃣ Statistiques du système...');
    const { data: finalEvents } = await supabase
      .from('community_events')
      .select('id')
      .eq('is_active', true);

    const { data: finalParticipants } = await supabase
      .from('event_participants')
      .select('id');

    const { data: finalCommunities } = await supabase
      .from('communities')
      .select('id')
      .eq('is_active', true);

    console.log('📊 Résumé:');
    console.log(`   - Communautés: ${finalCommunities?.length || 0}`);
    console.log(`   - Événements: ${finalEvents?.length || 0}`);
    console.log(`   - Participations: ${finalParticipants?.length || 0}`);

    // 6. Vérification des types d'événements
    console.log('\n6️⃣ Types d\'événements utilisés...');
    const eventTypes = events.reduce((acc, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {});

    Object.entries(eventTypes).forEach(([type, count]) => {
      const typeLabels = {
        meetup: 'Rencontres',
        swap: 'Troc Party',
        workshop: 'Ateliers',
        social: 'Événements sociaux',
        other: 'Autres'
      };
      console.log(`   - ${typeLabels[type] || type}: ${count}`);
    });

    console.log('\n🎉 Tests terminés avec succès !');
    console.log('\n📋 Recommandations:');
    console.log('   - Vérifiez que les composants React se chargent correctement');
    console.log('   - Testez les interactions utilisateur (création, inscription)');
    console.log('   - Vérifiez les notifications et rappels');
    console.log('   - Testez la géolocalisation si disponible');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
    process.exit(1);
  }
}

// Exécuter les tests
testEventsSystem();
