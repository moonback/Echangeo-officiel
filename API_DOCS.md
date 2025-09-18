# Documentation API - TrocAll

## Vue d'ensemble

TrocAll utilise Supabase comme Backend-as-a-Service, fournissant une API REST complète avec authentification, base de données PostgreSQL, storage et realtime. Cette documentation couvre les endpoints principaux et les patterns d'utilisation.

## Configuration

### Base URL
```
https://your-project.supabase.co
```

### Authentification
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);
```

## Endpoints Principaux

### 1. Authentification

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

#### Vérification de session
```typescript
const { data: { session } } = await supabase.auth.getSession();
```

### 2. Profils Utilisateurs

#### Récupérer un profil
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();
```

#### Mettre à jour un profil
```typescript
const { data, error } = await supabase
  .from('profiles')
  .update({
    full_name: 'Nouveau nom',
    bio: 'Nouvelle bio',
    latitude: 48.8566,
    longitude: 2.3522
  })
  .eq('id', userId);
```

#### Vérifier si un utilisateur est banni
```typescript
const { data, error } = await supabase.rpc('is_user_banned', {
  target_user_id: userId
});
```

### 3. Objets (Items)

#### Récupérer tous les objets avec filtres
```typescript
const { data, error } = await supabase
  .from('items')
  .select(`
    *,
    owner:profiles!items_owner_id_fkey(*),
    images:item_images(*)
  `)
  .eq('is_available', true)
  .eq('suspended_by_admin', false)
  .eq('category', 'tools')
  .ilike('title', '%perceuse%')
  .order('created_at', { ascending: false });
```

#### Créer un objet
```typescript
const { data, error } = await supabase
  .from('items')
  .insert({
    title: 'Perceuse Bosch',
    description: 'Perceuse en excellent état',
    category: 'tools',
    condition: 'excellent',
    offer_type: 'loan',
    brand: 'Bosch',
    estimated_value: 80,
    tags: ['bricolage', 'outils', 'perceuse'],
    owner_id: userId,
    latitude: 48.8566,
    longitude: 2.3522
  })
  .select()
  .single();
```

#### Mettre à jour un objet
```typescript
const { data, error } = await supabase
  .from('items')
  .update({
    title: 'Nouveau titre',
    is_available: false
  })
  .eq('id', itemId);
```

#### Supprimer un objet
```typescript
const { error } = await supabase
  .from('items')
  .delete()
  .eq('id', itemId);
```

#### Recherche géographique
```typescript
const { data, error } = await supabase.rpc('find_nearby_items', {
  p_latitude: 48.8566,
  p_longitude: 2.3522,
  p_radius_km: 5,
  p_category: 'tools'
});
```

### 4. Images d'Objets

#### Upload d'image
```typescript
const fileName = `${itemId}/${Date.now()}-${sanitizedFileName}`;

const { error: uploadError } = await supabase.storage
  .from('items')
  .upload(fileName, file);

if (!uploadError) {
  const { data: { publicUrl } } = supabase.storage
    .from('items')
    .getPublicUrl(fileName);

  await supabase
    .from('item_images')
    .insert({
      item_id: itemId,
      url: publicUrl,
      is_primary: true
    });
}
```

#### Récupérer les images d'un objet
```typescript
const { data, error } = await supabase
  .from('item_images')
  .select('*')
  .eq('item_id', itemId)
  .order('is_primary', { ascending: false });
```

### 5. Demandes (Requests)

#### Créer une demande
```typescript
const { data, error } = await supabase
  .from('requests')
  .insert({
    requester_id: userId,
    item_id: itemId,
    message: 'Bonjour, je souhaiterais emprunter cet objet',
    status: 'pending',
    requested_from: '2024-01-20',
    requested_to: '2024-01-25'
  })
  .select()
  .single();
```

#### Récupérer les demandes d'un utilisateur
```typescript
const { data, error } = await supabase
  .from('requests')
  .select(`
    *,
    requester:profiles!requests_requester_id_fkey(*),
    item:items(*)
  `)
  .eq('requester_id', userId)
  .order('created_at', { ascending: false });
```

#### Mettre à jour le statut d'une demande
```typescript
const { data, error } = await supabase
  .from('requests')
  .update({ status: 'approved' })
  .eq('id', requestId);
```

### 6. Messages

