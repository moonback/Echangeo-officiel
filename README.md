## 🏠 TrocAll – Prêt et troc d’objets entre voisins

Application web mobile-first pour emprunter/échanger des objets avec ses voisins. Objectif: encourager l’entraide locale et réduire la surconsommation.

## ⚙️ Stack technique
- **Frontend**: React 18, TypeScript, Vite, React Router v6
- **État & Data**: Zustand (auth), TanStack Query (server-state)
- **UI**: Tailwind CSS, Framer Motion, Lucide React
- **Formulaires**: React Hook Form + Zod
- **Backend**: Supabase (Auth, Database Postgres, Storage)
- **Tests**: Vitest, React Testing Library

## ✨ Fonctionnalités (MVP)
- 🔐 Authentification (inscription, connexion, déconnexion)
- 👤 Profils utilisateurs (affichage + édition basique via store)
- 📦 Objets à prêter (création, listing, images via Storage)
- 🔎 Recherche / filtres par catégories
- 📋 Demandes de prêt (création, suivi, changement de statut)
- 💬 Messagerie basique entre voisins (non temps réel)
- 🧑‍🤝‍🧑 Liste des voisins (profils, accès rapide au chat et au profil)
- 📱 UI responsive mobile-first

## ⚠️ Sécurité & mise en garde
Cette version MVP **désactive RLS (Row Level Security)** pour simplifier le dev. Ne pas déployer en production sans activer RLS et définir des policies adaptées. Voir `DB_SCHEMA.md`.

## 📦 Prérequis
- Node.js 18+ et npm
- Compte Supabase et un projet actif
- (Optionnel) Supabase CLI si vous souhaitez automatiser les migrations/local

## 🚀 Installation & Configuration
1. Cloner et installer
```bash
git clone <VOTRE_REPO>
cd trocall
npm install
```

2. Variables d’environnement
Créez `.env` à la racine et renseignez:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
Récupérez ces valeurs dans Supabase: Settings → API.

3. Base de données
- Ouvrez le SQL Editor de Supabase et exécutez le contenu de `supabase/migrations/20250916192035_old_bird.sql`.
- Créez un bucket de stockage public nommé `items` (Storage → Create bucket → Public) pour les images d’objets.

4. Démarrage en développement
```bash
npm run dev
```
Application: `http://localhost:5173`

5. Build & preview de production
```bash
npm run build
npm run preview
```

## 🗂️ Structure du projet
```
src/
├─ components/          # Composants UI (layout, navigation, cartes)
├─ pages/               # Pages (routing)
├─ hooks/               # Hooks React (items, requests, profiles, messages)
├─ services/            # Clients externes (Supabase)
├─ store/               # État global (auth via Zustand)
├─ types/               # Types TypeScript (domain)
├─ utils/               # Utilitaires (catégories, helpers)
└─ test/                # Tests unitaires et de rendu
```

## 🔑 Variables d’environnement
- `VITE_SUPABASE_URL`: URL du projet Supabase
- `VITE_SUPABASE_ANON_KEY`: clé anonyme Supabase

## 🧪 Tests
```bash
npm run test        # exécuter les tests
npm run test:ui     # mode UI de Vitest
```

## 🤝 Contribution
Voir `CONTRIBUTING.md` pour les conventions, process de PR et qualité.

## 📚 Documentation complémentaire
- `ARCHITECTURE.md`: architecture frontend/backend/DB
- `API_DOCS.md`: opérations de données et schémas (via Supabase)
- `DB_SCHEMA.md`: tables, relations, contraintes
- `ROADMAP.md`: trajectoire produit (MVP → V1 → +)
- `CONTRIBUTING.md`: guidelines de contribution

## 📄 Licence
MIT. Voir `LICENSE`.

---

TrocAll – Partageons plus, consommons mieux. 🌱