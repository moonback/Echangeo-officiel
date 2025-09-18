-- Script de test pour les fonctionnalités d'administration
-- À exécuter après avoir appliqué la migration

-- 1. Vérifier que la table user_bans existe
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_bans' 
ORDER BY ordinal_position;

-- 2. Vérifier que les fonctions existent
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name IN ('ban_user', 'unban_user', 'is_user_banned');

-- 3. Vérifier que la vue user_ban_stats existe
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_name = 'user_ban_stats';

-- 4. Tester la fonction de bannissement (remplacer les UUIDs par de vrais IDs)
-- SELECT ban_user(
--   'user-id-to-ban'::uuid,
--   'admin-user-id'::uuid,
--   'Test de bannissement',
--   'temporary',
--   (now() + interval '30 days')::timestamptz
-- );

-- 5. Vérifier les utilisateurs bannis
SELECT * FROM user_ban_stats WHERE is_banned = true;

-- 6. Tester la fonction de débannissement
-- SELECT unban_user('user-id-to-unban'::uuid);

-- 7. Vérifier qu'un utilisateur n'est plus banni
-- SELECT is_user_banned('user-id'::uuid);
