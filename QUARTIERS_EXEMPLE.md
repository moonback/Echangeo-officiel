# Exemple d'utilisation des marqueurs de quartiers

## 🏘️ Marqueurs de quartiers maintenant visibles !

Les marqueurs de quartiers (`type: 'community'`) sont maintenant correctement affichés sur la carte avec un design distinctif.

### 🎨 Apparence des marqueurs de quartiers

- **Forme** : Cercle violet avec bordure blanche
- **Icône** : 🏘️ (maisons)
- **Taille** : 80px (même taille que les objets)
- **Étiquette** : Nom du quartier sous le marqueur
- **Effet 3D** : Ombre et reflets pour la profondeur

### 📝 Structure des données

```typescript
const markers: MapboxMarker[] = [
  // Marqueurs de quartiers
  {
    id: 'quartier-1',
    type: 'community',           // ← Important !
    latitude: 48.8566,
    longitude: 2.3522,
    title: 'Marais',            // Nom affiché
    neighborhood: 'Marais',     // Quartier pour clustering
  },
  {
    id: 'quartier-2',
    type: 'community',
    latitude: 48.8606,
    longitude: 2.3376,
    title: 'Montmartre',
    neighborhood: 'Montmartre',
  },
  
  // Marqueurs d'objets
  {
    id: 'objet-1',
    type: 'item',               // ← Important !
    latitude: 48.8567,
    longitude: 2.3523,
    title: 'Vélo électrique',
    imageUrl: 'https://example.com/velo.jpg',
    neighborhood: 'Marais',     // Quartier pour clustering
  },
  // ...
];
```

### 🚀 Utilisation complète

```tsx
import { MapboxMap } from './components/MapboxMap';

function App() {
  const markers = [
    // Quartiers
    {
      id: 'marais',
      type: 'community',
      latitude: 48.8566,
      longitude: 2.3522,
      title: 'Marais',
      neighborhood: 'Marais',
    },
    {
      id: 'montmartre',
      type: 'community',
      latitude: 48.8606,
      longitude: 2.3376,
      title: 'Montmartre',
      neighborhood: 'Montmartre',
    },
    
    // Objets dans le Marais
    {
      id: 'velo-1',
      type: 'item',
      latitude: 48.8567,
      longitude: 2.3523,
      title: 'Vélo électrique',
      imageUrl: '/images/velo.jpg',
      neighborhood: 'Marais',
    },
    {
      id: 'livre-1',
      type: 'item',
      latitude: 48.8568,
      longitude: 2.3524,
      title: 'Livre de cuisine',
      imageUrl: '/images/livre.jpg',
      neighborhood: 'Marais',
    },
    
    // Objets à Montmartre
    {
      id: 'appareil-1',
      type: 'item',
      latitude: 48.8607,
      longitude: 2.3377,
      title: 'Appareil photo',
      imageUrl: '/images/appareil.jpg',
      neighborhood: 'Montmartre',
    },
  ];

  return (
    <MapboxMap
      center={{ lat: 48.8566, lng: 2.3522 }}
      zoom={12}
      markers={markers}
      enableClustering={true}
      clusterRadius={0.0005}
      clusterMaxZoom={15}
      onMarkerClick={(id) => {
        const marker = markers.find(m => m.id === id);
        if (marker?.type === 'community') {
          console.log(`Quartier cliqué: ${marker.title}`);
        } else {
          console.log(`Objet cliqué: ${marker?.title}`);
        }
      }}
      onClusterClick={(cluster) => {
        console.log(`Cluster ${cluster.neighborhood}: ${cluster.count} objets`);
      }}
    />
  );
}
```

### 🎯 Comportement attendu

#### **Zoom faible (clustering activé)** :
```
🏘️ Marais          🏘️ Montmartre
🔵 Cluster (2)     🔵 Cluster (1)
```

#### **Zoom élevé (marqueurs individuels)** :
```
🏘️ Marais          🏘️ Montmartre
📷 Vélo électrique 📷 Appareil photo
📷 Livre de cuisine
```

### 🔧 Points importants

1. **Type obligatoire** : `type: 'community'` pour les quartiers
2. **Toujours visibles** : Les quartiers ne sont jamais clusterisés
3. **Design distinctif** : Violet avec icône 🏘️
4. **Étiquettes** : Nom du quartier toujours affiché
5. **Interactions** : Clicables avec callback `onMarkerClick`

### 🎨 Styles appliqués

```css
Marqueur de quartier:
- Background: gradient violet (#8B5CF6 → #7C3AED)
- Bordure: 3px blanc
- Ombre: violette avec effet 3D
- Icône: 🏘️ (16px)
- Étiquette: fond noir semi-transparent
```

### 🚨 Dépannage

Si les quartiers n'apparaissent toujours pas :

1. **Vérifiez le type** : `type: 'community'` obligatoire
2. **Vérifiez les coordonnées** : latitude/longitude valides
3. **Vérifiez le titre** : `title` ou `neighborhood` pour l'étiquette
4. **Console** : Vérifiez les erreurs JavaScript
5. **Zoom** : Les quartiers sont visibles à tous les niveaux de zoom

Les marqueurs de quartiers sont maintenant parfaitement visibles et fonctionnels ! 🎉
