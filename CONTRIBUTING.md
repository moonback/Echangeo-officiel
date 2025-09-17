# Guide de Contribution - TrocAll 🤝

Merci de votre intérêt pour contribuer à TrocAll ! Ce guide vous aidera à comprendre comment participer au développement de la plateforme.

## 🎯 Comment Contribuer

### Types de Contributions
- 🐛 **Bug fixes** : Correction de bugs
- ✨ **Nouvelles fonctionnalités** : Ajout de features
- 📚 **Documentation** : Amélioration de la doc
- 🧪 **Tests** : Ajout de tests
- 🎨 **UI/UX** : Améliorations design
- 🔧 **Refactoring** : Amélioration du code

## 🚀 Démarrage Rapide

### 1. Fork du Repository
```bash
# Fork sur GitHub, puis cloner
git clone https://github.com/votre-username/trocall.git
cd trocall
```

### 2. Configuration de l'Environnement
```bash
# Installer les dépendances
npm install

# Copier les variables d'environnement
cp .env.example .env.local

# Configurer Supabase (voir README.md)
```

### 3. Branche de Développement
```bash
# Créer une branche pour votre feature
git checkout -b feature/nom-de-votre-feature

# Ou pour un bug fix
git checkout -b fix/description-du-bug
```

## 📋 Workflow de Développement

### 1. Avant de Commencer
- [ ] Vérifier les [issues ouvertes](https://github.com/trocall/trocall/issues)
- [ ] Commenter sur l'issue pour indiquer votre intention
- [ ] Attendre l'approbation des maintainers

### 2. Développement
```bash
# Synchroniser avec la branche principale
git fetch origin
git rebase origin/main

# Développer votre feature
# ... votre code ...

# Tester localement
npm run dev
npm run test
npm run lint
```

### 3. Commit & Push
```bash
# Ajouter vos changements
git add .

# Commit avec un message descriptif
git commit -m "feat: ajouter système de notifications push"

# Push vers votre fork
git push origin feature/nom-de-votre-feature
```

### 4. Pull Request
- Créer une PR depuis votre fork vers `main`
- Remplir le template de PR
- Attendre la review des maintainers

## 📝 Standards de Code

### TypeScript
```typescript
// ✅ Bon
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

const getUserProfile = async (id: string): Promise<UserProfile> => {
  // ...
};

// ❌ Éviter
const getUserProfile = async (id) => {
  // ...
};
```

### React Components
```typescript
// ✅ Bon - Functional Component avec TypeScript
interface ButtonProps {
  variant: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ variant, children, onClick }) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// ❌ Éviter - Props any
const Button = ({ variant, children, onClick }: any) => {
  // ...
};
```

### Hooks Personnalisés
```typescript
// ✅ Bon - Hook avec gestion d'erreur
export const useItems = (filters?: ItemFilters) => {
  return useQuery({
    queryKey: ['items', filters],
    queryFn: () => fetchItems(filters),
    staleTime: 5 * 60 * 1000,
    onError: (error) => {
      console.error('Erreur lors du chargement des objets:', error);
    },
  });
};
```

### Styling
```typescript
// ✅ Bon - Classes Tailwind cohérentes
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-soft">
  <h2 className="text-lg font-semibold text-gray-900">Titre</h2>
  <Button variant="primary">Action</Button>
</div>

// ❌ Éviter - Styles inline
<div style={{ display: 'flex', padding: '16px' }}>
  // ...
</div>
```

## 🧪 Tests

### Tests Unitaires
```typescript
// tests/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button variant="primary" onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Tests d'Intégration
```typescript
// tests/pages/ItemsPage.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ItemsPage } from '../ItemsPage';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

describe('ItemsPage', () => {
  it('displays items when loaded', async () => {
    const queryClient = createTestQueryClient();
    
    render(
      <QueryClientProvider client={queryClient}>
        <ItemsPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Objets disponibles')).toBeInTheDocument();
    });
  });
});
```

## 📚 Documentation

### Commentaires de Code
```typescript
/**
 * Calcule la distance entre deux points géographiques
 * @param lat1 Latitude du premier point
 * @param lng1 Longitude du premier point
 * @param lat2 Latitude du second point
 * @param lng2 Longitude du second point
 * @returns Distance en kilomètres
 */
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  // Formule de Haversine
  // ...
};
```

### README des Composants
```typescript
/**
 * ItemCard - Composant d'affichage d'un objet
 * 
 * @example
 * <ItemCard 
 *   item={item} 
 *   onRequest={() => handleRequest(item.id)}
 *   showDistance={true}
 * />
 */
