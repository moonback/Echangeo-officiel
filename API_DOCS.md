# Documentation API - Échangeo

## Vue d'ensemble

Échangeo utilise Supabase comme backend-as-a-service, fournissant une API REST complète avec authentification, base de données PostgreSQL, stockage de fichiers et fonctionnalités temps réel.

## Authentification

### Endpoints d'Authentification

#### Inscription
```http
POST /auth/v1/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "options": {
    "data": {
      "full_name": "Jean Dupont"
    }
  }
}
```

#### Connexion
```http
POST /auth/v1/token?grant_type=password
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### Déconnexion
```http
POST /auth/v1/logout
Authorization: Bearer <access_token>
```

#### Rafraîchissement du token
```http
POST /auth/v1/token?grant_type=refresh_token
Content-Type: application/json

{
  "refresh_token": "<refresh_token>"
}
```

## API des Profils Utilisateurs

### Récupérer un profil
```http
GET /rest/v1/profiles?id=eq.{user_id}
Authorization: Bearer <access_token>
```

**Réponse :**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "Jean Dupont",
  "avatar_url": "https://...",
  "bio": "Description utilisateur",
  "phone": "+33123456789",
  "address": "123 Rue de la Paix, Paris",
  "latitude": 48.8566,
  "longitude": 2.3522,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Mettre à jour un profil
```http
PATCH /rest/v1/profiles?id=eq.{user_id}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "full_name": "Jean Dupont Modifié",
  "bio": "Nouvelle description",
  "phone": "+33987654321"
}
```

### Upload d'avatar
```http
POST /storage/v1/object/avatars/{filename}
Authorization: Bearer <access_token>
Content-Type: image/jpeg

[Binary image data]
```

## API des Objets

### Récupérer tous les objets
```http
GET /rest/v1/items?select=*&is_available=eq.true
Authorization: Bearer <access_token>
```

**Paramètres de requête :**
- `category` : Filtrer par catégorie
- `offer_type` : Filtrer par type d'offre (loan, trade, donation)
- `is_available` : Objets disponibles uniquement
- `order` : Trier par (created_at.desc, estimated_value.asc, etc.)
- `limit` : Limiter le nombre de résultats
- `offset` : Pagination

### Récupérer un objet spécifique
```http
GET /rest/v1/items?id=eq.{item_id}&select=*,owner:profiles(*)
Authorization: Bearer <access_token>
```

**Réponse :**
```json
{
  "id": "uuid",
  "owner_id": "uuid",
  "title": "Perceuse Bosch",
  "description": "Perceuse en bon état, idéale pour le bricolage",
  "category": "tools",
  "condition": "good",
  "offer_type": "loan",
  "brand": "Bosch",
  "model": "GSR 120-LI",
  "estimated_value": 80,
  "tags": ["bricolage", "outils", "perceuse"],
  "available_from": "2024-01-01",
  "available_to": "2024-12-31",
  "location_hint": "Appartement 3B",
  "latitude": 48.8566,
  "longitude": 2.3522,
  "is_available": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "owner": {
    "id": "uuid",
    "full_name": "Marie Martin",
    "avatar_url": "https://..."
  }
}
```

### Créer un objet
```http
POST /rest/v1/items
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Perceuse Bosch",
  "description": "Perceuse en bon état",
  "category": "tools",
  "condition": "good",
  "offer_type": "loan",
  "brand": "Bosch",
  "estimated_value": 80,
  "tags": ["bricolage", "outils"],
  "available_from": "2024-01-01",
  "available_to": "2024-12-31",
  "latitude": 48.8566,
  "longitude": 2.3522
}
```

### Mettre à jour un objet
```http
PATCH /rest/v1/items?id=eq.{item_id}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Nouveau titre",
  "is_available": false
}
```

### Supprimer un objet
```http
DELETE /rest/v1/items?id=eq.{item_id}
Authorization: Bearer <access_token>
```

## API des Images d'Objets

### Upload d'image d'objet
```http
POST /storage/v1/object/items/{item_id}/{filename}
Authorization: Bearer <access_token>
Content-Type: image/jpeg

