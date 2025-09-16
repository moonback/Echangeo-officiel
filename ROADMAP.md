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


