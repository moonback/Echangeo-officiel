## Architecture

### Vue d’ensemble
TrocAll est une application React (SPA) qui s’appuie sur Supabase pour l’authentification, la base de données (PostgreSQL) et le stockage d’images. Le state côté client est géré par Zustand (auth) et TanStack Query (données serveur, cache, invalidation).

```
[React SPA] ── HTTP/WS ──> [Supabase]
   |                         |─ Auth (JWT)
   |                         |─ Postgres (tables)
   └─ UI/State               └─ Storage (images)
```

### Frontend (React)
- Routing via React Router (`src/App.tsx`)
- State global minimal via `src/store/authStore.ts` (Zustand)
- Data fetching/caching via TanStack Query (`src/hooks/*`)
- UI Tailwind + animations Framer Motion

Composants clés:
- `components/Layout.tsx`, `components/Sidebar.tsx`, `components/BottomNavigation.tsx`
- Pages: `pages/*` (Items, Requests, Chat, Profiles, etc.)

### Services
- `src/services/supabase.ts` instancie le client Supabase typé par `src/types/database.ts`.

### Hooks de données
- Items: `src/hooks/useItems.ts`
- Requests: `src/hooks/useRequests.ts`
- Profils & voisins: `src/hooks/useProfiles.ts`
- Messages (chat basique): `src/hooks/useMessages.ts`

### Authentification
- Supabase Auth (email/password)
- Le store `useAuthStore` expose `signUp`, `signIn`, `signOut`, `updateProfile` et hydrate `user`/`profile` au chargement

### Base de données (Supabase Postgres)
Tables principales (voir `DB_SCHEMA.md` pour le détail):
- `profiles` (utilisateurs, infos publiques)
- `items` + `item_images` (objets et images)
- `requests` (demandes d’emprunt)
- `messages` (échanges entre profils)

Relations:
- `items.owner_id -> profiles.id`
- `item_images.item_id -> items.id`
- `requests.requester_id -> profiles.id`, `requests.item_id -> items.id`
- `messages.sender_id -> profiles.id`, `messages.receiver_id -> profiles.id`

### Sécurité
- MVP: RLS désactivé (voir `README.md`).
- Production: activer RLS + policies finement (accès par utilisateur, visibilité publique restreinte, storage sécurisé).

### Performances
- Index sur les colonnes de jointure et de filtrage (déjà présents dans la migration)
- Pagination/infini-scroll à envisager pour Items et Messages

### Observabilité
- À ajouter: logs côté client, Sentry, métriques Supabase