#### Envoyer un message
```typescript
const { data, error } = await supabase
  .from('messages')
  .insert({
    sender_id: userId,
    receiver_id: receiverId,
    content: 'Bonjour, merci pour votre demande !',
    request_id: requestId
  })
  .select()
  .single();
```

#### Récupérer une conversation
```typescript
const { data, error } = await supabase
  .from('messages')
  .select(`
    *,
    sender:profiles!messages_sender_id_fkey(*),
    receiver:profiles!messages_receiver_id_fkey(*)
  `)
  .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
  .order('created_at', { ascending: true });
```

### 7. Communautés

#### Récupérer toutes les communautés
```typescript
const { data, error } = await supabase
  .from('communities')
  .select(`
    *,
    stats:community_stats(*)
  `)
  .eq('is_active', true)
  .order('created_at', { ascending: false });
```

#### Rejoindre une communauté
```typescript
const { data, error } = await supabase
  .from('community_members')
  .insert({
    community_id: communityId,
    user_id: userId,
    role: 'member',
    is_active: true
  })
  .select()
  .single();
```

#### Trouver les communautés proches
```typescript
const { data, error } = await supabase.rpc('find_nearby_communities', {
  p_latitude: 48.8566,
  p_longitude: 2.3522,
  p_radius_km: 10
});
```

#### Créer un événement communautaire
```typescript
const { data, error } = await supabase
  .from('community_events')
  .insert({
    community_id: communityId,
    title: 'Atelier bricolage',
    description: 'Apprendre les bases du bricolage',
    event_type: 'workshop',
    location: 'Centre communautaire',
    start_date: '2024-02-15T14:00:00Z',
    max_participants: 20,
    created_by: userId
  })
  .select()
  .single();
```

### 8. Gamification

#### Récupérer les statistiques de gamification
```typescript
const { data, error } = await supabase
  .from('gamification_stats')
  .select('*')
  .eq('profile_id', userId)
  .single();
```

#### Ajouter des points à un utilisateur
```typescript
const { data, error } = await supabase.rpc('add_user_points', {
  p_profile_id: userId,
  p_points: 50,
  p_reason: 'Transaction complétée',
  p_source_type: 'transaction',
  p_source_id: requestId
});
```

#### Récupérer le leaderboard
```typescript
const { data, error } = await supabase
  .from('leaderboard')
  .select('*')
  .limit(50);
```

### 9. Évaluations et Réputation

#### Évaluer un objet
```typescript
const { data, error } = await supabase
  .from('item_ratings')
  .insert({
    item_id: itemId,
    rater_id: userId,
    score: 5,
    comment: 'Excellent objet, très satisfait !'
  })
  .select()
  .single();
```

#### Évaluer un utilisateur
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
    comment: 'Très bon contact, objet rendu en parfait état'
  })
  .select()
  .single();
```

### 10. Administration

#### Récupérer les statistiques globales
```typescript
const { data, error } = await supabase.rpc('get_admin_stats');
```

#### Suspendre un objet
```typescript
const { data, error } = await supabase
  .from('items')
  .update({ suspended_by_admin: true })
  .eq('id', itemId);
```

#### Bannir un utilisateur
```typescript
const { data, error } = await supabase
  .from('user_bans')
  .insert({
    user_id: userId,
    reason: 'Comportement inapproprié',
    banned_by: adminId,
    expires_at: '2024-12-31T23:59:59Z'
  })
  .select()
  .single();
