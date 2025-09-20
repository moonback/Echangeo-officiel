# Guide de Contribution - Échangeo

Merci de votre intérêt pour contribuer à Échangeo ! Ce guide vous aidera à comprendre comment contribuer efficacement au projet.

## 🤝 Comment Contribuer

### Types de Contributions

Nous accueillons plusieurs types de contributions :

- **🐛 Corrections de bugs** - Signaler et corriger des problèmes
- **✨ Nouvelles fonctionnalités** - Ajouter de nouvelles capacités
- **📚 Documentation** - Améliorer la documentation
- **🎨 Design** - Améliorer l'interface utilisateur
- **🧪 Tests** - Ajouter ou améliorer les tests
- **🔧 Infrastructure** - Améliorer l'outillage et le déploiement

### Processus de Contribution

#### 1. Fork et Clone
```bash
# Forker le repository sur GitHub
# Puis cloner votre fork
git clone https://github.com/votre-username/echangeo.git
cd echangeo

# Ajouter le repository original comme upstream
git remote add upstream https://github.com/original-owner/echangeo.git
```

#### 2. Créer une Branche
```bash
# Créer une nouvelle branche pour votre contribution
git checkout -b feature/nom-de-votre-fonctionnalite
# ou
git checkout -b fix/nom-du-bug
```

#### 3. Installation et Configuration
```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés API
```

#### 4. Développement
- Faire vos modifications
- Tester vos changements
- Vérifier que les tests passent
- Linter le code

#### 5. Commit et Push
```bash
# Ajouter vos modifications
git add .

# Commit avec un message descriptif
git commit -m "feat: ajouter la fonctionnalité de recherche avancée"

# Pousser vers votre fork
git push origin feature/nom-de-votre-fonctionnalite
```

#### 6. Pull Request
- Créer une Pull Request sur GitHub
- Remplir le template de PR
- Attendre la revue et les retours

## 📝 Standards de Code

### TypeScript/JavaScript

#### Convention de Nommage
```typescript
// Variables et fonctions : camelCase
const userName = 'john';
const getUserProfile = () => {};

// Composants React : PascalCase
const UserProfile = () => {};

// Types et interfaces : PascalCase
interface UserProfile {
  id: string;
  name: string;
}

// Constantes : UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
```

#### Structure des Fichiers
```typescript
// 1. Imports externes
import React from 'react';
import { motion } from 'framer-motion';

// 2. Imports internes
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';

// 3. Types et interfaces
interface ComponentProps {
  title: string;
  onClose: () => void;
}

// 4. Composant principal
const MyComponent: React.FC<ComponentProps> = ({ title, onClose }) => {
  // 5. Hooks
  const { user } = useAuth();
  
  // 6. Handlers
  const handleClick = () => {
    onClose();
  };
  
  // 7. Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick}>Fermer</Button>
    </div>
  );
};

// 8. Export
export default MyComponent;
```

#### Documentation des Composants
```typescript
/**
 * Composant pour afficher un objet avec ses actions
 * 
 * @param item - L'objet à afficher
 * @param onRequest - Callback appelé lors d'une demande
 * @param showActions - Afficher les actions ou non
 */
interface ItemCardProps {
  item: Item;
  onRequest?: (item: Item) => void;
  showActions?: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({ 
  item, 
  onRequest, 
  showActions = true 
}) => {
  // Implementation...
};
```

### CSS/Styling

#### Tailwind CSS
```typescript
// Utiliser les classes Tailwind de manière cohérente
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-lg font-semibold text-gray-900">Titre</h2>
  <Button variant="primary" size="sm">Action</Button>
</div>

// Créer des classes utilitaires si nécessaire
<div className="card-hover">
  <img className="image-responsive" src="..." alt="..." />
</div>
```

#### Variables CSS Personnalisées
```css
/* Dans index.css ou un fichier de thème */
:root {
  --brand-primary: #3b82f6;
  --brand-secondary: #1e40af;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
}
```

## 🧪 Tests

### Structure des Tests
```
src/
├── components/
│   ├── Button.tsx
│   └── __tests__/
│       └── Button.test.tsx
├── hooks/
│   ├── useAuth.ts
│   └── __tests__/
│       └── useAuth.test.ts
└── utils/
    ├── helpers.ts
    └── __tests__/
        └── helpers.test.ts
```

### Écrire des Tests
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from '../Button';

