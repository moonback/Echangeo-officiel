import type { Message } from '../types';

export interface ChatAISuggestion {
  id: string;
  text: string;
  type: 'response' | 'question' | 'polite' | 'practical';
  confidence: number;
}

export interface ChatAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative';
  tone: 'formal' | 'casual' | 'friendly' | 'professional';
  suggestions: ChatAISuggestion[];
  translation?: string;
  summary?: string;
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Génère des suggestions de réponse contextuelle pour un chat
 */
export const generateChatSuggestions = async (
  messages: Message[],
  context?: {
    itemTitle?: string;
    itemCategory?: string;
    requestType?: 'loan' | 'trade';
    userRelation?: 'owner' | 'requester';
  }
): Promise<ChatAISuggestion[]> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    // Retourner des suggestions par défaut si pas d'API
    return getDefaultSuggestions(context);
  }

  try {
    const conversationHistory = messages
      .slice(-10) // Derniers 10 messages pour le contexte
      .map(m => `${m.sender_id === messages[0]?.sender_id ? 'Vous' : 'Autre'}: ${m.content}`)
      .join('\n');

    const contextInfo = context ? `
Contexte de la conversation :
- Objet : ${context.itemTitle || 'Non spécifié'}
- Catégorie : ${context.itemCategory || 'Non spécifiée'}
- Type d'échange : ${context.requestType === 'loan' ? 'Prêt' : context.requestType === 'trade' ? 'Troc' : 'Non spécifié'}
- Votre rôle : ${context.userRelation === 'owner' ? 'Propriétaire' : context.userRelation === 'requester' ? 'Demandeur' : 'Utilisateur'}
` : '';

    const prompt = `Vous êtes un assistant IA pour une application d'échange d'objets entre voisins. 

${contextInfo}

Historique de la conversation :
${conversationHistory}

Générez 3-4 suggestions de réponse appropriées au contexte. Retournez UNIQUEMENT un JSON avec ce format :

{
  "suggestions": [
    {
      "id": "1",
      "text": "Merci pour votre message ! Je peux vous prêter cet objet demain matin.",
      "type": "response",
      "confidence": 0.9
    },
    {
      "id": "2", 
      "text": "À quelle heure pourriez-vous venir le récupérer ?",
      "type": "question",
      "confidence": 0.8
    }
  ]
}

Types de suggestions :
- "response" : Réponse directe au message
- "question" : Question pour clarifier
- "polite" : Formule de politesse
- "practical" : Information pratique

Règles :
- Suggestions en français, polies et adaptées au contexte
- Longueur : 10-100 caractères
- Ton amical mais respectueux entre voisins
- Adaptées au type d'échange (prêt/troc)`;

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
          maxOutputTokens: 500,
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur API Gemini: ${response.status}`);
    }

    const result = await response.json();
    const content = result.candidates[0]?.content?.parts[0]?.text;

    if (!content) {
      return getDefaultSuggestions(context);
    }

    try {
      const parsed = JSON.parse(content);
      return parsed.suggestions || [];
    } catch {
      return getDefaultSuggestions(context);
    }

  } catch (error) {
    console.error('Erreur génération suggestions chat:', error);
    return getDefaultSuggestions(context);
  }
};

/**
 * Analyse le sentiment et le ton d'une conversation
 */
export const analyzeChatSentiment = async (messages: Message[]): Promise<ChatAnalysis> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey || messages.length === 0) {
    return {
      sentiment: 'neutral',
      tone: 'casual',
      suggestions: [],
    };
  }

  try {
    const conversationText = messages
      .slice(-5) // Derniers 5 messages
      .map(m => m.content)
      .join(' ');

    const prompt = `Analysez le sentiment et le ton de cette conversation entre voisins qui échangent des objets :

"${conversationText}"

Retournez UNIQUEMENT un JSON avec ce format :

{
  "sentiment": "positive|neutral|negative",
  "tone": "formal|casual|friendly|professional", 
  "summary": "Résumé en une phrase de l'état de la conversation"
}`;

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
          maxOutputTokens: 200,
          temperature: 0.3,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur API Gemini: ${response.status}`);
    }

    const result = await response.json();
    const content = result.candidates[0]?.content?.parts[0]?.text;

    if (content) {
      try {
        const parsed = JSON.parse(content);
        return {
          sentiment: parsed.sentiment || 'neutral',
          tone: parsed.tone || 'casual',
          suggestions: [],
          summary: parsed.summary,
        };
      } catch {
        // Fallback
      }
    }

    return {
      sentiment: 'neutral',
      tone: 'casual',
      suggestions: [],
    };

  } catch (error) {
    console.error('Erreur analyse sentiment:', error);
    return {
      sentiment: 'neutral',
      tone: 'casual',
      suggestions: [],
    };
  }
};

