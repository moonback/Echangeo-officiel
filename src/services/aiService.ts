import type { ItemCategory } from '../types';

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
 * Analyse une image avec l'API Mistral pour extraire les informations de l'objet
 */
export const analyzeImageWithAI = async (file: File): Promise<AIAnalysisResult> => {
  const apiKey = import.meta.env.VITE_MISTRAL_API_KEY;
  
  if (!apiKey) {
    throw new Error('Clé API Mistral manquante. Ajoutez VITE_MISTRAL_API_KEY dans votre fichier .env.local');
  }

  try {
    // Redimensionner l'image pour réduire la taille
    const resizedFile = await resizeImage(file);
    const base64Image = await imageToBase64(resizedFile);

    const prompt = `Analysez cette image d'objet et retournez UNIQUEMENT un JSON valide avec les informations suivantes :

{
  "title": "Nom court et descriptif de l'objet (max 80 caractères)",
  "description": "Description détaillée de l'objet, son état apparent, ses caractéristiques visibles (max 300 caractères)",
  "category": "Une des catégories suivantes UNIQUEMENT: tools, electronics, books, sports, kitchen, garden, toys, services, other",
  "condition": "État apparent: excellent, good, fair, poor",
  "brand": "Marque si visible (ou null)",
  "model": "Modèle si visible (ou null)",
  "estimated_value": "Valeur estimée en euros (nombre entier, ou null)",
  "tags": ["liste", "de", "mots-clés", "pertinents"],
  "confidence": 0.85
}

Règles importantes :
- Soyez précis et factuel
- La catégorie doit être exactement une des valeurs listées
- La condition doit refléter l'état visible
- Les tags doivent être en français et pertinents
- L'estimation de valeur doit être réaliste pour le marché français
- Le score de confiance doit refléter la clarté de l'image

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
    const validCategories: ItemCategory[] = ['tools', 'electronics', 'books', 'sports', 'kitchen', 'garden', 'toys', 'services', 'other'];
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

    return analysisResult;

  } catch (error) {
    console.error('Erreur lors de l\'analyse IA:', error);
    throw error;
  }
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
