# Échangeo 🌱

**La plateforme communautaire pour des échanges locaux et durables**

Échangeo révolutionne la consommation en permettant aux voisins de partager, emprunter et donner leurs objets facilement. Notre mission : créer du lien social tout en réduisant les déchets et en favorisant l'économie circulaire.

## 🚀 Stack Technique

### Frontend
- **React 18** avec TypeScript
- **Vite** pour le build et le dev server
- **Tailwind CSS** pour le styling
- **Framer Motion** pour les animations
- **React Router** pour la navigation
- **React Hook Form** + **Zod** pour les formulaires
- **TanStack Query** pour la gestion d'état serveur
- **Zustand** pour l'état global client
- **Lucide React** pour les icônes

### Backend & Base de données
- **Supabase** (PostgreSQL + Auth + Storage + Realtime)
- **Row Level Security** (RLS) pour la sécurité
- **Migrations SQL** pour la gestion du schéma

### Services externes
- **Google Gemini AI** pour l'analyse d'images et le chat
- **Mapbox** pour la géolocalisation et les cartes
- **Nominatim** (OpenStreetMap) pour la géocodification

### Outils de développement
- **ESLint** + **TypeScript** pour la qualité du code
- **Vitest** pour les tests
- **PostCSS** + **Autoprefixer**

## ✨ Fonctionnalités Principales (MVP)

### 📦 Gestion des Objets
- **Publication d'objets** avec photos multiples et analyse IA
- **Catégorisation automatique** par intelligence artificielle
- **Système de prêt, échange et don** entre voisins
- **Recherche géolocalisée** et filtres avancés
- **Favoris et évaluations** des objets

### 👥 Communauté Locale
- **Profils utilisateurs** complets avec géolocalisation
- **Communautés de quartier** avec événements et discussions
- **Système de voisinage** géographique intelligent
- **Chat intégré** avec assistant IA
- **Notifications** en temps réel

### 🎮 Gamification
- **Système de niveaux** et points (1-20+)
- **Badges de réputation** (Super Prêteur, Voisin Fiable, etc.)
- **Défis communautaires** quotidiens/hebdomadaires
- **Classement** des utilisateurs les plus actifs
- **Historique des récompenses**

### 🤖 Intelligence Artificielle
- **Analyse d'images** pour catégoriser automatiquement les objets
- **Suggestions de prix** et descriptions optimisées
- **Assistant de chat** avec suggestions contextuelles
- **Analyse de compatibilité** entre utilisateurs
- **Médiation automatique** des conflits

### 🛡️ Administration
- **Dashboard admin** avec statistiques globales
- **Gestion des utilisateurs** (bannissement, modération)
- **Gestion des objets** (modération, suspension)
- **Gestion des communautés** et événements
- **Système de rapports** et logs

## 📋 Prérequis

