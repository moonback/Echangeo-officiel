# Guide : Quartier d'inscription dans CreateItemPage

## 🎯 Objectif
Modifier la page de création d'objets (`CreateItemPage.tsx`) pour que les objets soient automatiquement placés dans le quartier sélectionné lors de l'inscription de l'utilisateur, plutôt que de simplement prendre le premier quartier de l'utilisateur.

## 📋 Problème identifié
Avant cette modification :
- La page `CreateItemPage.tsx` sélectionnait automatiquement la première communauté de l'utilisateur
- Cela ne garantissait pas que ce soit le quartier choisi lors de l'inscription
- L'utilisateur pouvait créer des objets dans un quartier différent de celui qu'il avait choisi à l'inscription

## ✅ Solution implémentée

### 1. Nouveau hook `useUserSignupCommunity`
**Fichier :** `src/hooks/useCommunities.ts`

```typescript
export function useUserSignupCommunity(userId?: string) {
  return useQuery({
    queryKey: ['userSignupCommunity', userId],
    queryFn: async (): Promise<Community | null> => {
      if (!userId) return null;

      // Récupérer le premier quartier rejoint par l'utilisateur (chronologiquement)
      const { data, error } = await supabase
        .from('community_members')
        .select(`
          community:communities(*)
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('joined_at', { ascending: true })
        .limit(1);

      if (error) throw error;
      const firstCommunity = data?.[0]?.community;
      return firstCommunity || null;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 10, // Cache plus long car le quartier d'inscription ne change pas
  });
}
```

**Fonctionnalités :**
- Récupère le premier quartier rejoint par l'utilisateur (chronologiquement)
- Utilise `joined_at` pour déterminer l'ordre chronologique
- Cache plus long car cette information ne change pas
- Retourne `null` si aucun quartier n'est trouvé

### 2. Modification de `CreateItemPage.tsx`
**Changements principaux :**

```typescript
// Import du nouveau hook
import { useUserCommunities, useUserSignupCommunity } from '../hooks/useCommunities';

// Utilisation du hook
const { data: signupCommunity } = useUserSignupCommunity(user?.id);

