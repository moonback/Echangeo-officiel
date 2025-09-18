# Guide des Marqueurs de Carte 🗺️

## ✅ Marqueurs Différenciés Implémentés !

Le système de marqueurs sur les cartes a été amélioré pour afficher différents types d'éléments avec des couleurs et formes distinctes.

## 🎨 **Types de Marqueurs**

### 📍 **Objets (Items)**
Les objets sont affichés avec des couleurs différentes selon leur catégorie :

- 🔧 **Outils** : Rouge (`#EF4444`)
- 📱 **Électronique** : Bleu (`#3B82F6`)
- 📚 **Livres** : Violet (`#8B5CF6`)
- 🏃 **Sport** : Vert (`#10B981`)
- 👨‍🍳 **Cuisine** : Orange (`#F59E0B`)
- 🌱 **Jardin** : Vert clair (`#22C55E`)
- 🎮 **Jouets** : Rose (`#EC4899`)
- 👕 **Mode** : Violet clair (`#A855F7`)
- 🪑 **Meubles** : Gris (`#6B7280`)
- 🎵 **Musique** : Orange foncé (`#F97316`)
- 👶 **Bébé** : Jaune (`#FBBF24`)
- 🎨 **Art** : Violet (`#8B5CF6`)
- 💄 **Beauté** : Rose (`#EC4899`)
- 🚗 **Auto** : Gris foncé (`#374151`)
- 💼 **Bureau** : Gris très foncé (`#1F2937`)
- 👥 **Services** : Indigo (`#6366F1`)
- 📦 **Autres** : Gris (`#6B7280`)

### 🏘️ **Communautés**
- **Couleur** : Violet (`#8B5CF6`)
- **Taille** : 24px (plus grand)
- **Forme** : Cercle

### 👤 **Utilisateurs**
- **Couleur** : Vert (`#10B981`)
- **Taille** : 18px (plus petit)
- **Forme** : Cercle

### 🎉 **Événements**
- **Couleur** : Orange (`#F59E0B`)
- **Taille** : 22px
- **Forme** : Cercle

## 🔧 **Implémentation Technique**

### Interface MapboxMarker
```typescript
export interface MapboxMarker {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  imageUrl?: string;
  category?: string;
  type?: 'item' | 'community' | 'user' | 'event';
  color?: string;
}
```

### Fonction getMarkerStyle()
La fonction `getMarkerStyle()` détermine automatiquement le style du marqueur selon :
1. Le type de marqueur (`type`)
2. La catégorie pour les objets (`category`)
3. Une couleur personnalisée (`color`)

## 📍 **Pages avec Marqueurs Différenciés**

### ✅ **Page des Voisins** (`/neighbours`)
- **Mode Communautés** : Marqueurs violets pour les quartiers
- **Mode Utilisateurs** : Marqueurs verts pour les voisins
- **Légende** : Affichage des types de marqueurs

### ✅ **Carte des Objets** (`NearbyItemsMap`)
- Marqueurs colorés selon la catégorie d'objet
- Différenciation communautés vs objets

### ✅ **Page de Détail d'Objet** (`/item/:id`)
- Marqueur rouge pour l'objet
- Marqueur bleu pour l'utilisateur (si géolocalisé)

## 🎯 **Utilisation**

### Exemple d'utilisation
```typescript
const markers = [
  {
    id: 'item-1',
    latitude: 48.8566,
    longitude: 2.3522,
    title: 'Mon objet',
    category: 'tools',
    type: 'item'
  },
  {
    id: 'community-1',
    latitude: 48.8566,
    longitude: 2.3522,
    title: 'Mon quartier',
    type: 'community'
  }
];
```

### Légende Interactive
Le composant `MapLegend` affiche automatiquement les types de marqueurs présents sur la carte.

## 🚀 **Avantages**

1. **Visibilité** : Distinction claire entre les types d'éléments
2. **UX Améliorée** : Navigation plus intuitive sur la carte
3. **Flexibilité** : Couleurs personnalisables par marqueur
4. **Évolutivité** : Facile d'ajouter de nouveaux types
5. **Accessibilité** : Couleurs contrastées et formes distinctes

## 🔮 **Évolutions Futures**

- Icônes personnalisées pour chaque catégorie
- Marqueurs animés pour les événements
- Clustering intelligent des marqueurs
- Filtres par type de marqueur
- Marqueurs avec images de profil
