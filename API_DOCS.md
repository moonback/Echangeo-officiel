# API Documentation - TrocAll 📚

## Vue d'ensemble

TrocAll utilise **Supabase** comme Backend-as-a-Service, fournissant une API REST automatique basée sur le schéma PostgreSQL. Cette documentation couvre les endpoints principaux et les patterns d'utilisation.

## 🔐 Authentification

### Base URL
```
https://your-project.supabase.co/rest/v1/
```

### Headers requis
```http
Authorization: Bearer <jwt_token>
apikey: <supabase_anon_key>
Content-Type: application/json
```

## 👤 Profils Utilisateurs

### GET /profiles
Récupère la liste des profils

**Query Parameters:**
- `select` (string): Colonnes à récupérer
- `order` (string): Tri des résultats
- `limit` (number): Nombre de résultats
- `offset` (number): Décalage

**Exemple:**
```typescript
const { data } = await supabase
  .from('profiles')
  .select('id, full_name, avatar_url, bio')
  .order('created_at', { ascending: false })
  .limit(10);
```

### GET /profiles?id=eq.{id}
Récupère un profil spécifique

**Exemple:**
```typescript
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();
```

### PATCH /profiles?id=eq.{id}
Met à jour un profil

**Body:**
```json
{
  "full_name": "Jean Dupont",
  "bio": "Passionné de bricolage",
  "phone": "06 12 34 56 78",
  "address": "123 rue de la Paix, Paris",
  "latitude": 48.8566,
  "longitude": 2.3522
}
```

## 📦 Objets

### GET /items
Récupère la liste des objets

**Query Parameters:**
- `select` (string): Colonnes à récupérer
- `is_available` (boolean): Filtrer par disponibilité
- `category` (string): Filtrer par catégorie
- `owner_id` (uuid): Filtrer par propriétaire

**Exemple:**
```typescript
const { data } = await supabase
  .from('items')
  .select(`
    *,
    owner:profiles(full_name, avatar_url),
    images:item_images(url, is_primary)
  `)
  .eq('is_available', true)
  .eq('category', 'tools');
```

### POST /items
Crée un nouvel objet

**Body:**
```json
{
  "title": "Perceuse visseuse",
  "description": "Perceuse en excellent état",
  "category": "tools",
  "condition": "excellent",
  "brand": "Bosch",
  "estimated_value": 150,
  "tags": ["bricolage", "perceuse"],
  "latitude": 48.8566,
  "longitude": 2.3522,
  "is_available": true
}
```

### PATCH /items?id=eq.{id}
Met à jour un objet

### DELETE /items?id=eq.{id}
Supprime un objet

## 🖼️ Images d'Objets

### POST /item_images
Ajoute une image à un objet

**Body:**
```json
{
  "item_id": "uuid",
  "url": "https://storage.supabase.co/...",
  "is_primary": true
}
```

### GET /item_images?item_id=eq.{item_id}
Récupère les images d'un objet

## 🤝 Demandes d'Emprunt

### GET /requests
Récupère les demandes

**Query Parameters:**
- `requester_id` (uuid): Demandes d'un utilisateur
- `item_id` (uuid): Demandes pour un objet
- `status` (string): Filtrer par statut

**Exemple:**
```typescript
const { data } = await supabase
  .from('requests')
  .select(`
    *,
    requester:profiles(full_name, avatar_url),
    item:items(title, owner:profiles(full_name))
  `)
  .eq('requester_id', userId);
```

### POST /requests
Crée une nouvelle demande

**Body:**
```json
{
  "item_id": "uuid",
  "message": "Bonjour, pourrais-je emprunter votre perceuse ?",
  "requested_from": "2024-01-15T10:00:00Z",
  "requested_to": "2024-01-20T18:00:00Z"
}
```

### PATCH /requests?id=eq.{id}
Met à jour le statut d'une demande

**Body:**
```json
{
  "status": "approved",
  "updated_at": "2024-01-10T15:30:00Z"
}
```

## 💬 Messages

### GET /messages
Récupère les messages

**Query Parameters:**
- `sender_id` (uuid): Messages envoyés
- `receiver_id` (uuid): Messages reçus
- `request_id` (uuid): Messages liés à une demande

**Exemple:**
```typescript
const { data } = await supabase
  .from('messages')
  .select(`
    *,
    sender:profiles(full_name, avatar_url),
    receiver:profiles(full_name, avatar_url)
  `)
  .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
  .order('created_at', { ascending: true });
```

### POST /messages
Envoie un message

**Body:**
```json
{
  "receiver_id": "uuid",
  "content": "Merci pour le prêt !",
  "request_id": "uuid"
}
```

## ⭐ Évaluations

### GET /item_ratings
Récupère les évaluations d'objets

**Query Parameters:**
- `item_id` (uuid): Évaluations d'un objet
- `rater_id` (uuid): Évaluations d'un utilisateur

### POST /item_ratings
Crée une évaluation d'objet

