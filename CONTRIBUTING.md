# Guide de Contribution TrocAll 🤝

## Bienvenue !

Merci de votre intérêt pour contribuer à TrocAll ! Ce guide vous aidera à comprendre comment participer au développement de cette plateforme de partage d'objets entre voisins.

## 🎯 Comment Contribuer

### 🐛 **Signaler un Bug**
1. Vérifiez que le bug n'a pas déjà été signalé dans les [Issues](../../issues)
2. Créez une nouvelle issue avec le label `bug`
3. Utilisez le template de bug report
4. Incluez des captures d'écran si possible

### 💡 **Suggérer une Amélioration**
1. Vérifiez que l'idée n'existe pas déjà
2. Créez une issue avec le label `enhancement`
3. Décrivez clairement le problème et la solution proposée
4. Expliquez pourquoi cette fonctionnalité serait utile

### 🔧 **Contribuer au Code**

#### **Fork et Clone**
```bash
# Fork le repository sur GitHub
# Puis clonez votre fork
git clone https://github.com/votre-username/trocall.git
cd trocall

# Ajoutez le repository original comme remote
git remote add upstream https://github.com/original-owner/trocall.git
```

#### **Configuration de l'Environnement**
```bash
# Installez les dépendances
npm install

# Configurez les variables d'environnement
cp .env.example .env.local
# Éditez .env.local avec vos clés API

# Lancez le serveur de développement
npm run dev
```

#### **Workflow de Développement**
```bash
# Créez une branche pour votre feature
git checkout -b feature/nom-de-votre-feature

# Faites vos modifications
# ...

# Testez vos changements
npm run test
npm run lint

# Committez vos changements
git add .
git commit -m "feat: ajouter nouvelle fonctionnalité"

# Push vers votre fork
git push origin feature/nom-de-votre-feature

# Créez une Pull Request sur GitHub
```

## 📋 Standards de Code

### 🎨 **Style de Code**

#### **TypeScript/React**
```typescript
// ✅ Bon
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

const UserCard: React.FC<{ user: UserProfile }> = ({ user }) => {
  return (
    <div className="p-4 rounded-lg bg-white shadow-sm">
      <h3 className="font-semibold text-gray-900">{user.name}</h3>
      <p className="text-sm text-gray-600">{user.email}</p>
    </div>
  );
};

// ❌ Éviter
const UserCard = ({ user }) => {
  return <div><h3>{user.name}</h3><p>{user.email}</p></div>;
};
```

#### **Conventions de Nommage**
- **Composants** : PascalCase (`UserCard`, `ItemList`)
- **Hooks** : camelCase avec préfixe `use` (`useItems`, `useAuth`)
- **Variables** : camelCase (`userName`, `itemCount`)
- **Constantes** : UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces** : PascalCase (`UserProfile`, `ItemData`)

#### **Structure des Fichiers**
```
src/
├── components/
│   ├── ui/              # Composants UI réutilisables
│   ├── business/        # Composants métier
│   └── layout/          # Composants de layout
├── pages/               # Pages de l'application
├── hooks/               # Hooks personnalisés
├── services/            # Services externes
├── store/               # État global
├── types/               # Types TypeScript
└── utils/               # Utilitaires
```

### 🧪 **Tests**

#### **Tests Unitaires**
```typescript
// UserCard.test.tsx
import { render, screen } from '@testing-library/react';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  it('affiche le nom et email de l\'utilisateur', () => {
    const user = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com'
    };

    render(<UserCard user={user} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });
});
```

#### **Tests d'Intégration**
```typescript
// useItems.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useItems } from './useItems';

describe('useItems', () => {
  it('récupère la liste des objets', async () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useItems(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });
  });
});
```

### 📝 **Documentation**

#### **Commentaires de Code**
```typescript
/**
 * Calcule le niveau d'un utilisateur basé sur ses points
 * @param points - Nombre de points de l'utilisateur
 * @returns Niveau calculé (1-100+)
 */
export function calculateUserLevel(points: number): number {
  if (points < 100) return 1;
  if (points < 250) return 2;
  // ...
}
```

