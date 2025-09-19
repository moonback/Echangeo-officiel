# Documentation API Échangeo 📚

## Vue d'ensemble

Échangeo utilise **Supabase** comme backend-as-a-service, fournissant une API REST automatique basée sur le schéma de base de données PostgreSQL. Cette documentation couvre les endpoints principaux et les patterns d'utilisation.

## Configuration

### Client Supabase
```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabase = createClient<Database>(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);
```

## Authentification

### Inscription
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      full_name: 'John Doe',
      phone: '+33123456789'
    }
  }
});
```

### Connexion
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});
```

### Déconnexion
```typescript
const { error } = await supabase.auth.signOut();
```

### Récupération du profil utilisateur
```typescript
const { data: { user } } = await supabase.auth.getUser();
```

## Gestion des Profils

### Créer un profil
```typescript
const { data, error } = await supabase
  .from('profiles')
  .insert({
    id: user.id,
    email: user.email,
    full_name: 'John Doe',
    bio: 'Passionné de bricolage',
    phone: '+33123456789',
    address: '123 Rue de la Paix, Paris',
    latitude: 48.8566,
    longitude: 2.3522
  });
```

### Récupérer un profil
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();
```

### Mettre à jour un profil
```typescript
const { data, error } = await supabase
  .from('profiles')
  .update({
    full_name: 'John Smith',
    bio: 'Nouvelle bio',
    phone: '+33987654321'
  })
  .eq('id', userId);
```

### Rechercher des profils par localisation
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .not('latitude', 'is', null)
  .not('longitude', 'is', null);
```

## Gestion des Objets

### Créer un objet
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
    brand: 'Bosch',
    model: 'GSB 13 RE',
    estimated_value: 80,
    tags: ['bricolage', 'perceuse', 'outils'],
    available_from: '2024-01-01T00:00:00Z',
    available_to: '2024-12-31T23:59:59Z',
    location_hint: 'Dans mon garage',
    latitude: 48.8566,
    longitude: 2.3522,
    community_id: communityId,
    is_available: true
  });
```

### Récupérer tous les objets disponibles
```typescript
const { data, error } = await supabase
  .from('items')
  .select(`
    *,
    owner:profiles(*),
    images:item_images(*),
    average_rating,
    ratings_count
  `)
  .eq('is_available', true)
  .order('created_at', { ascending: false });
```

### Récupérer un objet par ID
```typescript
const { data, error } = await supabase
  .from('items')
  .select(`
    *,
    owner:profiles(*),
    images:item_images(*),
    average_rating,
    ratings_count
  `)
  .eq('id', itemId)
  .single();
```

### Rechercher des objets par catégorie
```typescript
const { data, error } = await supabase
  .from('items')
  .select('*')
  .eq('category', 'tools')
  .eq('is_available', true);
```

### Recherche géolocalisée (dans un rayon)
```typescript
const { data, error } = await supabase
  .rpc('search_nearby_items', {
    user_lat: 48.8566,
    user_lng: 2.3522,
    radius_km: 5
  });
```

### Recherche par texte (titre et description)
```typescript
const { data, error } = await supabase
  .from('items')
  .select('*')
  .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
  .eq('is_available', true);
```

### Mettre à jour un objet
```typescript
const { data, error } = await supabase
  .from('items')
  .update({
    title: 'Nouveau titre',
    description: 'Nouvelle description',
    is_available: false
  })
  .eq('id', itemId)
  .eq('owner_id', userId); // Sécurité : seul le propriétaire peut modifier
```

### Supprimer un objet
```typescript
const { data, error } = await supabase
  .from('items')
  .delete()
  .eq('id', itemId)
  .eq('owner_id', userId);