describe('Button', () => {
  it('affiche le texte du bouton', () => {
    render(<Button>Cliquer ici</Button>);
    expect(screen.getByRole('button', { name: 'Cliquer ici' })).toBeInTheDocument();
  });

  it('appelle onClick quand cliqué', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Cliquer</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('est désactivé quand disabled=true', () => {
    render(<Button disabled>Désactivé</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Tests d'Intégration
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import ItemsPage from '../ItemsPage';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </QueryClientProvider>
);

describe('ItemsPage', () => {
  it('affiche la liste des objets', async () => {
    render(
      <TestWrapper>
        <ItemsPage />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Mes Objets')).toBeInTheDocument();
    });
  });
});
```

## 📋 Convention de Commits

Nous utilisons [Conventional Commits](https://www.conventionalcommits.org/) :

### Format
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types
- **feat** : Nouvelle fonctionnalité
- **fix** : Correction de bug
- **docs** : Documentation
- **style** : Formatage, points-virgules, etc.
- **refactor** : Refactoring de code
- **test** : Ajout ou modification de tests
- **chore** : Tâches de maintenance

### Exemples
```bash
# Nouvelle fonctionnalité
git commit -m "feat(auth): ajouter la connexion avec Google"

# Correction de bug
git commit -m "fix(ui): corriger l'alignement du bouton sur mobile"

# Documentation
git commit -m "docs(api): mettre à jour la documentation des endpoints"

# Refactoring
git commit -m "refactor(components): extraire la logique de validation"

# Test
git commit -m "test(auth): ajouter les tests pour la connexion"

# Maintenance
git commit -m "chore(deps): mettre à jour les dépendances"
```

## 🔍 Processus de Revue

### Critères de Revue

#### Code Quality
- [ ] Le code suit les conventions du projet
- [ ] Les tests passent tous
- [ ] Le code est documenté si nécessaire
- [ ] Pas de code mort ou commenté

#### Fonctionnalité
- [ ] La fonctionnalité répond au besoin
- [ ] Les cas limites sont gérés
- [ ] L'interface utilisateur est intuitive
- [ ] Les performances sont acceptables

#### Sécurité
- [ ] Pas de données sensibles exposées
- [ ] Validation des entrées utilisateur
- [ ] Gestion appropriée des erreurs
- [ ] Respect des bonnes pratiques de sécurité

### Commentaires de Revue

#### Constructifs
```typescript
// ✅ Bon commentaire
// Cette fonction pourrait bénéficier d'une validation d'entrée
// pour éviter les erreurs avec des valeurs null

// ❌ Mauvais commentaire
// Ce code est mauvais
```

#### Suggestions d'Amélioration
```typescript
// Suggestion : Utiliser un enum pour les statuts
// Au lieu de chaînes de caractères, cela éviterait les erreurs de typo
enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}
```

## 🐛 Signaler un Bug

### Template de Bug Report
```markdown
**Description du bug**
Une description claire et concise du problème.

**Étapes pour reproduire**
1. Aller sur '...'
2. Cliquer sur '...'
3. Faire défiler jusqu'à '...'
4. Voir l'erreur

**Comportement attendu**
Ce qui devrait se passer.

**Comportement actuel**
Ce qui se passe réellement.

**Captures d'écran**
Si applicable, ajouter des captures d'écran.

**Environnement**
- OS: [ex. Windows 10]
- Navigateur: [ex. Chrome 91]
- Version: [ex. 1.0.0]

**Informations supplémentaires**
Toute autre information utile.
```

## 💡 Proposer une Fonctionnalité

### Template de Feature Request
```markdown
**Description de la fonctionnalité**
Une description claire et concise de la fonctionnalité souhaitée.

**Problème résolu**
Quel problème cette fonctionnalité résoudrait-elle ?

**Solution proposée**
Comment envisagez-vous cette fonctionnalité ?

**Alternatives considérées**
D'autres solutions que vous avez envisagées.

**Contexte supplémentaire**
Toute autre information utile.
```

## 🛠️ Outils de Développement

### Scripts Disponibles
```bash
# Développement
npm run dev              # Serveur de développement
npm run build            # Build de production
npm run preview          # Prévisualiser le build

# Tests
npm run test             # Lancer les tests
npm run test:ui          # Interface graphique des tests
npm run test:coverage    # Couverture de tests

# Qualité
npm run lint             # Vérification ESLint
npm run lint:fix         # Corriger automatiquement
npm run type-check       # Vérification TypeScript

# Base de données
npm run db:reset         # Reset de la base de données
npm run db:migrate       # Appliquer les migrations
```

### Configuration IDE

#### VS Code
Recommandé : extensions suivantes
- ES7+ React/Redux/React-Native snippets
- TypeScript Importer
- Tailwind CSS IntelliSense
- ESLint
- Prettier

#### Configuration .vscode/settings.json
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## 📚 Ressources

### Documentation
- [React](https://reactjs.org/docs)
- [TypeScript](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase](https://supabase.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)

### Outils
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Testing Library](https://testing-library.com/)
- [Vitest](https://vitest.dev/)

## 🤝 Code de Conduite

### Nos Valeurs
- **Respect** : Traitez tout le monde avec respect
- **Inclusion** : Accueillez les contributions de tous
- **Collaboration** : Travaillez ensemble de manière constructive
- **Apprentissage** : Encouragez l'apprentissage mutuel

### Comportement Inacceptable
- Langage ou images sexuellement explicites
- Trolling, commentaires insultants ou désobligeants
- Harcèlement public ou privé
- Publication d'informations privées

### Application
Les violations du code de conduite peuvent entraîner :
- Un avertissement
- Un bannissement temporaire
- Un bannissement permanent

## 📞 Support

### Questions Techniques
- **GitHub Discussions** : Pour les questions générales
- **Issues GitHub** : Pour les bugs et fonctionnalités
- **Email** : dev@echangeo.fr pour les questions privées

### Mentorat
Nous offrons du mentorat pour les nouveaux contributeurs :
- Pair programming
- Revues de code détaillées
- Sessions de questions/réponses
- Documentation d'apprentissage

## 🙏 Remerciements

Merci de contribuer à Échangeo ! Chaque contribution, même petite, fait la différence et nous aide à créer une meilleure plateforme de partage entre voisins.

### Reconnaissance des Contributeurs
- Mention dans le README
- Badge de contributeur sur le profil
- Accès aux fonctionnalités beta
- Invitation aux événements communautaires

---

**Ensemble, créons l'avenir du partage entre voisins ! 🌱**
