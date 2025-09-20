# Implémentation Mapbox - TrocAll

## 🗺️ Vue d'ensemble

Cette implémentation fournit une carte interactive complète avec Mapbox GL JS pour afficher les quartiers et les objets de l'application TrocAll. Elle inclut un design glass moderne et une interface utilisateur intuitive.

## 🚀 Fonctionnalités

### Carte Interactive
- **Affichage des objets** : Points colorés par catégorie avec clustering automatique
- **Affichage des quartiers** : Marqueurs distincts pour les communautés
- **Géolocalisation** : Position de l'utilisateur avec marqueur personnalisé
- **Styles de carte** : Streets, Satellite, Dark, Outdoors

### Interface Utilisateur
- **Design Glass** : Effet de verre avec backdrop-blur et transparence
- **Mode plein écran** : Carte immersive avec contrôles avancés
- **Légende interactive** : Affichage des catégories et types d'objets
- **Filtres en temps réel** : Recherche, catégories, types d'offres, rayon

### Contrôles Avancés
- **Navigation** : Zoom, rotation, recentrage sur position
- **Visibilité** : Toggle pour afficher/masquer objets et quartiers
- **Clustering** : Groupement automatique des objets proches
- **Popups** : Informations détaillées au clic sur les marqueurs

## 📁 Structure des fichiers

```
src/
├── components/
│   ├── MapboxMap.tsx           # Carte principale intégrée
│   ├── MapboxFullscreenMap.tsx # Carte en plein écran
│   └── MapButton.tsx           # Bouton d'accès à la carte
├── pages/
│   └── MapPage.tsx             # Page dédiée à la carte
└── hooks/
    └── useGeolocation.ts       # Géolocalisation utilisateur
```

## 🔧 Configuration

### Variables d'environnement

Ajoutez votre token Mapbox dans le fichier `.env` :

```env
VITE_MAPBOX_ACCESS_TOKEN=votre_token_mapbox_ici
```

### Token Mapbox

