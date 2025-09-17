# Configuration du Système de Gamification

## Problème Actuel

Les erreurs 406 (Not Acceptable) indiquent que les tables de gamification existent mais que les permissions RLS (Row Level Security) ne sont pas configurées correctement.

## Solution

### 1. Appliquer les Migrations

Vous devez appliquer les migrations suivantes dans votre dashboard Supabase :

#### Migration 1: Tables de Gamification
Exécutez le contenu du fichier `supabase/migrations/20250120000000_enhanced_gamification.sql` dans l'éditeur SQL de Supabase.

#### Migration 2: Permissions RLS
Exécutez le contenu du fichier `supabase/migrations/20250120000002_gamification_rls.sql` dans l'éditeur SQL de Supabase.

### 2. Vérification

Après avoir appliqué les migrations, vérifiez que :

1. Les tables suivantes existent :
   - `user_levels`
   - `user_points_history`
   - `challenges`
   - `user_challenges`
   - `badges`
   - `user_badges`

2. Les vues suivantes existent :
   - `gamification_stats`
   - `leaderboard`

3. Les fonctions suivantes existent :
   - `calculate_user_level(INTEGER)`
   - `get_level_title(INTEGER)`
   - `add_user_points(UUID, INTEGER, TEXT, TEXT, UUID)`
   - `check_and_award_badges(UUID)`

### 3. Initialisation des Données

Une fois les migrations appliquées, les utilisateurs existants auront automatiquement un niveau par défaut créé grâce à la migration RLS.

### 4. Test

Rechargez la page de gamification. Les erreurs 406 devraient disparaître et les données de gamification devraient s'afficher correctement.

## Structure des Tables

### user_levels
- `id`: UUID (clé primaire)
- `profile_id`: UUID (référence vers profiles)
- `level`: INTEGER (niveau de l'utilisateur)
- `points`: INTEGER (points totaux)
- `title`: TEXT (titre du niveau)

### gamification_stats (vue)
Vue qui agrège les statistiques de gamification d'un utilisateur :
- Niveau et points
- Nombre d'évaluations et score moyen
- Nombre de prêts et emprunts
- Nombre de badges

### badges
Table des badges disponibles avec leurs critères d'obtention.

### user_badges
Table des badges obtenus par les utilisateurs.

## Permissions RLS

Les permissions sont configurées pour :
- Les utilisateurs peuvent voir leurs propres données
- Les utilisateurs peuvent voir les niveaux et badges des autres
- Le système peut créer et mettre à jour les données
- Les défis et badges publics sont visibles par tous

## Fonctionnalités

Une fois configuré, le système de gamification permet :
- Attribution automatique de points lors des transactions
- Calcul automatique des niveaux
- Attribution automatique de badges
- Système de défis
- Classement des utilisateurs
- Historique des points
