# Guide d'utilisation du Clustering par Quartier

## 🎯 Fonctionnalités ajoutées

Le composant `MapboxMap` supporte maintenant le **clustering par quartier** pour améliorer la visualisation des marqueurs sur la carte.

### ✨ Nouvelles props disponibles

```typescript
interface MapboxMapProps {
  // ... props existantes
  enableClustering?: boolean;        // Active/désactive le clustering
  clusterRadius?: number;           // Rayon de clustering (défaut: 0.001)
  clusterMaxZoom?: number;          // Zoom max pour clustering (défaut: 14)
  onClusterClick?: (cluster: Cluster) => void; // Callback pour clic sur cluster
}
```

### 🏗️ Types ajoutés

```typescript
export interface Cluster {
  id: string;
  latitude: number;
  longitude: number;
  count: number;           // Nombre de marqueurs dans le cluster
  markers: MapboxMarker[]; // Marqueurs regroupés
  neighborhood?: string;   // Quartier du cluster
}

export interface MapboxMarker {
  // ... propriétés existantes
  neighborhood?: string;   // Quartier du marqueur (requis pour clustering)
}
```

## 🚀 Utilisation

### 1. Activation basique du clustering

```tsx
<MapboxMap
  center={{ lat: 48.8566, lng: 2.3522 }}
  markers={markers}
  enableClustering={true}
  onMarkerClick={(id) => console.log('Marqueur cliqué:', id)}
  onClusterClick={(cluster) => console.log('Cluster cliqué:', cluster)}
/>
```

### 2. Configuration avancée

```tsx
<MapboxMap
  center={{ lat: 48.8566, lng: 2.3522 }}
  markers={markers}
  enableClustering={true}
  clusterRadius={0.0005}      // Rayon plus petit = clusters plus précis
  clusterMaxZoom={16}         // Clustering jusqu'au zoom 16
  onClusterClick={(cluster) => {
    // Zoomer sur le cluster
    map.fitBounds([
      [cluster.longitude - 0.001, cluster.latitude - 0.001],
      [cluster.longitude + 0.001, cluster.latitude + 0.001]
    ]);
  }}
/>
```

### 3. Préparation des données

```typescript
const markers: MapboxMarker[] = [
  {
    id: '1',
    latitude: 48.8566,
    longitude: 2.3522,
    title: 'Produit 1',
    imageUrl: 'https://example.com/image1.jpg',
    neighborhood: 'Marais',        // ← Important pour le clustering
    // ... autres propriétés
  },
  {
    id: '2',
    latitude: 48.8567,
    longitude: 2.3523,
    title: 'Produit 2',
    imageUrl: 'https://example.com/image2.jpg',
    neighborhood: 'Marais',        // ← Même quartier = même cluster
    // ... autres propriétés
  },
  // ...
];
```

## 🎨 Comportement visuel

### Clusters
- **Forme** : Cercles bleus avec bordure blanche
- **Taille** : Proportionnelle au nombre de marqueurs (60px + 5px par marqueur)
- **Contenu** : Nombre de marqueurs dans le cluster
- **Étiquette** : Nom du quartier sous le cluster

### Marqueurs individuels
- **Affichage** : Quand `zoom >= clusterMaxZoom`
- **Style** : Images rondes avec bordure 3D (comme avant)
- **Étiquettes** : Distance sous chaque marqueur

## ⚙️ Paramètres recommandés

### Pour une ville dense (Paris, Lyon)
```typescript
clusterRadius={0.0003}      // Clusters plus petits
clusterMaxZoom={15}         // Clustering jusqu'au zoom 15
```

### Pour une zone rurale
```typescript
clusterRadius={0.001}       // Clusters plus larges
clusterMaxZoom={12}         // Clustering jusqu'au zoom 12
```

### Pour une zone très dense (centre-ville)
```typescript
clusterRadius={0.0001}      // Clusters très précis
clusterMaxZoom={18}         // Clustering jusqu'au zoom 18
```

## 🔄 Transitions automatiques

- **Zoom in** : Les clusters se divisent automatiquement en marqueurs individuels
- **Zoom out** : Les marqueurs se regroupent automatiquement en clusters
- **Recalcul** : Les clusters sont recalculés à chaque changement de zoom

## 🎯 Avantages

1. **Performance** : Moins de marqueurs à afficher = carte plus fluide
2. **Lisibilité** : Évite la superposition des marqueurs
3. **Navigation** : Facilite la découverte des zones avec beaucoup d'objets
4. **UX** : Permet de zoomer rapidement sur les zones d'intérêt
5. **Organisation** : Regroupement logique par quartier

## 📱 Exemple complet

```tsx
import { MapboxMap } from './components/MapboxMap';

function App() {
  const [markers, setMarkers] = useState<MapboxMarker[]>([]);
  const [mapRef, setMapRef] = useState<mapboxgl.Map | null>(null);

  const handleClusterClick = (cluster: Cluster) => {
    console.log(`Cluster ${cluster.neighborhood}: ${cluster.count} objets`);
    
    // Zoomer sur le cluster
    if (mapRef) {
      const bounds = new mapboxgl.LngLatBounds();
      cluster.markers.forEach(marker => {
        bounds.extend([marker.longitude, marker.latitude]);
      });
      mapRef.fitBounds(bounds, { padding: 50 });
    }
  };

  return (
    <MapboxMap
      ref={setMapRef}
      center={{ lat: 48.8566, lng: 2.3522 }}
      zoom={12}
      markers={markers}
      enableClustering={true}
      clusterRadius={0.0005}
      clusterMaxZoom={15}
      onMarkerClick={(id) => console.log('Marqueur:', id)}
      onClusterClick={handleClusterClick}
    />
  );
}
```

## 🚨 Points importants

1. **Propriété `neighborhood`** : Obligatoire pour le clustering par quartier
2. **Performance** : Le clustering améliore les performances avec beaucoup de marqueurs
3. **Responsive** : Les clusters s'adaptent automatiquement au niveau de zoom
4. **Interactions** : Cliquer sur un cluster peut déclencher des actions personnalisées
5. **Fallback** : Si `enableClustering={false}`, affichage normal des marqueurs

Le clustering par quartier transforme votre carte en un outil de navigation intelligent et performant ! 🎉
