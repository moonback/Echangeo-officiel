# 🏠 TrocAll - Plateforme de prêt/troc entre voisins

TrocAll est une application web mobile-first qui permet aux voisins de se prêter ou d'échanger des objets facilement, encourageant la solidarité locale et la réduction de la consommation.

## ⚠️ Avertissement de Sécurité

**Cette version MVP désactive délibérément les politiques RLS (Row Level Security) de Supabase pour simplifier le développement initial.** 

🚨 **ATTENTION** : Ne pas utiliser en production sans activer RLS et implémenter des politiques de sécurité appropriées. Les données sont actuellement accessibles par tous les utilisateurs authentifiés.

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+ et npm
- Un projet Supabase configuré

### Installation

1. **Cloner et installer les dépendances**
```bash
git clone <votre-repo>
cd trocall
npm install
```

2. **Configuration Supabase**

Créez un fichier `.env` à la racine du projet :
```bash
cp .env.example .env
```

Remplissez les variables d'environnement :
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Comment obtenir ces informations :**
1. Rendez-vous sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Allez dans Settings > API
4. Copiez l'URL du projet (`VITE_SUPABASE_URL`)
5. Copiez la clé anonyme (`VITE_SUPABASE_ANON_KEY`)

3. **Initialiser la base de données**

Exécutez le script SQL fourni (`init.sql`) dans l'éditeur SQL de votre dashboard Supabase pour créer les tables nécessaires.

4. **Lancer l'application**
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 🗂️ Structure du projet

```
src/
├── components/          # Composants réutilisables
├── pages/              # Pages de l'application
├── hooks/              # Hooks React personnalisés
├── services/           # Services (Supabase, etc.)
├── store/              # État global (Zustand)
├── types/              # Types TypeScript
├── utils/              # Utilitaires
└── test/               # Tests
```

## 🎯 Fonctionnalités

### ✅ Implémentées
- 🔐 Authentification (inscription/connexion)
- 👤 Gestion de profil utilisateur
- 📦 CRUD des objets avec upload d'images
- 🔍 Recherche et filtrage par catégories
- 📋 Système de demandes de prêt
- 📱 Interface responsive (mobile-first)
- 🎨 Animations et transitions fluides
- ⚡ UI optimiste pour les demandes

### 🚧 À venir
- 💬 Messagerie en temps réel
- 🗺️ Géolocalisation et carte des voisins
- 🔔 Notifications push
- 🛡️ Système de réputation
- 📊 Analytics et statistiques

## 🧪 Tests

```bash
# Lancer tous les tests
npm run test

# Tests avec interface
npm run test:ui
```

## 🏗️ Technologies utilisées

- **Frontend** : React 18, TypeScript, Vite
- **Styling** : Tailwind CSS
- **Animations** : Framer Motion
- **Routing** : React Router v6
- **State Management** : Zustand, React Query
- **Forms** : React Hook Form + Zod
- **Backend** : Supabase (Auth + Database + Storage)
- **Tests** : Vitest + React Testing Library
- **Icons** : Lucide React

## 🔧 Scripts disponibles

- `npm run dev` - Démarrer le serveur de développement
- `npm run build` - Construire pour la production
- `npm run preview` - Prévisualiser la build de production
- `npm run test` - Lancer les tests
- `npm run lint` - Linter le code

## 📝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙋‍♀️ Support

Pour toute question ou problème, ouvrez une issue sur GitHub.

---

**TrocAll** - Partageons plus, consommons mieux ! 🌱