1. Créez un compte sur [Mapbox](https://www.mapbox.com/)
2. Générez un token d'accès public
3. Ajoutez-le à votre fichier `.env`

## 🎨 Design Glass

Le design utilise des effets de verre modernes :

```css
/* Exemple d'effet glass */
.glass-effect {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}
```

## 🎯 Utilisation

### Carte Intégrée

```tsx
import MapboxMap from './components/MapboxMap';

<MapboxMap
  className="h-96"
  onItemClick={(item) => console.log(item)}
  onCommunityClick={(community) => console.log(community)}
  showItems={true}
  showCommunities={true}
/>
```

### Bouton d'Accès

```tsx
import MapButton from './components/MapButton';

// Bouton compact
<MapButton variant="compact" />

// Bouton flottant
<MapButton variant="floating" />

// Bouton par défaut
<MapButton variant="default" />
```

### Carte Plein Écran

```tsx
import MapboxFullscreenMap from './components/MapboxFullscreenMap';

<MapboxFullscreenMap
  onClose={() => setShowMap(false)}
  onItemClick={(item) => navigate(`/items/${item.id}`)}
  onCommunityClick={(community) => navigate(`/communities/${community.id}`)}
/>
```

## 🎨 Catégories et Couleurs

Les objets sont colorés selon leur catégorie :

```typescript
const categoryColors = {
  'bricolage': '#FF6B6B',
  'transport': '#4ECDC4',
  'menage': '#45B7D1',
  'informatique': '#96CEB4',
  'livres': '#FFEAA7',
  'vetements': '#DDA0DD',
  // ... autres catégories
};
```

## 📱 Responsive Design

- **Mobile** : Interface tactile optimisée avec navigation en bas
- **Desktop** : Contrôles latéraux et panneau de filtres
- **Tablet** : Adaptation automatique selon la taille d'écran

## 🔍 Filtres et Recherche

### Filtres Disponibles
- **Recherche textuelle** : Titre des objets et noms des quartiers
- **Catégorie** : Filtrage par type d'objet
- **Type d'offre** : Prêt, Échange, Don
- **Rayon** : Distance de recherche (1-50 km)
- **Disponibilité** : Objets disponibles uniquement

### Clustering
- **Automatique** : Groupement des objets proches
- **Zoom adaptatif** : Dégroupement lors du zoom
- **Compteurs** : Affichage du nombre d'objets dans chaque cluster

## 🎭 Animations

Utilisation de Framer Motion pour des transitions fluides :

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {/* Contenu animé */}
</motion.div>
```

## 🚀 Performance

### Optimisations
- **Lazy loading** : Chargement différé des marqueurs
- **Memoization** : Mise en cache des données filtrées
- **Clustering** : Réduction du nombre de marqueurs affichés
- **Debouncing** : Limitation des requêtes de recherche

### Bonnes Pratiques
- Utilisation de `useCallback` pour les fonctions
- `useMemo` pour les calculs coûteux
- Nettoyage des event listeners
- Gestion des erreurs de géolocalisation

## 🔧 Développement

### Démarrage Rapide

```bash
# Installation des dépendances
npm install

# Démarrage du serveur de développement
npm run dev

# Accès à la carte
http://localhost:5173/map
```

### Tests

```bash
# Tests unitaires
npm run test

# Tests avec interface
npm run test:ui
```

## 📊 Données

### Structure des Objets
```typescript
interface Item {
  id: string;
  title: string;
  category: string;
  latitude?: number;
  longitude?: number;
  offer_type: 'loan' | 'trade' | 'donation';
  // ... autres propriétés
}
```

### Structure des Communautés
```typescript
interface Community {
  id: string;
  name: string;
  city: string;
  latitude?: number;
  longitude?: number;
  // ... autres propriétés
}
```

## 🎯 Navigation

### Routes Disponibles
- `/map` - Page de la carte interactive
- `/items` - Page des objets avec bouton carte
- `/communities` - Page des quartiers avec bouton carte

### Intégration
- **BottomNavigation** : Lien direct vers la carte
- **HomePage** : Bouton flottant pour accès rapide
- **ItemsPage** : Bouton "Voir sur la carte"

## 🎨 Personnalisation

### Styles de Carte
```typescript
const mapStyles = [
  'streets-v11',    // Rues
  'satellite-v11',  // Satellite
  'dark-v11',       // Sombre
  'outdoors-v11'    // Nature
];
```

### Thème
Modifiez les couleurs dans `tailwind.config.js` :

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'brand-500': '#3B82F6', // Bleu principal
        'brand-600': '#2563EB', // Bleu foncé
      }
    }
  }
}
```

## 🐛 Dépannage

### Problèmes Courants

1. **Carte ne s'affiche pas**
   - Vérifiez le token Mapbox
   - Vérifiez la console pour les erreurs

2. **Géolocalisation non disponible**
   - Vérifiez les permissions du navigateur
   - Testez avec HTTPS

3. **Performance lente**
   - Réduisez le nombre d'objets affichés
   - Activez le clustering

### Logs de Débogage

```typescript
// Activation des logs Mapbox
mapboxgl.accessToken = 'your-token';
map.addControl(new mapboxgl.NavigationControl(), 'top-right');
```

## 📈 Améliorations Futures

- [ ] Mode hors ligne avec cache
- [ ] Export de la carte en image
- [ ] Intégration avec les directions
- [ ] Notifications géolocalisées
- [ ] Mode réalité augmentée
- [ ] Analytics d'utilisation

## 📝 Licence

Cette implémentation utilise Mapbox GL JS sous licence BSD-3-Clause.

## 🤝 Contribution

Pour contribuer à cette implémentation :

1. Forkez le projet
2. Créez une branche feature
3. Commitez vos changements
4. Ouvrez une Pull Request

---

**Note** : Cette implémentation est optimisée pour l'application TrocAll et peut nécessiter des adaptations pour d'autres projets.
