# Guide de Débogage des Popups 🐛🔍

## ✅ Problème Résolu : "Propriétaire inconnu"

### 🐛 **Problème Identifié**
Le popup affichait "Propriétaire inconnu" alors que les informations du propriétaire étaient disponibles.

### 🔍 **Cause du Problème**
```typescript
// ❌ INCORRECT - Utilisait item.user
owner: item.user?.full_name || item.user?.email || 'Propriétaire inconnu'

// ✅ CORRECT - Utilise item.owner
owner: item.owner?.full_name || item.owner?.email || 'Propriétaire anonyme'
```

### 🛠️ **Solution Appliquée**
1. **Correction de l'accès aux données** : `item.user` → `item.owner`
2. **Amélioration du fallback** : "Propriétaire inconnu" → "Propriétaire anonyme"
3. **Vérification de la structure** : Confirmation que `item.owner` est bien récupéré

## 🔧 **Structure des Données**

### **Requête Supabase**
```sql
SELECT 
  *,
  owner:profiles!items_owner_id_fkey(*),
  images:item_images(*)
FROM items
```

### **Structure TypeScript**
```typescript
interface Item {
  id: string;
  owner_id: string;
  title: string;
  // ... autres propriétés
  owner?: Profile;  // ← Relation vers le profil
  images?: ItemImage[];
}

interface Profile {
  id: string;
  full_name?: string;
  email: string;
  avatar_url?: string;
  // ... autres propriétés
}
```

## 🎯 **Données Disponibles dans les Popups**

### **Pour les Objets (type: 'item')**
```typescript
{
  id: "uuid",
  title: "Nom de l'objet",
  description: "Description...",
  imageUrl: "url-image.jpg",
  category: "tools",
  type: "item",
  owner: "Jean Dupont",           // ← Corrigé !
  condition: "excellent",
  price: 45,
  distance: 0.25,
  createdAt: "2023-12-15T10:30:00Z"
}
```

### **Hiérarchie des Fallbacks**
1. **Nom complet** : `item.owner?.full_name`
2. **Email** : `item.owner?.email`
3. **Fallback** : `"Propriétaire anonyme"`

## 🔍 **Méthodes de Débogage**

### **1. Vérifier les Données Brutes**
```typescript
// Dans NearbyItemsMap.tsx
console.log('Item data:', item);
console.log('Owner data:', item.owner);
```

### **2. Vérifier la Requête Supabase**
```typescript
// Dans useItems.ts
const { data, error } = await supabase
  .from('items')
  .select(`
    *,
    owner:profiles!items_owner_id_fkey(*),
    images:item_images(*)
  `);
```

### **3. Vérifier les Types**
```typescript
// Vérifier que item.owner existe
if (item.owner) {
  console.log('Owner found:', item.owner.full_name);
} else {
  console.log('No owner data');
}
```

## 🚨 **Problèmes Courants**

### **1. Données Manquantes**
- **Cause** : Requête Supabase incomplète
- **Solution** : Vérifier la clause `select()` avec les relations

### **2. Types Incorrects**
- **Cause** : Interface TypeScript obsolète
- **Solution** : Mettre à jour les types dans `src/types/`

### **3. Fallbacks Inappropriés**
- **Cause** : Messages d'erreur confus
- **Solution** : Utiliser des messages plus clairs

## ✅ **Vérifications Post-Correction**

### **1. Données du Propriétaire**
- ✅ `item.owner?.full_name` : Nom complet
- ✅ `item.owner?.email` : Email de fallback
- ✅ `"Propriétaire anonyme"` : Message clair

### **2. Autres Données**
- ✅ `item.images[0].url` : Première image
- ✅ `item.condition` : État de l'objet
- ✅ `item.price` : Prix (si > 0)
- ✅ `distance` : Distance calculée

### **3. Affichage**
- ✅ Popup détaillé pour les objets
- ✅ Popup simple pour les autres types
- ✅ Informations complètes et lisibles

## 🔮 **Améliorations Futures**

### **1. Debug Mode**
```typescript
// Ajouter un mode debug pour les popups
const DEBUG_POPUPS = import.meta.env.VITE_DEBUG_POPUPS === 'true';

if (DEBUG_POPUPS) {
  console.log('Popup data:', marker);
}
```

### **2. Validation des Données**
```typescript
// Valider les données avant affichage
function validateMarkerData(marker: MapboxMarker) {
  const issues = [];
  if (!marker.title) issues.push('Missing title');
  if (!marker.owner) issues.push('Missing owner');
  if (issues.length > 0) {
    console.warn('Marker data issues:', issues);
  }
}
```

### **3. Tests Automatisés**
```typescript
// Tests pour vérifier la structure des données
describe('Popup Data', () => {
  it('should have owner information', () => {
    const marker = createTestMarker();
    expect(marker.owner).toBeDefined();
    expect(marker.owner).not.toBe('Propriétaire inconnu');
  });
});
```

## 📝 **Notes Importantes**

1. **Toujours vérifier** la structure des données avant l'affichage
2. **Utiliser des fallbacks** appropriés et informatifs
3. **Tester** avec des données réelles de la base
4. **Documenter** les changements de structure
5. **Valider** les types TypeScript régulièrement