```

## Gestion des Images

### Upload d'image vers Supabase Storage
```typescript
const uploadImage = async (file: File, itemId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${itemId}/${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('items')
    .upload(fileName, file);
    
  if (error) throw error;
  
  // Obtenir l'URL publique
  const { data: { publicUrl } } = supabase.storage
    .from('items')
    .getPublicUrl(fileName);
    
  return publicUrl;
};
```

### Enregistrer une image en base
```typescript
const { data, error } = await supabase
  .from('item_images')
  .insert({
    item_id: itemId,
    url: imageUrl,
    is_primary: isPrimary
  });
```

### Récupérer les images d'un objet
```typescript
const { data, error } = await supabase
  .from('item_images')
  .select('*')
  .eq('item_id', itemId)
  .order('is_primary', { ascending: false });
```

## Gestion des Demandes

### Créer une demande
```typescript
const { data, error } = await supabase
  .from('requests')
  .insert({
    requester_id: userId,
    item_id: itemId,
    message: 'Bonjour, je souhaiterais emprunter cet objet',
    status: 'pending',
    requested_from: '2024-01-15T00:00:00Z',
    requested_to: '2024-01-20T23:59:59Z'
  });
```

### Récupérer les demandes reçues
```typescript
const { data, error } = await supabase
  .from('requests')
  .select(`
    *,
    requester:profiles(*),
    item:items(*)
  `)
  .eq('item.owner_id', userId)
  .order('created_at', { ascending: false });
```

### Récupérer les demandes envoyées
```typescript
const { data, error } = await supabase
  .from('requests')
  .select(`
    *,
    item:items(*)
  `)
  .eq('requester_id', userId)
  .order('created_at', { ascending: false });
```

### Mettre à jour le statut d'une demande
```typescript
const { data, error } = await supabase
  .from('requests')
  .update({ status: 'approved' })
  .eq('id', requestId)
  .eq('item.owner_id', userId); // Sécurité : seul le propriétaire peut approuver
```

## Système de Messagerie

### Envoyer un message
```typescript
const { data, error } = await supabase
  .from('messages')
  .insert({
    sender_id: userId,
    receiver_id: receiverId,
    content: 'Bonjour, merci pour votre réponse !',
    request_id: requestId // Optionnel : lier à une demande
  });
```

### Récupérer les conversations
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

### Récupérer les messages d'une conversation
```typescript
const { data, error } = await supabase
  .from('messages')
  .select(`
    *,
    sender:profiles(*),
    receiver:profiles(*)
  `)
  .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
  .order('created_at', { ascending: true });
```

## Système de Favoris

### Ajouter aux favoris
```typescript
const { data, error } = await supabase
  .from('favorites')
  .insert({
    user_id: userId,
    item_id: itemId
  });
```

### Retirer des favoris
```typescript
const { data, error } = await supabase
  .from('favorites')
  .delete()
  .eq('user_id', userId)
  .eq('item_id', itemId);
```

### Récupérer les favoris
```typescript
const { data, error } = await supabase
  .from('favorites')
  .select(`
    *,
    item:items(
      *,
      owner:profiles(*),
      images:item_images(*)
    )
  `)
  .eq('user_id', userId);
```

## Système de Notation

### Noter un objet
```typescript
const { data, error } = await supabase
  .from('item_ratings')
  .insert({
    item_id: itemId,
    rater_id: userId,
    score: 5,
    comment: 'Excellent objet, très satisfait !'
  });
```

### Noter un utilisateur
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
    comment: 'Très bon échange, personne de confiance'
  });
```

### Récupérer les statistiques de réputation
```typescript
const { data, error } = await supabase
  .from('profile_reputation_stats')
  .select('*')
  .eq('profile_id', userId)
  .single();
```

## Gestion des Communautés

### Créer une communauté
```typescript
const { data, error } = await supabase
  .from('communities')
  .insert({
    name: 'Quartier Belleville',
    description: 'Communauté des habitants de Belleville',
    city: 'Paris',
    postal_code: '75019',
    country: 'France',
    center_latitude: 48.8722,
    center_longitude: 2.3767,
    radius_km: 2,
    created_by: userId
  });
```

### Récupérer les communautés proches
```typescript
const { data, error } = await supabase
  .rpc('search_nearby_communities', {
    user_lat: 48.8566,
    user_lng: 2.3522,
    radius_km: 10
  });
```

### Rejoindre une communauté
```typescript
const { data, error } = await supabase
  .from('community_members')
  .insert({
    community_id: communityId,
    user_id: userId,
    role: 'member'
  });
```

### Récupérer les membres d'une communauté
```typescript
const { data, error } = await supabase
  .from('community_members')
  .select(`
    *,
    user:profiles(*)
  `)
  .eq('community_id', communityId)
  .eq('is_active', true);
```

## Système de Gamification

### Récupérer les points et badges
```typescript
const { data, error } = await supabase
  .from('user_gamification')
  .select(`
    *,
    badges:user_badges(
      *,
      badge:badges(*)
    )
  `)
  .eq('user_id', userId)
  .single();
```

### Ajouter des points
```typescript
const { data, error } = await supabase
  .from('user_gamification')
  .update({
    total_points: totalPoints + newPoints,
    level: newLevel
  })
  .eq('user_id', userId);
```

## Administration

### Récupérer les statistiques globales
```typescript
const { data, error } = await supabase
  .from('admin_stats')
  .select('*')
  .single();
```

### Bannir un utilisateur
```typescript
const { data, error } = await supabase
  .from('user_bans')
  .insert({
    user_id: userId,
    banned_by: adminId,
    reason: 'Comportement inapproprié',
    expires_at: '2024-12-31T23:59:59Z'
  });
```

### Suspendre un objet
```typescript
const { data, error } = await supabase
  .from('items')
  .update({
    is_available: false,
    suspended_by_admin: true,
    suspension_reason: 'Contenu inapproprié'
  })
  .eq('id', itemId);
```

## Fonctions RPC Personnalisées

### Recherche géolocalisée d'objets
```sql
CREATE OR REPLACE FUNCTION search_nearby_items(
  user_lat double precision,
  user_lng double precision,
  radius_km double precision DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  category text,
  condition text,
  offer_type text,
  latitude double precision,
  longitude double precision,
  distance_km double precision
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.title,
    i.description,
    i.category,
    i.condition,
    i.offer_type,
    i.latitude,
    i.longitude,
    ST_Distance(
      ST_Point(i.longitude, i.latitude)::geography,
      ST_Point(user_lng, user_lat)::geography
    ) / 1000 as distance_km
  FROM items i
  WHERE i.is_available = true
    AND i.latitude IS NOT NULL
    AND i.longitude IS NOT NULL
    AND ST_DWithin(
      ST_Point(i.longitude, i.latitude)::geography,
      ST_Point(user_lng, user_lat)::geography,
      radius_km * 1000
    )
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;
```

### Recherche géolocalisée de communautés
```sql
CREATE OR REPLACE FUNCTION search_nearby_communities(
  user_lat double precision,
  user_lng double precision,
  radius_km double precision DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  city text,
  postal_code text,
  distance_km double precision,
  member_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.description,
    c.city,
    c.postal_code,
    ST_Distance(
      ST_Point(c.center_longitude, c.center_latitude)::geography,
      ST_Point(user_lng, user_lat)::geography
    ) / 1000 as distance_km,
    COUNT(cm.id) as member_count
  FROM communities c
  LEFT JOIN community_members cm ON c.id = cm.community_id AND cm.is_active = true
  WHERE c.is_active = true
    AND c.center_latitude IS NOT NULL
    AND c.center_longitude IS NOT NULL
    AND ST_DWithin(
      ST_Point(c.center_longitude, c.center_latitude)::geography,
      ST_Point(user_lng, user_lat)::geography,
      radius_km * 1000
    )
  GROUP BY c.id, c.name, c.description, c.city, c.postal_code, c.center_latitude, c.center_longitude
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;
```

## Gestion des Erreurs

### Pattern de gestion d'erreur
```typescript
const handleSupabaseError = (error: any) => {
  if (error.code === 'PGRST116') {
    return 'Aucun résultat trouvé';
  } else if (error.code === '23505') {
    return 'Cette ressource existe déjà';
  } else if (error.code === '23503') {
    return 'Référence invalide';
  } else {
    return error.message || 'Une erreur est survenue';
  }
};

// Utilisation
const { data, error } = await supabase.from('items').select('*');
if (error) {
  throw new Error(handleSupabaseError(error));
}
```

## Rate Limiting et Performance

### Pagination
```typescript
const { data, error } = await supabase
  .from('items')
  .select('*')
  .range(0, 19) // Première page (20 éléments)
  .order('created_at', { ascending: false });

// Page suivante
const { data, error } = await supabase
  .from('items')
  .select('*')
  .range(20, 39) // Deuxième page
  .order('created_at', { ascending: false });
```

### Optimisation des requêtes
```typescript
// ✅ Bon : Sélection spécifique
const { data } = await supabase
  .from('items')
  .select('id, title, category, latitude, longitude')
  .eq('is_available', true);

// ❌ Éviter : Sélection de tout
const { data } = await supabase
  .from('items')
  .select('*');
```

## Webhooks et Realtime

### Écouter les changements en temps réel
```typescript
const subscription = supabase
  .channel('items_changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'items'
  }, (payload) => {
    console.log('Changement détecté:', payload);
    // Mettre à jour l'interface utilisateur
  })
  .subscribe();

// Nettoyer l'abonnement
subscription.unsubscribe();
```

---

Cette documentation couvre les principaux patterns d'utilisation de l'API Supabase dans Échangeo. Pour plus de détails sur les fonctionnalités avancées, consultez la [documentation officielle Supabase](https://supabase.com/docs).