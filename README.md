# TrocAll 🌱 - La plateforme communautaire pour des échanges locaux et durables

![TrocAll Logo](https://your-image-url/logo.png) <!-- TODO: Ajouter un logo ou une capture d'écran ici -->

## ✨ Présentation

**TrocAll** est une plateforme communautaire innovante dédiée au **partage, à l'emprunt et à l'échange d'objets du quotidien entre voisins**. Notre mission est de révolutionner la consommation en favorisant l'économie circulaire, le désencombrement et le renforcement des liens sociaux au sein des quartiers. Grâce à l'intégration de l'**Intelligence Artificielle** et de la **géolocalisation**, TrocAll rend le partage d'objets plus simple, plus intelligent et plus convivial que jamais.

### Pourquoi TrocAll ?

*   **Économisez de l'argent :** Accédez à une multitude d'objets sans dépenser.
*   **Réduisez votre empreinte écologique :** Donnez une seconde vie aux objets et participez à une consommation plus responsable.
*   **Désencombrez votre espace :** Débarrassez-vous facilement de ce dont vous n'avez plus besoin.
*   **Créez du lien social :** Rencontrez vos voisins et construisez une communauté d'entraide.

## 🚀 Fonctionnalités Clés

### 📦 Gestion Intelligente des Objets
*   **Publication Facile :** Mettez en ligne vos objets avec photos et descriptions détaillées.
*   **Catégorisation IA :** L'Intelligence Artificielle catégorise automatiquement vos objets (outils, électronique, livres, sports, etc.) pour une meilleure visibilité.
*   **Prêt & Échange :** Proposez vos objets en prêt ou en échange, et gérez les demandes.
*   **Recherche Avancée :** Trouvez rapidement ce dont vous avez besoin grâce à la recherche géolocalisée et par catégories.
*   **Favoris & Évaluations :** Gardez une trace de vos objets préférés et évaluez les échanges.

### 🏘️ Communautés de Quartier Dynamiques
*   **Profils Utilisateurs :** Gérez votre profil, votre réputation et votre localisation.
*   **Voisinage Géographique :** Rejoignez ou créez des communautés basées sur votre quartier.
*   **Chat Intégré :** Communiquez facilement avec vos voisins grâce à une messagerie instantanée avec assistant IA.
*   **Notifications en Temps Réel :** Restez informé des nouvelles opportunités et messages.
*   **Modération & Signalement :** Un système robuste pour assurer la sécurité et le respect au sein de la communauté.
*   **Événements Communautaires :** Organisez et participez à des rencontres, ateliers ou échanges au niveau local.
*   **Forums de Discussion :** Échangez sur des sujets spécifiques à votre quartier.

### 🤖 Intelligence Artificielle au Service du Partage
*   **Analyse d'Images :** L'IA analyse les photos de vos objets lors de la publication pour des suggestions de catégories et descriptions.
*   **Suggestions Contextuelles :** Obtenez des suggestions de prix et des descriptions optimisées.
*   **Assistant de Chat :** Un assistant IA vous aide dans vos négociations et requêtes.
*   **Score de Compatibilité :** L'IA évalue la compatibilité entre utilisateurs et objets pour des échanges pertinents.
*   **Médiation des Conflits :** Un support IA pour faciliter la résolution des désaccords.

### 🏆 Gamification Engageante
*   **Niveaux & Points :** Gagnez des points et progressez en niveau en participant activement.
*   **Badges de Réputation :** Obtenez des badges (ex: "Super Prêteur", "Voisin Fiable") pour reconnaître votre engagement.
*   **Défis Communautaires :** Participez à des défis quotidiens/hebdomadaires pour dynamiser les échanges.
*   **Classement :** Visualisez votre position et celle des autres membres dans le classement des utilisateurs les plus actifs.

### 🎨 Interface Utilisateur Moderne & Intuitive
*   **Design Responsive :** Une expérience fluide sur tous les appareils (mobile-first).
*   **Navigation Intuitive :** Accédez facilement aux fonctionnalités grâce à une navigation claire.
*   **Animations Fluides :** Des micro-interactions et animations pour une expérience agréable.
*   **Cartes Interactives :** Explorez les objets et communautés autour de vous avec Mapbox.
*   **Mode Sombre :** (En développement) Une option pour une interface plus reposante.

## 🛠️ Stack Technique

| Catégorie | Technologie | Description |
| :-------- | :---------- | :---------- |
| **Frontend** | `React 18` (TypeScript) | Interface utilisateur moderne et robuste. |
| | `Vite` | Bundler ultra-rapide pour le développement et la production. |
| | `Tailwind CSS` | Framework CSS utilitaire pour un design rapide et cohérent. |
| | `Framer Motion` | Bibliothèque pour des animations fluides et déclaratives. |
| | `React Router` | Gestion de la navigation au sein de l'application SPA. |
| | `TanStack Query` | Gestion performante de l'état serveur, du cache et des requêtes. |
| | `Zustand` | Solution légère et flexible pour la gestion de l'état global client. |
| | `React Hook Form` + `Zod` | Gestion et validation des formulaires de manière efficace. |
| | `Lucide React` | Bibliothèque d'icônes modulaires. |
| **Backend & Services** | `Supabase` | Backend-as-a-Service complet (PostgreSQL, Authentification, Stockage, Temps réel). |
| | `Google Gemini AI` | Services d'Intelligence Artificielle pour l'analyse d'images et les suggestions de chat. |
| | `Mapbox` | Services de cartographie pour la géolocalisation et les cartes interactives. |
| **Outils de Dev** | `ESLint` + `TypeScript` | Assure la qualité et la cohérence du code. |
| | `Vitest` + `Testing Library` | Frameworks pour les tests unitaires et d'intégration. |
| | `PostCSS` + `Autoprefixer` | Traitement et optimisation du CSS. |

## ⚙️ Installation et Configuration

### Prérequis
Assurez-vous d'avoir installé :
*   **Node.js** (version 18 ou supérieure)
*   **npm** ou **Yarn**

### Étapes

1.  **Cloner le dépôt :**
    ```bash
    git clone https://github.com/moonback/TrocAll-officiel.git
    cd TrocAll-officiel
    ```

2.  **Installer les dépendances :**
    ```bash
    npm install
    # ou
    yarn install
    ```

3.  **Configuration Supabase :**
    *   Créez un projet sur [Supabase](https://supabase.com) et récupérez votre `URL de projet` et votre `Clé Anon`.
    *   Installez la CLI Supabase globalement : `npm install -g supabase`.
    *   Liez votre projet local à Supabase : `supabase link --project-ref <votre-project-ref>`.
    *   Appliquez les migrations de la base de données : `supabase db push`.

4.  **Variables d'environnement :**
    Créez un fichier `.env.local` à la racine du projet avec les informations suivantes :
    ```env
    # Supabase (obligatoire)
    VITE_SUPABASE_URL="https://your-project.supabase.co"
    VITE_SUPABASE_ANON_KEY="your-anon-key"

    # Google Gemini AI (optionnel, mais recommandé pour les fonctionnalités IA)
    VITE_GEMINI_API_KEY="your-gemini-key"

    # Mapbox (optionnel, mais recommandé pour les fonctionnalités de cartographie)
    VITE_MAPBOX_TOKEN="your-mapbox-token"
    ```

5.  **Lancer l'application :**
    ```bash
    # Pour le développement
    npm run dev

    # Pour un build de production
    npm run build

    # Pour prévisualiser le build de production
    npm run preview
    ```

## 📂 Structure du Projet

```
src/
├── components/           # Composants réutilisables (UI, Admin, Modals, Layouts)
├── pages/                # Vues principales de l'application (Accueil, Objets, Chat, Admin)
├── hooks/                # Hooks React personnalisés pour la logique réutilisable
├── services/             # Modules d'interaction avec les services externes (Supabase, IA)
├── store/                # Gestion de l'état global avec Zustand
├── types/                # Définitions de types TypeScript
├── utils/                # Fonctions utilitaires (catégories, validation, géolocalisation)
└── test/                 # Tests unitaires et d'intégration
```

## 🔒 Sécurité et Conformité

*   **Sécurité au niveau des lignes (RLS) :** Protection des données via Supabase PostgreSQL.
*   **Authentification Robuste :** Gérée par Supabase Auth.
*   **Validation des Données :** Utilisation de Zod pour garantir l'intégrité des données.
*   **Modération Active :** Système de signalement et de gestion des utilisateurs bannis.
*   **RGPD :** Conception axée sur la protection des données personnelles (à confirmer par une politique de confidentialité détaillée).

## 📊 Fonctionnalités d'Administration

Un tableau de bord complet pour les administrateurs incluant :
*   **Statistiques Globales :** Vue d'ensemble de l'activité de la plateforme.
*   **Gestion des Utilisateurs :** Modération, bannissement et gestion des comptes.
*   **Gestion des Objets :** Supervision et modération des annonces.
*   **Gestion des Communautés :** Création, modification et modération des communautés.
*   **Rapports & Logs :** Suivi des signalements et des activités du système.

## 🤝 Contribuer

Nous accueillons toutes les contributions ! Veuillez consulter notre [guide de contribution](./CONTRIBUTING.md) pour plus de détails sur la manière de participer au projet.

### Workflow de Contribution
1.  **Fork** le dépôt.
2.  Créez une branche pour votre fonctionnalité (`git checkout -b feature/nom-de-ma-fonctionnalite`).
3.  Effectuez vos modifications et **commitez**-les (`git commit -m 'Ajout de ma super fonctionnalité'`).
4.  **Poussez** votre branche (`git push origin feature/nom-de-ma-fonctionnalite`).
5.  Ouvrez une **Pull Request** claire et détaillée.

## 📚 Documentation Additionnelle

*   [**ARCHITECTURE.md**](./ARCHITECTURE.md) : Détails de l'architecture technique.
*   [**API_DOCS.md**](./API_DOCS.md) : Documentation des APIs utilisées.
*   [**DB_SCHEMA.md**](./DB_SCHEMA.md) : Schéma détaillé de la base de données.
*   [**ROADMAP.md**](./ROADMAP.md) : Feuille de route et évolutions futures du projet.
*   [**CONTRIBUTING.md**](./CONTRIBUTING.md) : Guide complet pour les contributeurs.

## ⚠️ Problèmes Connus & Améliorations Futures

*   **Gamification :** Nécessite l'application des migrations RLS spécifiques à la gamification.
*   **Intégration IA :** L'analyse d'images et certaines fonctionnalités IA dépendent d'une clé API Google Gemini valide.
*   **Cartographie :** Les fonctionnalités de géolocalisation et de carte nécessitent une clé API Mapbox valide.
*   **Communautés :** Certaines fonctionnalités avancées des communautés pourraient nécessiter des migrations ou des développements supplémentaires.
*   **Optimisation des Performances :** Des optimisations continues sont prévues pour garantir une fluidité maximale.
*   **Tests Automatisés :** Extension de la couverture des tests unitaires et d'intégration.
*   **Mode Sombre :** Finalisation de l'implémentation du mode sombre.
*   **Application Mobile Native :** Étude et développement d'applications iOS/Android dédiées.

## 📄 Licence

Ce projet est distribué sous la licence MIT. Voir le fichier [LICENSE](./LICENSE) pour plus d'informations.

## 🙏 Remerciements

Nous tenons à remercier les projets et services open source qui rendent TrocAll possible :
*   [Supabase](https://supabase.com)
*   [Google Gemini](https://ai.google.dev)
*   [Mapbox](https://mapbox.com)
*   [Tailwind CSS](https://tailwindcss.com)
*   [Framer Motion](https://www.framer.com/motion)
*   Et toute la communauté open source !

---

**TrocAll** - Ensemble, donnons une nouvelle vie à nos objets et à nos quartiers ! 🌱


