# API Documentation TrocAll 📚

## Vue d'ensemble

TrocAll utilise **Supabase** comme Backend-as-a-Service, fournissant une API REST automatique basée sur le schéma PostgreSQL. Cette documentation couvre tous les endpoints disponibles, les types de données et les exemples d'utilisation.

## 🔐 Authentification

### Configuration Supabase

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);
```

### Endpoints d'Authentification

#### Inscription
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});
```

#### Connexion
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});
```

#### Déconnexion
```typescript
const { error } = await supabase.auth.signOut();
```

#### Récupération de session
```typescript
const { data: { session } } = await supabase.auth.getSession();
```

## 👤 Profils Utilisateurs

### Table: `profiles`

#### Structure
```typescript
interface Profile {
  id: string;                    // UUID (clé primaire)
  email: string;                 // Email unique
  full_name?: string;            // Nom complet
  avatar_url?: string;           // URL de l'avatar
  bio?: string;                  // Biographie
  phone?: string;                // Téléphone
  address?: string;              // Adresse
  latitude?: number;             // Latitude GPS
  longitude?: number;            // Longitude GPS
  created_at: string;            // Date de création
  updated_at: string;            // Date de mise à jour
}
```

#### Endpoints

##### Récupérer un profil
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();
```

##### Mettre à jour un profil
```typescript
const { data, error } = await supabase
  .from('profiles')
  .update({
    full_name: 'Nouveau Nom',
    bio: 'Nouvelle biographie',
    updated_at: new Date().toISOString()
  })
  .eq('id', userId);
```

##### Rechercher des profils
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .ilike('full_name', '%john%')
  .limit(10);
```

## 📦 Objets

### Table: `items`

#### Structure
```typescript
interface Item {
  id: string;                    // UUID (clé primaire)
  owner_id: string;              // ID du propriétaire
  title: string;                 // Titre de l'objet
  description?: string;          // Description
  category: ItemCategory;        // Catégorie
  condition: ItemCondition;      // État
  offer_type: OfferType;         // Type d'offre
  desired_items?: string;        // Objets désirés en échange
  brand?: string;               // Marque
  model?: string;               // Modèle
  estimated_value?: number;      // Valeur estimée
  tags?: string[];              // Tags
  available_from?: string;      // Disponible à partir de
  available_to?: string;        // Disponible jusqu'à
  location_hint?: string;       // Indication de localisation
  latitude?: number;            // Latitude GPS
  longitude?: number;           // Longitude GPS
  is_available: boolean;        // Disponibilité
  created_at: string;          // Date de création
  updated_at: string;          // Date de mise à jour
}

type ItemCategory = 'tools' | 'electronics' | 'books' | 'sports' | 'kitchen' | 'garden' | 'toys' | 'services' | 'other';
type ItemCondition = 'excellent' | 'good' | 'fair' | 'poor';
type OfferType = 'loan' | 'trade';
```

#### Endpoints

##### Lister tous les objets
```typescript
const { data, error } = await supabase
  .from('items')
  .select(`
    *,
    owner:profiles(*),
    images:item_images(*)
  `)
  .eq('is_available', true)
  .order('created_at', { ascending: false });
```

##### Créer un objet
```typescript
const { data, error } = await supabase
  .from('items')
  .insert({
    owner_id: userId,
    title: 'Perceuse Bosch',
    description: 'Perceuse en excellent état',
    category: 'tools',
    condition: 'excellent',
    offer_type: 'loan',
    estimated_value: 80,
    tags: ['bricolage', 'outils'],
    latitude: 48.8566,
    longitude: 2.3522
  });
```

##### Rechercher des objets
```typescript
const { data, error } = await supabase
  .from('items')
  .select('*')
  .ilike('title', '%perceuse%')
  .eq('category', 'tools')
  .eq('is_available', true);
```

##### Recherche géolocalisée
```typescript
const { data, error } = await supabase
  .from('items')
  .select('*')
  .not('latitude', 'is', null)
  .not('longitude', 'is', null)
  .gte('latitude', minLat)
  .lte('latitude', maxLat)
  .gte('longitude', minLng)
  .lte('longitude', maxLng);
