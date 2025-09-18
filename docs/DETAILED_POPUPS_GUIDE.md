# Guide des Popups Détaillés pour Objets 🗺️📦

## ✅ Popups Détaillés Implémentés !

Le système de popups détaillés a été créé spécifiquement pour les objets (items) avec des informations complètes et un design moderne.

## 🎯 **Fonctionnalités des Popups Détaillés**

### 📸 **Image de l'Objet**
- **Affichage** : Image principale de l'objet (120px de hauteur)
- **Badge catégorie** : Badge coloré en haut à droite de l'image
- **Fallback** : Fond gris si pas d'image disponible

### 📝 **Informations Principales**
- **Titre** : Nom de l'objet en gras
- **Description** : Texte descriptif (limité à 2 lignes avec ellipsis)
- **Catégorie** : Badge avec couleur correspondante

### 👤 **Informations du Propriétaire**
- **Icône** : 👤 dans un cercle vert
- **Nom** : Nom complet ou email du propriétaire
- **Fallback** : "Propriétaire inconnu" si pas d'info

### ⭐ **État de l'Objet**
- **Icône** : ⭐ dans un cercle coloré selon l'état
- **États** : Neuf (vert), Excellent (bleu), Bon (orange), Correct (rouge), Usé (gris)
- **Couleurs** : Code couleur pour chaque état

### 📍 **Distance**
- **Calcul** : Distance réelle depuis la position utilisateur
- **Affichage** : En mètres (< 1km) ou kilomètres (> 1km)
- **Icône** : 📍 dans un cercle violet

### 💰 **Prix**
- **Affichage** : Prix en euros avec icône 💰
- **Condition** : Seulement si prix > 0
- **Style** : Texte en gras pour mise en valeur

### 📅 **Date d'Ajout**
- **Format** : Date française (ex: "Ajouté 15/12/2023")
- **Style** : Fond gris clair avec icône calendrier
- **Position** : Avant le bouton d'action

### 🔘 **Bouton d'Action**
- **Texte** : "Voir les détails"
- **Couleur** : Couleur du marqueur (catégorie)
- **Effet** : Hover avec élévation et ombre
- **Action** : Clique pour aller à la page de détail

## 🎨 **Design et Styles**

### **Dimensions**
- **Largeur** : 280px minimum, 320px maximum
- **Hauteur** : Adaptative selon le contenu
- **Bordures** : 12px de rayon

### **Animations**
- **Apparition** : Animation slide-in avec scale
- **Durée** : 0.2s avec easing
- **Effet** : Translation Y + scale pour fluidité

### **Couleurs**
- **Fond** : Blanc pur
- **Ombres** : Ombre douce et moderne
- **Bordures** : Gris clair subtil
- **Textes** : Gris foncé pour lisibilité

## 🔧 **Implémentation Technique**

### **Interface MapboxMarker Étendue**
```typescript
export interface MapboxMarker {
  // ... propriétés existantes
  description?: string;
  owner?: string;
  condition?: string;
  price?: number;
  distance?: number;
  createdAt?: string;
  data?: any;
}
```

### **Fonction createDetailedItemPopup()**
- **Génération HTML** : Contenu complet avec styles inline
- **Responsive** : Adaptation mobile-friendly
- **Accessibilité** : Contrastes et tailles appropriés

### **Calcul de Distance**
```typescript
// Formule de Haversine pour distance précise
const R = 6371; // Rayon Terre en km
const dLat = (lat2 - lat1) * Math.PI / 180;
const dLon = (lon2 - lon1) * Math.PI / 180;
// ... calcul complet
```

## 📍 **Pages avec Popups Détaillés**

### ✅ **Carte des Objets** (`NearbyItemsMap`)
- **Données complètes** : Toutes les infos des objets
- **Distance calculée** : Depuis la position utilisateur
- **Images** : Première image de chaque objet

### ✅ **Page d'Accueil**
- **Objets géolocalisés** : Avec popups détaillés
- **Filtrage** : Seulement les objets avec coordonnées

### ✅ **Page des Communautés**
- **Objets du quartier** : Popups détaillés pour les objets locaux

## 🎯 **Exemples de Contenu**

### **Objet - Perceuse**
```
🖼️ [Image de la perceuse]
   🔴 Outils

🔧 Perceuse Bosch Professionnelle
   Perceuse-visseuse sans fil avec batterie lithium...

👤 Jean Dupont
⭐ Excellent
📍 250m
💰 45€

📅 Ajouté 15/12/2023

[Voir les détails] (bouton rouge)
```

### **Objet - Livre**
```
🖼️ [Image du livre]
   🟣 Livres

📚 "Le Petit Prince" - Édition Originale
   Livre en excellent état, édition de 1943...

👤 Marie Martin
⭐ Neuf
📍 1.2km

📅 Ajouté 10/12/2023

[Voir les détails] (bouton violet)
```

## 🚀 **Avantages**

1. **Information Complète** : Toutes les infos importantes visibles
2. **Design Moderne** : Interface élégante et professionnelle
3. **Performance** : Calculs optimisés et rendu rapide
4. **Accessibilité** : Contrastes et tailles appropriés
5. **Responsive** : Adaptation mobile automatique
6. **Interactif** : Animations et effets hover

## ⚙️ **Configuration**

### **Activation Automatique**
Les popups détaillés s'activent automatiquement pour :
- `marker.type === 'item'`
- Tous les autres types utilisent le popup simple

### **Données Requises**
Pour un popup complet, fournir :
```typescript
{
  type: 'item',
  title: 'Nom de l\'objet',
  description: 'Description...',
  imageUrl: 'url-image.jpg',
  category: 'tools',
  owner: 'Jean Dupont',
  condition: 'excellent',
  price: 45,
  distance: 0.25,
  createdAt: '2023-12-15T10:30:00Z'
}
```

## 🔮 **Évolutions Futures**

- **Images multiples** : Carousel d'images dans le popup
- **Actions directes** : Boutons "Ajouter aux favoris", "Contacter"
- **Évaluations** : Notes et avis dans le popup
- **Partage** : Bouton de partage de l'objet
- **Mode sombre** : Thème sombre pour les popups
- **Notifications** : Alertes pour nouveaux objets proches