export const ItemCard: React.FC<ItemCardProps> = ({ item, onRequest, showDistance }) => {
  // ...
};
```

## 🐛 Rapport de Bugs

### Template de Bug Report
```markdown
## 🐛 Description du Bug
Description claire et concise du problème.

## 🔄 Étapes pour Reproduire
1. Aller sur '...'
2. Cliquer sur '...'
3. Voir l'erreur

## 🎯 Comportement Attendu
Description de ce qui devrait se passer.

## 📱 Environnement
- OS: [ex: iOS 14, Windows 10]
- Navigateur: [ex: Chrome 91, Safari 14]
- Version: [ex: v0.1.0]

## 📸 Captures d'Écran
Si applicable, ajouter des captures d'écran.

## 📋 Logs
```
Erreur dans la console:
Error: ...
```
```

## ✨ Nouvelles Fonctionnalités

### Template de Feature Request
```markdown
## ✨ Description de la Fonctionnalité
Description claire de la fonctionnalité souhaitée.

## 🎯 Problème Résolu
Quel problème cette fonctionnalité résout-elle ?

## 💡 Solution Proposée
Description détaillée de la solution.

## 🔄 Alternatives Considérées
Autres solutions envisagées.

## 📋 Critères d'Acceptation
- [ ] Critère 1
- [ ] Critère 2
- [ ] Critère 3
```

## 🔍 Code Review

### Checklist pour les Reviewers
- [ ] Le code respecte les standards du projet
- [ ] Les tests passent
- [ ] La documentation est mise à jour
- [ ] Les performances sont acceptables
- [ ] La sécurité est respectée
- [ ] L'accessibilité est prise en compte

### Checklist pour les Auteurs
- [ ] J'ai testé mon code localement
- [ ] J'ai ajouté des tests si nécessaire
- [ ] J'ai mis à jour la documentation
- [ ] Mon code est lisible et commenté
- [ ] J'ai vérifié les performances
- [ ] J'ai testé sur mobile et desktop

## 🏷️ Convention de Nommage

### Branches
```bash
# Features
feature/notifications-push
feature/user-dashboard

# Bug fixes
fix/login-error
fix/mobile-layout

# Hotfixes
hotfix/security-patch

# Documentation
docs/api-documentation
docs/user-guide
```

### Commits
```bash
# Format: type(scope): description
feat(auth): ajouter authentification OAuth
fix(ui): corriger layout mobile
docs(api): mettre à jour documentation
test(items): ajouter tests unitaires
refactor(store): simplifier authStore
```

### Types de Commits
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation
- `style`: Formatage, point-virgules
- `refactor`: Refactoring
- `test`: Tests
- `chore`: Maintenance

## 🚀 Déploiement

### Environnements
- **Development**: `localhost:5173`
- **Staging**: `staging.trocall.app`
- **Production**: `trocall.app`

### Processus
1. **Feature** → **Staging** (automatique)
2. **Staging** → **Production** (manuel, après review)

## 📞 Support

### Communication
- **GitHub Issues**: Pour les bugs et features
- **GitHub Discussions**: Pour les questions générales
- **Discord**: Pour le chat en temps réel (lien à venir)

### Ressources
- [Documentation API](./API_DOCS.md)
- [Architecture](./ARCHITECTURE.md)
- [Roadmap](./ROADMAP.md)

## 📄 Licence

En contribuant à TrocAll, vous acceptez que vos contributions soient sous licence MIT. Voir [LICENSE](./LICENSE) pour plus de détails.

## 🙏 Reconnaissance

Les contributeurs sont listés dans [CONTRIBUTORS.md](./CONTRIBUTORS.md) et remerciés publiquement.

---

Merci de contribuer à TrocAll ! Ensemble, nous construisons l'avenir de l'économie collaborative locale. 🌱

**Questions ?** N'hésitez pas à ouvrir une issue ou à nous contacter !