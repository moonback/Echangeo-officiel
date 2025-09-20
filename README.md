# Échangeo 🌱

**Plateforme communautaire de partage d'objets entre voisins pour une consommation plus responsable.**

Échangeo facilite le prêt, l'échange et le don d'objets au niveau local, créant des liens sociaux tout en promouvant l'économie circulaire. L'application permet aux résidents d'un même quartier de partager leurs ressources matérielles de manière sécurisée et conviviale.

## 🚀 Stack Technique

### Frontend
- **React 18** - Framework JavaScript moderne
- **TypeScript** - Typage statique pour plus de robustesse
- **Vite** - Outil de build rapide et moderne
- **React Router v6** - Navigation côté client
- **Tailwind CSS** - Framework CSS utilitaire
- **Framer Motion** - Animations fluides et micro-interactions
- **Lucide React** - Bibliothèque d'icônes

### État et Données
- **Zustand** - Gestion d'état global léger (authentification)
- **TanStack Query** - Gestion des données serveur, cache et synchronisation
- **React Hook Form + Zod** - Gestion et validation des formulaires

### Backend
- **Supabase** - Backend-as-a-Service
  - **PostgreSQL** - Base de données relationnelle
  - **Auth** - Authentification et autorisation
  - **Storage** - Stockage d'images et fichiers
  - **Real-time** - Mises à jour en temps réel
  - **Edge Functions** - Fonctions serverless

### Tests et Qualité
- **Vitest** - Framework de tests rapide
- **React Testing Library** - Tests de composants React
- **ESLint** - Linting du code
- **TypeScript** - Vérification de types

## ✨ Fonctionnalités Principales (MVP)

### 🔐 Authentification & Profils
- Inscription/connexion sécurisée avec confirmation email
- Profils utilisateurs personnalisables avec géolocalisation
- Gestion des préférences et paramètres de confidentialité

### 📦 Gestion des Objets
- **Création d'annonces** avec photos haute qualité
- **Catégorisation intelligente** par IA (outils, électronique, livres, etc.)
- **Types d'offres** : Prêt, Échange, Don
- **Géolocalisation précise** avec auto-remplissage d'adresse
- **Gestion des disponibilités** avec créneaux horaires
- **États d'objets** : excellent, bon, correct, usé

### 🔍 Recherche & Découverte
- **Recherche intelligente** avec suggestions
- **Filtres avancés** : catégorie, état, marque, valeur, période
- **Vue cartographique** avec clusters et marqueurs
- **Système de favoris** pour sauvegarder les objets

### 💬 Communication & Échanges
- **Messagerie intégrée** pour communiquer entre utilisateurs
- **Demandes de prêt/troc** avec suivi de statut
- **Notifications en temps réel** pour les interactions
- **Système d'avis et notations** pour la réputation

### 🏘️ Communautés Locales
- **Rejoindre des quartiers** géolocalisés
- **Événements communautaires** (troc party, ateliers)
- **Discussions de quartier** par catégorie
- **Statistiques de communauté** (membres, objets, activité)

### 🎮 Gamification
- **Système de niveaux et points** pour encourager l'engagement
- **Badges et récompenses** pour les utilisateurs actifs
- **Défis communautaires** (quotidiens, hebdomadaires, mensuels)
- **Classements** par quartier et global

### 🛡️ Administration
- **Interface admin complète** pour la modération
- **Gestion des utilisateurs** (bannissements, statistiques)
- **Modération des objets** (suspension, suppression)
- **Tableaux de bord** avec métriques détaillées

## 📋 Prérequis

- **Node.js** 18+ et npm/yarn
- **Compte Supabase** avec projet configuré
- **Git** pour le versioning
- **Navigateur moderne** (Chrome, Firefox, Safari, Edge)

## 🛠️ Installation et Configuration

### 1. Cloner le projet

```bash
git clone https://github.com/votre-username/echangeo.git
cd echangeo
```

### 2. Installer les dépendances

```bash
npm install
# ou
yarn install
```

### 3. Configuration Supabase

