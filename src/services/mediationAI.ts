import type { Message, Request } from '../types';

export interface ConflictAnalysis {
  hasConflict: boolean;
  conflictLevel: 'low' | 'medium' | 'high';
  issues: string[];
  suggestions: string[];
  mediationMessage?: string;
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Analyse les messages pour détecter des conflits potentiels
 */
export const analyzeConflict = async (
  messages: Message[],
  request?: Request
): Promise<ConflictAnalysis> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey || messages.length < 2) {
    return {
      hasConflict: false,
      conflictLevel: 'low',
      issues: [],
      suggestions: [],
    };
  }

  try {
    const conversationText = messages
      .map(m => m.content)
      .join('\n');

    const contextInfo = request ? `
Contexte de l'échange :
- Objet : ${request.item?.title || 'Non spécifié'}
- Type : ${request.item?.offer_type === 'loan' ? 'Prêt' : 'Troc'}
- Statut : ${request.status}
- Date de demande : ${new Date(request.created_at).toLocaleDateString('fr-FR')}
` : '';

    const prompt = `Analysez cette conversation entre voisins qui échangent des objets pour détecter d'éventuels conflits ou problèmes :

${contextInfo}

Conversation :
${conversationText}

Analysez et retournez UNIQUEMENT un JSON avec ce format :

{
  "hasConflict": false,
  "conflictLevel": "low|medium|high",
  "issues": ["liste des problèmes détectés"],
  "suggestions": ["suggestions pour résoudre les problèmes"],
  "mediationMessage": "Message de médiation si nécessaire"
}

Critères de conflit :
- Mots négatifs, frustration, colère
- Malentendus sur les conditions
- Problèmes de timing ou disponibilité  
- Désaccords sur l'état de l'objet
- Communication difficile

Suggestions de résolution :
- Solutions pratiques et réalistes
- Ton diplomatique et bienveillant
- Rappel des bonnes pratiques Échangeo`;

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 600,
          temperature: 0.3,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const result = await response.json();
    const content = result.candidates[0]?.content?.parts[0]?.text;

    if (!content) {
      return {
        hasConflict: false,
        conflictLevel: 'low',
        issues: [],
        suggestions: [],
      };
    }

    try {
      const analysis = JSON.parse(content);
      return {
        hasConflict: analysis.hasConflict || false,
        conflictLevel: analysis.conflictLevel || 'low',
        issues: analysis.issues || [],
        suggestions: analysis.suggestions || [],
        mediationMessage: analysis.mediationMessage,
      };
    } catch {
      return {
        hasConflict: false,
        conflictLevel: 'low',
        issues: [],
        suggestions: [],
      };
    }

  } catch (error) {
    console.error('Erreur analyse conflit:', error);
    return {
      hasConflict: false,
      conflictLevel: 'low',
      issues: [],
      suggestions: [],
    };
  }
};

/**
 * Génère un message de médiation pour résoudre un conflit
 */
export const generateMediationMessage = async (
  conflictAnalysis: ConflictAnalysis,
  context?: string
): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    return "Il semble y avoir un malentendu. Pourriez-vous clarifier la situation pour que nous trouvions une solution ensemble ?";
  }

  try {
    const prompt = `Générez un message de médiation bienveillant pour résoudre ce conflit entre voisins :

Problèmes identifiés :
${conflictAnalysis.issues.join('\n')}

Suggestions de résolution :
${conflictAnalysis.suggestions.join('\n')}

${context ? `Contexte : ${context}` : ''}

Générez un message qui :
- Est diplomatique et bienveillant
- Propose des solutions concrètes
- Rappelle l'esprit communautaire de Échangeo
- Encourage la communication positive
- Maximum 200 caractères

Retournez UNIQUEMENT le message, sans guillemets.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.5,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const result = await response.json();
    const mediationMessage = result.candidates[0]?.content?.parts[0]?.text?.trim();

    return mediationMessage || "Essayons de trouver une solution qui convient à tous les deux. Que proposez-vous ?";

  } catch (error) {
    console.error('Erreur génération médiation:', error);
    return "Il semble y avoir un malentendu. Pouvons-nous en discuter calmement pour trouver une solution ?";
  }
};