- **Node.js** 18+ et npm/yarn
- **Compte Supabase** (gratuit)
- **Clé API Google Gemini** (optionnel pour l'IA)
- **Clé API Mapbox** (optionnel pour les cartes)

## 🛠️ Installation et Configuration

### 1. Cloner le projet
```bash
git clone <repository-url>
cd echangeo
```

### 2. Installer les dépendances
```bash
npm install
# ou
yarn install
```

### 3. Configuration Supabase

#### Créer un projet Supabase
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Récupérez l'URL et la clé anonyme

#### Configurer les variables d'environnement
Créez un fichier `.env.local` à la racine :

```env
# Supabase (obligatoire)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini AI (optionnel)
VITE_GEMINI_API_KEY=your_gemini_api_key

# Mapbox (optionnel)
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token

# Fonctionnalités (optionnel)
VITE_ENABLE_DONATIONS=false
```

### 4. Configuration de la base de données

#### Option A : Via Supabase CLI (recommandé)
```bash
# Installer Supabase CLI
npm install -g supabase

# Initialiser le projet
supabase init

# Lier à votre projet Supabase
supabase link --project-ref your_project_ref

# Appliquer les migrations
supabase db push
```

#### Option B : Via l'interface Supabase
1. Allez dans l'onglet "SQL Editor" de votre projet Supabase
2. Exécutez les fichiers SQL dans l'ordre :
   - `supabase/migrations/20250916192035_old_bird.sql`
   - `supabase/migrations/20250917130000_add_user_ratings_and_badges.sql`
   - `supabase/migrations/20250917140000_add_offer_type.sql`
   - `supabase/migrations/20250120000000_enhanced_gamification.sql`
   - `supabase/migrations/20250120000001_notifications.sql`
   - `supabase/migrations/20250120000003_communities_simple.sql`
   - `supabase/migrations/20250120000004_user_bans.sql`
   - `supabase/migrations/20250917150000_add_favorites.sql`

### 5. Configuration du storage Supabase
1. Allez dans "Storage" de votre projet Supabase
2. Créez un bucket nommé `items` avec les permissions publiques
3. Configurez les politiques RLS si nécessaire

## 🚀 Lancement du projet

### Développement
```bash
npm run dev
# ou
yarn dev
```

L'application sera accessible sur `http://localhost:5173`

### Production
```bash
# Build
npm run build
# ou
yarn build

# Preview
npm run preview
# ou
yarn preview
```

### Tests
```bash
npm run test
# ou
yarn test

# Tests avec interface
npm run test:ui
# ou
yarn test:ui
```

## 📁 Structure du Projet

```
src/
├── components/           # Composants réutilisables
│   ├── admin/           # Composants d'administration
│   ├── ui/              # Composants UI de base
│   └── modals/          # Modales
├── hooks/               # Hooks React personnalisés
├── pages/               # Pages de l'application
│   └── admin/           # Pages d'administration
├── services/            # Services externes (Supabase, AI, etc.)
├── store/               # État global (Zustand)
├── types/               # Types TypeScript
├── utils/               # Utilitaires et helpers
└── test/                # Configuration des tests

supabase/
├── migrations/          # Migrations SQL
└── *.sql               # Scripts SQL utilitaires

public/                  # Assets statiques
docs/                    # Documentation
```

## 🔧 Variables d'Environnement

| Variable | Description | Obligatoire | Défaut |
|----------|-------------|-------------|---------|
| `VITE_SUPABASE_URL` | URL de votre projet Supabase | ✅ | - |
| `VITE_SUPABASE_ANON_KEY` | Clé anonyme Supabase | ✅ | - |
| `VITE_GEMINI_API_KEY` | Clé API Google Gemini | ❌ | - |
| `VITE_MAPBOX_ACCESS_TOKEN` | Token Mapbox | ❌ | - |
| `VITE_ENABLE_DONATIONS` | Activer les dons | ❌ | `false` |

## 🎯 Bonnes Pratiques pour Contribuer

### Code Style
- Utilisez **TypeScript** strict
- Suivez les conventions **ESLint** configurées
- Préférez les **composants fonctionnels** avec hooks
- Utilisez **Tailwind CSS** pour le styling

### Architecture
- **Séparation des responsabilités** : hooks pour la logique, composants pour l'UI
- **Gestion d'état** : TanStack Query pour le serveur, Zustand pour le client
- **Validation** : Zod pour les schémas, React Hook Form pour les formulaires
- **Types** : Interfaces TypeScript strictes

### Base de données
- **Migrations** : Toujours créer des migrations pour les changements de schéma
- **RLS** : Utiliser Row Level Security pour la sécurité
- **Index** : Ajouter des index pour les performances

### Tests
- **Tests unitaires** pour les utilitaires et hooks
- **Tests d'intégration** pour les composants critiques
- **Tests E2E** pour les flux utilisateur principaux

## 📚 Documentation Additionnelle

- [Architecture détaillée](./docs/ARCHITECTURE.md)
- [Documentation API](./docs/API_DOCS.md)
- [Schéma de base de données](./docs/DB_SCHEMA.md)
- [Roadmap du projet](./docs/ROADMAP.md)
- [Guide de contribution](./docs/CONTRIBUTING.md)

## 🐛 Dépannage

### Erreurs courantes

#### "Missing Supabase environment variables"
- Vérifiez que `.env.local` existe et contient les bonnes variables
- Redémarrez le serveur de développement

#### "Invalid enum value" pour les types d'offre
- Exécutez le script `supabase/FIX_ALL_ENUM_ERRORS.sql` dans Supabase
- Redémarrez l'application

#### Problèmes de géolocalisation
- Vérifiez que `VITE_MAPBOX_ACCESS_TOKEN` est configuré
- Autorisez la géolocalisation dans votre navigateur

### Logs et debugging
- **Console du navigateur** : Erreurs frontend
- **Supabase Dashboard** : Logs de la base de données
- **Network tab** : Requêtes API

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](./LICENSE) pour plus de détails.

## 🤝 Support

- **Issues** : Utilisez les GitHub Issues pour signaler des bugs
- **Discussions** : GitHub Discussions pour les questions
- **Email** : contact@echangeo.fr

---

**Échangeo** - Révolutionnons ensemble la consommation locale ! 🌱✨