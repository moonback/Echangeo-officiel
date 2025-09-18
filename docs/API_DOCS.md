# Documentation API - Échangeo

## 🌐 Vue d'ensemble

Échangeo utilise **Supabase** comme backend-as-a-service, fournissant une API REST automatique basée sur le schéma PostgreSQL. Cette documentation couvre tous les endpoints disponibles et leur utilisation.

## 🔐 Authentification

### Endpoints d'Auth Supabase
```typescript
// Connexion
POST /auth/v1/token?grant_type=password
{
  "email": "user@example.com",
  "password": "password123"
}

// Inscription
POST /auth/v1/signup
{
  "email": "user@example.com",
  "password": "password123",
  "data": {
    "full_name": "John Doe"
  }
}

// Déconnexion
POST /auth/v1/logout

// Refresh token
POST /auth/v1/token?grant_type=refresh_token
{
  "refresh_token": "refresh_token_here"
}
```

### Headers requis
```http
Authorization: Bearer <jwt_token>
apikey: <supabase_anon_key>
Content-Type: application/json
```

## 👤 Profils Utilisateurs

### Obtenir le profil courant
```typescript
GET /rest/v1/profiles?select=*&id=eq.{user_id}

// Response
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "avatar_url": "https://...",
  "bio": "Bio utilisateur",
  "phone": "+33123456789",
  "address": "123 Rue Example",
  "latitude": 48.8566,
  "longitude": 2.3522,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Mettre à jour le profil
```typescript
PATCH /rest/v1/profiles?id=eq.{user_id}
{
  "full_name": "John Doe Updated",
  "bio": "Nouvelle bio",
  "phone": "+33123456789",
  "address": "456 Nouvelle Rue",
  "latitude": 48.8566,
  "longitude": 2.3522
}
```

### Rechercher des voisins
```typescript
GET /rest/v1/profiles?select=*&distance=lt.5000&order=distance

// Avec géolocalisation
GET /rest/v1/profiles?select=*&latitude=gte.48.8&latitude=lte.48.9&longitude=gte.2.3&longitude=lte.2.4
```

## 📦 Objets (Items)

### Lister les objets
```typescript
GET /rest/v1/items?select=*,owner:profiles(*),images:item_images(*)

// Avec filtres
GET /rest/v1/items?select=*&category=eq.tools&is_available=eq.true&order=created_at.desc

// Recherche textuelle
GET /rest/v1/items?select=*&title=ilike.*perceuse*

// Géolocalisation (rayon de 5km)
GET /rest/v1/items?select=*&latitude=gte.48.8&latitude=lte.48.9&longitude=gte.2.3&longitude=lte.2.4
```

### Obtenir un objet spécifique
```typescript
GET /rest/v1/items?select=*,owner:profiles(*),images:item_images(*),ratings:item_ratings(*)&id=eq.{item_id}

// Response
{
  "id": "uuid",
  "owner_id": "uuid",
  "title": "Perceuse Bosch",
  "description": "Perceuse en excellent état",
  "category": "tools",
  "condition": "excellent",
  "offer_type": "loan",
  "desired_items": null,
  "brand": "Bosch",
  "model": "GSR 18V-21",
  "estimated_value": 150,
  "tags": ["bricolage", "outil", "électrique"],
  "available_from": "2024-01-01",
  "available_to": "2024-12-31",
  "location_hint": "RDC, boîte aux lettres",
  "latitude": 48.8566,
  "longitude": 2.3522,
  "is_available": true,
  "suspended_by_admin": false,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "owner": { /* profil owner */ },
  "images": [ /* array d'images */ ],
  "ratings": [ /* array d'évaluations */ ]
}
```

### Créer un objet
```typescript
POST /rest/v1/items
{
  "title": "Perceuse Bosch",
  "description": "Perceuse en excellent état",
  "category": "tools",
  "condition": "excellent",
  "offer_type": "loan",
  "brand": "Bosch",
  "model": "GSR 18V-21",
  "estimated_value": 150,
  "tags": ["bricolage", "outil", "électrique"],
  "available_from": "2024-01-01",
  "available_to": "2024-12-31",
  "location_hint": "RDC, boîte aux lettres",
  "latitude": 48.8566,
  "longitude": 2.3522
}
```

### Mettre à jour un objet
```typescript
PATCH /rest/v1/items?id=eq.{item_id}
{
  "title": "Perceuse Bosch - Mise à jour",
  "is_available": false
}
```

### Supprimer un objet
```typescript
DELETE /rest/v1/items?id=eq.{item_id}
```

## 🖼️ Images d'Objets

### Upload d'images
```typescript
// Via Supabase Storage
POST /storage/v1/object/items/{item_id}/{filename}
Content-Type: image/jpeg
Body: [binary image data]

