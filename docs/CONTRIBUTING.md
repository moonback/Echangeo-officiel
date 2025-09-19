# Guide de Contribution - Échangeo

## 🤝 Bienvenue !

Merci de votre intérêt pour contribuer à Échangeo ! Ce guide vous aidera à comprendre comment participer au développement de la plateforme.

## 🚀 Premiers Pas

### Prérequis
- **Node.js** 18+ et npm/yarn
- **Git** pour la gestion de version
- **Compte GitHub** pour les contributions
- **Compte Supabase** (optionnel pour les tests)

### Fork et Clone
```bash
# Fork le repository sur GitHub
# Puis clonez votre fork
git clone https://github.com/votre-username/echangeo.git
cd echangeo

# Ajoutez le repository original comme remote
git remote add upstream https://github.com/original-owner/echangeo.git
```

### Installation
```bash
# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env.local
# Éditez .env.local avec vos clés API
```

## 🔧 Configuration de Développement

### Variables d'Environnement
Créez un fichier `.env.local` avec :
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_key (optionnel)
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token (optionnel)
```

### Base de Données de Test
```bash
# Option 1: Utiliser Supabase CLI
supabase start
supabase db reset

# Option 2: Utiliser un projet Supabase de test
# Créez un projet de test et appliquez les migrations
```

## 📋 Processus de Contribution

### 1. Créer une Issue
- Vérifiez qu'une issue similaire n'existe pas
- Utilisez les templates d'issue appropriés
- Décrivez clairement le problème ou la fonctionnalité

### 2. Créer une Branche
```bash
# Synchroniser avec upstream
git fetch upstream
git checkout main
git merge upstream/main

# Créer une nouvelle branche
git checkout -b feature/nom-de-la-fonctionnalite
# ou
git checkout -b fix/nom-du-bug
```

### 3. Développer
- Suivez les conventions de code
- Écrivez des tests pour vos modifications
- Documentez les changements importants
- Testez localement avant de commit

### 4. Commit et Push
```bash
# Ajouter les fichiers modifiés
git add .

# Commit avec un message descriptif
git commit -m "feat: ajouter système de dons"

# Push vers votre fork
git push origin feature/nom-de-la-fonctionnalite
```

### 5. Pull Request
- Créez une PR vers la branche `main`
- Utilisez le template de PR
- Ajoutez des captures d'écran si nécessaire
- Référencez les issues liées

## 📝 Conventions de Code

### Messages de Commit
Utilisez le format [Conventional Commits](https://www.conventionalcommits.org/) :

```bash
feat: ajouter nouvelle fonctionnalité
fix: corriger un bug
docs: mise à jour documentation
style: formatage du code
refactor: refactoring sans changement fonctionnel
test: ajouter ou modifier tests
chore: tâches de maintenance
```

### Structure des Composants
```typescript
// Ordre des imports
import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

// Imports locaux
import Button from '../ui/Button';
import { useItems } from '../../hooks/useItems';
import type { Item } from '../../types';

// Interface du composant
interface ComponentProps {
  title: string;
  onAction: () => void;
}

// Composant
const Component: React.FC<ComponentProps> = ({ title, onAction }) => {
  // Hooks
  const { data, loading } = useItems();
  
  // Handlers
  const handleClick = () => {
    onAction();
  };
  
  // Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick}>Action</Button>
    </div>
  );
};

export default Component;
```

### Nommage
- **Composants** : PascalCase (`UserProfile`)
- **Hooks** : camelCase avec `use` (`useUserData`)
- **Fonctions** : camelCase (`getUserData`)
- **Variables** : camelCase (`userData`)
- **Constantes** : UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types** : PascalCase (`UserProfile`)

### Styling
- Utilisez **Tailwind CSS** pour le styling
- Préférez les classes utilitaires
- Créez des composants réutilisables pour les patterns répétitifs
- Utilisez les design tokens définis dans `tailwind.config.js`

## 🧪 Tests

### Tests Unitaires
```typescript
// Exemple de test avec Vitest
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Button from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Tests d'Intégration
```typescript
// Test d'un hook
import { renderHook } from '@testing-library/react';
import { useItems } from './useItems';

describe('useItems', () => {
  it('returns items data', async () => {
    const { result } = renderHook(() => useItems());
    // Assertions...
  });
});
```

### Exécuter les Tests
```bash
# Tous les tests
npm run test

# Tests en mode watch
npm run test:watch

# Tests avec couverture
npm run test:coverage

# Tests UI
npm run test:ui
```

