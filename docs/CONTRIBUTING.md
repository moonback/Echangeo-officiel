# Guide de Contribution TrocAll 🤝

Merci de votre intérêt pour contribuer à TrocAll ! Ce guide vous aidera à comprendre comment participer au développement de la plateforme.

## 📋 Table des Matières

- [Code de Conduite](#code-de-conduite)
- [Comment Contribuer](#comment-contribuer)
- [Environnement de Développement](#environnement-de-développement)
- [Standards de Code](#standards-de-code)
- [Processus de Contribution](#processus-de-contribution)
- [Types de Contributions](#types-de-contributions)
- [Reporting de Bugs](#reporting-de-bugs)
- [Suggestions de Fonctionnalités](#suggestions-de-fonctionnalités)
- [Questions et Support](#questions-et-support)

## 📜 Code de Conduite

### Notre Engagement

Nous nous engageons à créer un environnement accueillant et inclusif pour tous les contributeurs, indépendamment de leur âge, taille, handicap, ethnicité, identité et expression de genre, niveau d'expérience, nationalité, apparence, race, religion, identité ou orientation sexuelle.

### Comportements Attendus

- ✅ Utiliser un langage accueillant et inclusif
- ✅ Respecter les points de vue et expériences différents
- ✅ Accepter gracieusement les critiques constructives
- ✅ Se concentrer sur ce qui est le mieux pour la communauté
- ✅ Faire preuve d'empathie envers les autres membres

### Comportements Inacceptables

- ❌ Langage ou images sexualisés ou attention non désirée
- ❌ Trolling, commentaires insultants ou désobligeants
- ❌ Harcèlement public ou privé
- ❌ Publication d'informations privées sans permission
- ❌ Autres comportements non professionnels

## 🚀 Comment Contribuer

### 1. Fork et Clone

```bash
# Fork le repository sur GitHub
# Puis clonez votre fork
git clone https://github.com/VOTRE-USERNAME/trocall.git
cd trocall

# Ajoutez le repository original comme remote
git remote add upstream https://github.com/ORIGINAL-OWNER/trocall.git
```

### 2. Configuration de l'Environnement

```bash
# Installez les dépendances
npm install

# Configurez les variables d'environnement
cp .env.example .env.local
# Éditez .env.local avec vos clés API

# Lancez le serveur de développement
npm run dev
```

### 3. Créer une Branche

```bash
# Créez une nouvelle branche pour votre feature
git checkout -b feature/nom-de-votre-feature

# Ou pour un bug fix
git checkout -b fix/description-du-bug
```

## 🛠️ Environnement de Développement

### Prérequis

- **Node.js** 18+ et npm/yarn
- **Git** pour le versioning
- **Compte Supabase** (gratuit)
- **Clé API Gemini** (optionnel)
- **Clé API Mapbox** (optionnel)

### Structure du Projet

```
src/
├── components/          # Composants React
│   ├── ui/             # Composants UI de base
│   ├── admin/          # Composants d'administration
│   └── modals/         # Modales et overlays
├── pages/              # Pages de l'application
├── hooks/              # Hooks personnalisés
├── services/           # Services externes
├── store/              # État global (Zustand)
├── types/              # Types TypeScript
├── utils/              # Utilitaires
└── test/               # Tests
```

### Scripts Disponibles

```bash
# Développement
npm run dev              # Serveur de développement
npm run build           # Build de production
npm run preview         # Preview du build

# Qualité du code
npm run lint            # ESLint
npm run lint:fix        # Correction automatique
npm run type-check      # Vérification TypeScript

# Tests
npm run test            # Tests unitaires
npm run test:ui         # Interface de test
npm run test:coverage   # Couverture de tests
```

## 📏 Standards de Code

### TypeScript

- ✅ Utilisez TypeScript pour tous les nouveaux fichiers
- ✅ Définissez des types explicites pour les props et états
- ✅ Évitez `any`, préférez des types spécifiques
- ✅ Utilisez les interfaces pour les objets complexes

```typescript
// ✅ Bon
interface UserProps {
  id: string;
  name: string;
  email: string;
  onUpdate?: (user: User) => void;
}

const UserComponent: React.FC<UserProps> = ({ id, name, email, onUpdate }) => {
  // ...
};

// ❌ Éviter
const UserComponent = ({ id, name, email, onUpdate }: any) => {
  // ...
};
```

### React

- ✅ Utilisez des composants fonctionnels avec hooks
- ✅ Préférez la composition à l'héritage
- ✅ Utilisez `useCallback` et `useMemo` pour l'optimisation
- ✅ Gérez les états de loading et d'erreur

```typescript
// ✅ Bon
const ItemCard: React.FC<ItemCardProps> = ({ item, onFavorite }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleFavorite = useCallback(async () => {
    setIsLoading(true);
    try {
      await onFavorite(item.id);
    } catch (error) {
      console.error('Error favoriting item:', error);
    } finally {
      setIsLoading(false);
    }
  }, [item.id, onFavorite]);

  if (isLoading) {
    return <ItemCardSkeleton />;
  }

  return (
    <div className="item-card">
      {/* ... */}
    </div>
  );
};
```

### CSS et Styling

- ✅ Utilisez Tailwind CSS pour le styling
- ✅ Créez des composants réutilisables
- ✅ Suivez le design system existant
- ✅ Utilisez les classes utilitaires de Tailwind

```typescript
// ✅ Bon
<Button 
  variant="primary" 
  size="lg" 
  className="w-full md:w-auto"
  leftIcon={<Plus className="w-4 h-4" />}
>
  Ajouter un objet
</Button>

// ❌ Éviter
<button style={{ backgroundColor: 'blue', padding: '10px' }}>
  Ajouter un objet
</button>
```

### Gestion d'État

- ✅ Utilisez Zustand pour l'état global
- ✅ Utilisez TanStack Query pour l'état serveur
- ✅ Créez des hooks personnalisés pour la logique métier
- ✅ Évitez le prop drilling

```typescript
// ✅ Bon - Hook personnalisé
export function useItems() {
  return useQuery({
    queryKey: ['items'],
    queryFn: async (): Promise<Item[]> => {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('is_available', true);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

// ✅ Bon - Store Zustand
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  
  signIn: async (email: string, password: string) => {
    // Logique de connexion
  },
}));
```

## 🔄 Processus de Contribution

### 1. Planifier votre Contribution

- 📋 Consultez les [Issues](https://github.com/ORIGINAL-OWNER/trocall/issues) existantes
- 💬 Discutez de votre idée dans les discussions GitHub
- 🎯 Assurez-vous que votre contribution s'aligne avec la roadmap

### 2. Développer

```bash
# Synchronisez avec le repository principal
git fetch upstream
git checkout main
git merge upstream/main

# Créez votre branche
git checkout -b feature/votre-feature

# Développez et testez
npm run dev
npm run test
npm run lint
```

### 3. Tester

```bash
# Tests unitaires
npm run test

# Tests de linting
npm run lint

# Vérification TypeScript
npm run type-check

# Tests de build
npm run build
```

### 4. Commit et Push

```bash
# Ajoutez vos changements
git add .

# Commit avec un message descriptif
git commit -m "feat: ajouter la fonctionnalité de recherche avancée"

# Push vers votre fork
git push origin feature/votre-feature
```

### 5. Pull Request

- 📝 Créez une Pull Request sur GitHub
- 📋 Remplissez le template de PR
- 🔍 Demandez une review
- 🔄 Répondez aux commentaires

## 📝 Types de Contributions

### 🐛 Bug Fixes

```bash
git checkout -b fix/description-du-bug
```

**Template de commit :**
```
fix: corriger le bug de chargement des images

- Résoudre le problème de chargement des images dans ItemCard
- Ajouter un fallback pour les images manquantes
- Améliorer la gestion d'erreur

Fixes #123
```

### ✨ Nouvelles Fonctionnalités

```bash
git checkout -b feature/nom-de-la-feature
```

**Template de commit :**
```
feat: ajouter la recherche par géolocalisation

- Implémenter la recherche d'objets par proximité
- Ajouter des filtres de distance
- Intégrer avec Mapbox pour la visualisation

Closes #456
```

### 📚 Documentation

```bash
git checkout -b docs/description-de-la-doc
```

**Template de commit :**
```
docs: améliorer la documentation de l'API

- Ajouter des exemples d'utilisation
- Documenter les nouveaux endpoints
- Corriger les erreurs de typo
```

### 🎨 Améliorations UI/UX

```bash
git checkout -b ui/description-de-l-amélioration
```

**Template de commit :**
```
ui: améliorer l'interface de création d'objet

- Simplifier le formulaire de création
- Ajouter des animations de transition
- Améliorer la responsivité mobile
```

### ⚡ Optimisations de Performance

```bash
git checkout -b perf/description-de-l-optimisation
```

**Template de commit :**
```
perf: optimiser le chargement des images

- Implémenter le lazy loading
- Ajouter la compression d'images
- Réduire la taille du bundle de 15%
```

## 🐛 Reporting de Bugs

### Avant de Reporter

1. 🔍 Vérifiez que le bug n'a pas déjà été reporté
2. 🧪 Testez avec la dernière version
3. 🔄 Essayez de reproduire le bug

### Template de Bug Report

```markdown
## 🐛 Description du Bug

Description claire et concise du bug.

## 🔄 Étapes pour Reproduire

1. Aller à '...'
2. Cliquer sur '...'
3. Faire défiler vers '...'
4. Voir l'erreur

## 🎯 Comportement Attendu

Description claire de ce qui devrait se passer.

## 📱 Environnement

- OS: [e.g. iOS, Windows, Linux]
- Navigateur: [e.g. Chrome, Safari, Firefox]
- Version: [e.g. 22]
- Version de l'app: [e.g. 1.0.0]

## 📸 Captures d'Écran

Si applicable, ajoutez des captures d'écran.

## 📋 Informations Supplémentaires

Toute autre information pertinente.
```

## 💡 Suggestions de Fonctionnalités

### Avant de Suggérer

1. 🔍 Vérifiez que la fonctionnalité n'existe pas déjà
2. 📋 Consultez la roadmap
3. 💬 Discutez dans les discussions GitHub

### Template de Feature Request

```markdown
## 🚀 Fonctionnalité Suggérée

Description claire de la fonctionnalité souhaitée.

## 🎯 Problème à Résoudre

Quel problème cette fonctionnalité résoudrait-elle ?

## 💡 Solution Proposée

Description détaillée de votre solution.

## 🔄 Alternatives Considérées

Autres solutions que vous avez considérées.

## 📋 Contexte Supplémentaire

Toute autre information pertinente.
```

## 🧪 Tests

### Écrire des Tests

```typescript
// Exemple de test pour un composant
import { render, screen, fireEvent } from '@testing-library/react';
import { ItemCard } from '../ItemCard';

describe('ItemCard', () => {
  const mockItem = {
    id: '1',
    title: 'Test Item',
    description: 'Test Description',
    category: 'tools',
    condition: 'good',
    offer_type: 'loan',
    is_available: true,
  };

  it('renders item information correctly', () => {
    render(<ItemCard item={mockItem} />);
    
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('handles favorite button click', () => {
    const onFavorite = jest.fn();
    render(<ItemCard item={mockItem} onFavorite={onFavorite} />);
    
    fireEvent.click(screen.getByRole('button', { name: /favorite/i }));
    expect(onFavorite).toHaveBeenCalledWith('1');
  });
});
```

### Tests d'Intégration

```typescript
// Exemple de test d'intégration
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ItemsPage } from '../ItemsPage';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

describe('ItemsPage Integration', () => {
  it('loads and displays items', async () => {
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

## 📚 Ressources Utiles

### Documentation

- 📖 [React Documentation](https://react.dev/)
- 📖 [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- 📖 [Tailwind CSS Docs](https://tailwindcss.com/docs)
- 📖 [Supabase Docs](https://supabase.com/docs)
- 📖 [TanStack Query Docs](https://tanstack.com/query/latest)

### Outils de Développement

- 🛠️ [React DevTools](https://react.dev/learn/react-developer-tools)
- 🛠️ [Supabase Dashboard](https://supabase.com/dashboard)
- 🛠️ [Tailwind Play](https://play.tailwindcss.com/)
- 🛠️ [TypeScript Playground](https://www.typescriptlang.org/play)

### Communauté

- 💬 [Discussions GitHub](https://github.com/ORIGINAL-OWNER/trocall/discussions)
- 💬 [Discord Community](https://discord.gg/trocall)
- 📧 [Email Support](mailto:support@trocall.app)

## ❓ Questions et Support

### Obtenir de l'Aide

1. 📚 Consultez la documentation
2. 🔍 Recherchez dans les issues existantes
3. 💬 Posez votre question dans les discussions GitHub
4. 📧 Contactez l'équipe par email

### Contact

- 📧 **Email** : dev@trocall.app
- 💬 **Discord** : [Serveur TrocAll](https://discord.gg/trocall)
- 🐦 **Twitter** : [@TrocAllApp](https://twitter.com/TrocAllApp)
- 💼 **LinkedIn** : [TrocAll](https://linkedin.com/company/trocall)

## 🎉 Reconnaissance

### Contributeurs

Nous reconnaissons tous les contributeurs qui aident à faire de TrocAll une meilleure plateforme :

- 👨‍💻 **Développeurs** : Code, tests, documentation
- 🎨 **Designers** : UI/UX, illustrations, branding
- 📝 **Rédacteurs** : Documentation, guides, traductions
- 🐛 **Testeurs** : Bug reports, feedback utilisateur
- 💡 **Innovateurs** : Idées, suggestions, améliorations

### Système de Reconnaissance

- 🏆 **Hall of Fame** : Contributeurs exceptionnels
- 🎖️ **Badges** : Reconnaissance des contributions
- 📜 **Certificats** : Attestation de participation
- 🎁 **Récompenses** : Merchandise et accès premium

---

Merci de contribuer à TrocAll ! Ensemble, nous construisons l'avenir du partage local. 🌱

**TrocAll** - Révolutionnons la consommation locale ensemble ! 🚀