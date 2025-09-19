import { supabase } from '../services/supabase';

// Fonction pour initialiser les données de gamification pour un utilisateur
export async function initializeGamificationData(profileId: string) {
  try {
    // Vérifier si l'utilisateur a déjà un niveau
    const { data: existingLevel } = await supabase
      .from('user_levels')
      .select('id')
      .eq('profile_id', profileId)
      .single();

    if (existingLevel) {
      console.log('Niveau utilisateur déjà initialisé');
      return;
    }

    // Créer un niveau par défaut
    const { error: levelError } = await supabase
      .from('user_levels')
      // @ts-expect-error - Table user_levels pas encore définie dans les types Supabase
      .insert({
        profile_id: profileId,
        level: 1,
        points: 0,
        title: 'Nouveau membre'
      });

    if (levelError) {
      console.error('Erreur lors de la création du niveau:', levelError);
      return;
    }

    console.log('Données de gamification initialisées avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la gamification:', error);
  }
}

// Fonction pour vérifier et créer les tables si nécessaire
export async function ensureGamificationTables() {
  try {
    // Vérifier si la table user_levels existe
    const { error } = await supabase
      .from('user_levels')
      .select('id')
      .limit(1);

    if (error && error.code === '42P01') {
      console.warn('Les tables de gamification n\'existent pas encore. Veuillez appliquer les migrations.');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erreur lors de la vérification des tables:', error);
    return false;
  }
}
