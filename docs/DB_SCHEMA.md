# Schéma de Base de Données - Échangeo 🗄️

## Vue d'ensemble

Échangeo utilise **PostgreSQL** via **Supabase** avec un schéma relationnel optimisé pour l'économie collaborative locale.

## 📋 Tables Principales

### 👤 PROFILES
Table des profils utilisateurs (miroir de `auth.users`).

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `uuid` | PK, FK → `auth.users(id)` | Identifiant unique |
| `email` | `text` | UNIQUE, NOT NULL | Email de l'utilisateur |
| `full_name` | `text` | | Nom complet |
| `avatar_url` | `text` | | URL de l'avatar |
| `bio` | `text` | | Biographie |
| `phone` | `text` | | Numéro de téléphone |
| `address` | `text` | | Adresse complète |
| `latitude` | `double precision` | | Latitude GPS |
| `longitude` | `double precision` | | Longitude GPS |
| `created_at` | `timestamptz` | DEFAULT `now()` | Date de création |
| `updated_at` | `timestamptz` | DEFAULT `now()` | Date de mise à jour |

### 📦 ITEMS
Table des objets à prêter/échanger.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `uuid_generate_v4()` | Identifiant unique |
| `owner_id` | `uuid` | FK → `profiles(id)`, NOT NULL | Propriétaire |
| `title` | `text` | NOT NULL | Titre de l'objet |
| `description` | `text` | | Description détaillée |
| `category` | `text` | NOT NULL, CHECK | Catégorie |
| `condition` | `text` | NOT NULL, CHECK | État de l'objet |
| `brand` | `text` | | Marque |
| `model` | `text` | | Modèle |
| `estimated_value` | `numeric` | | Valeur estimée |
| `tags` | `text[]` | | Tags de recherche |
| `available_from` | `date` | | Disponible à partir de |
| `available_to` | `date` | | Disponible jusqu'au |
| `location_hint` | `text` | | Indice de localisation |
| `latitude` | `double precision` | | Latitude GPS |
| `longitude` | `double precision` | | Longitude GPS |
| `is_available` | `boolean` | DEFAULT `true` | Disponible |
| `created_at` | `timestamptz` | DEFAULT `now()` | Date de création |
| `updated_at` | `timestamptz` | DEFAULT `now()` | Date de mise à jour |

**Contraintes CHECK:**
- `category` IN ('tools', 'electronics', 'books', 'sports', 'kitchen', 'garden', 'toys', 'other')
- `condition` IN ('excellent', 'good', 'fair', 'poor')

### 🖼️ ITEM_IMAGES
Images des objets.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `uuid_generate_v4()` | Identifiant unique |
| `item_id` | `uuid` | FK → `items(id)`, NOT NULL | Objet associé |
| `url` | `text` | NOT NULL | URL de l'image |
| `is_primary` | `boolean` | DEFAULT `false` | Image principale |
| `created_at` | `timestamptz` | DEFAULT `now()` | Date de création |

### 🤝 REQUESTS
Demandes d'emprunt.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `uuid_generate_v4()` | Identifiant unique |
| `requester_id` | `uuid` | FK → `profiles(id)`, NOT NULL | Demandeur |
| `item_id` | `uuid` | FK → `items(id)`, NOT NULL | Objet demandé |
| `message` | `text` | | Message du demandeur |
| `status` | `text` | DEFAULT 'pending', CHECK | Statut |
| `requested_from` | `timestamptz` | | Demande à partir de |
| `requested_to` | `timestamptz` | | Demande jusqu'au |
| `created_at` | `timestamptz` | DEFAULT `now()` | Date de création |
| `updated_at` | `timestamptz` | DEFAULT `now()` | Date de mise à jour |

**Contraintes CHECK:**
- `status` IN ('pending', 'approved', 'rejected', 'completed')

### 💬 MESSAGES
Messages entre utilisateurs.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `uuid_generate_v4()` | Identifiant unique |
| `sender_id` | `uuid` | FK → `profiles(id)`, NOT NULL | Expéditeur |
| `receiver_id` | `uuid` | FK → `profiles(id)`, NOT NULL | Destinataire |
| `content` | `text` | NOT NULL | Contenu du message |
| `request_id` | `uuid` | FK → `requests(id)` | Demande associée |
| `created_at` | `timestamptz` | DEFAULT `now()` | Date de création |

### ⭐ ITEM_RATINGS
Évaluations des objets.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `uuid_generate_v4()` | Identifiant unique |
| `item_id` | `uuid` | FK → `items(id)`, NOT NULL | Objet évalué |
| `rater_id` | `uuid` | FK → `profiles(id)`, NOT NULL | Évaluateur |
| `score` | `int2` | NOT NULL, CHECK | Note (1-5) |
| `comment` | `text` | | Commentaire |
| `created_at` | `timestamptz` | DEFAULT `now()` | Date de création |

**Contraintes CHECK:**
- `score` BETWEEN 1 AND 5