## 🎨 Design System

### Composants UI
- Utilisez les composants de `src/components/ui/`
- Respectez les props et interfaces définies
- Ajoutez de nouveaux composants si nécessaire

### Icônes
- Utilisez **Lucide React** pour les icônes
- Importez seulement les icônes nécessaires
- Préférez les icônes cohérentes avec le design

### Couleurs
- Utilisez les couleurs définies dans `tailwind.config.js`
- Respectez la palette de couleurs Échangeo
- Utilisez les variants de couleurs (50, 100, 200, etc.)

## 📚 Documentation

### Code Documentation
```typescript
/**
 * Hook pour gérer les données des objets
 * @param filters - Filtres optionnels pour la recherche
 * @returns Données des objets, état de chargement et erreurs
 */
export function useItems(filters?: ItemFilters) {
  // Implementation...
}
```

### README Updates
- Mettez à jour le README si vous ajoutez des fonctionnalités
- Documentez les nouvelles variables d'environnement
- Ajoutez des exemples d'utilisation

### Documentation Technique
- Mettez à jour `docs/ARCHITECTURE.md` pour les changements architecturaux
- Mettez à jour `docs/API_DOCS.md` pour les nouveaux endpoints
- Mettez à jour `docs/DB_SCHEMA.md` pour les changements de base de données

## 🐛 Débogage

### Outils de Développement
- **React DevTools** : Inspection des composants
- **TanStack Query DevTools** : Debug des requêtes
- **Supabase Dashboard** : Inspection de la base de données
- **Browser DevTools** : Debug JavaScript et réseau

### Logs
```typescript
// Utilisez console.log pour le debug
console.log('Debug info:', data);

// Utilisez console.error pour les erreurs
console.error('Error occurred:', error);

// Utilisez console.warn pour les avertissements
console.warn('Deprecated feature used');
```

### Problèmes Courants
1. **Erreurs Supabase** : Vérifiez les variables d'environnement
2. **Erreurs TypeScript** : Vérifiez les types et interfaces
3. **Erreurs de build** : Vérifiez les imports et dépendances
4. **Erreurs de test** : Vérifiez les mocks et setup

## 🔍 Code Review

### Critères de Review
- **Fonctionnalité** : Le code fait-il ce qu'il est censé faire ?
- **Performance** : Y a-t-il des optimisations possibles ?
- **Sécurité** : Y a-t-il des vulnérabilités ?
- **Maintenabilité** : Le code est-il facile à comprendre ?
- **Tests** : Y a-t-il des tests appropriés ?

### Checklist PR
- [ ] Code fonctionne et répond aux exigences
- [ ] Tests passent et couvrent les nouveaux cas
- [ ] Documentation mise à jour si nécessaire
- [ ] Pas de console.log oubliés
- [ ] Code respecte les conventions
- [ ] Pas de code mort ou commenté
- [ ] Gestion d'erreurs appropriée

## 🚀 Déploiement

### Environnements
- **Development** : `npm run dev`
- **Staging** : Déploiement automatique sur les PR
- **Production** : Déploiement manuel après validation

### Processus de Release
1. Mise à jour du numéro de version
2. Génération du changelog
3. Création d'un tag Git
4. Déploiement en production
5. Communication aux utilisateurs

## 🤔 Questions Fréquentes

### Comment ajouter une nouvelle fonctionnalité ?
1. Créez une issue pour discuter de la fonctionnalité
2. Créez une branche feature
3. Développez avec des tests
4. Créez une PR avec documentation

### Comment corriger un bug ?
1. Reproduisez le bug localement
2. Créez une branche fix
3. Écrivez un test qui reproduit le bug
4. Corrigez le bug
5. Vérifiez que le test passe

### Comment contribuer à la documentation ?
1. Identifiez les sections à améliorer
2. Créez une branche docs
3. Améliorez la documentation
4. Créez une PR avec les changements

## 📞 Support

### Communication
- **GitHub Issues** : Pour les bugs et fonctionnalités
- **GitHub Discussions** : Pour les questions générales
- **Email** : contact@echangeo.fr pour les questions privées

### Ressources
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation React](https://react.dev)
- [Documentation Tailwind](https://tailwindcss.com/docs)
- [Documentation TanStack Query](https://tanstack.com/query)

---

Merci de contribuer à Échangeo ! Ensemble, nous créons une plateforme qui transforme la consommation locale et favorise l'économie circulaire. 🌱✨