// Enregistrer en base
POST /rest/v1/item_images
{
  "item_id": "uuid",
  "url": "https://supabase.co/storage/v1/object/public/items/...",
  "is_primary": true
}
```

### Lister les images d'un objet
```typescript
GET /rest/v1/item_images?select=*&item_id=eq.{item_id}&order=is_primary.desc,created_at.asc
```

## 📝 Demandes (Requests)

### Créer une demande
```typescript
POST /rest/v1/requests
{
  "item_id": "uuid",
  "message": "Bonjour, je souhaiterais emprunter cette perceuse pour un week-end",
  "requested_from": "2024-01-15T09:00:00Z",
  "requested_to": "2024-01-17T18:00:00Z"
}
```

### Lister les demandes
```typescript
// Demandes où je suis le demandeur
GET /rest/v1/requests?select=*,item:items(*,owner:profiles(*))&requester_id=eq.{user_id}

// Demandes sur mes objets
GET /rest/v1/requests?select=*,requester:profiles(*),item:items(*)&item_id=in.(item_ids_array)
```

### Mettre à jour le statut d'une demande
```typescript
PATCH /rest/v1/requests?id=eq.{request_id}
{
  "status": "approved", // ou "rejected", "completed"
  "message": "Demande acceptée, vous pouvez venir la récupérer"
}
```

## 💬 Messages

### Envoyer un message
```typescript
POST /rest/v1/messages
{
  "sender_id": "uuid",
  "receiver_id": "uuid",
  "content": "Bonjour, merci pour votre demande !",
  "conversation_id": "uuid"
}
```

### Récupérer une conversation
```typescript
GET /rest/v1/messages?select=*,sender:profiles(*),receiver:profiles(*)&conversation_id=eq.{conversation_id}&order=created_at.asc
```

### Lister les conversations
```typescript
GET /rest/v1/messages?select=distinct(conversation_id),sender:profiles(*),receiver:profiles(*),content,created_at&or=(sender_id.eq.{user_id},receiver_id.eq.{user_id})&order=created_at.desc
```

## 🏘️ Communautés

### Lister les communautés
```typescript
GET /rest/v1/communities?select=*,members:community_members(count)&is_active=eq.true&order=created_at.desc
```

### Obtenir une communauté
```typescript
GET /rest/v1/communities?select=*,members:community_members(*,profile:profiles(*)),events:community_events(*),discussions:community_discussions(*)&id=eq.{community_id}
```

### Créer une communauté
```typescript
POST /rest/v1/communities
{
  "name": "Quartier République",
  "description": "Communauté du quartier République à Paris",
  "city": "Paris",
  "postal_code": "75011",
  "center_latitude": 48.8566,
  "center_longitude": 2.3522,
  "radius_km": 2,
  "created_by": "uuid"
}
```

### Rejoindre une communauté
```typescript
POST /rest/v1/community_members
{
  "community_id": "uuid",
  "user_id": "uuid",
  "role": "member"
}
```

## ⭐ Évaluations et Gamification

### Créer une évaluation
```typescript
POST /rest/v1/item_ratings
{
  "item_id": "uuid",
  "rater_id": "uuid",
  "rating": 5,
  "comment": "Excellent service, objet en parfait état"
}
```

### Obtenir les statistiques d'un utilisateur
```typescript
GET /rest/v1/user_levels?select=*,points_history:user_points_history(*)&profile_id=eq.{user_id}
```

### Obtenir le classement
```typescript
GET /rest/v1/user_levels?select=*,profile:profiles(full_name,avatar_url)&order=points.desc&limit=50
```

## 🔔 Notifications

### Lister les notifications
```typescript
GET /rest/v1/notifications?select=*&user_id=eq.{user_id}&is_read=eq.false&order=created_at.desc
```

### Marquer comme lu
```typescript
PATCH /rest/v1/notifications?id=eq.{notification_id}
{
  "is_read": true
}
```

## 🛡️ Administration

### Statistiques globales
```typescript
GET /rest/v1/admin_stats?select=*

