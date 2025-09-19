import { supabase } from '../services/supabase';

export async function testStatsQueries() {
  console.log('🧪 Test des requêtes de statistiques...');
  
  try {
    // Test 1: Nombre d'utilisateurs
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1000);
    
    console.log('👥 Utilisateurs totaux:', users?.length || 0, usersError);

    // Test 2: Nombre d'objets
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('id')
      .eq('is_available', true)
      .limit(1000);
    
    console.log('📦 Objets disponibles:', items?.length || 0, itemsError);

    // Test 3: Nombre d'échanges (avec gestion d'erreur)
    let exchangesCount = 0;
    let exchangesError = null;
    try {
      const result = await supabase
        .from('requests')
        .select('id')
        .eq('status', 'completed')
        .limit(1000);
      exchangesCount = result.data?.length || 0;
      exchangesError = result.error;
    } catch (error) {
      console.warn('Table requests non disponible:', error);
    }
    
    console.log('🔄 Échanges réussis:', exchangesCount, exchangesError);

    // Test 4: Nombre de communautés (avec gestion d'erreur)
    let communitiesCount = 0;
    let communitiesError = null;
    try {
      const result = await supabase
        .from('communities')
        .select('id')
        .eq('is_active', true)
        .limit(1000);
      communitiesCount = result.data?.length || 0;
      communitiesError = result.error;
    } catch (error) {
      console.warn('Table communities non disponible:', error);
    }
    
    console.log('🏘️ Communautés actives:', communitiesCount, communitiesError);

    // Test 5: Objets récents (30 jours)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentItems, error: recentItemsError } = await supabase
      .from('items')
      .select('id')
      .eq('is_available', true)
      .gte('created_at', thirtyDaysAgo)
      .limit(1000);
    
    console.log('📅 Objets récents (30j):', recentItems?.length || 0, recentItemsError);

    console.log('✅ Tests terminés !');
    
    return {
      users: users?.length || 0,
      items: items?.length || 0,
      exchanges: exchangesCount,
      communities: communitiesCount,
      recentItems: recentItems?.length || 0
    };
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
    return null;
  }
}

// Fonction pour tester les statistiques d'un utilisateur spécifique
export async function testUserStats(userId: string) {
  console.log('🧪 Test des statistiques utilisateur pour:', userId);
  
  try {
    // Objets de l'utilisateur
    const { data: userItems, error: userItemsError } = await supabase
      .from('items')
      .select('id')
      .eq('owner_id', userId)
      .eq('is_available', true)
      .limit(1000);
    
    console.log('📦 Objets de l\'utilisateur:', userItems?.length || 0, userItemsError);

    // Échanges de l'utilisateur (avec gestion d'erreur)
    let userExchangesCount = 0;
    let userExchangesError = null;
    try {
      const result = await supabase
        .from('requests')
        .select('id')
        .or(`requester_id.eq.${userId},owner_id.eq.${userId}`)
        .eq('status', 'completed')
        .limit(1000);
      userExchangesCount = result.data?.length || 0;
      userExchangesError = result.error;
    } catch (error) {
      console.warn('Table requests non disponible pour les statistiques utilisateur:', error);
    }
    
    console.log('🔄 Échanges de l\'utilisateur:', userExchangesCount, userExchangesError);

    // Favoris de l'utilisateur (avec gestion d'erreur)
    let userFavoritesCount = 0;
    let userFavoritesError = null;
    try {
      const result = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .limit(1000);
      userFavoritesCount = result.data?.length || 0;
      userFavoritesError = result.error;
    } catch (error) {
      console.warn('Table favorites non disponible:', error);
    }
    
    console.log('⭐ Favoris de l\'utilisateur:', userFavoritesCount, userFavoritesError);

    // Communautés de l'utilisateur (avec gestion d'erreur)
    let userCommunitiesCount = 0;
    let userCommunitiesError = null;
    try {
      const result = await supabase
        .from('community_members')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .limit(1000);
      userCommunitiesCount = result.data?.length || 0;
      userCommunitiesError = result.error;
    } catch (error) {
      console.warn('Table community_members non disponible:', error);
    }
    
    console.log('🏘️ Communautés de l\'utilisateur:', userCommunitiesCount, userCommunitiesError);

    console.log('✅ Tests utilisateur terminés !');
    
    return {
      itemsPublished: userItems?.length || 0,
      exchangesCompleted: userExchangesCount,
      favoritesCount: userFavoritesCount,
      communitiesJoined: userCommunitiesCount
    };
    
  } catch (error) {
    console.error('❌ Erreur lors des tests utilisateur:', error);
    return null;
  }
}