```

##### Mettre à jour un objet
```typescript
const { data, error } = await supabase
  .from('items')
  .update({
    title: 'Nouveau titre',
    is_available: false,
    updated_at: new Date().toISOString()
  })
  .eq('id', itemId);
```

##### Supprimer un objet
```typescript
const { data, error } = await supabase
  .from('items')
  .delete()
  .eq('id', itemId)
  .eq('owner_id', userId); // Sécurité: seul le propriétaire peut supprimer
```

## 🖼️ Images d'Objets

### Table: `item_images`

#### Structure
```typescript
interface ItemImage {
  id: string;           // UUID (clé primaire)
  item_id: string;      // ID de l'objet
  url: string;          // URL de l'image
  is_primary: boolean;  // Image principale
  created_at: string;   // Date de création
}
```

#### Endpoints

##### Ajouter une image
```typescript
const { data, error } = await supabase
  .from('item_images')
  .insert({
    item_id: itemId,
    url: imageUrl,
    is_primary: false
  });
```

##### Récupérer les images d'un objet
```typescript
const { data, error } = await supabase
  .from('item_images')
  .select('*')
  .eq('item_id', itemId)
  .order('is_primary', { ascending: false });
```

## 📝 Demandes d'Emprunt/Échange

### Table: `requests`

#### Structure
```typescript
interface Request {
  id: string;                    // UUID (clé primaire)
  requester_id: string;          // ID du demandeur
  item_id: string;               // ID de l'objet
  message?: string;              // Message du demandeur
  status: RequestStatus;         // Statut de la demande
  requested_from?: string;       // Date de début souhaitée
  requested_to?: string;         // Date de fin souhaitée
  created_at: string;            // Date de création
  updated_at: string;            // Date de mise à jour
}

type RequestStatus = 'pending' | 'approved' | 'rejected' | 'completed';
```

#### Endpoints

##### Créer une demande
```typescript
const { data, error } = await supabase
  .from('requests')
  .insert({
    requester_id: userId,
    item_id: itemId,
    message: 'Bonjour, je souhaiterais emprunter cet objet',
    status: 'pending',
    requested_from: '2024-01-15',
    requested_to: '2024-01-20'
  });
```

##### Récupérer les demandes d'un utilisateur
```typescript
const { data, error } = await supabase
  .from('requests')
  .select(`
    *,
    item:items(*),
    requester:profiles(*)
  `)
  .eq('requester_id', userId)
  .order('created_at', { ascending: false });
```

##### Récupérer les demandes reçues
```typescript
const { data, error } = await supabase
  .from('requests')
  .select(`
    *,
    item:items(*),
    requester:profiles(*)
  `)
  .eq('item.owner_id', userId)
  .order('created_at', { ascending: false });
```

##### Mettre à jour le statut d'une demande
```typescript
const { data, error } = await supabase
  .from('requests')
  .update({
    status: 'approved',
    updated_at: new Date().toISOString()
  })
  .eq('id', requestId);
```

## 💬 Messages

### Table: `messages`

#### Structure
```typescript
interface Message {
  id: string;           // UUID (clé primaire)
  sender_id: string;     // ID de l'expéditeur
  receiver_id: string;   // ID du destinataire
  content: string;       // Contenu du message
  request_id?: string;  // ID de la demande associée
  created_at: string;    // Date de création
}
```

#### Endpoints

##### Envoyer un message
```typescript
const { data, error } = await supabase
  .from('messages')
  .insert({
    sender_id: userId,
    receiver_id: receiverId,
    content: 'Bonjour, merci pour votre proposition',
    request_id: requestId
  });
```

##### Récupérer une conversation
```typescript
const { data, error } = await supabase
  .from('messages')
  .select(`
    *,
    sender:profiles(*),
    receiver:profiles(*)
  `)
  .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
  .eq('request_id', requestId)
  .order('created_at', { ascending: true });
```

##### Récupérer toutes les conversations
```typescript
const { data, error } = await supabase
  .from('messages')
  .select(`
    *,
    sender:profiles(*),
    receiver:profiles(*)
  `)
  .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
  .order('created_at', { ascending: false });