// Response
{
  "total_users": 1250,
  "total_items": 3400,
  "total_requests": 8900,
  "total_communities": 45,
  "active_users_today": 89,
  "items_by_category": { /* breakdown */ },
  "requests_by_status": { /* breakdown */ }
}
```

### Gestion des utilisateurs
```typescript
// Lister tous les utilisateurs
GET /rest/v1/profiles?select=*,level:user_levels(*),items_count:items(count),requests_count:requests(count)&order=created_at.desc

// Suspendre un utilisateur
PATCH /rest/v1/profiles?id=eq.{user_id}
{
  "is_suspended": true,
  "suspension_reason": "Violation des conditions d'utilisation"
}
```

### Gestion des objets
```typescript
// Objets signalés
GET /rest/v1/items?select=*,owner:profiles(*),reports:item_reports(*)&suspended_by_admin=eq.false&order=created_at.desc

// Suspendre un objet
PATCH /rest/v1/items?id=eq.{item_id}
{
  "suspended_by_admin": true,
  "suspension_reason": "Contenu inapproprié"
}
```

## 🤖 Intelligence Artificielle

### Analyse d'image (via service externe)
```typescript
// Endpoint interne (pas Supabase)
POST /api/ai/analyze-image
Content-Type: multipart/form-data
Body: FormData avec image

// Response
{
  "title": "Perceuse électrique",
  "description": "Perceuse sans fil en bon état",
  "category": "tools",
  "condition": "good",
  "brand": "Bosch",
  "model": "GSR 18V-21",
  "estimated_value": 120,
  "tags": ["bricolage", "outil", "électrique", "sans fil"],
  "confidence": 0.95
}
```

### Suggestions de chat
```typescript
POST /api/ai/chat-suggestions
{
  "messages": [/* array de messages */],
  "context": {
    "itemTitle": "Perceuse Bosch",
    "itemCategory": "tools",
    "requestType": "loan",
    "userRelation": "owner"
  }
}
```

## 📊 Requêtes Avancées

### Recherche géolocalisée avec distance
```sql
-- Via fonction SQL personnalisée
SELECT *, 
  ST_Distance(
    ST_Point(longitude, latitude)::geography,
    ST_Point(2.3522, 48.8566)::geography
  ) as distance_meters
FROM items 
WHERE ST_DWithin(
  ST_Point(longitude, latitude)::geography,
  ST_Point(2.3522, 48.8566)::geography,
  5000
)
ORDER BY distance_meters;
```

### Agrégations complexes
```typescript
// Statistiques par catégorie
GET /rest/v1/items?select=category,count:id&group=category

// Activité utilisateur
GET /rest/v1/profiles?select=id,items:items(count),requests:requests(count),ratings:item_ratings(count)
```

## 🔄 Realtime Subscriptions

### Écouter les changements
```typescript
// Messages en temps réel
supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`
  }, (payload) => {
    console.log('Nouveau message:', payload.new)
  })
  .subscribe()

// Notifications
supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    showNotification(payload.new)
  })
  .subscribe()
```

## ⚡ Optimisations

### Pagination
```typescript
// Pagination avec offset
GET /rest/v1/items?select=*&order=created_at.desc&limit=20&offset=40

// Pagination avec cursor
GET /rest/v1/items?select=*&order=created_at.desc&limit=20&created_at=lt.2024-01-01T00:00:00Z
```

### Sélection de colonnes
```typescript
// Sélectionner seulement les colonnes nécessaires
GET /rest/v1/items?select=id,title,category,is_available,created_at

// Éviter les colonnes lourdes
GET /rest/v1/profiles?select=id,full_name,avatar_url&exclude=bio,address
```

### Cache et performance
```typescript
// Utiliser les headers de cache
GET /rest/v1/items?select=*
Cache-Control: max-age=300

// Requêtes en batch
GET /rest/v1/items?select=*&id=in.(id1,id2,id3)
```

## 🚨 Gestion d'Erreurs

### Codes d'erreur courants
```typescript
// 400 - Bad Request
{
  "code": "23505",
  "message": "duplicate key value violates unique constraint"
}

// 401 - Unauthorized
{
  "message": "JWT expired"
}

// 403 - Forbidden
{
  "message": "new row violates row-level security policy"
}

// 404 - Not Found
{
  "message": "No rows found"
}
```

### Retry et fallback
```typescript
// Stratégie de retry
const retryRequest = async (fn, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}
```

---

Cette documentation couvre tous les endpoints essentiels d'Échangeo. Pour plus de détails sur l'implémentation côté client, consultez les hooks dans `src/hooks/`.