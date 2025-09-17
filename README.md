## 🏠 TrocAll – Prêt et troc d’objets entre voisins

Application web mobile-first pour prêter, emprunter et échanger des objets entre voisins. Réduisez la surconsommation, économisez de l’argent et créez du lien local.

## ⚙️ Stack technique
- **Frontend**: React 18, TypeScript, Vite, React Router v6
- **State/Server**: Zustand (auth), TanStack Query (server-state)
- **UI/Design**: Tailwind CSS (thème custom), Framer Motion, Lucide React
- **Formulaires**: React Hook Form + Zod
- **Backend**: Supabase (Auth, Postgres, Storage, Policies)
- **Tests**: Vitest, React Testing Library

## ✨ Fonctionnalités (MVP actuel)
- 🔐 Auth: inscription (avec confirmation email), connexion, déconnexion
- 👤 Profils: affichage, mise à jour basique
- 📦 Objets: création avec images (Storage), géolocalisation, informations détaillées (marque, modèle, tags, valeur, disponibilité)
- 🗺️ Localisation: auto-remplissage d’adresse via reverse-geocoding (Nominatim), coordonnées lat/lng
- 🔎 Filtres avancés: catégorie, état, marque, tags, valeur min/max, période, avec photos, disponibilité
- 📋 Demandes de prêt: création, suivi, changement de statut; vue combinée (demandeur/propriétaire)
- 💬 Messagerie basique (non temps réel)
- ⭐ Avis: note moyenne et nombre d’avis par objet (agrégations)
- 📱 UI responsive avec thème affiné (typographie compacte, composants utilitaires)
- 🔧 Propriétaire: modification, désactivation/réactivation, suppression d’un objet

## ⚠️ Sécurité & déploiement
- En dev, RLS peut être assouplie. En prod, activer RLS et écrire des policies strictes (voir `DB_SCHEMA.md`).
- Supabase Storage: créer le bucket `items` et définir des policies (lecture publique, écriture authentifiée, ou par dossier utilisateur).

## 📦 Prérequis
- Node.js 18+ et npm
- Compte Supabase (projet actif)
- (Optionnel) Supabase CLI pour automatiser les migrations

## 🚀 Installation & Configuration
1) Cloner et installer
```bash
git clone <VOTRE_REPO>
cd trocall
npm install
```

2) Variables d’environnement
Créez `.env` à la racine:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
Supabase Dashboard → Settings → API.

3) Base de données & storage
- Exécuter les migrations dans l’ordre:
  - `supabase/migrations/20250916192035_old_bird.sql` (schéma de base)
  - `supabase/migrations/20250917120000_add_item_fields.sql` (champs items additionnels)
  - `supabase/migrations/20250917121000_add_item_location.sql` (latitude/longitude)
  - `supabase/migrations/20250917123000_add_item_ratings.sql` (table des avis)
- Storage: créer le bucket public `items` (Dashboard → Storage). Ajouter les policies (voir `DB_SCHEMA.md`).

4) Démarrer en développement
```bash
npm run dev
```
Accéder à `http://localhost:5173`

5) Build & Preview production
```bash
npm run build
npm run preview
```

## 🗂️ Structure du projet
```
src/
├─ components/          # UI (layout, navigation, cartes)
├─ pages/               # Pages & routing
├─ hooks/               # Hooks (items, requests, profiles, messages)
├─ services/            # Clients externes (Supabase)
├─ store/               # État global (auth via Zustand)
├─ types/               # Types TypeScript (domaine)
├─ utils/               # Utilitaires (catégories…)
└─ test/                # Tests unitaires & rendu
```

## 🔑 Variables d’environnement
- `VITE_SUPABASE_URL`: URL du projet Supabase
- `VITE_SUPABASE_ANON_KEY`: clé anonyme Supabase

## 🧪 Tests
```bash
npm run test
npm run test:ui
```

## 🤝 Contribution
Voir `CONTRIBUTING.md` (style, conventions, branchement, qualité, CI). Les PRs sont bienvenues !

## 📚 Documentation
- `ARCHITECTURE.md`: frontend, backend, DB et flux clefs
- `API_DOCS.md`: opérations (items, requests, messages, storage…) et exemples
- `DB_SCHEMA.md`: tables, relations, contraintes et policies
- `ROADMAP.md`: trajectoire MVP → V1 → +
- `CONTRIBUTING.md`: contribuer proprement au projet

## 📄 Licence
MIT — voir `LICENSE`.

---

TrocAll – Partageons plus, consommons mieux. 🌱