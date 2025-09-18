import type { ItemCategory } from '../types';

export interface CategoryDetectionResult {
  category: ItemCategory;
  confidence: number;
  alternatives: Array<{
    category: ItemCategory;
    confidence: number;
    reason: string;
  }>;
  suggestions: string[];
}

export interface CategoryKeywords {
  [key: string]: {
    keywords: string[];
    synonyms: string[];
    exclusions: string[];
  };
}

/**
 * Base de données de mots-clés pour chaque catégorie
 */
export const CATEGORY_KEYWORDS: CategoryKeywords = {
  tools: {
    keywords: [
      'marteau', 'tournevis', 'clé', 'pince', 'scie', 'perceuse', 'ponceuse',
      'bêche', 'râteau', 'sécateur', 'étau', 'établi', 'coffret', 'outil',
      'bricolage', 'plomberie', 'électricité', 'professionnel', 'manuel',
      'électrique', 'jardinage', 'réparation', 'maintenance'
    ],
    synonyms: [
      'équipement', 'matériel', 'instrument', 'appareil', 'machine',
      'dispositif', 'engin', 'accessoire', 'pièce'
    ],
    exclusions: [
      'jouet', 'enfant', 'cuisine', 'électronique', 'livre', 'sport'
    ]
  },
  electronics: {
    keywords: [
      'téléphone', 'tablette', 'ordinateur', 'appareil photo', 'caméra',
      'drone', 'enceinte', 'casque', 'amplificateur', 'télévision',
      'console', 'jeu', 'cafetière', 'mixeur', 'aspirateur', 'chargeur',
      'câble', 'adaptateur', 'écran', 'clavier', 'souris', 'imprimante',
      'routeur', 'modem', 'batterie', 'pile'
    ],
    synonyms: [
      'électronique', 'digital', 'numérique', 'technologie', 'high-tech',
      'informatique', 'télécommunication', 'audio', 'vidéo'
    ],
    exclusions: [
      'manuel', 'mécanique', 'analogique', 'traditionnel'
    ]
  },
  books: {
    keywords: [
      'livre', 'roman', 'essai', 'biographie', 'manuel', 'guide',
      'bande dessinée', 'manga', 'revue', 'magazine', 'catalogue',
      'dictionnaire', 'encyclopédie', 'atlas', 'carte', 'brochure',
      'pamphlet', 'feuillet', 'page', 'chapitre', 'volume', 'tome',
      'édition', 'collection', 'bibliothèque'
    ],
    synonyms: [
      'ouvrage', 'publication', 'écrit', 'texte', 'document',
      'imprimé', 'papier', 'lecture', 'littérature'
    ],
    exclusions: [
      'électronique', 'numérique', 'audio', 'vidéo', 'interactif'
    ]
  },
  sports: {
    keywords: [
      'ballon', 'raquette', 'club', 'maillot', 'chaussure', 'survêtement',
      'gant', 'casque', 'protège-tibia', 'haltère', 'tapis', 'yoga',
      'vélo', 'tente', 'sac', 'couchage', 'bâton', 'randonnée',
      'fitness', 'musculation', 'cardio', 'course', 'natation',
      'football', 'basketball', 'tennis', 'golf', 'ski', 'snowboard'
    ],
    synonyms: [
      'sportif', 'athlétique', 'fitness', 'entraînement', 'exercice',
      'compétition', 'performance', 'endurance', 'force'
    ],
    exclusions: [
      'cuisine', 'outil', 'électronique', 'livre', 'jouet enfant'
    ]
  },
  kitchen: {
    keywords: [
      'casserole', 'poêle', 'couteau', 'assiette', 'verre', 'tasse',
      'four', 'micro-ondes', 'réfrigérateur', 'planche', 'découper',
      'passoire', 'moule', 'robot', 'culinaire', 'presse-agrumes',
      'mixeur', 'blender', 'bouilloire', 'grille-pain', 'machine',
      'café', 'vaisselle', 'ustensile', 'cuisine', 'cuisson'
    ],
    synonyms: [
      'culinaire', 'gastronomie', 'cuisine', 'alimentaire', 'ménager',
      'domestique', 'maison', 'repas', 'nourriture'
    ],
    exclusions: [
      'outil', 'professionnel', 'industriel', 'électronique complexe'
    ]
  },
  garden: {
    keywords: [
      'plante', 'pot', 'jardinière', 'arrosoir', 'binette', 'transplantoir',
      'table', 'chaise', 'parasol', 'statue', 'fontaine', 'éclairage',
      'bâche', 'tuteur', 'étiquette', 'terreau', 'engrais', 'graine',
      'fleur', 'arbre', 'arbuste', 'pelouse', 'jardin', 'terrasse',
      'balcon', 'extérieur', 'décoration', 'mobilier'
    ],
    synonyms: [
      'jardinage', 'horticulture', 'botanique', 'extérieur', 'nature',
      'végétal', 'floral', 'paysager', 'terrasse'
    ],
    exclusions: [
      'intérieur', 'cuisine', 'outil professionnel', 'électronique'
    ]
  },
  toys: {
    keywords: [
      'poupée', 'voiture', 'jeu', 'construction', 'société', 'puzzle',
      'carte', 'interactif', 'apprentissage', 'toboggan', 'balançoire',
      'vélo', 'enfant', 'figurine', 'peluche', 'déguisement',
      'jouet', 'enfant', 'bébé', 'éducatif', 'créatif', 'imagination'
    ],
    synonyms: [
      'enfant', 'bébé', 'jeune', 'éducatif', 'ludique', 'divertissement',
      'amusement', 'récréation', 'loisir'
    ],
    exclusions: [
      'adulte', 'professionnel', 'outil', 'électronique complexe'
    ]
  },
  services: {
    keywords: [
      'cours', 'particulier', 'réparation', 'gardiennage', 'coiffure',
      'massage', 'conseil', 'organisation', 'animation', 'traiteur',
      'transport', 'coviturage', 'déménagement', 'nettoyage',
      'service', 'prestation', 'compétence', 'aide', 'assistance'
    ],
    synonyms: [
      'service', 'prestation', 'aide', 'assistance', 'support',
      'accompagnement', 'conseil', 'expertise', 'savoir-faire'
    ],
    exclusions: [
      'objet', 'matériel', 'produit', 'physique', 'tangible'
    ]
  },
  fashion: {
    keywords: [
      'vêtement', 'robe', 'pantalon', 'chemise', 'pull', 'veste',
      'manteau', 'chaussure', 'botte', 'sac', 'ceinture', 'bijou',
      'collier', 'bracelet', 'bague', 'boucle', 'oreille', 'montre',
      'accessoire', 'mode', 'style', 'marque', 'designer', 'couture'
    ],
    synonyms: [
      'mode', 'style', 'élégance', 'beauté', 'apparence',
      'look', 'tenue', 'parure', 'atours'
    ],
    exclusions: [
      'outil', 'électronique', 'livre', 'sport', 'cuisine'
    ]
  },
  furniture: {
    keywords: [
      'table', 'chaise', 'fauteuil', 'canapé', 'lit', 'armoire',
      'commode', 'étagère', 'bureau', 'tabouret', 'meuble',
      'mobilier', 'décoration', 'intérieur', 'salon', 'chambre',
      'cuisine', 'salle', 'bain', 'rangement', 'placard'
    ],
    synonyms: [
      'mobilier', 'ameublement', 'décoration', 'intérieur',
      'équipement', 'agencement', 'aménagement'
    ],
    exclusions: [
      'outil', 'électronique', 'livre', 'jouet', 'vêtement'
    ]
  },
  music: {
    keywords: [
      'guitare', 'piano', 'violon', 'batterie', 'microphone',
      'amplificateur', 'enceinte', 'casque', 'mixer', 'table',
      'tourne-disque', 'cd', 'vinyle', 'partition', 'livre',
      'musique', 'instrument', 'concert', 'groupe', 'chanson'
    ],
    synonyms: [
      'musique', 'son', 'audio', 'mélodie', 'harmonie',
      'rythme', 'concert', 'spectacle'
    ],
    exclusions: [
      'outil', 'électronique complexe', 'vêtement', 'meuble'
    ]
  },
  baby: {
    keywords: [
      'bébé', 'enfant', 'poussette', 'berceau', 'chaise',
      'haute', 'jouet', 'doudou', 'biberon', 'couche',
      'vêtement', 'enfant', 'bébé', 'nourrisson', 'toddler',
      'puériculture', 'maternité', 'enfance'
    ],
    synonyms: [
      'bébé', 'enfant', 'nourrisson', 'toddler', 'puériculture',
      'maternité', 'enfance', 'petit'
    ],
    exclusions: [
      'adulte', 'professionnel', 'outil', 'électronique complexe'
    ]
  },
  art: {
    keywords: [
      'peinture', 'tableau', 'dessin', 'sculpture', 'photo',
      'art', 'créatif', 'loisir', 'manuel', 'artisanat',
      'broderie', 'tricot', 'couture', 'poterie', 'céramique',
      'bijou', 'fait main', 'original', 'unique', 'artistique'
    ],
    synonyms: [
      'art', 'créatif', 'artistique', 'manuel', 'artisanat',
      'loisir', 'création', 'expression'
    ],
    exclusions: [
      'électronique', 'outil professionnel', 'vêtement standard'
    ]
  },
  beauty: {
    keywords: [
      'maquillage', 'cosmétique', 'parfum', 'crème', 'shampoing',
      'soin', 'beauté', 'bien-être', 'santé', 'hygiène',
      'produit', 'naturel', 'bio', 'organique', 'spa',
      'massage', 'relaxation', 'détente', 'pédicure', 'manucure'
    ],
    synonyms: [
      'beauté', 'bien-être', 'soin', 'cosmétique', 'hygiène',
      'santé', 'relaxation', 'détente'
    ],
    exclusions: [
      'outil', 'électronique', 'meuble', 'vêtement'
    ]
  },
  auto: {
    keywords: [
      'voiture', 'moto', 'vélo', 'scooter', 'auto', 'moto',
      'véhicule', 'transport', 'pneu', 'batterie', 'huile',
      'pièce', 'accessoire', 'garage', 'mécanique', 'réparation',
      'entretien', 'carburant', 'essence', 'diesel', 'électrique'
    ],
    synonyms: [
      'véhicule', 'transport', 'mobilité', 'déplacement',
      'automobile', 'motorisation'
    ],
    exclusions: [
      'jouet', 'enfant', 'cuisine', 'livre', 'vêtement'
    ]
  },
  office: {
    keywords: [
      'bureau', 'chaise', 'table', 'ordinateur', 'clavier',
      'souris', 'imprimante', 'scanner', 'téléphone', 'fax',
      'papeterie', 'stylo', 'crayon', 'cahier', 'agenda',
      'classeur', 'dossier', 'trombone', 'agrafeuse', 'perforateur'
    ],
    synonyms: [
      'bureau', 'travail', 'professionnel', 'entreprise',
      'papeterie', 'fourniture', 'matériel'
    ],
    exclusions: [
      'jouet', 'enfant', 'cuisine', 'vêtement', 'sport'
    ]
  },
  other: {
    keywords: [
      'unique', 'artisanal', 'personnalisé', 'sur mesure', 'rare',
      'collection', 'vintage', 'antique', 'rétro', 'original'
    ],
    synonyms: [
      'spécial', 'particulier', 'exceptionnel', 'inhabituel',
      'distinctif', 'remarquable'
    ],
    exclusions: []
  }
};

