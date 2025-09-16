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
- `is_available boolean default true`
- `created_at timestamptz default now()`, `updated_at timestamptz default now()`

Indexes: `owner_id`, `category`, `is_available`

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