**Body:**
```json
{
  "item_id": "uuid",
  "score": 5,
  "comment": "Excellent objet, très satisfait !"
}
```

### GET /user_ratings
Récupère les évaluations mutuelles

**Query Parameters:**
- `rated_user_id` (uuid): Évaluations reçues
- `rater_id` (uuid): Évaluations données

### POST /user_ratings
Crée une évaluation mutuelle

**Body:**
```json
{
  "request_id": "uuid",
  "rated_user_id": "uuid",
  "communication_score": 5,
  "punctuality_score": 4,
  "care_score": 5,
  "comment": "Très bon échange !"
}
```

## 📊 Vues et Statistiques

### GET /profile_reputation_stats
Statistiques de réputation des utilisateurs

**Exemple:**
```typescript
const { data } = await supabase
  .from('profile_reputation_stats')
  .select('*')
  .eq('profile_id', userId)
  .single();
```

### GET /profile_badges
Badges des utilisateurs

**Exemple:**
```typescript
const { data } = await supabase
  .from('profile_badges')
  .select('*')
  .eq('profile_id', userId);
```

### GET /item_rating_stats
Statistiques des objets

**Exemple:**
```typescript
const { data } = await supabase
  .from('item_rating_stats')
  .select('*')
  .eq('item_id', itemId)
  .single();
```

## 🔍 Filtres et Recherche

### Recherche textuelle
```typescript
const { data } = await supabase
  .from('items')
  .select('*')
  .or('title.ilike.%perceuse%,description.ilike.%perceuse%');
```

### Filtres géographiques
```typescript
const { data } = await supabase
  .from('items')
  .select('*')
  .gte('latitude', minLat)
  .lte('latitude', maxLat)
  .gte('longitude', minLng)
  .lte('longitude', maxLng);
```

### Tri et pagination
```typescript
const { data } = await supabase
  .from('items')
  .select('*')
  .order('created_at', { ascending: false })
  .range(0, 9); // 10 premiers résultats
```

## 📁 Storage (Fichiers)

### Upload d'image
```typescript
const { data, error } = await supabase.storage
  .from('items')
  .upload(`${userId}/${Date.now()}-${filename}`, file);

if (data) {
  const { data: urlData } = supabase.storage
    .from('items')
    .getPublicUrl(data.path);
  
  const publicUrl = urlData.publicUrl;
}
```

### Suppression d'image
```typescript
const { error } = await supabase.storage
  .from('items')
  .remove([filePath]);
```

## 🔄 Realtime (Temps Réel)

### Écouter les changements
```typescript
const subscription = supabase
  .channel('requests')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'requests' },
    (payload) => {
      console.log('Nouvelle demande:', payload.new);
    }
  )
  .subscribe();
```

### Désabonnement
```typescript
subscription.unsubscribe();
```

## 🚨 Gestion d'Erreurs

### Codes d'erreur courants
- `400` - Bad Request (données invalides)
- `401` - Unauthorized (token invalide)
- `403` - Forbidden (permissions insuffisantes)
- `404` - Not Found (ressource introuvable)
- `409` - Conflict (contrainte violée)
- `422` - Unprocessable Entity (validation échouée)

### Exemple de gestion
```typescript
try {
  const { data, error } = await supabase
    .from('items')
    .insert(newItem);
    
  if (error) {
    if (error.code === '23505') {
      throw new Error('Cet objet existe déjà');
    }
    throw new Error(error.message);
  }
  
  return data;
} catch (error) {
  console.error('Erreur:', error.message);
  throw error;
}
```

## 🔒 Sécurité

### Row Level Security (RLS)
Actuellement désactivé en MVP. Pour la production :

```sql
-- Activer RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politique : utilisateurs peuvent lire tous les profils
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT USING (true);

-- Politique : utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE USING (auth.uid() = id);
```

### Validation des données
```typescript
// Côté client avec Zod
const itemSchema = z.object({
  title: z.string().min(1, 'Titre requis'),
  category: z.enum(['tools', 'electronics', 'books', 'sports', 'kitchen', 'garden', 'toys', 'other']),
  condition: z.enum(['excellent', 'good', 'fair', 'poor']),
});

const validatedData = itemSchema.parse(formData);
```

## 📈 Performance

### Optimisations recommandées
- Utiliser `select()` pour limiter les colonnes
- Implémenter la pagination avec `range()`
- Utiliser les index sur les colonnes filtrées
- Mettre en cache les requêtes fréquentes

### Exemple de requête optimisée
```typescript
const { data } = await supabase
  .from('items')
  .select(`
    id, title, category, condition, is_available,
    owner:profiles(id, full_name, avatar_url),
    images:item_images(url, is_primary)
  `)
  .eq('is_available', true)
  .eq('category', 'tools')
  .order('created_at', { ascending: false })
  .limit(20);
```

---

Cette documentation couvre les endpoints principaux de l'API TrocAll. Pour plus de détails, consultez la [documentation Supabase](https://supabase.com/docs). 🚀