/**
 * Analyse le titre et la description pour suggérer une catégorie
 */
export const analyzeTextForCategory = (
  title: string,
  description: string
): CategoryDetectionResult => {
  const text = `${title} ${description}`.toLowerCase();
  const scores: Record<ItemCategory, number> = {
    tools: 0,
    electronics: 0,
    books: 0,
    sports: 0,
    kitchen: 0,
    garden: 0,
    toys: 0,
    fashion: 0,
    furniture: 0,
    music: 0,
    baby: 0,
    art: 0,
    beauty: 0,
    auto: 0,
    office: 0,
    services: 0,
    other: 0
  };

  // Calculer les scores pour chaque catégorie
  Object.entries(CATEGORY_KEYWORDS).forEach(([category, data]) => {
    let score = 0;
    
    // Points pour les mots-clés principaux
    data.keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        score += 3;
      }
    });
    
    // Points pour les synonymes
    data.synonyms.forEach(synonym => {
      if (text.includes(synonym)) {
        score += 2;
      }
    });
    
    // Pénalités pour les exclusions
    data.exclusions.forEach(exclusion => {
      if (text.includes(exclusion)) {
        score -= 2;
      }
    });
    
    scores[category as ItemCategory] = Math.max(0, score);
  });

  // Trouver la catégorie avec le score le plus élevé
  const sortedCategories = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([category, score]) => ({
      category: category as ItemCategory,
      score
    }));

  const bestCategory = sortedCategories[0];
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const confidence = totalScore > 0 ? bestCategory.score / totalScore : 0.1;

  // Générer les alternatives
  const alternatives = sortedCategories
    .slice(1, 4)
    .filter(alt => alt.score > 0)
    .map(alt => ({
      category: alt.category,
      confidence: alt.score / totalScore,
      reason: `Mots-clés détectés: ${CATEGORY_KEYWORDS[alt.category].keywords
        .filter(keyword => text.includes(keyword))
        .slice(0, 3)
        .join(', ')}`
    }));

  // Générer des suggestions d'amélioration
  const suggestions: string[] = [];
  if (confidence < 0.7) {
    suggestions.push('Ajoutez plus de détails dans le titre ou la description');
    suggestions.push('Précisez le type d\'objet et son usage');
  }
  if (alternatives.length > 0 && alternatives[0].confidence > confidence * 0.8) {
    suggestions.push(`Considérez aussi la catégorie "${getCategoryLabel(alternatives[0].category)}"`);
  }

  return {
    category: bestCategory.category,
    confidence,
    alternatives,
    suggestions
  };
};

