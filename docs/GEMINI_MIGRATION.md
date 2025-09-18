# Migration de Mistral vers Gemini

## Résumé des changements

Cette migration remplace l'API Mistral par l'API Google Gemini dans l'application Échangeo.

## Changements effectués

### 1. Services modifiés

- `src/services/aiService.ts` - Analyse d'images avec IA
- `src/services/chatAI.ts` - Suggestions de chat et analyse de sentiment
- `src/services/mediationAI.ts` - Médiation de conflits
- `src/services/compatibilityAI.ts` - Calcul de compatibilité

### 2. Variables d'environnement

**Ancienne variable :**
```
VITE_MISTRAL_API_KEY=your_mistral_api_key
```

**Nouvelle variable :**
```
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 3. Endpoints API

**Ancien endpoint Mistral :**
```
https://api.mistral.ai/v1/chat/completions
```

**Nouvel endpoint Gemini :**
```
https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
```

### 4. Format des requêtes

**Ancien format Mistral :**
```json
{
  "model": "mistral-large-latest",
  "messages": [
    {
      "role": "user",
      "content": "prompt"
    }
  ],
  "max_tokens": 1000,
  "temperature": 0.1
}
```

**Nouveau format Gemini :**
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "prompt"
        }
      ]
    }
  ],
  "generationConfig": {
    "maxOutputTokens": 1000,
    "temperature": 0.1
  }
}
```

### 5. Format des réponses

**Ancien format Mistral :**
```json
{
  "choices": [
    {
      "message": {
        "content": "response"
      }
    }
  ]
}
```

**Nouveau format Gemini :**
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "response"
          }
        ]
      }
    }
  ]
}
```

## Configuration requise

### 1. Obtenir une clé API Gemini

1. Allez sur [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Générez une nouvelle clé API
4. Copiez la clé API

### 2. Configuration locale

Créez un fichier `.env.local` à la racine du projet :

```bash
# Configuration Gemini
VITE_GEMINI_API_KEY=votre_cle_api_gemini_ici
```

### 3. Configuration de production

Ajoutez la variable d'environnement `VITE_GEMINI_API_KEY` dans votre plateforme de déploiement (Netlify, Vercel, etc.).

## Avantages de Gemini

1. **Multimodalité** : Gemini peut traiter du texte, des images, de l'audio et de la vidéo
2. **Performance** : Meilleure compréhension contextuelle
3. **Coût** : Tarification compétitive de Google
4. **Intégration** : Meilleure intégration avec l'écosystème Google

## Fonctionnalités maintenues

Toutes les fonctionnalités existantes sont conservées :

- ✅ Analyse d'images pour détecter les objets
- ✅ Suggestions de chat contextuelles
- ✅ Analyse de sentiment des conversations
- ✅ Amélioration automatique des messages
- ✅ Génération de messages de demande
- ✅ Détection et médiation de conflits
- ✅ Calcul de compatibilité entre utilisateurs

## Tests recommandés

Après la migration, testez les fonctionnalités suivantes :

1. **Upload d'image** : Vérifiez que l'analyse d'objets fonctionne
2. **Chat** : Testez les suggestions de réponse
3. **Messages** : Vérifiez l'amélioration automatique des messages
4. **Conflits** : Testez la détection de conflits dans les conversations

## Support

En cas de problème :

1. Vérifiez que votre clé API Gemini est valide
2. Consultez les logs de la console pour les erreurs API
3. Vérifiez les quotas et limites de votre compte Google AI
4. Assurez-vous que la variable d'environnement est correctement configurée