#### **README des Composants**
```typescript
/**
 * UserCard - Composant d'affichage d'un profil utilisateur
 * 
 * @example
 * ```tsx
 * <UserCard 
 *   user={userProfile} 
 *   showActions={true}
 *   onEdit={() => console.log('Edit user')}
 * />
 * ```
 */
```

## 🔄 Processus de Review

### 📝 **Pull Request**

#### **Template de PR**
```markdown
## Description
Brève description des changements apportés.

## Type de changement
- [ ] Bug fix
- [ ] Nouvelle fonctionnalité
- [ ] Breaking change
- [ ] Documentation

## Tests
- [ ] Tests unitaires ajoutés/mis à jour
- [ ] Tests d'intégration ajoutés/mis à jour
- [ ] Tests manuels effectués

## Checklist
- [ ] Code respecte les standards du projet
- [ ] Documentation mise à jour
- [ ] Pas de console.log oubliés
- [ ] Variables d'environnement documentées
```

#### **Critères d'Acceptation**
- ✅ Code testé et fonctionnel
- ✅ Respect des conventions de style
- ✅ Documentation mise à jour
- ✅ Pas de régression introduite
- ✅ Performance acceptable

### 👥 **Review Process**

#### **Pour les Reviewers**
1. **Vérifiez la logique** : Le code fait-il ce qu'il est censé faire ?
2. **Testez manuellement** : Lancez l'application et testez la fonctionnalité
3. **Vérifiez les tests** : Les tests couvrent-ils les cas d'usage ?
4. **Commentaires constructifs** : Soyez spécifique et proposer des améliorations

#### **Pour les Auteurs**
1. **Répondez aux commentaires** : Adressez chaque point soulevé
2. **Tests supplémentaires** : Ajoutez des tests si demandé
3. **Documentation** : Mettez à jour la documentation si nécessaire
4. **Communication** : Expliquez vos choix de design

## 🛠️ Outils de Développement

### 📦 **Scripts Disponibles**
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

### 🔧 **Configuration IDE**

#### **VS Code Extensions Recommandées**
```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

#### **Settings.json**
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.includeLanguages": {
    "typescript": "typescript",
    "typescriptreact": "typescriptreact"
  }
}
```

## 🐛 Debugging

### 🔍 **Outils de Debug**

#### **React DevTools**
- Installez l'extension React DevTools
- Inspectez les composants et leur état
- Profiler les performances

#### **Supabase Debug**
```typescript
// Activer les logs Supabase
const supabase = createClient(url, key, {
  auth: {
    debug: true
  }
});
```

#### **TanStack Query DevTools**
```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// En développement
{process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
```

### 📊 **Performance**

#### **Bundle Analyzer**
```bash
npm run build
npx vite-bundle-analyzer dist
```

#### **Lighthouse**
- Utilisez Lighthouse pour auditer les performances
- Ciblez un score > 90 pour chaque métrique

## 🚀 Déploiement

### 🌐 **Environnements**

#### **Development**
- Branche : `develop`
- URL : `localhost:5173`
- Base de données : Supabase local ou staging

#### **Staging**
- Branche : `staging`
- URL : `staging.trocall.app`
- Base de données : Supabase staging

#### **Production**
- Branche : `main`
- URL : `trocall.app`
- Base de données : Supabase production

### 🔄 **CI/CD**

#### **GitHub Actions**
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

## 📚 Ressources

### 📖 **Documentation**
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Docs](https://supabase.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)

### 🎓 **Apprentissage**
- [React Patterns](https://reactpatterns.com/)
- [TypeScript Best Practices](https://typescript-eslint.io/rules/)
- [Supabase Best Practices](https://supabase.com/docs/guides/database/best-practices)

### 💬 **Communauté**
- [Discord TrocAll](../../discussions)
- [GitHub Discussions](../../discussions)
- [Issues](../../issues)

## 🎉 Reconnaissance

### 👏 **Contributeurs**
Merci à tous les contributeurs qui rendent TrocAll meilleur !

### 🏆 **Badges de Contribution**
- 🥇 **Gold Contributor** : 50+ contributions
- 🥈 **Silver Contributor** : 20+ contributions  
- 🥉 **Bronze Contributor** : 5+ contributions

---

Merci de contribuer à TrocAll ! Ensemble, nous construisons une plateforme qui révolutionne la consommation locale et crée du lien social dans nos quartiers. 🌱