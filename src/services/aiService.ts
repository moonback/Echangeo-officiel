import type { ItemCategory } from '../types';
import { validateCategoryDetection } from './categoryDetection';

export interface AIAnalysisResult {
  title: string;
  description: string;
  category: ItemCategory;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  brand?: string;
  model?: string;
  estimated_value?: number;
  tags: string[];
  confidence: number; // 0-1
  categoryConfidence?: number; // Confiance spécifique pour la catégorie
  categoryAlternatives?: Array<{
    category: ItemCategory;
    confidence: number;
    reason: string;
  }>;
  categorySuggestions?: string[];
}

interface MistralResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

/**
 * Convertit une image en base64
 */
export const imageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Extraire seulement la partie base64 (sans le préfixe data:image/...)
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Redimensionne une image pour réduire la taille avant l'envoi à l'API
 */
export const resizeImage = (file: File, maxWidth = 800, maxHeight = 600, quality = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculer les nouvelles dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Dessiner l'image redimensionnée
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          } else {
            resolve(file); // Fallback vers le fichier original
          }
        },
        file.type,
        quality
      );
    };
    
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Fonction utilitaire pour gérer les retry avec backoff exponentiel
 */
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      // Si c'est une erreur 429 (rate limit), on retry
      if (error instanceof Error && error.message?.includes('429') && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        console.log(`Tentative ${attempt + 1}/${maxRetries + 1} échouée, retry dans ${Math.round(delay)}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Nombre maximum de tentatives atteint');
};

/**
 * Analyse une image avec l'API Mistral pour extraire les informations de l'objet
 */
export const analyzeImageWithAI = async (file: File): Promise<AIAnalysisResult> => {
  const apiKey = import.meta.env.VITE_MISTRAL_API_KEY;
  
  if (!apiKey) {
    throw new Error('Clé API Mistral manquante. Ajoutez VITE_MISTRAL_API_KEY dans votre fichier .env.local');
  }

  return retryWithBackoff(async () => {
    try {
      // Redimensionner l'image pour réduire la taille
      const resizedFile = await resizeImage(file);
      const base64Image = await imageToBase64(resizedFile);

      const prompt = `Analysez cette image d'objet et retournez UNIQUEMENT un JSON valide avec les informations suivantes :

{
  "title": "Nom court et descriptif de l'objet (max 80 caractères)",
  "description": "Description détaillée de l'objet, son état apparent, ses caractéristiques visibles (max 300 caractères)",
  "category": "Une des catégories suivantes UNIQUEMENT: tools, electronics, books, sports, kitchen, garden, toys, fashion, furniture, music, baby, art, beauty, auto, office, services, other",
  "condition": "État apparent: excellent, good, fair, poor",
  "brand": "Marque si visible (ou null)",
  "model": "Modèle si visible (ou null)",
  "estimated_value": "Valeur estimée en euros (nombre entier, ou null)",
  "tags": ["liste", "de", "mots-clés", "pertinents"],
  "confidence": 0.85
}

GUIDE DE CATÉGORISATION DÉTAILLÉ :

🔧 TOOLS (Outils) :
- Outils manuels : marteaux, tournevis, clés, pinces, scies
- Outils électriques : perceuses, ponceuses, scies circulaires
- Outils de jardinage : bêches, râteaux, sécateurs
- Équipement de bricolage : étaux, établi, coffrets d'outils
- Matériel professionnel : outils de plomberie, électricité

📱 ELECTRONICS (Électronique) :
- Téléphones, tablettes, ordinateurs
- Appareils photo, caméras, drones
- Audio : enceintes, casques, amplificateurs
- Télévision, consoles de jeux
- Petits électroménagers : cafetières, mixeurs, aspirateurs
- Accessoires électroniques : chargeurs, câbles, adaptateurs

📚 BOOKS (Livres) :
- Romans, essais, biographies
- Livres techniques, manuels, guides
- Bandes dessinées, mangas
- Livres pour enfants
- Revues, magazines
- Livres anciens, éditions spéciales

⚽ SPORTS (Sports) :
- Équipement de sport : ballons, raquettes, clubs
- Vêtements de sport : maillots, chaussures, survêtements
- Accessoires : gants, casques, protège-tibias
- Matériel de fitness : haltères, tapis de yoga, vélo d'appartement
- Équipement d'extérieur : tentes, sacs de couchage, bâtons de randonnée

🍳 KITCHEN (Cuisine) :
- Ustensiles de cuisine : casseroles, poêles, couteaux
- Vaisselle : assiettes, verres, tasses
- Électroménager : four, micro-ondes, réfrigérateur
- Accessoires : planches à découper, passoires, moules
- Petit électroménager : robot culinaire, presse-agrumes

🌱 GARDEN (Jardin) :
- Plantes, pots, jardinières
- Outils de jardinage : arrosoirs, binettes, transplantoirs
- Mobilier de jardin : tables, chaises, parasols
- Décorations : statues, fontaines, éclairage
- Accessoires : bâches, tuteurs, étiquettes

🎮 TOYS (Jouets) :
- Jouets pour enfants : poupées, voitures, jeux de construction
- Jeux de société, puzzles, cartes
- Jouets éducatifs : livres interactifs, jeux d'apprentissage
- Jouets d'extérieur : toboggans, balançoires, vélos enfants
- Figurines, peluches, déguisements

👗 FASHION (Mode) :
- Vêtements : robes, pantalons, chemises, pulls, vestes
- Chaussures : bottes, baskets, sandales, talons
- Accessoires : sacs, ceintures, bijoux, montres
- Marques de mode et articles de luxe
- Articles vintage et de collection

🪑 FURNITURE (Mobilier) :
- Meubles : tables, chaises, fauteuils, canapés, lits
- Rangement : armoires, commodes, étagères, placards
- Décoration : éléments décoratifs, éclairage
- Mobilier de jardin et d'extérieur
- Antiquités et meubles anciens

🎵 MUSIC (Musique) :
- Instruments : guitares, pianos, violons, batteries
- Équipement audio : amplificateurs, enceintes, casques
- Supports : CD, vinyles, partitions
- Accessoires : microphones, mixers, pédales
- Équipement de studio et de concert

👶 BABY (Bébé) :
- Puériculture : poussettes, berceaux, chaises hautes
- Jouets pour bébés et enfants en bas âge
- Vêtements pour bébés et enfants
- Accessoires : biberons, doudous, couches
- Équipement de sécurité et de protection

🎨 ART (Art & Loisirs créatifs) :
- Matériel artistique : peintures, pinceaux, toiles
- Artisanat : broderie, tricot, couture, poterie
- Œuvres d'art : tableaux, sculptures, photographies
- Loisirs créatifs : scrapbooking, modelage
- Fournitures pour artistes et créateurs

💄 BEAUTY (Beauté & Bien-être) :
- Cosmétiques : maquillage, parfums, crèmes
- Soins : shampoings, produits de soin, masques
- Bien-être : produits spa, huiles essentielles
- Accessoires de beauté : pinceaux, éponges
- Produits naturels et bio

🚗 AUTO (Auto & Moto) :
- Véhicules : voitures, motos, vélos, scooters
- Pièces détachées : pneus, batteries, filtres
- Accessoires : GPS, sièges auto, porte-vélos
- Outils de garage et équipement de réparation
- Pièces de rechange et consommables

💼 OFFICE (Bureau) :
- Mobilier de bureau : chaises, tables, armoires
- Équipement informatique : ordinateurs, imprimantes
- Fournitures : papeterie, stylos, classeurs
- Accessoires : téléphones, calculatrices, agrafeuses
- Matériel de présentation et organisation

👥 SERVICES (Services) :
- Prestations : cours particuliers, réparations, gardiennage
- Compétences : coiffure, massage, conseil
- Événements : organisation, animation, traiteur
- Transport : covoiturage, déménagement
- Autres services personnalisés

📦 OTHER (Autre) :
- Objets qui ne rentrent dans aucune catégorie ci-dessus
- Objets ambigus ou difficiles à classifier
- Objets uniques ou artisanaux

Règles importantes :
- Soyez précis et factuel dans l'analyse visuelle
- La catégorie doit être exactement une des valeurs listées ci-dessus
- Privilégiez la catégorie la plus spécifique possible
- La condition doit refléter l'état visible de l'objet
- Les tags doivent être en français et pertinents
- L'estimation de valeur doit être réaliste pour le marché français
- Le score de confiance doit refléter la clarté de l'image et la certitude de l'analyse

Répondez UNIQUEMENT avec le JSON, sans texte supplémentaire.`;

      const response = await fetch(MISTRAL_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'mistral-large-latest',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${file.type};base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 1000,
          temperature: 0.1, // Faible température pour des réponses plus déterministes
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // Gestion spécifique des erreurs Mistral
        if (response.status === 429) {
          const errorData = JSON.parse(errorText);
          if (errorData.code === 3505) {
            throw new Error(`Limite de taux dépassée (${errorData.message}). Veuillez réessayer dans quelques instants ou vérifier votre niveau de service Mistral.`);
          }
        }
        
        throw new Error(`Erreur API Mistral: ${response.status} - ${errorText}`);
      }

      const result: MistralResponse = await response.json();
      const content = result.choices[0]?.message?.content;

      if (!content) {
        throw new Error('Réponse vide de l\'API Mistral');
      }

      // Parser le JSON retourné par Mistral
      let analysisResult: AIAnalysisResult;
      try {
        // Nettoyer le contenu au cas où il y aurait du texte supplémentaire
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : content;
        analysisResult = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Erreur de parsing JSON:', parseError, 'Contenu:', content);
        throw new Error('Format de réponse invalide de l\'IA');
      }

      // Validation et nettoyage des données
      const validCategories: ItemCategory[] = ['tools', 'electronics', 'books', 'sports', 'kitchen', 'garden', 'toys', 'fashion', 'furniture', 'music', 'baby', 'art', 'beauty', 'auto', 'office', 'services', 'other'];
      const validConditions = ['excellent', 'good', 'fair', 'poor'];

      if (!validCategories.includes(analysisResult.category)) {
        analysisResult.category = 'other';
      }

      if (!validConditions.includes(analysisResult.condition)) {
        analysisResult.condition = 'good';
      }

      // Nettoyer et valider les autres champs
      analysisResult.title = (analysisResult.title || '').slice(0, 80);
      analysisResult.description = (analysisResult.description || '').slice(0, 300);
      analysisResult.brand = analysisResult.brand || undefined;
      analysisResult.model = analysisResult.model || undefined;
      analysisResult.tags = (analysisResult.tags || []).slice(0, 10); // Limiter à 10 tags
      analysisResult.confidence = Math.max(0, Math.min(1, analysisResult.confidence || 0.5));

      if (analysisResult.estimated_value && (analysisResult.estimated_value < 0 || analysisResult.estimated_value > 100000)) {
        analysisResult.estimated_value = undefined;
      }

      // Validation et amélioration de la détection de catégorie
      const categoryValidation = validateCategoryDetection(
        analysisResult.category,
        analysisResult.title,
        analysisResult.description,
        analysisResult.confidence
      );

      // Appliquer les résultats de la validation
      analysisResult.categoryConfidence = categoryValidation.confidence;
      analysisResult.categoryAlternatives = categoryValidation.alternatives;
      analysisResult.categorySuggestions = categoryValidation.suggestions;

      // Si la validation suggère une meilleure catégorie, l'appliquer
      if (categoryValidation.confidence > analysisResult.confidence + 0.2) {
        analysisResult.category = categoryValidation.category;
        analysisResult.confidence = Math.max(analysisResult.confidence, categoryValidation.confidence);
      }

      return analysisResult;

    } catch (error) {
      console.error('Erreur lors de l\'analyse IA:', error);
      throw error;
    }
  });
};

/**
 * Analyse multiple d'images (traite la première image principale)
 */
export const analyzeImagesWithAI = async (files: File[]): Promise<AIAnalysisResult | null> => {
  if (files.length === 0) return null;
  
  // Analyser la première image (image principale)
  const primaryImage = files[0];
  return await analyzeImageWithAI(primaryImage);
};

/**
 * Suggère des améliorations basées sur l'analyse IA
 */
export const generateImprovementSuggestions = (analysis: AIAnalysisResult): string[] => {
  const suggestions: string[] = [];
  
  if (analysis.confidence < 0.7) {
    suggestions.push('Prenez une photo plus nette pour une meilleure analyse');
  }
  
  if (!analysis.brand) {
    suggestions.push('Ajoutez la marque si elle est visible sur l\'objet');
  }
  
  if (!analysis.model) {
    suggestions.push('Précisez le modèle si vous le connaissez');
  }
  
  if (!analysis.estimated_value) {
    suggestions.push('Ajoutez une estimation de valeur pour faciliter les échanges');
  }
  
  if (analysis.tags.length < 3) {
    suggestions.push('Ajoutez plus de mots-clés pour améliorer la visibilité');
  }
  
  return suggestions;
};
