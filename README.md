# TrocAll 🎯

**Plateforme communautaire de partage et d'emprunt d'objets entre voisins**

TrocAll révolutionne la consommation en permettant aux voisins de partager, emprunter et échanger des objets du quotidien. Économisez de l'argent, désencombrez votre espace et créez du lien social dans votre quartier.

## 🚀 Stack Technique

### Frontend
- **React 18** avec TypeScript pour une interface moderne et type-safe
- **Vite** comme bundler ultra-rapide
- **Tailwind CSS** pour un design system cohérent et responsive
- **Framer Motion** pour des animations fluides
- **React Router** pour la navigation SPA
- **TanStack Query** pour la gestion d'état serveur
- **Zustand** pour l'état global client
- **React Hook Form** + **Zod** pour la validation des formulaires
- **Lucide React** pour les icônes

### Backend & Services
- **Supabase** comme Backend-as-a-Service (PostgreSQL + Auth + Storage + Realtime)
- **Mistral AI** pour l'analyse d'images et suggestions de chat
- **Mapbox** pour la géolocalisation et cartes interactives

### Outils de Développement
- **ESLint** + **TypeScript** pour la qualité du code
- **Vitest** + **Testing Library** pour les tests
- **PostCSS** + **Autoprefixer** pour le CSS

## ✨ Fonctionnalités Principales (MVP)

### 🏠 **Gestion des Objets**
- Publication d'objets avec photos, descriptions et géolocalisation
- Catégorisation automatique par IA (outils, électronique, livres, sports, etc.)
- Système de prêt et d'échange
- Recherche géolocalisée et par catégories

### 👥 **Système Communautaire**
- Profils utilisateurs avec réputation
- Système de voisinage géographique
- Chat intégré pour les négociations
- Notifications en temps réel

### 🎮 **Gamification Avancée**
- Système de niveaux et points
- Badges de réputation (Super Prêteur, Voisin Fiable, etc.)
- Défis communautaires quotidiens/hebdomadaires
- Classement des utilisateurs les plus actifs
- Récompenses et événements communautaires

### 🤖 **Intelligence Artificielle**
- Analyse automatique d'images pour catégoriser les objets
- Suggestions de prix et descriptions
- Assistant de chat avec suggestions contextuelles
- Analyse de compatibilité entre utilisateurs

### 📱 **Interface Moderne**
- Design responsive (mobile-first)
- Navigation intuitive avec bottom navigation
- Animations fluides et micro-interactions
- Mode sombre (en développement)

## 📋 Prérequis

- **Node.js** 18+ et npm/yarn
- **Compte Supabase** (gratuit)
- **Clé API Mistral** (optionnel pour l'IA)
- **Clé API Mapbox** (optionnel pour les cartes)

## 🛠️ Installation et Configuration

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
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Récupérez l'URL et la clé anonyme

#### Appliquer les migrations
```bash
# Installer Supabase CLI
npm install -g supabase

# Se connecter à votre projet
supabase link --project-ref <your-project-ref>

# Appliquer les migrations
supabase db push
```

### 4. Variables d'environnement
Créez un fichier `.env.local` :
```env
# Supabase (obligatoire)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Mistral AI (optionnel)
VITE_MISTRAL_API_KEY=your-mistral-key

# Mapbox (optionnel)
VITE_MAPBOX_ACCESS_TOKEN=your-mapbox-token
```

### 5. Lancer le projet
```bash
# Développement
npm run dev

# Build de production
npm run build

# Preview de production
npm run preview
```

## 🏗️ Structure du Projet

```
src/
├── components/           # Composants réutilisables
│   ├── ui/              # Composants UI de base (Button, Card, Input...)
│   ├── Shell.tsx        # Layout principal avec navigation
│   ├── Topbar.tsx       # Barre de navigation desktop
│   ├── BottomNavigation.tsx # Navigation mobile
│   ├── ItemCard.tsx     # Carte d'objet
│   ├── MapboxMap.tsx    # Carte interactive
│   ├── ChatAIAssistant.tsx # Assistant IA pour le chat
│   ├── GamificationPage.tsx # Système de gamification
│   └── ...
├── pages/               # Pages de l'application
│   ├── HomePage.tsx     # Page d'accueil avec dashboard
│   ├── ItemsPage.tsx    # Liste et recherche d'objets
│   ├── CreateItemPage.tsx # Création d'objet avec IA
│   ├── GamificationPage.tsx # Système de niveaux et badges
│   ├── ChatPage.tsx     # Messagerie intégrée
│   └── ...
├── hooks/               # Hooks personnalisés
│   ├── useItems.ts      # Gestion des objets
│   ├── useGamification.ts # Système de gamification
│   ├── useChatAI.ts     # Assistant IA
│   ├── useAuth.ts       # Authentification
│   └── ...
├── services/            # Services externes
│   ├── supabase.ts      # Configuration Supabase
│   ├── aiService.ts     # Services IA (Mistral)
│   ├── chatAI.ts        # Assistant de chat
│   └── ...
├── store/               # État global
│   └── authStore.ts     # Store d'authentification (Zustand)
├── types/               # Types TypeScript
│   ├── index.ts         # Types principaux
│   └── database.ts      # Types générés Supabase
└── utils/               # Utilitaires
    ├── categories.ts    # Catégories d'objets
    └── ...
```

## 🔧 Scripts Disponibles

```bash
# Développement
npm run dev              # Serveur de développement Vite

# Build et déploiement
npm run build           # Build de production
npm run preview         # Preview du build

# Qualité du code
npm run lint            # ESLint
npm run lint:fix        # Correction automatique

# Tests
npm run test            # Tests unitaires Vitest
npm run test:ui         # Interface de test
```

## 🌐 Déploiement

### Netlify (Recommandé)
1. Connectez votre repository GitHub
2. Configurez les variables d'environnement
3. Déployez automatiquement

### Vercel
```bash
npm install -g vercel
vercel --prod
```

### Build statique
```bash
npm run build
# Les fichiers sont dans dist/
```

## 🤝 Contribuer

Voir [CONTRIBUTING.md](./CONTRIBUTING.md) pour les guidelines détaillées.

### Workflow de base
1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit vos changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📚 Documentation Additionnelle

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture technique détaillée
- [API_DOCS.md](./API_DOCS.md) - Documentation des APIs
- [DB_SCHEMA.md](./DB_SCHEMA.md) - Schéma de base de données
- [ROADMAP.md](./ROADMAP.md) - Feuille de route du projet
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Guide de contribution

## 🐛 Problèmes Connus

- **Gamification** : Les tables de gamification nécessitent l'application des migrations RLS
- **IA** : L'analyse d'images nécessite une clé API Mistral
- **Cartes** : La géolocalisation nécessite une clé API Mapbox

## 📄 Licence

Ce projet est sous licence MIT. Voir [LICENSE](./LICENSE) pour plus de détails.

## 🙏 Remerciements

- [Supabase](https://supabase.com) pour l'infrastructure backend
- [Mistral AI](https://mistral.ai) pour les services d'IA
- [Mapbox](https://mapbox.com) pour les services de cartographie
- [Tailwind CSS](https://tailwindcss.com) pour le système de design

---

**TrocAll** - Révolutionnons la consommation locale ensemble ! 🌱