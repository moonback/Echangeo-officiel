# Guide de Contribution Échangeo 🤝

## Bienvenue !

Merci de votre intérêt pour contribuer à **Échangeo** ! Ce guide vous aidera à comprendre comment participer efficacement au développement de la plateforme.

## 📋 Table des Matières

- [Code de Conduite](#code-de-conduite)
- [Comment Contribuer](#comment-contribuer)
- [Environnement de Développement](#environnement-de-développement)
- [Standards de Code](#standards-de-code)
- [Processus de Contribution](#processus-de-contribution)
- [Types de Contributions](#types-de-contributions)
- [Reporting de Bugs](#reporting-de-bugs)
- [Suggestions de Fonctionnalités](#suggestions-de-fonctionnalités)
- [Documentation](#documentation)
- [Tests](#tests)
- [Déploiement](#déploiement)

## Code de Conduite

### Nos Engagements

Nous nous engageons à créer un environnement accueillant et inclusif pour tous les contributeurs, indépendamment de leur âge, taille, handicap, ethnicité, identité et expression de genre, niveau d'expérience, nationalité, apparence physique, race, religion, identité et orientation sexuelle.

### Comportements Attendus

- **Respect** : Utiliser un langage accueillant et inclusif
- **Empathie** : Être respectueux des différents points de vue et expériences
- **Collaboration** : Accepter gracieusement les critiques constructives
- **Focus** : Se concentrer sur ce qui est le mieux pour la communauté
- **Bienveillance** : Montrer de l'empathie envers les autres membres de la communauté

### Comportements Inacceptables

- L'utilisation de langage ou d'images sexualisés
- Le trolling, les commentaires insultants ou désobligeants
- Le harcèlement public ou privé
- La publication d'informations privées sans permission
- Toute conduite inappropriée dans un contexte professionnel

## Comment Contribuer

### 1. Fork et Clone

```bash
# Fork le repository sur GitHub
# Puis clonez votre fork
git clone https://github.com/VOTRE_USERNAME/echangeo.git
cd echangeo
```

### 2. Configuration de l'Environnement

```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditez .env.local avec vos clés API
```

### 3. Créer une Branche

```bash
# Créer une nouvelle branche pour votre fonctionnalité
git checkout -b feature/nom-de-votre-fonctionnalite

# Ou pour un bug fix
git checkout -b fix/description-du-bug
```

### 4. Développement

```bash
# Lancer le serveur de développement
npm run dev

# Lancer les tests
npm run test

# Vérifier le code
npm run lint
```

## Environnement de Développement

### Prérequis

- **Node.js** 18+ 
- **npm** ou **yarn**
- **Git**
- **Compte Supabase** (gratuit)
- **Clé API Google Gemini** (optionnel)
- **Clé API Mapbox** (optionnel)

### Configuration Supabase

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Récupérez l'URL et la clé anonyme
3. Configurez les variables d'environnement :

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token
```

### Structure du Projet

```
src/
├── components/          # Composants réutilisables
│   ├── admin/          # Composants d'administration
│   ├── ui/             # Composants UI de base
│   └── modals/         # Modales
├── hooks/              # Hooks React personnalisés
├── pages/              # Pages de l'application
├── services/           # Services externes
├── store/              # État global (Zustand)
├── types/              # Types TypeScript
├── utils/              # Utilitaires
└── test/               # Configuration des tests
```

## Standards de Code

### TypeScript

- **Strict Mode** : Utilisez TypeScript en mode strict
- **Types Explicites** : Définissez des types pour toutes les fonctions et variables
- **Interfaces** : Utilisez des interfaces pour définir la structure des objets
- **Enums** : Utilisez des enums pour les valeurs constantes

```typescript
// ✅ Bon
interface User {
  id: string;
  name: string;
  email: string;
}

const getUser = async (id: string): Promise<User | null> => {
  // Implementation
};

// ❌ Éviter
const getUser = async (id) => {
  // Implementation
};
```

### React

- **Composants Fonctionnels** : Utilisez des composants fonctionnels avec hooks
- **Hooks Personnalisés** : Créez des hooks pour la logique réutilisable
- **Props Typées** : Définissez des interfaces pour les props
- **Évitez les Side Effects** : Utilisez useEffect correctement

```typescript
// ✅ Bon
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, onClick, variant = 'primary' }) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// ❌ Éviter
const Button = ({ children, onClick }) => {
  return <button onClick={onClick}>{children}</button>;
};
```

### Styling

- **Tailwind CSS** : Utilisez les classes Tailwind pour le styling
- **Composants Responsive** : Assurez-vous que les composants sont responsives
- **Accessibilité** : Utilisez les bonnes pratiques d'accessibilité

```typescript
// ✅ Bon
<div className="flex flex-col md:flex-row gap-4 p-6 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-semibold text-gray-900">Titre</h2>
  <p className="text-gray-600">Description</p>
</div>

// ❌ Éviter
<div style={{ display: 'flex', padding: '24px', backgroundColor: 'white' }}>
  <h2>Titre</h2>
  <p>Description</p>
</div>
```

### Gestion d'État

- **TanStack Query** : Pour les données serveur
- **Zustand** : Pour l'état global client
- **React Hook Form** : Pour les formulaires
- **useState/useReducer** : Pour l'état local

```typescript
// ✅ Bon - TanStack Query
const { data: items, isLoading, error } = useQuery({
  queryKey: ['items'],
  queryFn: () => supabase.from('items').select('*'),
});

// ✅ Bon - Zustand
const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
```

## Processus de Contribution

### 1. Issues

- **Cherchez** d'abord si l'issue existe déjà
- **Créez** une issue claire et détaillée
- **Assignez** des labels appropriés
- **Définissez** les critères d'acceptation

### 2. Pull Requests

- **Fork** le repository
- **Créez** une branche pour votre fonctionnalité
- **Commitez** vos changements avec des messages clairs
- **Poussez** vers votre fork
- **Créez** une Pull Request

### 3. Review Process

- **Automatique** : Les tests et le linting sont exécutés automatiquement
- **Manuel** : Au moins un reviewer doit approuver
- **Feedback** : Les commentaires sont constructifs et respectueux
- **Itération** : Les changements sont discutés et améliorés

### 4. Merge

- **Squash** : Les commits sont fusionnés en un seul commit
- **Clean History** : L'historique Git reste propre
- **Documentation** : Les changements sont documentés

## Types de Contributions

### 🐛 Bug Fixes

- **Reproduire** le bug avec des étapes claires
- **Identifier** la cause racine
- **Implémenter** la correction
- **Tester** la solution
- **Documenter** le changement

### ✨ Nouvelles Fonctionnalités

- **Discuter** l'idée dans une issue
- **Concevoir** l'architecture
- **Implémenter** la fonctionnalité
- **Tester** exhaustivement
- **Documenter** l'utilisation

### 📚 Documentation

- **README** : Mise à jour des instructions
- **API Docs** : Documentation des endpoints
- **Guides** : Tutoriels et guides utilisateur
- **Code Comments** : Commentaires dans le code

### 🎨 Améliorations UI/UX

- **Design** : Respecter le design system
- **Accessibilité** : Suivre les standards WCAG
- **Responsive** : Tester sur différents appareils
- **Performance** : Optimiser les animations

### 🧪 Tests

- **Tests Unitaires** : Tester les fonctions individuelles
- **Tests d'Intégration** : Tester les interactions
- **Tests E2E** : Tester les flux utilisateur
- **Couverture** : Maintenir une bonne couverture

## Reporting de Bugs

### Template d'Issue

```markdown
## 🐛 Description du Bug

Une description claire et concise du problème.

## 🔄 Étapes pour Reproduire

1. Allez sur '...'
2. Cliquez sur '...'
3. Faites défiler vers '...'
4. Voir l'erreur

## ✅ Comportement Attendu

Une description claire de ce qui devrait se passer.

## 📱 Environnement

- OS: [ex: iOS, Windows, Linux]
- Navigateur: [ex: Chrome, Safari, Firefox]
- Version: [ex: 22]
- Version de l'app: [ex: 1.0.0]

## 📸 Captures d'Écran

Si applicable, ajoutez des captures d'écran.

## 📝 Informations Supplémentaires

Toute autre information pertinente.
```

### Critères de Qualité

- **Reproductible** : Le bug peut être reproduit
- **Spécifique** : Description précise du problème
- **Contextuel** : Informations sur l'environnement
- **Priorisé** : Niveau de priorité défini

## Suggestions de Fonctionnalités

### Template de Feature Request

```markdown
## ✨ Description de la Fonctionnalité

Une description claire et concise de la fonctionnalité souhaitée.

## 🎯 Problème à Résoudre

Quel problème cette fonctionnalité résoudrait-elle ?

## 💡 Solution Proposée

Décrivez votre solution idéale.

## 🔄 Alternatives Considérées

Décrivez les alternatives que vous avez considérées.

## 📱 Contexte Supplémentaire

Toute autre information pertinente.
```

### Processus d'Évaluation

1. **Validation** : L'idée est-elle alignée avec la vision ?
2. **Faisabilité** : Est-ce techniquement réalisable ?
3. **Priorité** : Quelle est la priorité par rapport aux autres features ?
4. **Ressources** : Quelles ressources sont nécessaires ?

## Documentation

### Standards de Documentation

- **Clarté** : Langage simple et compréhensible
- **Complétude** : Toutes les informations nécessaires
- **Actualité** : Documentation à jour
- **Exemples** : Code d'exemple quand nécessaire

### Types de Documentation

- **README** : Instructions d'installation et d'utilisation
- **API Docs** : Documentation des endpoints
- **Guides** : Tutoriels pas à pas
- **Architecture** : Documentation technique
- **Changelog** : Historique des changements

### Outils de Documentation

- **Markdown** : Format principal
- **JSDoc** : Documentation du code JavaScript/TypeScript
- **Storybook** : Documentation des composants
- **Mermaid** : Diagrammes et schémas

## Tests

### Stratégie de Tests

- **Tests Unitaires** : Fonctions individuelles
- **Tests d'Intégration** : Interactions entre composants
- **Tests E2E** : Flux utilisateur complets
- **Tests de Performance** : Temps de réponse et charge

### Outils de Test

- **Vitest** : Framework de test principal
- **Testing Library** : Utilitaires de test React
- **Playwright** : Tests E2E
- **MSW** : Mocking des APIs

### Exemple de Test

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Button from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button onClick={() => {}}>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    screen.getByText('Click me').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Déploiement

### Environnements

- **Development** : Environnement local
- **Staging** : Environnement de test
- **Production** : Environnement de production

### Processus de Déploiement

1. **Tests** : Tous les tests passent
2. **Review** : Code review approuvé
3. **Merge** : Fusion dans la branche principale
4. **Build** : Construction de l'application
5. **Deploy** : Déploiement automatique

### CI/CD Pipeline

```yaml
# Exemple GitHub Actions
name: CI/CD
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v2
      - run: npm ci
      - run: npm run build
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

## 🎯 Checklist de Contribution

### Avant de Commencer
- [ ] J'ai lu et compris le code de conduite
- [ ] J'ai vérifié qu'il n'y a pas d'issue similaire
- [ ] J'ai configuré mon environnement de développement
- [ ] J'ai lu la documentation pertinente

### Pendant le Développement
- [ ] Mon code suit les standards définis
- [ ] J'ai écrit des tests pour mes changements
- [ ] J'ai mis à jour la documentation si nécessaire
- [ ] J'ai testé mes changements localement

### Avant la Soumission
- [ ] Tous les tests passent
- [ ] Le code est linté sans erreurs
- [ ] J'ai créé une Pull Request claire
- [ ] J'ai ajouté des captures d'écran si nécessaire

## 🆘 Besoin d'Aide ?

### Ressources

- **Documentation** : Consultez les docs dans `/docs`
- **Issues** : Recherchez dans les issues existantes
- **Discussions** : Utilisez GitHub Discussions
- **Discord** : Rejoignez notre serveur Discord (si disponible)

### Contact

- **Email** : dev@echangeo.fr
- **GitHub** : @echangeo-team
- **Twitter** : @echangeo_app

## 🙏 Remerciements

Merci à tous les contributeurs qui rendent Échangeo possible ! Votre participation est précieuse et contribue à créer une plateforme meilleure pour tous.

---

**Échangeo** - Ensemble, construisons l'avenir de l'économie circulaire ! 🌱✨

*Ce guide évolue avec le projet. N'hésitez pas à suggérer des améliorations !*