```

## Fonctions PostgreSQL Personnalisées

### 1. Recherche géographique

```sql
-- Trouver les objets proches
CREATE OR REPLACE FUNCTION find_nearby_items(
  p_latitude DOUBLE PRECISION,
  p_longitude DOUBLE PRECISION,
  p_radius_km INTEGER DEFAULT 5,
  p_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  distance_km DOUBLE PRECISION,
  owner_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.title,
    calculate_distance_km(p_latitude, p_longitude, i.latitude, i.longitude) as distance_km,
    p.full_name as owner_name
  FROM items i
  JOIN profiles p ON p.id = i.owner_id
  WHERE i.is_available = true
  AND i.suspended_by_admin = false
  AND i.latitude IS NOT NULL
  AND i.longitude IS NOT NULL
  AND (p_category IS NULL OR i.category = p_category)
  AND calculate_distance_km(p_latitude, p_longitude, i.latitude, i.longitude) <= p_radius_km
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;
```

### 2. Calcul de distance

```sql
-- Calculer la distance entre deux points (formule de Haversine)
CREATE OR REPLACE FUNCTION calculate_distance_km(
  lat1 DOUBLE PRECISION,
  lon1 DOUBLE PRECISION,
  lat2 DOUBLE PRECISION,
  lon2 DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION AS $$
DECLARE
  R DOUBLE PRECISION := 6371; -- Rayon de la Terre en km
  dLat DOUBLE PRECISION;
  dLon DOUBLE PRECISION;
  a DOUBLE PRECISION;
  c DOUBLE PRECISION;
BEGIN
  dLat := radians(lat2 - lat1);
  dLon := radians(lon2 - lon1);
  
  a := sin(dLat/2) * sin(dLat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dLon/2) * sin(dLon/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  RETURN R * c;
END;
$$ LANGUAGE plpgsql;
```

### 3. Vérification de bannissement

```sql
-- Vérifier si un utilisateur est banni
CREATE OR REPLACE FUNCTION is_user_banned(target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  ban_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM user_bans 
    WHERE user_id = target_user_id 
    AND (expires_at IS NULL OR expires_at > now())
  ) INTO ban_exists;
  
  RETURN ban_exists;
END;
$$ LANGUAGE plpgsql;
```

## Row Level Security (RLS)

### Politiques de sécurité

```sql
-- Les utilisateurs peuvent voir leurs propres objets
CREATE POLICY "Users can view their own items" ON items
  FOR SELECT USING (auth.uid() = owner_id);

-- Les objets publics sont visibles par tous
CREATE POLICY "Public items are viewable by everyone" ON items
  FOR SELECT USING (is_available = true AND suspended_by_admin = false);

-- Les utilisateurs peuvent modifier leurs propres objets
CREATE POLICY "Users can update their own items" ON items
  FOR UPDATE USING (auth.uid() = owner_id);

-- Les utilisateurs peuvent créer des objets
CREATE POLICY "Users can create items" ON items
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
```

## Gestion des Erreurs

### Codes d'erreur courants

```typescript
// Erreur d'authentification
if (error?.message?.includes('Invalid login credentials')) {
  throw new Error('Email ou mot de passe incorrect');
}

// Erreur de permissions
if (error?.code === 'PGRST301') {
  throw new Error('Vous n\'avez pas les permissions nécessaires');
}

// Erreur de contrainte
if (error?.code === '23505') {
  throw new Error('Cette ressource existe déjà');
}
```

### Retry avec backoff exponentiel

```typescript
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      if (error instanceof Error && error.message?.includes('429') && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Nombre maximum de tentatives atteint');
};
```

## Rate Limiting

Supabase applique des limites de taux par défaut :
- **API calls** : 1000 requêtes/minute par utilisateur
- **Storage** : 1000 uploads/minute par utilisateur
- **Realtime** : 100 connexions simultanées par projet

## Monitoring et Logs

### Logs des requêtes

```typescript
// Logging des requêtes importantes
console.log('Requête API:', {
  endpoint: 'items',
  method: 'SELECT',
  filters: { category: 'tools' },
  timestamp: new Date().toISOString()
});
```

### Métriques de performance

```typescript
// Mesure du temps de réponse
const startTime = performance.now();
const { data, error } = await supabase.from('items').select('*');
const endTime = performance.now();

console.log(`Temps de réponse: ${endTime - startTime}ms`);
```

## Bonnes Pratiques

### 1. **Optimisation des requêtes**

```typescript
// ✅ Bon : Sélection spécifique des colonnes
const { data } = await supabase
  .from('items')
  .select('id, title, category, created_at')
  .eq('is_available', true);

// ❌ Éviter : Sélection de toutes les colonnes
const { data } = await supabase
  .from('items')
  .select('*')
  .eq('is_available', true);
```

### 2. **Gestion du cache**

```typescript
// Utiliser TanStack Query pour le cache
const { data } = useQuery({
  queryKey: ['items', filters],
  queryFn: () => fetchItems(filters),
  staleTime: 1000 * 60 * 5, // 5 minutes
});
```

### 3. **Pagination**

```typescript
// Pagination avec offset
const { data } = await supabase
  .from('items')
  .select('*')
  .range(0, 19) // Première page (20 éléments)
  .order('created_at', { ascending: false });
```

Cette documentation couvre les principaux patterns d'utilisation de l'API TrocAll. Pour plus de détails sur des endpoints spécifiques, consultez la documentation Supabase officielle.