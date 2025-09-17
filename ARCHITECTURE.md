## Architecture

### Vue d’ensemble

TrocAll est une application React (Vite, TypeScript) qui consomme Supabase (Auth, Postgres, Storage). L’état applicatif côté client repose sur Zustand (auth) et TanStack Query (données serveur). Tailwind CSS fournit le design system avec un thème personnalisé.

### Frontend
- React 18 + Vite + TypeScript
- Routing: React Router v6
- State: Zustand (auth), React Query (cache, mutations, revalidation)
- UI: Tailwind (thème custom), Framer Motion (transitions), Lucide Icons
- Forms: React Hook Form + Zod (validation schema)

Pages clés:
- `HomePage`: hero, fonctionnement, stats, objets récents (distance), FAQ
- `ItemsPage`: recherche + filtres avancés, listing
- `ItemDetailPage`: fiche objet, images, disponibilité, notes, actions
- `CreateItemPage` / `EditItemPage`: création/édition d’objet (images, geo, champs étendus)
- `RequestsPage`: demandes où je suis demandeur ou propriétaire
- `LoginPage`: inscription (email confirmation), connexion

### Backend (Supabase)
- Auth: gestion des comptes, sessions, confirmation email
- Database (Postgres): tables `profiles`, `items`, `item_images`, `requests`, `messages`, `item_ratings`
- Storage: bucket public `items` pour les images
- RLS/Policies: à activer en prod (lecture publique des items, écriture propriétaire, etc.)

### Base de données (résumé)
- `profiles`: miroir utilisateur public
- `items`: objets (métadonnées, disponibilité, géolocalisation, tags, etc.)
- `item_images`: images d’un objet (URLs Storage)
- `requests`: demandes d’emprunt (statut, messages facultatifs)
- `messages`: messagerie entre profils
- `item_ratings`: avis sur les objets (score/commentaire)

### Flux principaux
- Création d’un objet: formulaire → insertion `items` → upload images Storage → insertion `item_images`
- Listing: `items` + jointures `profiles`, `item_images`, agrégations `item_ratings`
- Demandes: `requests` avec jointures profil et item; vue combinée (demandeur/propriétaire)
- Géolocalisation: latitude/longitude stockées; reverse-geocoding (Nominatim) pour l’adresse

### Sécurité
- Dev: policies permissives possibles
- Prod: activer RLS (policies par table + Storage). Voir `DB_SCHEMA.md`

### Performances
- Sélection partielle avec jointures ciblées
- Index sur colonnes filtrées (`owner_id`, `category`, `available_*`, `latitude/longitude`)
- Mise en cache via React Query

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


