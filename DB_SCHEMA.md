## Schéma base de données (Supabase / Postgres)

Migration utilisée: `supabase/migrations/20250916192035_old_bird.sql`

### profiles
Informations publiques des utilisateurs (miroir de `auth.users`).

Champs:
- `id uuid PK` (FK `auth.users.id`)
- `email text UNIQUE NOT NULL`
- `full_name text`
- `avatar_url text`
- `bio text`, `phone text`, `address text`
- `latitude double precision`, `longitude double precision`
- `created_at timestamptz default now()`, `updated_at timestamptz default now()`

### items
Objets proposés au prêt/troc.

Champs:
- `id uuid PK default uuid_generate_v4()`
- `owner_id uuid NOT NULL` → FK `profiles(id)`
- `title text NOT NULL`, `description text`
- `category text NOT NULL` ∈ {tools, electronics, books, sports, kitchen, garden, toys, other}
- `condition text NOT NULL` ∈ {excellent, good, fair, poor}
- Champs additionnels: `brand text`, `model text`, `estimated_value numeric`, `tags text[]`, `available_from date`, `available_to date`, `location_hint text`
- Géoloc: `latitude double precision`, `longitude double precision`
- `is_available boolean default true`
- `created_at timestamptz default now()`, `updated_at timestamptz default now()`

Indexes: `owner_id`, `category`, `is_available`, `available_from`, `available_to`, `latitude`, `longitude`

### item_images
Images liées à un item (URLs publiques Storage).

Champs:
- `id uuid PK default uuid_generate_v4()`
- `item_id uuid NOT NULL` → FK `items(id)`
- `url text NOT NULL`
- `is_primary boolean default false`
- `created_at timestamptz default now()`

Index: `item_id`

### requests
Demandes d’emprunt d’un item.

Champs:
- `id uuid PK default uuid_generate_v4()`
- `requester_id uuid NOT NULL` → FK `profiles(id)`
- `item_id uuid NOT NULL` → FK `items(id)`
- `message text`
- `status text default 'pending'` ∈ {pending, approved, rejected, completed}
- `requested_from timestamptz`, `requested_to timestamptz`
- `created_at timestamptz default now()`, `updated_at timestamptz default now()`

Indexes: `requester_id`, `item_id`

### item_ratings
Avis des utilisateurs sur un objet.

Champs:
- `id uuid PK default uuid_generate_v4()`
- `item_id uuid NOT NULL` → FK `items(id)` on delete cascade
- `rater_id uuid NOT NULL` → FK `profiles(id)` on delete cascade
- `score smallint` (1..5) NOT NULL
- `comment text`
- `created_at timestamptz default now()`

Contraintes/Indexes: `UNIQUE(item_id, rater_id)`, index sur `item_id`, `rater_id`

### messages
Messages privés entre deux profils (facultativement liés à une `request`).

Champs:
- `id uuid PK default uuid_generate_v4()`
- `sender_id uuid NOT NULL` → FK `profiles(id)`
- `receiver_id uuid NOT NULL` → FK `profiles(id)`
- `content text NOT NULL`
- `request_id uuid NULL` → FK `requests(id)` on delete set null
- `created_at timestamptz default now()`

Indexes: `sender_id`, `receiver_id`

### Sécurité (RLS)
- MVP: RLS désactivé pour accélérer le dev.
- Production: activer RLS et définir des policies par table. Exemples de départ:
  - Lecture/écriture sur `profiles` restreinte à `auth.uid() = id`
  - Lecture des `items` disponibles publique, création/modification par propriétaire
  - `requests`: accès restreint à `requester` et au propriétaire de l’`item`
  - `messages`: accès restreint à `sender` et `receiver`
  - `item_ratings`: insert/update restreint à `auth.uid() = rater_id`, lecture publique agrégée

### Storage (bucket `items`)
- Lecture publique (select)
- Écriture authentifiée (insert/update) ou stricte par dossier `/<userId>/...`
- Exemples de policies dans README / réponses précédentes