/**
 * Valide et corrige une catégorie détectée par l'IA
 */
export const validateCategoryDetection = (
  aiCategory: ItemCategory,
  title: string,
  description: string,
  aiConfidence: number
): CategoryDetectionResult => {
  const textAnalysis = analyzeTextForCategory(title, description);
  
  // Si l'IA a une confiance élevée (>0.8), on fait confiance à l'IA
  if (aiConfidence > 0.8) {
    return {
      category: aiCategory,
      confidence: aiConfidence,
      alternatives: textAnalysis.alternatives,
      suggestions: []
    };
  }
  
  // Si l'IA a une confiance moyenne (0.5-0.8), on compare avec l'analyse textuelle
  if (aiConfidence >= 0.5) {
    const textConfidence = textAnalysis.confidence;
    
    // Si l'analyse textuelle est plus confiante, on l'utilise
    if (textConfidence > aiConfidence + 0.2) {
      return {
        ...textAnalysis,
        alternatives: [
          {
            category: aiCategory,
            confidence: aiConfidence,
            reason: 'Détection IA avec confiance moyenne'
          },
          ...textAnalysis.alternatives
        ]
      };
    }
  }
  
  // Si l'IA a une confiance faible (<0.5), on privilégie l'analyse textuelle
  if (aiConfidence < 0.5 && textAnalysis.confidence > 0.3) {
    return {
      ...textAnalysis,
      alternatives: [
        {
          category: aiCategory,
          confidence: aiConfidence,
          reason: 'Détection IA avec faible confiance'
        },
        ...textAnalysis.alternatives
      ]
    };
  }
  
  // Par défaut, on garde la catégorie IA mais avec des suggestions
  return {
    category: aiCategory,
    confidence: aiConfidence,
    alternatives: textAnalysis.alternatives,
    suggestions: [
      'Vérifiez manuellement la catégorie suggérée',
      'Ajoutez plus de détails pour améliorer la détection',
      ...textAnalysis.suggestions
    ]
  };
};

/**
 * Génère des suggestions de mots-clés pour améliorer la détection
 */
export const generateCategoryKeywords = (category: ItemCategory): string[] => {
  const keywords = CATEGORY_KEYWORDS[category];
  return [
    ...keywords.keywords.slice(0, 5),
    ...keywords.synonyms.slice(0, 3)
  ];
};

/**
 * Obtient le label d'une catégorie (fonction utilitaire)
 */
function getCategoryLabel(category: ItemCategory): string {
  const labels: Record<ItemCategory, string> = {
    tools: 'Outils',
    electronics: 'Électronique',
    books: 'Livres',
    sports: 'Sports',
    kitchen: 'Cuisine',
    garden: 'Jardin',
    toys: 'Jouets',
    fashion: 'Mode',
    furniture: 'Mobilier',
    music: 'Musique',
    baby: 'Bébé',
    art: 'Art & Loisirs créatifs',
    beauty: 'Beauté & Bien-être',
    auto: 'Auto & Moto',
    office: 'Bureau',
    services: 'Services',
    other: 'Autre'
  };
  return labels[category];
}
