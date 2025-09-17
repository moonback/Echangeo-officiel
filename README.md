# TrocAll 🛠️

**Une plateforme communautaire de prêt et d'échange d'objets entre voisins, permettant de partager des ressources localement tout en renforçant les liens de quartier.**

TrocAll facilite le prêt, l'emprunt et l'échange d'objets du quotidien (outils, livres, équipements sportifs, etc.) entre voisins, avec un système de réputation et de géolocalisation pour créer une économie collaborative de proximité.

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
- **PostgreSQL** avec extensions UUID
- **Row Level Security** (RLS) désactivé en MVP

### Outils de développement
- **ESLint** + **TypeScript** pour la qualité du code
- **Vitest** + **Testing Library** pour les tests
- **Mapbox GL** pour la géolocalisation

## ✨ Fonctionnalités Principales (MVP)

### 🔐 Authentification & Profils
- Inscription/Connexion sécurisée
- Profils utilisateurs complets (nom, bio, localisation, avatar)
- Géolocalisation automatique
- Système de badges et de réputation

### 📦 Gestion d'Objets
- Publication d'objets avec photos, descriptions, catégories
- 8 catégories : Outils, Électronique, Livres, Sports, Cuisine, Jardin, Jouets, Autre
- Système de condition (excellent, bon, correct, mauvais)
- Géolocalisation des objets
- Gestion de la disponibilité

### 🤝 Système d'Échanges
- **Prêts** : Demande d'emprunt d'objets
- **Troc** : Échange d'objets entre utilisateurs
- Workflow complet : Demande → Validation → Échange → Retour
- Messagerie intégrée pour la communication
- Notifications de statut

### ⭐ Système de Réputation
- Évaluations mutuelles après chaque transaction
- 3 critères : Communication, Ponctualité, Soin de l'objet
- Système de badges automatique (Super Prêteur, Voisin Fiable, etc.)
- Affichage des scores de confiance sur les profils

### 🗺️ Géolocalisation
- Carte interactive des objets disponibles
- Calcul de distance avec les utilisateurs
- Filtrage par proximité

## 📋 Prérequis

- **Node.js** 18+ 
- **npm** ou **yarn**
- **Compte Supabase** (gratuit)
- **Clé API Mapbox** (gratuite)

## 🛠️ Installation & Configuration

### 1. Cloner le projet
```bash
git clone <repository-url>
cd trocall
```

### 2. Installer les dépendances
```bash
npm install
# ou
yarn install
```

### 3. Configuration Supabase

#### Créer un projet Supabase
1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Récupérer l'URL et la clé anonyme

#### Exécuter les migrations
```bash
# Installer Supabase CLI
npm install -g supabase

# Se connecter à votre projet
supabase link --project-ref <your-project-ref>

# Appliquer les migrations
supabase db push
```

### 4. Configuration des variables d'environnement

Créer un fichier `.env.local` :
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_MAPBOX_TOKEN=your_mapbox_token
```

### 5. Configuration Mapbox (optionnel)
1. Créer un compte sur [mapbox.com](https://mapbox.com)
2. Générer un token d'accès public
3. L'ajouter dans `.env.local`

## 🚀 Lancement du Projet

### Développement
```bash
npm run dev
# ou
yarn dev
```

L'application sera disponible sur `http://localhost:5173`

### Build de production
```bash
npm run build
# ou
yarn build
```

### Preview de production
```bash
npm run preview
# ou
yarn preview
```

### Tests
```bash
npm run test
# ou
yarn test

# Interface de test
npm run test:ui
# ou
yarn test:ui
```

## 📁 Structure du Projet

```
src/
├── components/           # Composants réutilisables
│   ├── ui/              # Composants UI de base
│   ├── AuthGuard.tsx    # Protection des routes
│   ├── BottomNavigation.tsx
│   ├── ItemCard.tsx     # Carte d'objet
│   ├── MapboxMap.tsx    # Carte interactive
│   ├── Shell.tsx        # Layout principal
│   └── Topbar.tsx       # Barre de navigation
├── hooks/               # Hooks personnalisés
│   ├── useItems.ts      # Gestion des objets
│   ├── useProfiles.ts   # Gestion des profils
│   ├── useRequests.ts   # Gestion des demandes
│   ├── useRatings.ts    # Système d'évaluation
│   └── useMediaQuery.ts # Responsive design
├── pages/               # Pages de l'application
│   ├── HomePage.tsx     # Page d'accueil
│   ├── ItemsPage.tsx    # Liste des objets
│   ├── ItemDetailPage.tsx
│   ├── CreateItemPage.tsx
│   ├── RequestsPage.tsx # Gestion des échanges
│   ├── ProfilePage.tsx  # Profil utilisateur
│   ├── MyProfilePage.tsx
│   ├── ChatPage.tsx     # Messagerie
│   └── ...
├── services/            # Services externes
│   └── supabase.ts      # Configuration Supabase
├── store/               # État global
│   └── authStore.ts     # Store d'authentification
├── types/               # Types TypeScript
│   ├── index.ts         # Types principaux
│   └── database.ts      # Types Supabase
├── utils/               # Utilitaires
│   └── categories.ts    # Catégories d'objets
└── test/                # Tests
    ├── setup.ts
    └── *.test.tsx
```

## 🔧 Variables d'Environnement

| Variable | Description | Requis |
|----------|-------------|--------|
| `VITE_SUPABASE_URL` | URL de votre projet Supabase | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Clé anonyme Supabase | ✅ |
| `VITE_MAPBOX_TOKEN` | Token d'accès Mapbox | ❌ |

## 🗄️ Base de Données

### Tables principales
- **profiles** : Profils utilisateurs
- **items** : Objets à prêter/échanger
- **item_images** : Images des objets
- **requests** : Demandes d'emprunt
- **messages** : Messagerie
- **item_ratings** : Évaluations d'objets
- **user_ratings** : Évaluations mutuelles

### Vues
- **profile_reputation_stats** : Statistiques de réputation
- **profile_activity_counts** : Compteurs d'activité
- **profile_badges** : Badges automatiques
- **item_rating_stats** : Statistiques d'objets

## 🧪 Tests

Le projet utilise **Vitest** et **Testing Library** :

```bash
# Tests unitaires
npm run test

# Tests avec interface graphique
npm run test:ui

# Tests en mode watch
npm run test -- --watch
```

## 📦 Déploiement

### Netlify (recommandé)
1. Connecter le repository GitHub
2. Build command : `npm run build`
3. Publish directory : `dist`
4. Variables d'environnement : Ajouter les variables Supabase

### Vercel
1. Importer le projet
2. Variables d'environnement : Configurer Supabase
3. Build automatique

## 🤝 Contribution

Voir [CONTRIBUTING.md](./CONTRIBUTING.md) pour les guidelines de contribution.

## 📄 Licence

MIT License - Voir [LICENSE](./LICENSE) pour plus de détails.

## 🆘 Support

- **Documentation** : Voir les fichiers dans `/docs`
- **Issues** : Utiliser GitHub Issues
- **Discussions** : GitHub Discussions

## 🗺️ Roadmap

Voir [ROADMAP.md](./ROADMAP.md) pour les fonctionnalités à venir.

---

**TrocAll** - *Partageons localement, vivons mieux ensemble* 🌱