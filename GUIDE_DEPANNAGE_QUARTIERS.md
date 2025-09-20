# Guide de dépannage : Quartiers non affichés à l'étape 4

## 🚨 Problème identifié
Les quartiers de l'utilisateur ne s'affichent pas automatiquement à l'étape 4 de création d'objet, et le message "Suggérer un quartier" / "Utiliser ma position" apparaît à la place.

## 🔍 Diagnostic

### 1. Vérifier les données en base
Exécutez le script SQL de debug :
```sql
-- Dans Supabase SQL Editor
\i supabase/DEBUG_USER_COMMUNITIES.sql
```

### 2. Vérifier les logs de debug
Ouvrez la console du navigateur (F12) et regardez les messages :
```javascript
// Ces messages devraient apparaître :
🔍 Debug CreateItemPage: { signupCommunity: {...}, userCommunities: [...], selectedCommunity: "...", userId: "..." }
🔍 Debug Step4Availability: { userCommunities: [...], signupCommunity: {...}, selectedCommunity: "...", userCommunitiesLength: 1 }
```

### 3. Causes possibles

#### A. Utilisateur non rattaché à des quartiers
**Symptôme :** `userCommunities` est vide ou `undefined`
**Solution :** Exécuter le script d'ajout d'utilisateurs aux quartiers :
```sql
\i supabase/ADD_TEST_USERS_TO_COMMUNITIES.sql
```

#### B. Quartiers inactifs
**Symptôme :** Les quartiers existent mais `is_active = false`
**Solution :** Activer les quartiers :
```sql
UPDATE communities SET is_active = true WHERE is_active = false;
```

#### C. Membres de communauté inactifs
**Symptôme :** L'utilisateur est membre mais `is_active = false`
**Solution :** Activer les membres :
```sql
UPDATE community_members SET is_active = true WHERE is_active = false;
```

#### D. Problème de cache
**Symptôme :** Les données changent mais l'interface ne se met pas à jour
**Solution :** Vider le cache du navigateur ou forcer le rechargement (Ctrl+F5)

## 🛠️ Solutions étape par étape

### Étape 1 : Vérifier la base de données
```sql
-- Vérifier que l'utilisateur a des communautés
SELECT 
  p.email,
  c.name as community_name,
  cm.is_active as member_active,
  c.is_active as community_active
FROM profiles p
INNER JOIN community_members cm ON p.id = cm.user_id
INNER JOIN communities c ON cm.community_id = c.id
WHERE p.email = 'votre-email@example.com';
```

### Étape 2 : Ajouter l'utilisateur à un quartier
```sql
-- Ajouter l'utilisateur au premier quartier disponible
INSERT INTO community_members (community_id, user_id, role, joined_at, is_active)
SELECT 
  c.id,
  'votre-user-id',
  'member',
  now(),
  true
FROM communities c
WHERE c.is_active = true
ORDER BY c.created_at ASC
LIMIT 1;
```

### Étape 3 : Créer des quartiers de test
```sql
-- Créer des quartiers de test s'ils n'existent pas
INSERT INTO communities (id, name, description, city, postal_code, country, center_latitude, center_longitude, radius_km, is_active, created_at, updated_at)
VALUES 
  ('test-quartier-1', 'Belleville', 'Quartier populaire de Paris', 'Paris', '75019', 'France', 48.8722, 2.3767, 2, true, now(), now()),
  ('test-quartier-2', 'Canal Saint-Martin', 'Quartier branché de Paris', 'Paris', '75010', 'France', 48.8708, 2.3686, 2, true, now(), now())
ON CONFLICT (id) DO NOTHING;
```

### Étape 4 : Tester l'interface
1. Ouvrir la console du navigateur (F12)
2. Aller à la création d'objet
3. Naviguer jusqu'à l'étape 4
4. Vérifier les messages de debug dans la console
5. Vérifier que les quartiers s'affichent

## 🔧 Scripts de dépannage

### Script JavaScript de debug
```bash
# Exécuter le script de debug
node scripts/debug-user-communities.js
```

### Script SQL complet
```sql
-- Script complet de vérification et correction
\i supabase/DEBUG_USER_COMMUNITIES.sql
\i supabase/ADD_TEST_USERS_TO_COMMUNITIES.sql
```

## 📋 Checklist de vérification

### Base de données
- [ ] L'utilisateur existe dans la table `profiles`
- [ ] L'utilisateur est membre d'au moins une communauté dans `community_members`
- [ ] La communauté est active (`is_active = true`)
- [ ] Le membre est actif (`is_active = true`)
- [ ] La date `joined_at` est correctement remplie

### Interface utilisateur
- [ ] Les logs de debug apparaissent dans la console
- [ ] `userCommunities` n'est pas vide
- [ ] `signupCommunity` est défini
- [ ] `selectedCommunity` est défini
- [ ] La section "Vos quartiers" s'affiche

### Code
- [ ] Le hook `useUserCommunities` fonctionne
- [ ] Le hook `useUserSignupCommunity` fonctionne
- [ ] Les props sont correctement passées au composant
- [ ] Le composant `Step4Availability` reçoit les bonnes données

## 🚀 Solutions rapides

### Solution 1 : Ajouter l'utilisateur à un quartier
```sql
-- Remplacer 'votre-user-id' par l'ID réel de l'utilisateur
INSERT INTO community_members (community_id, user_id, role, joined_at, is_active)
SELECT 
  c.id,
  'votre-user-id',
  'member',
  now(),
  true
FROM communities c
WHERE c.is_active = true
ORDER BY c.created_at ASC
LIMIT 1;
```

### Solution 2 : Créer un quartier et y ajouter l'utilisateur
```sql
-- Créer un quartier de test
INSERT INTO communities (id, name, description, city, postal_code, country, center_latitude, center_longitude, radius_km, is_active, created_at, updated_at)
VALUES 
  ('quartier-test', 'Quartier Test', 'Quartier de test pour debug', 'Paris', '75001', 'France', 48.8566, 2.3522, 2, true, now(), now());

-- Ajouter l'utilisateur au quartier
INSERT INTO community_members (community_id, user_id, role, joined_at, is_active)
VALUES ('quartier-test', 'votre-user-id', 'member', now(), true);
```

### Solution 3 : Forcer le rechargement des données
```javascript
// Dans la console du navigateur
// Vider le cache et recharger
localStorage.clear();
sessionStorage.clear();
location.reload(true);
```

## 📞 Support

Si le problème persiste après avoir suivi ce guide :

1. **Vérifiez les logs** dans la console du navigateur
2. **Exécutez les scripts SQL** de debug
3. **Testez avec un utilisateur de test** créé via les scripts
4. **Vérifiez la configuration Supabase** (URL, clés API)
5. **Consultez la documentation** des hooks `useUserCommunities` et `useUserSignupCommunity`

## 🎯 Résultat attendu

Après avoir résolu le problème, vous devriez voir :
- La section "Vos quartiers (X)" s'affiche
- Le quartier d'inscription est sélectionné par défaut
- Le message "🏠 Votre quartier d'inscription est sélectionné par défaut" apparaît
- Le badge "🏠 Quartier d'inscription" est visible sur la carte du quartier