/**
 * Améliore un message avec l'IA (correction, politesse, clarté)
 */
export const improveMessage = async (message: string, context?: string): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    return message;
  }

  try {
    const prompt = `Améliorez ce message pour qu'il soit plus poli, clair et adapté à une conversation entre voisins qui échangent des objets :

Message original : "${message}"
${context ? `Contexte : ${context}` : ''}

Règles :
- Gardez le sens original
- Rendez-le plus poli et amical
- Maximum 200 caractères
- En français
- Ton respectueux entre voisins

Retournez UNIQUEMENT le message amélioré, sans guillemets ni formatage.`;

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
          temperature: 0.4,
        },
      }),
    });

    if (!response.ok) {
      return message;
    }

    const result = await response.json();
    const improvedMessage = result.candidates[0]?.content?.parts[0]?.text?.trim();

    return improvedMessage || message;

  } catch (error) {
    console.error('Erreur amélioration message:', error);
    return message;
  }
};

/**
 * Suggestions par défaut quand l'IA n'est pas disponible
 */
const getDefaultSuggestions = (context?: {
  itemTitle?: string;
  itemCategory?: string;
  requestType?: 'loan' | 'trade';
  userRelation?: 'owner' | 'requester';
}): ChatAISuggestion[] => {
  const isOwner = context?.userRelation === 'owner';
  const isLoan = context?.requestType === 'loan';
  
  if (isOwner) {
    return [
      {
        id: '1',
        text: isLoan ? 'Oui, vous pouvez emprunter cet objet !' : 'Votre proposition m\'intéresse !',
        type: 'response',
        confidence: 0.9,
      },
      {
        id: '2',
        text: 'À quelle heure pourriez-vous passer ?',
        type: 'question',
        confidence: 0.8,
      },
      {
        id: '3',
        text: 'Merci pour votre message 😊',
        type: 'polite',
        confidence: 0.7,
      },
    ];
  } else {
    return [
      {
        id: '1',
        text: isLoan ? 'Merci beaucoup pour le prêt !' : 'Merci pour cette opportunité d\'échange !',
        type: 'polite',
        confidence: 0.9,
      },
      {
        id: '2',
        text: 'Je peux passer quand cela vous arrange',
        type: 'practical',
        confidence: 0.8,
      },
      {
        id: '3',
        text: 'Avez-vous des créneaux de disponibilité ?',
        type: 'question',
        confidence: 0.7,
      },
    ];
  }
};

/**
 * Génère un message de demande d'emprunt/troc optimisé par IA
 */
export const generateRequestMessage = async (
  itemTitle: string,
  itemCategory: string,
  requestType: 'loan' | 'trade',
  userMessage?: string
): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    // Message par défaut
    if (requestType === 'loan') {
      return `Bonjour ! J'aimerais emprunter votre ${itemTitle}. ${userMessage || 'Merci d\'avance !'}`;
    } else {
      return `Bonjour ! Votre ${itemTitle} m'intéresse pour un échange. ${userMessage || 'Pouvons-nous discuter ?'}`;
    }
  }

  try {
    const prompt = `Générez un message poli et efficace pour demander ${requestType === 'loan' ? 'un prêt' : 'un échange'} d'objet entre voisins.

Informations :
- Objet : ${itemTitle}
- Catégorie : ${itemCategory}
- Type : ${requestType === 'loan' ? 'Prêt temporaire' : 'Échange définitif'}
- Message utilisateur : ${userMessage || 'Aucun message spécifique'}

Générez un message qui :
- Est poli et respectueux
- Explique clairement l'intention
- Inclut le message utilisateur s'il existe
- Fait maximum 150 caractères
- Utilise un ton amical entre voisins

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
          maxOutputTokens: 100,
          temperature: 0.6,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const result = await response.json();
    const generatedMessage = result.candidates[0]?.content?.parts[0]?.text?.trim();

    return generatedMessage || `Bonjour ! J'aimerais ${requestType === 'loan' ? 'emprunter' : 'échanger'} votre ${itemTitle}. Merci !`;

  } catch (error) {
    console.error('Erreur génération message:', error);
    return `Bonjour ! J'aimerais ${requestType === 'loan' ? 'emprunter' : 'échanger'} votre ${itemTitle}. Merci !`;
  }
};