1. Créez un nouveau projet sur [supabase.com](https://supabase.com)
2. Récupérez votre URL et clé anonyme dans les paramètres du projet
3. Exécutez les migrations SQL (voir section Base de données)

### 4. Variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# Supabase
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anonyme-supabase

# Mapbox (optionnel, pour les cartes)
VITE_MAPBOX_TOKEN=votre-token-mapbox

# Google Gemini AI (optionnel, pour les fonctionnalités IA)
VITE_GEMINI_API_KEY=votre-cle-gemini
```

### 5. Configuration de la base de données

Exécutez les migrations SQL dans l'ordre :

```bash
# Via l'interface Supabase ou le CLI
supabase db reset
```

Les fichiers de migration se trouvent dans `supabase/migrations/`

### 6. Lancer l'application

```bash
# Mode développement
npm run dev

# Build de production
npm run build

# Prévisualisation du build
npm run preview
```

## 🏃‍♂️ Commandes Disponibles

```bash
# Développement
npm run dev          # Lance le serveur de développement
npm run build        # Build de production
npm run preview      # Prévisualise le build

# Tests
npm run test         # Lance les tests
npm run test:ui      # Interface graphique des tests

# Qualité du code
npm run lint         # Vérification ESLint
```

## 📁 Structure du Projet

```
echangeo/
├── public/                 # Fichiers statiques
│   ├── logo.png           # Logo de l'application
│   └── hero-1.png         # Images d'illustration
├── src/
│   ├── components/        # Composants React réutilisables
│   │   ├── admin/        # Composants d'administration
│   │   ├── ui/           # Composants UI de base
│   │   └── ...
│   ├── pages/            # Pages de l'application
│   │   ├── admin/        # Pages d'administration
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── ...
│   ├── hooks/            # Hooks personnalisés
│   │   ├── useAuth.ts
│   │   ├── useItems.ts
│   │   └── ...
│   ├── services/         # Services externes
│   │   ├── supabase.ts   # Client Supabase
│   │   ├── aiService.ts  # Services IA
│   │   └── ...
│   ├── store/            # Gestion d'état global
│   │   └── authStore.ts  # Store d'authentification
│   ├── types/            # Définitions TypeScript
│   │   ├── database.ts   # Types de la base de données
│   │   └── index.ts      # Types généraux
│   ├── utils/            # Utilitaires
│   │   ├── categories.ts
│   │   └── ...
│   ├── App.tsx           # Composant racine
│   └── main.tsx          # Point d'entrée
├── supabase/             # Configuration Supabase
│   ├── migrations/       # Migrations de la base de données
│   └── ...
├── package.json          # Dépendances et scripts
├── tailwind.config.js    # Configuration Tailwind
├── vite.config.ts        # Configuration Vite
└── README.md            # Ce fichier
```

## 🔧 Variables d'Environnement

| Variable | Description | Requis |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | URL de votre projet Supabase | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Clé anonyme Supabase | ✅ |
| `VITE_MAPBOX_TOKEN` | Token Mapbox pour les cartes | ❌ |
| `VITE_GEMINI_API_KEY` | Clé API Google Gemini | ❌ |

## 🤝 Contribution

Nous accueillons les contributions ! Consultez notre [guide de contribution](CONTRIBUTING.md) pour :

- Comment contribuer au projet
- Standards de code et bonnes pratiques
- Processus de pull request
- Convention de commits

## 🗺️ Roadmap

Consultez notre [roadmap](ROADMAP.md) pour voir les fonctionnalités à venir :

- **MVP** : Fonctionnalités de base (actuel)
- **V1.0** : Améliorations UX et performance
- **V1.1** : Fonctionnalités avancées
- **V2.0** : Nouvelles fonctionnalités majeures

## 📚 Documentation

- [Architecture](ARCHITECTURE.md) - Architecture technique détaillée
- [API Documentation](API_DOCS.md) - Documentation des endpoints
- [Base de données](DB_SCHEMA.md) - Schéma de la base de données
- [Contributing](CONTRIBUTING.md) - Guide de contribution

## 🐛 Signaler un Bug

1. Vérifiez que le bug n'a pas déjà été signalé dans les [issues](../../issues)
2. Créez une nouvelle issue avec :
   - Description détaillée du problème
   - Étapes pour reproduire
   - Environnement (OS, navigateur, version)
   - Captures d'écran si nécessaire

## 💡 Demander une Fonctionnalité

1. Vérifiez que la fonctionnalité n'a pas déjà été demandée
2. Créez une nouvelle issue avec le label "enhancement"
3. Décrivez la fonctionnalité et son utilité

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- [Supabase](https://supabase.com) pour le backend
- [Tailwind CSS](https://tailwindcss.com) pour le design system
- [React](https://reactjs.org) pour le framework
- Tous les contributeurs de la communauté open source

## 📞 Support

- 📧 Email : support@echangeo.fr
- 💬 Discussions : [GitHub Discussions](../../discussions)
- 📖 Documentation : [docs.echangeo.fr](https://docs.echangeo.fr)

---

**Fait avec ❤️ pour promouvoir l'économie circulaire et renforcer les liens de quartier**
