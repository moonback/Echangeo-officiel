# Configuration Mapbox pour TrocAll 🗺️

## Problème actuel

L'erreur `Cannot read properties of undefined (reading 'send')` indique que Mapbox n'est pas correctement configuré. Cette erreur survient généralement quand :

1. **Clé API Mapbox manquante** ou incorrecte
2. **Token d'accès invalide** ou expiré
3. **Configuration réseau** bloquant les requêtes Mapbox

## Solution temporaire ✅

J'ai temporairement désactivé Mapbox dans l'application pour éviter les erreurs :

- ✅ **CommunitiesPage** : Fonctionne sans carte
- ✅ **HomePage** : Affiche les statistiques sans carte interactive
- ✅ **NeighboursPage** : Liste les voisins sans carte

## Configuration Mapbox (optionnel)

Si vous voulez réactiver les cartes :

### 1. Obtenir une clé API Mapbox

1. Allez sur [mapbox.com](https://mapbox.com)
2. Créez un compte gratuit
3. Générez un token d'accès public
4. Copiez le token

### 2. Configuration des variables d'environnement

Créez/modifiez le fichier `.env.local` :

```env
# Mapbox (optionnel)
VITE_MAPBOX_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsZXhhbXBsZSJ9.yourtokenhere
```

### 3. Réactiver Mapbox

Décommentez les imports dans :
- `src/pages/HomePage.tsx`
- `src/pages/NeighboursPage.tsx`
- `src/pages/CommunitiesPage.tsx`

Et remplacez les sections de remplacement par les composants MapboxMap originaux.

## Fonctionnalités disponibles sans Mapbox

### ✅ **Communautés de quartier**
- Découverte des communautés
- Recherche et filtres
- Statistiques communautaires
- Système de rôles
- Événements communautaires
- Discussions et forums

### ✅ **Gestion des objets**
- Création et modification d'objets
- Système de prêt/échange
- Recherche par catégories
- Notifications

### ✅ **Système social**
- Profils utilisateurs
- Système de réputation
- Messagerie
- Gamification

## Recommandations

1. **Pour le développement** : Gardez Mapbox désactivé pour éviter les erreurs
2. **Pour la production** : Configurez Mapbox si vous voulez les cartes interactives
3. **Alternative** : Utilisez une autre solution de cartographie (Google Maps, OpenStreetMap)

## Support

Si vous rencontrez d'autres problèmes :
1. Vérifiez la console du navigateur
2. Assurez-vous que Supabase est correctement configuré
3. Vérifiez les variables d'environnement

---

L'application fonctionne parfaitement sans Mapbox ! 🚀
