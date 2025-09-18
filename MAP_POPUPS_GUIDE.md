# Guide des Popups de Carte 🗺️💬

## ✅ Popups Interactifs Implémentés !

Le système de popups sur les cartes a été ajouté pour afficher les détails des éléments au survol de la souris.

## 🎯 **Fonctionnalités des Popups**

### 📍 **Affichage au Survol**
- **Déclenchement** : Survol du marqueur avec la souris
- **Fermeture** : Sortie de la souris du marqueur
- **Position** : Centré au-dessus du marqueur avec un décalage de 15px

### 🎨 **Contenu du Popup**

#### **En-tête**
- **Icône colorée** : Petite pastille avec la couleur du marqueur
- **Titre** : Nom de l'élément (objet, communauté, utilisateur, etc.)

#### **Badges Informatifs**
- **Catégorie** : Badge gris avec le nom de la catégorie (ex: "Outils", "Électronique")
- **Type** : Badge coloré avec le type d'élément (ex: "Objet", "Communauté")

#### **Pied de Page**
- **Message d'action** : "Cliquez pour plus de détails"

## 🔧 **Implémentation Technique**

### **Interface MapboxMapProps**
```typescript
interface MapboxMapProps {
  // ... autres props
  showPopup?: boolean; // Active/désactive les popups (défaut: true)
}
```

### **Fonction createPopupContent()**
Génère le HTML du popup avec :
- Styles inline pour la compatibilité
- Couleurs dynamiques selon le type de marqueur
- Labels traduits en français
- Design responsive et moderne

### **Gestion des Événements**
```typescript
// Survol du marqueur
el.addEventListener('mouseenter', () => {
  // Créer le popup
});

// Sortie du marqueur
el.addEventListener('mouseleave', () => {
  // Fermer le popup avec délai
});
```

## 🎨 **Styles CSS**

### **Classes Personnalisées**
- `.custom-popup` : Conteneur principal
- `.mapboxgl-popup-content` : Contenu du popup
- `.mapboxgl-popup-tip` : Flèche du popup

### **Propriétés Visuelles**
- **Bordures arrondies** : 12px
- **Ombre portée** : Ombre douce et moderne
- **Pas de bouton fermer** : Fermeture automatique au survol
- **Couleurs cohérentes** : Avec le système de couleurs des marqueurs

## 📍 **Pages avec Popups Activés**

### ✅ **Page des Voisins** (`/neighbours`)
- **Mode Communautés** : Popups violets avec info quartier
- **Mode Utilisateurs** : Popups verts avec nom utilisateur

### ✅ **Carte des Objets** (`NearbyItemsMap`)
- **Objets** : Popups colorés selon la catégorie
- **Communautés** : Popups violets avec statistiques

### ✅ **Page d'Accueil**
- Popups sur tous les objets géolocalisés

## 🎯 **Exemples de Contenu**

### **Objet - Outils**
```
🔴 Mon Perceuse
   [Outils] [Objet]
   Cliquez pour plus de détails
```

### **Communauté**
```
🟣 Quartier Belleville
   [Communauté]
   Cliquez pour plus de détails
```

### **Utilisateur**
```
🟢 Jean Dupont
   [Utilisateur]
   Cliquez pour plus de détails
```

## 🚀 **Avantages**

1. **UX Améliorée** : Information immédiate sans clic
2. **Navigation Fluide** : Pas besoin de charger de nouvelles pages
3. **Design Cohérent** : Couleurs et styles uniformes
4. **Performance** : Popups légers et rapides
5. **Accessibilité** : Texte lisible et contrasté

## ⚙️ **Configuration**

### **Activer/Désactiver les Popups**
```typescript
<MapboxMap
  // ... autres props
  showPopup={true}  // Par défaut
  // ou
  showPopup={false} // Désactiver
/>
```

### **Personnalisation du Contenu**
Modifier la fonction `createPopupContent()` pour :
- Ajouter de nouvelles informations
- Changer le design
- Modifier les couleurs
- Ajouter des icônes

## 🔮 **Évolutions Futures**

- **Images** : Miniatures des objets dans les popups
- **Actions** : Boutons d'action directe (favoris, contact)
- **Animations** : Transitions fluides d'apparition/disparition
- **Responsive** : Adaptation mobile avec popups plus grands
- **Thème** : Mode sombre pour les popups
- **Multilingue** : Support de plusieurs langues
