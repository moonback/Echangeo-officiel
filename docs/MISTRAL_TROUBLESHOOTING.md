# Guide de Dépannage - API Mistral 🤖

## Erreur 429 - Service Tier Capacity Exceeded

### 🔍 **Diagnostic**

L'erreur `429 - Service tier capacity exceeded for this model` avec le code `3505` indique que vous avez dépassé les limites de votre niveau de service Mistral.

### 📊 **Niveaux de Service Mistral**

| Niveau | Déclenchement | Limites |
|--------|---------------|---------|
| **Niveau 1** | Gratuit | Limites de base |
| **Niveau 2** | 20€ de facturation | Limites augmentées |
| **Niveau 3+** | Sur demande | Limites personnalisées |

### 🛠️ **Solutions Immédiates**

#### 1. **Vérification du Compte**
```bash
# Connectez-vous à votre console Mistral
https://console.mistral.ai
```
- Consultez la section "Limits" 
- Vérifiez votre utilisation en temps réel
- Identifiez les limites dépassées

#### 2. **Augmentation du Niveau de Service**
- **Automatique** : Le niveau 2 se déclenche à 20€ de facturation
- **Manuel** : Contactez le support pour des besoins spécifiques

#### 3. **Optimisation des Requêtes**

##### Réduction de la Fréquence
```typescript
// Implémentation du retry avec backoff exponentiel
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (error.message?.includes('429') && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
};
```

##### Réduction de la Taille des Images
```typescript
// Compression automatique des images
const resizeImage = (file, maxWidth = 800, maxHeight = 600, quality = 0.8) => {
  // Réduit la taille avant l'envoi à l'API
};
```

### 🚨 **Gestion d'Erreurs Améliorée**

#### Interface Utilisateur
- **Messages d'erreur spécifiques** pour les erreurs 429
- **Suggestions contextuelles** pour résoudre le problème
- **Bouton de retry intelligent** avec délai progressif

#### Code de Gestion
```typescript
if (response.status === 429) {
  const errorData = JSON.parse(errorText);
  if (errorData.code === 3505) {
    throw new Error(`Limite de taux dépassée (${errorData.message}). 
      Veuillez réessayer dans quelques instants ou vérifier votre niveau de service Mistral.`);
  }
}
```

### 📈 **Optimisations Recommandées**

#### 1. **Cache des Analyses**
```typescript
// Éviter les re-analyses d'images identiques
const imageHash = await generateImageHash(file);
const cachedResult = await getCachedAnalysis(imageHash);
if (cachedResult) return cachedResult;
```

#### 2. **Batch Processing**
```typescript
// Grouper les analyses pour réduire les appels API
const batchAnalyze = async (files: File[]) => {
  // Traiter plusieurs images en un seul appel si possible
};
```

#### 3. **Fallback Local**
```typescript
// Analyse basique sans IA en cas d'échec
const fallbackAnalysis = (file: File) => {
  return {
    title: file.name.split('.')[0],
    category: 'other',
    condition: 'good',
    confidence: 0.3
  };
};
```

### 🔧 **Configuration Recommandée**

#### Variables d'Environnement
```bash
# .env.local
VITE_MISTRAL_API_KEY=your_api_key_here
VITE_MISTRAL_MAX_RETRIES=3
VITE_MISTRAL_BASE_DELAY=1000
VITE_MISTRAL_ENABLE_CACHE=true
```

#### Paramètres API Optimisés
```typescript
const optimizedParams = {
  model: 'mistral-large-latest',
  max_tokens: 1000,        // Limité pour réduire les coûts
  temperature: 0.1,        // Faible pour des réponses déterministes
  top_p: 0.9,             // Optimisé pour la reconnaissance d'objets
};
```

### 📞 **Support et Contact**

#### Ressources Officielles
- **Documentation** : [help.mistral.ai](https://help.mistral.ai)
- **Console** : [console.mistral.ai](https://console.mistral.ai)
- **Support** : support@mistral.ai

#### Informations à Fournir
- Modèle utilisé (`mistral-large-latest`)
- Volume de requêtes estimé
- Cas d'usage spécifique
- Logs d'erreurs détaillés

### 🎯 **Bonnes Pratiques**

#### Pour les Développeurs
1. **Implémentez toujours un retry** avec backoff exponentiel
2. **Compressez les images** avant l'envoi
3. **Cachez les résultats** pour éviter les re-analyses
4. **Gérez gracieusement les erreurs** avec des fallbacks
5. **Surveillez les limites** de votre compte

#### Pour les Utilisateurs
1. **Attendez quelques instants** avant de réessayer
2. **Vérifiez votre connexion** internet
3. **Utilisez des images de qualité** mais pas trop volumineuses
4. **Contactez le support** si le problème persiste

### 📊 **Monitoring et Métriques**

#### Indicateurs à Surveiller
- **Taux de succès** des analyses IA
- **Temps de réponse** moyen
- **Nombre d'erreurs 429** par jour
- **Coût mensuel** de l'API Mistral

#### Alertes Recommandées
- Seuil de 80% des limites de taux
- Plus de 5 erreurs 429 consécutives
- Temps de réponse > 10 secondes

---

## 🚀 **Améliorations Futures**

### Court Terme
- [ ] Cache Redis pour les analyses
- [ ] Queue de traitement asynchrone
- [ ] Compression d'images avancée
- [ ] Fallback avec modèle local

### Moyen Terme
- [ ] Intégration d'autres fournisseurs IA
- [ ] Analyse batch optimisée
- [ ] Prédiction des limites de taux
- [ ] Dashboard de monitoring

### Long Terme
- [ ] Modèle IA local (Ollama)
- [ ] Edge computing pour l'analyse
- [ ] IA collaborative avec feedback
- [ ] Optimisation automatique des paramètres

---

*Ce guide est maintenu à jour avec les dernières informations de l'API Mistral. Dernière mise à jour : Décembre 2024*