### 👥 USER_RATINGS
Évaluations mutuelles entre utilisateurs.

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `uuid_generate_v4()` | Identifiant unique |
| `request_id` | `uuid` | FK → `requests(id)`, NOT NULL | Demande associée |
| `rater_id` | `uuid` | FK → `profiles(id)`, NOT NULL | Évaluateur |
| `rated_user_id` | `uuid` | FK → `profiles(id)`, NOT NULL | Utilisateur évalué |
| `communication_score` | `int2` | NOT NULL, CHECK | Note communication |
| `punctuality_score` | `int2` | NOT NULL, CHECK | Note ponctualité |
| `care_score` | `int2` | NOT NULL, CHECK | Note soin |
| `comment` | `text` | | Commentaire |
| `created_at` | `timestamptz` | DEFAULT `now()` | Date de création |

**Contraintes CHECK:**
- `communication_score` BETWEEN 1 AND 5
- `punctuality_score` BETWEEN 1 AND 5
- `care_score` BETWEEN 1 AND 5

## 📊 Vues et Fonctions

### `profile_reputation_stats`
Statistiques de réputation des utilisateurs.

```sql
CREATE VIEW profile_reputation_stats AS
SELECT
  rated_user_id as profile_id,
  COUNT(*)::int as ratings_count,
  AVG(communication_score)::numeric(10,4) as avg_communication,
  AVG(punctuality_score)::numeric(10,4) as avg_punctuality,
  AVG(care_score)::numeric(10,4) as avg_care,
  AVG((communication_score + punctuality_score + care_score) / 3.0)::numeric(10,4) as overall_score
FROM user_ratings
GROUP BY rated_user_id;
```

### `profile_activity_counts`
Compteurs d'activité des utilisateurs.

```sql
CREATE VIEW profile_activity_counts AS
SELECT
  p.id as profile_id,
  COALESCE(SUM(CASE WHEN r.status = 'completed' AND i.owner_id = p.id THEN 1 ELSE 0 END), 0)::int as completed_lends,
  COALESCE(SUM(CASE WHEN r.status = 'completed' AND r.requester_id = p.id THEN 1 ELSE 0 END), 0)::int as completed_borrows
FROM profiles p
LEFT JOIN requests r ON r.requester_id = p.id OR EXISTS (
  SELECT 1 FROM items i2 WHERE i2.id = r.item_id AND i2.owner_id = p.id
)
LEFT JOIN items i ON i.id = r.item_id
GROUP BY p.id;
```

### `profile_badges`
Badges automatiques basés sur l'activité.

```sql
CREATE VIEW profile_badges AS
WITH stats AS (
  SELECT 
    c.profile_id,
    c.completed_lends,
    c.completed_borrows,
    COALESCE(s.overall_score, 0) as overall_score,
    COALESCE(s.ratings_count, 0) as ratings_count
  FROM profile_activity_counts c
  LEFT JOIN profile_reputation_stats s ON s.profile_id = c.profile_id
)
SELECT 
  profile_id,
  'super_lender'::text as badge_slug,
  'Super Prêteur'::text as badge_label
FROM stats 
WHERE completed_lends >= 10 AND overall_score >= 4.5
UNION ALL
SELECT 
  profile_id,
  'reliable_neighbor'::text as badge_slug,
  'Voisin Fiable'::text as badge_label
FROM stats 
WHERE ratings_count >= 5 AND overall_score >= 4.2
UNION ALL
SELECT 
  profile_id,
  'active_borrower'::text as badge_slug,
  'Emprunteur Actif'::text as badge_label
FROM stats 
WHERE completed_borrows >= 10;
```

### `item_rating_stats`
Statistiques des objets.

```sql
CREATE VIEW item_rating_stats AS
SELECT
  i.id as item_id,
  AVG(ir.score)::numeric as average_rating,
  COUNT(ir.id) as ratings_count
FROM items i
LEFT JOIN item_ratings ir ON ir.item_id = i.id
GROUP BY i.id;
```

## 🔐 Sécurité (RLS)

### État Actuel
**⚠️ RLS désactivé en MVP** pour faciliter le développement.

### Activation en Production
```sql
-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
```

## 📈 Performance

### Index Recommandés
```sql
-- Index composites pour les requêtes fréquentes
CREATE INDEX idx_items_search ON items USING GIN (to_tsvector('french', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_items_location_available ON items (latitude, longitude) WHERE is_available = true;
CREATE INDEX idx_requests_user_status ON requests (requester_id, status);
CREATE INDEX idx_messages_conversation_time ON messages (sender_id, receiver_id, created_at DESC);
```

## 🔄 Migrations

### Structure des Migrations
```
supabase/migrations/
├── 20250916192035_old_bird.sql          # Schéma de base
├── 20250917120000_add_item_fields.sql   # Champs additionnels items
├── 20250917121000_add_item_location.sql # Géolocalisation
├── 20250917123000_add_item_ratings.sql  # Système d'évaluation
├── 20250917130000_add_user_ratings_and_badges.sql # Réputation
└── 20250917131000_add_item_rating_stats_view.sql  # Vues statistiques
```

### Application des Migrations
```bash
# Via Supabase CLI
supabase db push

# Via Dashboard Supabase
# Aller dans SQL Editor et exécuter les migrations
```

---

Ce schéma est conçu pour être évolutif et performant, tout en maintenant la simplicité nécessaire au MVP. 🚀