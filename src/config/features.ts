// Configuration des fonctionnalités de l'application
// Permet d'activer/désactiver des fonctionnalités via des variables d'environnement

export const FEATURES = {
  // Fonctionnalité de dons (en développement)
  DONATIONS: {
    enabled: import.meta.env.VITE_ENABLE_DONATIONS === 'true',
    beta: true, // Indique que c'est en version bêta
    description: 'Système de dons d\'objets entre voisins'
  },
  
  // Fonctionnalités existantes
  COMMUNITIES: {
    enabled: true,
    beta: false,
    description: 'Communautés de quartier'
  },
  
  AI_ANALYSIS: {
    enabled: true,
    beta: false,
    description: 'Analyse IA des objets'
  },
  
  GAMIFICATION: {
    enabled: true,
    beta: false,
    description: 'Système de points et badges'
  }
} as const;

// Fonction utilitaire pour vérifier si une fonctionnalité est activée
export function isFeatureEnabled(feature: keyof typeof FEATURES): boolean {
  return FEATURES[feature].enabled;
}

// Fonction utilitaire pour obtenir les fonctionnalités en version bêta
export function getBetaFeatures(): Array<{ key: string; description: string }> {
  return Object.entries(FEATURES)
    .filter(([_, config]) => config.beta && config.enabled)
    .map(([key, config]) => ({ key, description: config.description }));
}

// Fonction utilitaire pour obtenir toutes les fonctionnalités disponibles
export function getAvailableFeatures(): Array<{ key: string; enabled: boolean; beta: boolean; description: string }> {
  return Object.entries(FEATURES).map(([key, config]) => ({
    key,
    enabled: config.enabled,
    beta: config.beta,
    description: config.description
  }));
}
