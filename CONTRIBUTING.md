## Contribuer à TrocAll

Merci de votre intérêt pour contribuer ! Ce guide décrit le workflow, les standards de code et les attentes pour les Pull Requests.

### Préparer l’environnement
1. Forkez le dépôt puis clonez votre fork
2. Installez les dépendances: `npm install`
3. Configurez `.env` (voir `README.md`)
4. Démarrez le projet: `npm run dev`

### Workflow Git
- Créez une branche depuis `main`: `git checkout -b feature/ma-feature`
- Commitez de façon claire: `feat: ...`, `fix: ...`, `docs: ...`, `refactor: ...`
- Poussez et ouvrez une Pull Request avec une description concise (quoi/pourquoi)

### Qualité & style
- TypeScript strict sur les API publiques
- Nommez clairement variables et fonctions (voir `code_style` dans la doc interne)
- Pas d’`any` non justifié, pas de catch silencieux
- Evitez les changements de formatting non liés

### Tests & lint
- Exécutez: `npm run lint` et `npm run test`
- Ajoutez des tests pour les hooks/logic critiques

### Revue & merge
- Mainteneurs demandent 1 approval minimum
- Squash & merge recommandé

### Sécurité
- Ne commitez jamais de secrets. Utilisez `.env` local et des variables de CI.
- En production, RLS doit être activé (voir `DB_SCHEMA.md`).


