# TrocAll 🌱

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
- **Gemini AI** pour l'analyse d'images et suggestions de chat
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
- Système de favoris et d'évaluations

### 👥 **Système Communautaire**
- Profils utilisateurs avec réputation et géolocalisation
- Système de voisinage géographique avec communautés
- Chat intégré pour les négociations avec assistant IA
- Notifications en temps réel
- Système de modération et de signalement

### 🎮 **Gamification Avancée**
- Système de niveaux et points
- Badges de réputation (Super Prêteur, Voisin Fiable, etc.)
- Défis communautaires quotidiens/hebdomadaires
- Classement des utilisateurs les plus actifs
- Récompenses et événements communautaires

### 🤖 **Intelligence Artificielle**
- Analyse automatique d'images pour catégoriser les objets
- Suggestions de prix et descriptions optimisées
- Assistant de chat avec suggestions contextuelles
- Analyse de compatibilité entre utilisateurs
- Médiation automatique des conflits

### 🗺️ **Communautés de Quartier**
- Création et gestion de communautés géographiques
- Événements communautaires (rencontres, ateliers, échanges)
- Forums de discussion par quartier
- Statistiques d'activité communautaire

### 📱 **Interface Moderne**
- Design responsive (mobile-first)
- Navigation intuitive avec bottom navigation
- Animations fluides et micro-interactions
- Cartes interactives avec Mapbox
- Mode sombre (en développement)

## 📋 Prérequis

- **Node.js** 18+ et npm/yarn
- **Compte Supabase** (gratuit)
- **Clé API Gemini** (optionnel pour l'IA)
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

# Gemini AI (optionnel)
VITE_GEMINI_API_KEY=your-gemini-key

# Mapbox (optionnel)
VITE_MAPBOX_TOKEN=your-mapbox-token
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
│   ├── admin/           # Composants d'administration
│   ├── modals/          # Modales et overlays
│   ├── Shell.tsx        # Layout principal avec navigation
│   ├── Topbar.tsx       # Barre de navigation desktop
│   ├── BottomNavigation.tsx # Navigation mobile
│   ├── ItemCard.tsx     # Carte d'objet
│   ├── MapboxMap.tsx    # Carte interactive
│   ├── ChatAIAssistant.tsx # Assistant IA pour le chat
│   ├── GamificationPage.tsx # Système de gamification
│   ├── NotificationSystem.tsx # Système de notifications
│   └── ...
├── pages/               # Pages de l'application
│   ├── HomePage.tsx     # Page d'accueil avec dashboard
│   ├── ItemsPage.tsx    # Liste et recherche d'objets
│   ├── CreateItemPage.tsx # Création d'objet avec IA
│   ├── GamificationPage.tsx # Système de niveaux et badges
│   ├── ChatPage.tsx     # Messagerie intégrée
│   ├── CommunitiesPage.tsx # Gestion des communautés
│   ├── admin/           # Pages d'administration
│   └── ...
├── hooks/               # Hooks personnalisés
│   ├── useItems.ts      # Gestion des objets
│   ├── useGamification.ts # Système de gamification
│   ├── useChatAI.ts     # Assistant IA
│   ├── useCommunities.ts # Gestion des communautés
│   ├── useAdmin.ts      # Fonctionnalités admin
│   └── ...
├── services/            # Services externes
│   ├── supabase.ts      # Configuration Supabase
│   ├── aiService.ts     # Services IA (Gemini)
│   ├── chatAI.ts        # Assistant de chat
│   ├── categoryDetection.ts # Détection de catégories
│   ├── compatibilityAI.ts # Analyse de compatibilité
│   └── mediationAI.ts   # Médiation des conflits
├── store/               # État global
│   └── authStore.ts     # Store d'authentification (Zustand)
├── types/               # Types TypeScript
│   ├── index.ts         # Types principaux
│   ├── database.ts      # Types générés Supabase
│   └── admin.ts         # Types d'administration
├── utils/               # Utilitaires
│   ├── categories.ts    # Catégories d'objets
│   ├── validation.ts    # Schémas de validation
│   ├── geolocation.ts  # Utilitaires géolocalisation
│   └── formatting.ts    # Formatage des données
└── test/                # Tests
    ├── setup.ts         # Configuration des tests
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

## 🔒 Sécurité

- **Row Level Security (RLS)** activé sur toutes les tables
- **Authentification** via Supabase Auth
- **Validation** des données avec Zod
- **Sanitisation** des entrées utilisateur
- **Système de modération** et signalement
- **Gestion des utilisateurs bannis**

## 📊 Fonctionnalités d'Administration

- **Dashboard** avec statistiques globales
- **Gestion des utilisateurs** (bannissement, modération)
- **Gestion des objets** (modération, suspension)
- **Gestion des communautés** (validation, modération)
- **Système de rapports** et logs
- **Analytics** avancées

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
- **IA** : L'analyse d'images nécessite une clé API Gemini
- **Cartes** : La géolocalisation nécessite une clé API Mapbox
- **Communautés** : Certaines fonctionnalités nécessitent des migrations supplémentaires

## 🚀 Roadmap

### Phase Actuelle (MVP)
- ✅ Système de base complet
- ✅ Gamification avancée
- ✅ IA intégrée
- ✅ Communautés de quartier
- ✅ Administration complète

### Prochaines étapes
- 🔄 Optimisation des performances
- 🔄 Tests automatisés complets
- 🔄 Mode sombre
- 🔄 Application mobile native

## 📄 Licence

Ce projet est sous licence MIT. Voir [LICENSE](./LICENSE) pour plus de détails.

## 🙏 Remerciements

- [Supabase](https://supabase.com) pour l'infrastructure backend
- [Google Gemini](https://ai.google.dev) pour les services d'IA
- [Mapbox](https://mapbox.com) pour les services de cartographie
- [Tailwind CSS](https://tailwindcss.com) pour le système de design
- [Framer Motion](https://framer.com/motion) pour les animations

---

**TrocAll** - Révolutionnons la consommation locale ensemble ! 🌱