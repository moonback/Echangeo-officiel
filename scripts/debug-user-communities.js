// Script pour déboguer les communautés d'un utilisateur
// Ce script vérifie que l'utilisateur est bien rattaché à des quartiers

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (remplacer par vos vraies valeurs)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugUserCommunities() {
  console.log('🔍 Debug des communautés utilisateur...\n');

  try {
    // 1. Vérifier tous les utilisateurs et leurs communautés
    console.log('📊 Tous les utilisateurs et leurs communautés:');
    const { data: allUsers, error: usersError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        created_at,
        community_members(
          id,
          joined_at,
          is_active,
          role,
          community:communities(
            id,
            name,
            city,
            postal_code
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (usersError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', usersError.message);
      return;
    }

    if (!allUsers || allUsers.length === 0) {
      console.log('⚠️  Aucun utilisateur trouvé');
      return;
    }

    allUsers.forEach((user, index) => {
      console.log(`\n👤 Utilisateur ${index + 1}:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Nom: ${user.full_name}`);
      console.log(`   Créé le: ${user.created_at}`);
      
      if (user.community_members && user.community_members.length > 0) {
        console.log(`   🏘️  Communautés (${user.community_members.length}):`);
        user.community_members.forEach((member, memberIndex) => {
          const community = member.community;
          console.log(`      ${memberIndex + 1}. ${community.name} (${community.city})`);
          console.log(`         - Rejoint le: ${member.joined_at}`);
          console.log(`         - Rôle: ${member.role}`);
          console.log(`         - Actif: ${member.is_active}`);
        });
      } else {
        console.log('   ⚠️  Aucune communauté');
      }
    });

    // 2. Vérifier spécifiquement le premier utilisateur (pour test)
    const firstUser = allUsers[0];
    if (firstUser && firstUser.community_members && firstUser.community_members.length > 0) {
      console.log(`\n🎯 Test spécifique pour l'utilisateur: ${firstUser.email}`);
      
      // Simuler la requête du hook useUserCommunities
      const { data: userCommunities, error: communitiesError } = await supabase
        .from('community_members')
        .select(`
          community:communities(*)
        `)
        .eq('user_id', firstUser.id)
        .eq('is_active', true);

      if (communitiesError) {
        console.error('❌ Erreur lors de la récupération des communautés:', communitiesError.message);
      } else {
        console.log('✅ Communautés récupérées par useUserCommunities:');
        userCommunities?.forEach((item, index) => {
          const community = item.community;
          console.log(`   ${index + 1}. ${community.name} (${community.city})`);
        });
      }

      // Simuler la requête du hook useUserSignupCommunity
      const { data: signupCommunity, error: signupError } = await supabase
        .from('community_members')
        .select(`
          community:communities(*)
        `)
        .eq('user_id', firstUser.id)
        .eq('is_active', true)
        .order('joined_at', { ascending: true })
        .limit(1);

      if (signupError) {
        console.error('❌ Erreur lors de la récupération du quartier d\'inscription:', signupError.message);
      } else {
        const community = signupCommunity?.[0]?.community;
        if (community) {
          console.log('✅ Quartier d\'inscription récupéré par useUserSignupCommunity:');
          console.log(`   🏠 ${community.name} (${community.city})`);
        } else {
          console.log('⚠️  Aucun quartier d\'inscription trouvé');
        }
      }
    }

    // 3. Vérifier les communautés disponibles
    console.log('\n📋 Communautés disponibles:');
    const { data: communities, error: communitiesListError } = await supabase
      .from('communities')
      .select('id, name, city, postal_code, is_active, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (communitiesListError) {
      console.error('❌ Erreur lors de la récupération des communautés:', communitiesListError.message);
    } else {
      console.log(`✅ ${communities?.length || 0} communautés actives trouvées:`);
      communities?.forEach((community, index) => {
        console.log(`   ${index + 1}. ${community.name} (${community.city}) - ${community.postal_code}`);
      });
    }

    console.log('\n🎉 Debug terminé !');
    console.log('\n📝 Prochaines étapes:');
    console.log('   1. Vérifiez que l\'utilisateur a bien des communautés');
    console.log('   2. Vérifiez que les hooks retournent les bonnes données');
    console.log('   3. Testez l\'interface dans le navigateur');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error.message);
  }
}

// Exécuter le debug
debugUserCommunities();
