import { supabase } from '../services/supabase';

// Fonction pour tester la disponibilité des tables de gamification
export async function testGamificationTables() {
  const results = {
    user_levels: false,
    gamification_stats: false,
    badges: false,
    user_badges: false,
    challenges: false,
    user_challenges: false,
    leaderboard: false,
  };

  try {
    // Test user_levels
    try {
      await supabase.from('user_levels').select('id').limit(1);
      results.user_levels = true;
    } catch (error) {
      console.log('Table user_levels non disponible:', error);
    }

    // Test gamification_stats (vue)
    try {
      await supabase.from('gamification_stats').select('*').limit(1);
      results.gamification_stats = true;
    } catch (error) {
      console.log('Vue gamification_stats non disponible:', error);
    }

    // Test badges
    try {
      await supabase.from('badges').select('id').limit(1);
      results.badges = true;
    } catch (error) {
      console.log('Table badges non disponible:', error);
    }

    // Test user_badges
    try {
      await supabase.from('user_badges').select('id').limit(1);
      results.user_badges = true;
    } catch (error) {
      console.log('Table user_badges non disponible:', error);
    }

    // Test challenges
    try {
      await supabase.from('challenges').select('id').limit(1);
      results.challenges = true;
    } catch (error) {
      console.log('Table challenges non disponible:', error);
    }

    // Test user_challenges
    try {
      await supabase.from('user_challenges').select('id').limit(1);
      results.user_challenges = true;
    } catch (error) {
      console.log('Table user_challenges non disponible:', error);
    }

    // Test leaderboard (vue)
    try {
      await supabase.from('leaderboard').select('*').limit(1);
      results.leaderboard = true;
    } catch (error) {
      console.log('Vue leaderboard non disponible:', error);
    }

    return results;
  } catch (error) {
    console.error('Erreur lors du test des tables:', error);
    return results;
  }
}

// Fonction pour tester les fonctions de gamification
export async function testGamificationFunctions() {
  const results = {
    calculate_user_level: false,
    get_level_title: false,
    add_user_points: false,
    check_and_award_badges: false,
  };

  try {
    // Test calculate_user_level
    try {
      await supabase.rpc('calculate_user_level', { points: 100 });
      results.calculate_user_level = true;
    } catch (error) {
      console.log('Fonction calculate_user_level non disponible:', error);
    }

    // Test get_level_title
    try {
      await supabase.rpc('get_level_title', { level: 1 });
      results.get_level_title = true;
    } catch (error) {
      console.log('Fonction get_level_title non disponible:', error);
    }

    // Test add_user_points (nécessite un utilisateur authentifié)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc('add_user_points', {
          p_profile_id: user.id,
          p_points: 0,
          p_reason: 'Test',
          p_source_type: 'test',
          p_source_id: null,
        });
        results.add_user_points = true;
      }
    } catch (error) {
      console.log('Fonction add_user_points non disponible:', error);
    }

    // Test check_and_award_badges (nécessite un utilisateur authentifié)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc('check_and_award_badges', {
          p_profile_id: user.id,
        });
        results.check_and_award_badges = true;
      }
    } catch (error) {
      console.log('Fonction check_and_award_badges non disponible:', error);
    }

    return results;
  } catch (error) {
    console.error('Erreur lors du test des fonctions:', error);
    return results;
  }
}

// Fonction complète de diagnostic
export async function diagnoseGamification() {
  console.log('🔍 Diagnostic du système de gamification...');
  
  const tablesStatus = await testGamificationTables();
  const functionsStatus = await testGamificationFunctions();
  
  console.log('📊 État des tables:', tablesStatus);
  console.log('⚙️ État des fonctions:', functionsStatus);
  
  const allTablesAvailable = Object.values(tablesStatus).every(status => status);
  const allFunctionsAvailable = Object.values(functionsStatus).every(status => status);
  
  if (allTablesAvailable && allFunctionsAvailable) {
    console.log('✅ Système de gamification entièrement fonctionnel');
  } else {
    console.log('⚠️ Système de gamification partiellement fonctionnel');
    console.log('📋 Actions requises:');
    
    if (!allTablesAvailable) {
      console.log('  - Appliquer les migrations de tables');
    }
    if (!allFunctionsAvailable) {
      console.log('  - Appliquer les migrations de fonctions');
    }
  }
  
  return {
    tables: tablesStatus,
    functions: functionsStatus,
    fullyFunctional: allTablesAvailable && allFunctionsAvailable,
  };
}
