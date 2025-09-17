import type { Profile, Item, Request } from '../types';

export interface CompatibilityScore {
  overall: number; // 0-100
  factors: {
    proximity: number;
    reliability: number;
    communication: number;
    interests: number;
  };
  reasoning: string[];
  recommendations: string[];
}

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

/**
 * Calcule un score de compatibilité entre deux utilisateurs pour un échange
 */
export const calculateCompatibility = async (
  requesterProfile: Profile,
  ownerProfile: Profile,
  item: Item,
  requestHistory?: Request[]
): Promise<CompatibilityScore> => {
  const apiKey = import.meta.env.VITE_MISTRAL_API_KEY;
  
  if (!apiKey) {
    return generateBasicCompatibility(requesterProfile, ownerProfile, item);
  }

  try {
    // Calculer la distance géographique
    const distance = calculateDistance(
      requesterProfile.latitude,
      requesterProfile.longitude,
      ownerProfile.latitude,
      ownerProfile.longitude
    );

    const prompt = `Analysez la compatibilité entre ces deux utilisateurs pour un échange d'objet :

DEMANDEUR :
- Nom : ${requesterProfile.full_name || 'Non renseigné'}
- Bio : ${requesterProfile.bio || 'Aucune bio'}
- Adresse : ${requesterProfile.address || 'Non renseignée'}

PROPRIÉTAIRE :
- Nom : ${ownerProfile.full_name || 'Non renseigné'}  
- Bio : ${ownerProfile.bio || 'Aucune bio'}
- Adresse : ${ownerProfile.address || 'Non renseignée'}

OBJET :
- Titre : ${item.title}
- Catégorie : ${item.category}
- Type : ${item.offer_type === 'loan' ? 'Prêt' : 'Troc'}
- Valeur : ${item.estimated_value ? `${item.estimated_value}€` : 'Non estimée'}

DONNÉES GÉOGRAPHIQUES :
- Distance : ${distance ? `${distance.toFixed(1)} km` : 'Inconnue'}

HISTORIQUE :
- Échanges précédents : ${requestHistory?.length || 0}

Analysez et retournez UNIQUEMENT un JSON avec ce format :

{
  "overall": 85,
  "factors": {
    "proximity": 90,
    "reliability": 80,
    "communication": 85,
    "interests": 80
  },
  "reasoning": [
    "Proximité géographique favorable",
    "Profils complémentaires"
  ],
  "recommendations": [
    "Échange recommandé",
    "Communication directe suggérée"
  ]
}

Critères d'évaluation :
- Proximité : Distance géographique (0-5km = 100, 5-10km = 80, >10km = 60)
- Fiabilité : Complétude des profils, historique
- Communication : Qualité des bios, informations partagées
- Intérêts : Compatibilité des profils et de l'objet

Scores de 0 à 100.`;

    const response = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices[0]?.message?.content;

    if (!content) {
      return generateBasicCompatibility(requesterProfile, ownerProfile, item);
    }

    try {
      const compatibility = JSON.parse(content);
      
      // Validation des scores
      const validateScore = (score: number) => Math.max(0, Math.min(100, score || 50));
      
      return {
        overall: validateScore(compatibility.overall),
        factors: {
          proximity: validateScore(compatibility.factors?.proximity),
          reliability: validateScore(compatibility.factors?.reliability),
          communication: validateScore(compatibility.factors?.communication),
          interests: validateScore(compatibility.factors?.interests),
        },
        reasoning: compatibility.reasoning || [],
        recommendations: compatibility.recommendations || [],
      };
    } catch {
      return generateBasicCompatibility(requesterProfile, ownerProfile, item);
    }

  } catch (error) {
    console.error('Erreur calcul compatibilité:', error);
    return generateBasicCompatibility(requesterProfile, ownerProfile, item);
  }
};

/**
 * Calcule la distance entre deux points géographiques
 */
const calculateDistance = (
  lat1?: number,
  lng1?: number,
  lat2?: number,
  lng2?: number
): number | null => {
  if (!lat1 || !lng1 || !lat2 || !lng2) return null;
  
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371; // Rayon de la Terre en km
  
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) ** 2 + 
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLng / 2) ** 2;
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
};

/**
 * Génère un score de compatibilité basique sans IA
 */
const generateBasicCompatibility = (
  requesterProfile: Profile,
  ownerProfile: Profile,
  item: Item
): CompatibilityScore => {
  const distance = calculateDistance(
    requesterProfile.latitude,
    requesterProfile.longitude,
    ownerProfile.latitude,
    ownerProfile.longitude
  );

  let proximityScore = 70;
  if (distance) {
    if (distance <= 2) proximityScore = 95;
    else if (distance <= 5) proximityScore = 85;
    else if (distance <= 10) proximityScore = 70;
    else proximityScore = 50;
  }

  const reliabilityScore = [
    requesterProfile.full_name ? 20 : 0,
    requesterProfile.bio ? 15 : 0,
    requesterProfile.phone ? 10 : 0,
    requesterProfile.address ? 15 : 0,
  ].reduce((sum, score) => sum + score, 40);

  const communicationScore = [
    ownerProfile.bio ? 25 : 0,
    requesterProfile.bio ? 25 : 0,
  ].reduce((sum, score) => sum + score, 50);

  const interestsScore = item.category === 'tools' ? 80 : 70; // Score par défaut

  const overall = Math.round((proximityScore + reliabilityScore + communicationScore + interestsScore) / 4);

  return {
    overall,
    factors: {
      proximity: proximityScore,
      reliability: reliabilityScore,
      communication: communicationScore,
      interests: interestsScore,
    },
    reasoning: [
      distance ? `Distance: ${distance.toFixed(1)} km` : 'Position non renseignée',
      'Profils partiellement complétés',
    ],
    recommendations: [
      overall >= 80 ? 'Échange fortement recommandé' : 
      overall >= 60 ? 'Échange recommandé avec précautions' : 
      'Échange possible mais prudence conseillée',
    ],
  };
};