[Binary image data]
```

### Récupérer les images d'un objet
```http
GET /rest/v1/item_images?item_id=eq.{item_id}
Authorization: Bearer <access_token>
```

### Définir une image principale
```http
PATCH /rest/v1/item_images?id=eq.{image_id}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "is_primary": true
}
```

## API des Demandes

### Créer une demande
```http
POST /rest/v1/requests
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "item_id": "uuid",
  "message": "Bonjour, je souhaiterais emprunter cette perceuse pour la semaine prochaine.",
  "requested_from": "2024-01-15",
  "requested_to": "2024-01-20"
}
```

### Récupérer les demandes d'un utilisateur
```http
GET /rest/v1/requests?requester_id=eq.{user_id}&select=*,item:items(*)
Authorization: Bearer <access_token>
```

### Mettre à jour le statut d'une demande
```http
PATCH /rest/v1/requests?id=eq.{request_id}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "approved"
}
```

**Statuts possibles :**
- `pending` : En attente
- `approved` : Approuvée
- `rejected` : Rejetée
- `completed` : Terminée

## API des Messages

### Envoyer un message
```http
POST /rest/v1/messages
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "receiver_id": "uuid",
  "content": "Bonjour, merci pour votre proposition !",
  "request_id": "uuid"
}
```

### Récupérer les messages d'une conversation
```http
GET /rest/v1/messages?or=(and(sender_id.eq.{user1_id},receiver_id.eq.{user2_id}),and(sender_id.eq.{user2_id},receiver_id.eq.{user1_id}))&order=created_at.asc
Authorization: Bearer <access_token>
```

## API des Communautés

### Récupérer les communautés à proximité
```http
GET /rest/v1/communities?select=*&is_active=eq.true
Authorization: Bearer <access_token>
```

### Rejoindre une communauté
```http
POST /rest/v1/community_members
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "community_id": "uuid"
}
```

### Créer une communauté
```http
POST /rest/v1/communities
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Quartier Montmartre",
  "description": "Communauté du quartier Montmartre",
  "city": "Paris",
  "postal_code": "75018",
  "country": "France",
  "center_latitude": 48.8867,
  "center_longitude": 2.3431,
  "radius_km": 2
}
```

## API des Favoris

### Ajouter un objet aux favoris
```http
POST /rest/v1/favorites
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "item_id": "uuid"
}
```

### Récupérer les favoris d'un utilisateur
```http
GET /rest/v1/favorites?user_id=eq.{user_id}&select=*,item:items(*)
Authorization: Bearer <access_token>
```

### Supprimer un favori
```http
DELETE /rest/v1/favorites?item_id=eq.{item_id}&user_id=eq.{user_id}
Authorization: Bearer <access_token>
```

## API des Évaluations

### Noter un objet
```http
POST /rest/v1/item_ratings
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "item_id": "uuid",
  "score": 5,
  "comment": "Très bon état, propriétaire très sympa !"
}
```

### Noter un utilisateur
```http
POST /rest/v1/user_ratings
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "request_id": "uuid",
  "rated_user_id": "uuid",
  "communication_score": 5,
  "punctuality_score": 4,
  "care_score": 5,
  "comment": "Utilisateur très fiable"
}
```

## API d'Administration

### Statistiques générales
```http
GET /rest/v1/user_ban_stats
Authorization: Bearer <admin_token>
```

### Gestion des utilisateurs
```http
GET /rest/v1/profiles?select=*,user_details(*)
Authorization: Bearer <admin_token>
```

### Bannir un utilisateur
```http
POST /rest/v1/user_bans
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "user_id": "uuid",
  "reason": "Violation des conditions d'utilisation",
  "ban_type": "temporary",
  "expires_at": "2024-02-01T00:00:00Z"
}
```

## Fonctionnalités Temps Réel

### S'abonner aux changements d'objets
```javascript
const subscription = supabase
  .channel('items_changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'items'
  }, (payload) => {
    console.log('Changement détecté:', payload);
  })
  .subscribe();
```

### S'abonner aux nouveaux messages
```javascript
const subscription = supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `receiver_id=eq.${userId}`
  }, (payload) => {
    console.log('Nouveau message:', payload.new);
  })
  .subscribe();
```

## Codes d'Erreur

| Code | Description |
|------|-------------|
| 400 | Requête malformée |
| 401 | Non authentifié |
| 403 | Accès interdit |
| 404 | Ressource non trouvée |
| 409 | Conflit (ex: email déjà utilisé) |
| 422 | Données de validation invalides |
| 429 | Trop de requêtes (rate limiting) |
| 500 | Erreur serveur |

## Rate Limiting

- **Authentification** : 5 tentatives par minute
- **API REST** : 1000 requêtes par heure par utilisateur
- **Upload de fichiers** : 10 uploads par minute par utilisateur

## Pagination

Utilisez les paramètres `limit` et `offset` pour la pagination :

```http
GET /rest/v1/items?limit=20&offset=40
```

Pour une pagination basée sur les curseurs, utilisez les filtres de date :

```http
GET /rest/v1/items?created_at=lt.2024-01-01T00:00:00Z&limit=20
```

## Filtres et Recherche

### Filtres simples
```http
GET /rest/v1/items?category=eq.tools&offer_type=eq.loan
```

### Filtres complexes
```http
GET /rest/v1/items?and=(category.eq.tools,estimated_value.gte.50,estimated_value.lte.200)
```

### Recherche textuelle
```http
GET /rest/v1/items?title=ilike.*perceuse*
```

### Tri
```http
GET /rest/v1/items?order=created_at.desc,estimated_value.asc
```

## Exemples d'Intégration

### JavaScript/TypeScript
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
);

// Récupérer des objets
const { data: items, error } = await supabase
  .from('items')
  .select('*, owner:profiles(*)')
  .eq('is_available', true)
  .order('created_at', { ascending: false });

// Créer un objet
const { data: item, error } = await supabase
  .from('items')
  .insert({
    title: 'Mon objet',
    category: 'tools',
    offer_type: 'loan'
  })
  .select()
  .single();
```

### Python
```python
from supabase import create_client, Client

supabase: Client = create_client(
    "https://your-project.supabase.co",
    "your-anon-key"
)

# Récupérer des objets
items = supabase.table('items').select('*').eq('is_available', True).execute()

# Créer un objet
item = supabase.table('items').insert({
    'title': 'Mon objet',
    'category': 'tools',
    'offer_type': 'loan'
}).execute()
```

Cette API fournit toutes les fonctionnalités nécessaires pour construire une application complète de partage d'objets entre voisins, avec une sécurité robuste et des performances optimisées.
