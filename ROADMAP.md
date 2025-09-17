## Roadmap

### MVP (fait / en cours)
- Auth email avec confirmation
- Création/édition d’objets (images, géoloc, champs étendus)
- Listing + filtres avancés
- Demandes d’emprunt (workflow basique)
- Détail objet (distance, notes)
- Thème UI responsive

### V1
- Avis complets: création d’avis post-transaction (modal), moyenne temps réel
- RLS production: policies strictes (propriétaire, demandeur, rôles)
- Upload multi-images avec réorganisation et suppression
- Amélioration recherche (texte intégral, tri par distance)
- Notifications email (demande reçue, acceptée, rappel)

### V1.1 – Expérience
- Pages profil enrichies (bio, coordonnées, évaluations)
- Historique d’emprunts prêts/rendus
- Badges de confiance (vérifié, top prêteur)

### V2 – Réseau & Mobile
- Messagerie temps réel (Supabase Realtime)
- PWA / App mobile (capacitor/expo) avec cache offline
- Suggestions basées sur tags et historiques

### V3 – Communauté & Sécurité
- Modération basique (report, blocage)
- Tarifs/dépôts optionnels, gestion de caution
- Programmes de communautés (groupes de quartier)

## Roadmap

### MVP (actuel)
- Auth email/password (Supabase)
- Profils: affichage, hydratation du store
- Items: création, listing, images (Storage public `items`)
- Requests: création et mise à jour du statut
- Chat: conversation basique (pull, pas de temps réel)
- UI responsive, animations

### V1
- RLS activé + policies de sécurité par table
- Chat temps réel (realtime channels Supabase)
- Pagination/infini-scroll items et messages
- Upload multi-images avec gestion d’images principales/miniatures
- Modération basique (signalements items/messages)
- Amélioration accessibilité (a11y)

### V2
- Géolocalisation & carte des voisins (Leaflet/Mapbox)
- Notifications push (Web Push / OneSignal)
- Système de réputation (notes/avis)
- Filtrage avancé (distance, disponibilité calendrier)
- Historique de prêts et statistiques

### Tech debt & qualité
- Tests e2e (Playwright/Cypress)
- Sentry pour erreurs front
- CI (lint, test, build) + pré-commit hooks
- Documentation continue (API, schémas)


