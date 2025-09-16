## API Docs (via Supabase)

Cette application ne possède pas d’API backend custom; elle consomme directement Supabase (Auth, Postgres, Storage) depuis le frontend. Les opérations ci-dessous décrivent les accès aux tables et aux services fournis par Supabase.

### Auth
- Inscription: `supabase.auth.signUp({ email, password })`
- Connexion: `supabase.auth.signInWithPassword({ email, password })`
- Déconnexion: `supabase.auth.signOut()`
- Session courante: `supabase.auth.getSession()` / `supabase.auth.getUser()`

### Profils (`profiles`)
- Lecture d’un profil: `from('profiles').select('*').eq('id', :id).single()`
- Liste des profils (voisins): `from('profiles').select('*').neq('id', currentUserId)`
- Mise à jour de profil: `from('profiles').update({...}).eq('id', currentUserId)`

Champs: `id, email, full_name, avatar_url, bio, phone, address, latitude, longitude, created_at, updated_at`

### Objets (`items`) et images (`item_images`)
- Liste d’items: `from('items').select('*, owner:profiles(*), images:item_images(*)').eq('is_available', true)`
- Détail d’un item: `from('items').select('*, owner:profiles(*), images:item_images(*)').eq('id', :id).single()`
- Création d’un item: `from('items').insert({...}).select().single()`
- Upload d’image (Storage, bucket `items`): `storage.from('items').upload(path, file)` puis `getPublicUrl(path)` et insertion dans `item_images`

Champs `items`: `id, owner_id, title, description, category, condition, is_available, created_at, updated_at`
Champs `item_images`: `id, item_id, url, is_primary, created_at`

### Demandes (`requests`)
- Liste des demandes liées à l’utilisateur (demandeur ou propriétaire):
  `from('requests').select('*, requester:profiles!requests_requester_id_fkey(*), item:items(*, owner:profiles(*))').or('requester_id.eq.:uid,item.owner_id.eq.:uid')`
- Création: `from('requests').insert({ item_id, message, requested_from, requested_to, requester_id: :uid, status: 'pending' }).select().single()`
- Mise à jour du statut: `from('requests').update({ status }).eq('id', :id)`

Champs: `id, requester_id, item_id, message, status, requested_from, requested_to, created_at, updated_at`

### Messages (`messages`)
- Conversation entre deux profils: `from('messages').select('*').or('and(sender_id.eq.:uid,receiver_id.eq.:other),and(sender_id.eq.:other,receiver_id.eq.:uid)').order('created_at')`
- Envoi d’un message: `from('messages').insert({ sender_id: :uid, receiver_id: :other, content, request_id? }).select().single()`

Champs: `id, sender_id, receiver_id, content, request_id, created_at`

### Erreurs & gestion
- Les méthodes Supabase renvoient `{ data, error }`. Toujours tester `error` et gérer l’affichage côté UI.


