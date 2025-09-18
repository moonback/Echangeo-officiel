# Résolution de l'erreur "Invalid enum value" pour les dons

## 🚨 Problème
```
Invalid enum value. Expected 'loan' | 'trade', received 'donation'
```

Cette erreur indique que la base de données n'a pas encore été mise à jour pour accepter le nouveau type `'donation'`.

## ✅ Solutions

### Solution 1 : Via l'interface Supabase (Recommandée)

1. **Ouvrez votre projet Supabase** dans le navigateur
2. **Allez dans l'onglet "SQL Editor"**
3. **Copiez et exécutez le contenu** du fichier `supabase/UPDATE_OFFER_TYPE.sql`
4. **Vérifiez** avec le fichier `supabase/TEST_DONATION_SIMPLE.sql`

### Solution 2 : Via Supabase CLI (si installé)

```bash
# Dans le dossier supabase/
supabase db reset
# ou
supabase migration up
```

### Solution 3 : Modification manuelle

Si vous avez accès direct à la base de données :

```sql
-- Supprimer l'ancienne contrainte
ALTER TABLE public.items
  DROP CONSTRAINT IF EXISTS items_offer_type_check;

-- Ajouter la nouvelle contrainte
ALTER TABLE public.items
  ADD CONSTRAINT items_offer_type_check 
  CHECK (offer_type IN ('loan', 'trade', 'donation'));
```

## 🔍 Vérification

Après avoir appliqué la solution, testez avec :

```sql
-- Vérifier que les trois types sont acceptés
SELECT 'donation'::text IN ('loan', 'trade', 'donation') as donation_valid;
-- Devrait retourner: true
```

## 📋 Étapes détaillées

### 1. Ouvrir Supabase Dashboard
- Connectez-vous à [supabase.com](https://supabase.com)
- Sélectionnez votre projet Échangeo

### 2. Accéder au SQL Editor
- Cliquez sur "SQL Editor" dans le menu de gauche
- Cliquez sur "New query"

### 3. Exécuter la mise à jour
- Copiez le contenu de `supabase/UPDATE_OFFER_TYPE.sql`
- Collez-le dans l'éditeur
- Cliquez sur "Run" (ou Ctrl+Enter)

### 4. Vérifier le succès
- Vous devriez voir : `Contrainte offer_type mise à jour avec succès!`
- Exécutez ensuite `supabase/TEST_DONATION_SIMPLE.sql` pour vérifier

## 🎯 Résultat attendu

Après la mise à jour :
- ✅ Le type `'donation'` sera accepté
- ✅ Les composants React fonctionneront
- ✅ La landing page affichera les dons
- ✅ Les statistiques incluront les dons

## 🚨 Si le problème persiste

1. **Vérifiez la contrainte** :
```sql
SELECT pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'items_offer_type_check';
```

2. **Redémarrez l'application** après la mise à jour

3. **Vérifiez les types TypeScript** dans `src/types/index.ts`

---

**Une fois cette mise à jour effectuée, votre application supportera pleinement les dons !** 🎉