```

## ⭐ Évaluations

### Table: `user_ratings`

#### Structure
```typescript
interface UserRating {
  id: string;                    // UUID (clé primaire)
  request_id: string;            // ID de la demande
  rater_id: string;              // ID de l'évaluateur
  rated_user_id: string;         // ID de l'utilisateur évalué
  communication_score: number;   // Score communication (1-5)
  punctuality_score: number;     // Score ponctualité (1-5)
  care_score: number;            // Score soin (1-5)
  comment?: string;              // Commentaire
  created_at: string;            // Date de création
}
```

#### Endpoints

##### Créer une évaluation
```typescript
const { data, error } = await supabase
  .from('user_ratings')
  .insert({
    request_id: requestId,
    rater_id: userId,
    rated_user_id: ratedUserId,
    communication_score: 5,
    punctuality_score: 4,
    care_score: 5,
    comment: 'Très bon échange, je recommande !'
  });
```

##### Récupérer les statistiques de réputation
```typescript
const { data, error } = await supabase
  .from('profile_reputation_stats')
  .select('*')
  .eq('profile_id', userId)
  .single();
```

## 🎮 Gamification

### Tables: `user_levels`, `user_badges`, `challenges`

#### Structure
```typescript
interface UserLevel {
  id: string;           // UUID (clé primaire)
  profile_id: string;   // ID du profil
  level: number;         // Niveau actuel
  points: number;        // Points totaux
  title: string;        // Titre du niveau
  created_at: string;   // Date de création
  updated_at: string;   // Date de mise à jour
}

interface UserBadge {
  id: string;           // UUID (clé primaire)
  profile_id: string;   // ID du profil
  badge_id: string;     // ID du badge
  earned_at: string;    // Date d'obtention
  source_type?: string; // Type de source
  source_id?: string;   // ID de la source
}

interface Challenge {
  id: string;           // UUID (clé primaire)
  title: string;        // Titre du défi
  description: string;  // Description
  type: string;         // Type (daily, weekly, monthly)
  target_value: number; // Valeur cible
  reward_points: number; // Points de récompense
  is_active: boolean;   // Actif
  created_at: string;   // Date de création
}
```

#### Endpoints

##### Récupérer les statistiques de gamification
```typescript
const { data, error } = await supabase
  .from('gamification_stats')
  .select('*')
  .eq('profile_id', userId)
  .single();
```

##### Récupérer le niveau d'un utilisateur
```typescript
const { data, error } = await supabase
  .from('user_levels')
  .select('*')
  .eq('profile_id', userId)
  .single();
```

##### Récupérer les badges d'un utilisateur
```typescript
const { data, error } = await supabase
  .from('user_badges')
  .select(`
    *,
    badge:badges(*)
  `)
  .eq('profile_id', userId)
  .order('earned_at', { ascending: false });
```

##### Récupérer le classement
```typescript
const { data, error } = await supabase
  .from('leaderboard')
  .select('*')
  .limit(50);
```

### Fonctions Stockées

##### Ajouter des points
```typescript
const { error } = await supabase.rpc('add_user_points', {
  p_profile_id: userId,
  p_points: 50,
  p_reason: 'Transaction réussie',
  p_source_type: 'transaction',
  p_source_id: requestId
});
```

##### Vérifier les badges
```typescript
const { error } = await supabase.rpc('check_and_award_badges', {
  p_profile_id: userId
});
```

## ❤️ Favoris

### Table: `favorites`

#### Structure
```typescript
interface Favorite {
  id: string;        // UUID (clé primaire)
  user_id: string;   // ID de l'utilisateur
  item_id: string;   // ID de l'objet
  created_at: string; // Date de création
}
```

#### Endpoints

##### Ajouter aux favoris
```typescript
const { data, error } = await supabase
  .from('favorites')
  .insert({
    user_id: userId,
    item_id: itemId
  });
```

##### Récupérer les favoris
```typescript
const { data, error } = await supabase
  .from('favorites')
  .select(`
    *,
    item:items(*)
  `)
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