// Logique de sélection automatique améliorée
React.useEffect(() => {
  if (signupCommunity && !selectedCommunity) {
    setSelectedCommunity(signupCommunity.id);
    console.log('Quartier d\'inscription sélectionné automatiquement:', signupCommunity.name);
  } else if (userCommunities && userCommunities.length > 0 && !selectedCommunity && !signupCommunity) {
    // Fallback : utiliser la première communauté si le quartier d'inscription n'est pas trouvé
    setSelectedCommunity(userCommunities[0].id);
    console.log('Première communauté utilisateur sélectionnée automatiquement:', userCommunities[0].name);
  }
}, [signupCommunity, userCommunities, selectedCommunity]);
```

**Logique de priorité :**
1. **Priorité 1** : Quartier d'inscription (si trouvé)
2. **Priorité 2** : Première communauté de l'utilisateur (fallback)
3. **Priorité 3** : Aucune sélection automatique

### 3. Amélioration de l'interface utilisateur
**Fichier :** `src/components/CreateItemFormSteps/Step4Availability.tsx`

#### Indicateur visuel du quartier d'inscription
```typescript
// Message informatif
{signupCommunity && selectedCommunity === signupCommunity.id ? (
  <span className="block mt-1 text-green-800 font-medium">
    🏠 Votre quartier d'inscription est sélectionné par défaut
  </span>
) : (
  'Votre objet sera automatiquement visible dans le quartier sélectionné.'
)}
```

#### Badge spécial pour le quartier d'inscription
```typescript
{isSignupCommunity && (
  <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
    🏠 Quartier d'inscription
  </span>
)}
```

**Fonctionnalités visuelles :**
- Message explicatif quand le quartier d'inscription est sélectionné
- Badge bleu "🏠 Quartier d'inscription" sur la carte du quartier
- Distinction claire entre quartier d'inscription et autres quartiers
- Interface intuitive et informative

## 🔄 Flux utilisateur amélioré

### Avant
1. Utilisateur s'inscrit et choisit un quartier
2. Utilisateur crée un objet
3. Le premier quartier de l'utilisateur est sélectionné (pas forcément celui d'inscription)
4. Confusion possible pour l'utilisateur

### Après
1. Utilisateur s'inscrit et choisit un quartier
2. Utilisateur crée un objet
3. **Le quartier d'inscription est automatiquement sélectionné**
4. Message clair : "🏠 Votre quartier d'inscription est sélectionné par défaut"
5. Badge visuel sur le quartier d'inscription
6. Utilisateur peut toujours changer de quartier si souhaité

## 🧪 Tests implémentés

### Test unitaire : `src/test/CreateItemWithSignupCommunity.test.tsx`
**Couverture des tests :**
- ✅ Sélection automatique du quartier d'inscription
- ✅ Possibilité de changer de quartier
- ✅ Affichage correct des badges
- ✅ Interface utilisateur appropriée

**Scénarios testés :**
1. **Sélection automatique** : Vérifie que le quartier d'inscription est sélectionné par défaut
2. **Changement de quartier** : Vérifie que l'utilisateur peut choisir un autre quartier
3. **Badges visuels** : Vérifie l'affichage des badges "Quartier d'inscription" et "Membre"

## 📊 Avantages de la solution

### Pour l'utilisateur
- **Cohérence** : Les objets sont créés dans le quartier choisi à l'inscription
- **Clarté** : Interface claire indiquant quel quartier est sélectionné par défaut
- **Flexibilité** : Possibilité de changer de quartier si nécessaire
- **Confiance** : L'utilisateur sait exactement où son objet sera visible

### Pour la plateforme
- **Engagement local** : Encourage les échanges dans le quartier d'inscription
- **Données cohérentes** : Meilleure cohérence entre inscription et création d'objets
- **Expérience fluide** : Réduit la confusion et améliore l'expérience utilisateur
- **Analytics** : Données plus précises sur l'engagement par quartier

## 🔧 Configuration requise

### Base de données
- La table `community_members` doit avoir un champ `joined_at` avec la date d'adhésion
- Les utilisateurs doivent être membres d'au moins un quartier
- Le quartier d'inscription doit être le premier chronologiquement

### Code
- Hook `useUserSignupCommunity` doit être importé dans `CreateItemPage.tsx`
- Le composant `Step4Availability` doit recevoir la prop `signupCommunity`
- Les tests doivent être exécutés pour vérifier le bon fonctionnement

## 🚀 Déploiement

### Étapes de déploiement
1. **Vérifier la base de données** : S'assurer que `joined_at` est correctement rempli
2. **Tester l'inscription** : Créer un nouvel utilisateur et vérifier l'adhésion au quartier
3. **Tester la création d'objets** : Vérifier que le quartier d'inscription est sélectionné par défaut
4. **Vérifier l'interface** : S'assurer que les badges et messages s'affichent correctement

### Vérifications post-déploiement
- [ ] Nouveaux utilisateurs : Le quartier d'inscription est-il sélectionné par défaut ?
- [ ] Utilisateurs existants : Le fallback fonctionne-t-il correctement ?
- [ ] Interface : Les badges et messages s'affichent-ils ?
- [ ] Performance : Le cache du hook fonctionne-t-il ?

## 🔮 Évolutions futures possibles

### Court terme
- [ ] Ajouter une préférence utilisateur pour le quartier par défaut
- [ ] Améliorer les messages d'aide contextuelle
- [ ] Ajouter des statistiques sur l'utilisation par quartier

### Moyen terme
- [ ] Détection automatique du quartier le plus proche
- [ ] Suggestions intelligentes basées sur l'historique
- [ ] Interface de gestion des préférences de quartier

### Long terme
- [ ] Système de recommandations de quartiers
- [ ] Analytics avancées sur l'engagement par quartier
- [ ] Intégration avec des APIs de géolocalisation

## 📝 Notes importantes

### Limitations actuelles
- Le système suppose que le premier quartier rejoint est celui d'inscription
- Si un utilisateur rejoint plusieurs quartiers le même jour, l'ordre peut être imprévisible
- Le cache de 10 minutes peut masquer des changements récents

### Bonnes pratiques
- Toujours tester avec des utilisateurs réels
- Surveiller les logs pour détecter des problèmes de sélection
- Maintenir la cohérence entre inscription et création d'objets
- Documenter les changements pour les autres développeurs

Cette implémentation garantit que les objets créés par les utilisateurs sont automatiquement placés dans leur quartier d'inscription, améliorant ainsi la cohérence et l'expérience utilisateur de la plateforme TrocAll.