##### Supprimer des favoris
```typescript
const { data, error } = await supabase
  .from('favorites')
  .delete()
  .eq('user_id', userId)
  .eq('item_id', itemId);
```

## 🔔 Notifications

### Table: `notifications`

#### Structure
```typescript
interface Notification {
  id: string;           // UUID (clé primaire)
  user_id: string;      // ID de l'utilisateur
  type: string;         // Type de notification
  title: string;         // Titre
  message: string;       // Message
  data?: any;           // Données supplémentaires
  is_read: boolean;      // Lu
  created_at: string;    // Date de création
}
```

#### Endpoints

##### Récupérer les notifications
```typescript
const { data, error } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', userId)
  .eq('is_read', false)
  .order('created_at', { ascending: false });
```

##### Marquer comme lu
```typescript
const { data, error } = await supabase
  .from('notifications')
  .update({ is_read: true })
  .eq('id', notificationId);
```

## 🔍 Recherche Avancée

### Requêtes Complexes

#### Recherche multi-critères
```typescript
const { data, error } = await supabase
  .from('items')
  .select(`
    *,
    owner:profiles(*),
    images:item_images(*)
  `)
  .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
  .eq('category', category)
  .eq('is_available', true)
  .gte('estimated_value', minValue)
  .lte('estimated_value', maxValue)
  .order('created_at', { ascending: false });
```

#### Statistiques agrégées
```typescript
const { data, error } = await supabase
  .from('items')
  .select('category, count(*)')
  .eq('is_available', true)
  .group('category');
```

## 🚨 Gestion des Erreurs

### Codes d'Erreur Courants

```typescript
// Erreurs d'authentification
if (error?.code === 'invalid_credentials') {
  // Identifiants invalides
}

// Erreurs de permissions
if (error?.code === 'PGRST301') {
  // Table non accessible (RLS)
}

// Erreurs de validation
if (error?.code === '23505') {
  // Violation de contrainte unique
}

// Erreurs de données manquantes
if (error?.code === 'PGRST116') {
  // Aucune donnée trouvée
}
```

### Gestion des Erreurs dans les Hooks

```typescript
export function useItems() {
  return useQuery({
    queryKey: ['items'],
    queryFn: async (): Promise<Item[]> => {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('is_available', true);

      if (error) {
        if (error.code === 'PGRST116') return [];
        throw new Error(`Erreur lors de la récupération des objets: ${error.message}`);
      }

      return data || [];
    },
    retry: (failureCount, error) => {
      // Ne pas retry pour certaines erreurs
      if (error?.message?.includes('PGRST301')) return false;
      return failureCount < 3;
    },
  });
}
```

## 🔄 Realtime

### Abonnements en Temps Réel

#### Messages de chat
```typescript
const channel = supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `receiver_id=eq.${userId}`
  }, (payload) => {
    // Nouveau message reçu
    console.log('Nouveau message:', payload.new);
  })
  .subscribe();
```

#### Demandes
```typescript
const channel = supabase
  .channel('requests')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'requests',
    filter: `item.owner_id=eq.${userId}`
  }, (payload) => {
    // Nouvelle demande ou mise à jour
    console.log('Demande mise à jour:', payload);
  })
  .subscribe();
```

## 📊 Vues et Fonctions

### Vues Disponibles

- `profile_reputation_stats` - Statistiques de réputation
- `gamification_stats` - Statistiques de gamification
- `leaderboard` - Classement des utilisateurs
- `item_rating_stats` - Statistiques d'évaluation des objets

### Fonctions Stockées

- `calculate_user_level(points)` - Calcul du niveau utilisateur
- `get_level_title(level)` - Titre du niveau
- `add_user_points(profile_id, points, reason, source_type, source_id)` - Ajouter des points
- `check_and_award_badges(profile_id)` - Vérifier et attribuer des badges

---

Cette documentation couvre tous les endpoints disponibles dans l'API TrocAll. Pour plus de détails sur l'implémentation côté client, consultez les hooks dans `src/hooks/`.