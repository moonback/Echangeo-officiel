# Système d'Événements dans les Quartiers

## Vue d'ensemble

Le système d'événements permet aux membres des communautés de quartier d'organiser, participer et gérer des événements locaux. Il comprend une interface utilisateur complète avec des fonctionnalités avancées de gestion, de filtrage et de notifications.

## Fonctionnalités Principales

### 🎉 Création d'Événements
- **Formulaire multi-étapes** avec validation en temps réel
- **Types d'événements** : Rencontres, Troc Party, Ateliers, Événements sociaux
- **Gestion des participants** avec limite optionnelle
- **Localisation précise** avec coordonnées GPS
- **Événements récurrents** (hebdomadaire/mensuel)
- **Options avancées** : confirmation d'inscription, invitations, rappels

### 📅 Gestion des Événements
- **Interface d'administration** complète pour les organisateurs
- **Gestion des participants** : statuts (inscrit, confirmé, annulé)
- **Notifications** : rappels, mises à jour, annulations
- **Statistiques** : taux de participation, historique
- **Export des participants** en CSV

### 🔍 Découverte et Filtrage
- **Page dédiée** aux événements avec filtres avancés
- **Vue calendrier** interactive avec navigation mensuelle
- **Vue timeline** chronologique des événements
- **Recherche** par titre, description, type, statut
- **Filtres géographiques** par distance
- **Tri** par date, participants, titre

### 📱 Notifications Intelligentes
- **Rappels automatiques** 24h et 2h avant l'événement
- **Notifications contextuelles** selon la proximité
- **Gestion des préférences** utilisateur
- **Historique** des notifications

### 🎯 Widgets et Intégrations
- **Widget événements à venir** sur la page d'accueil
- **Résumé des statistiques** dans le dashboard
- **Notifications en temps réel** dans la barre de navigation
- **Intégration** avec le système de communautés

## Architecture Technique

### Base de Données

#### Table `community_events`
```sql
CREATE TABLE community_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES communities(id),
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT DEFAULT 'meetup',
    location TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    max_participants INTEGER,
    created_by UUID REFERENCES profiles(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### Table `event_participants`
```sql
CREATE TABLE event_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES community_events(id),
    user_id UUID REFERENCES profiles(id),
    status TEXT DEFAULT 'registered',
    registered_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(event_id, user_id)
);
```

### Hooks React

#### `useEvents.ts`
- `useUserEvents()` - Événements de l'utilisateur
- `useUpcomingUserEvents()` - Événements à venir
- `usePastUserEvents()` - Événements passés
- `useUserParticipatingEvents()` - Participations de l'utilisateur
- `useNearbyEvents()` - Événements géolocalisés
- `useCreateCommunityEvent()` - Création d'événement
- `useJoinEvent()` / `useLeaveEvent()` - Gestion des participations

#### `useCommunities.ts` (extension)
- `useCommunityEvents()` - Événements d'une communauté
- `useCreateCommunityEvent()` - Création d'événement communautaire

### Composants React

#### Pages
- `CommunityEventsPage.tsx` - Page principale des événements
- `EventDetailPage.tsx` - Détails d'un événement spécifique

#### Composants
- `CommunityEventCard.tsx` - Carte d'événement
- `CreateEventModal.tsx` - Modal de création
- `EventManagementModal.tsx` - Gestion d'événement
- `EventFiltersModal.tsx` - Filtres avancés
- `EventCalendar.tsx` - Vue calendrier
- `EventTimeline.tsx` - Vue timeline
- `EventSummary.tsx` - Résumé statistiques
- `UpcomingEventsWidget.tsx` - Widget événements à venir
- `EventNotifications.tsx` - Notifications d'événements

## Interface Utilisateur

### Design System
- **Couleurs cohérentes** selon le type d'événement
- **Icônes contextuelles** pour chaque type
- **Animations fluides** avec Framer Motion
- **Responsive design** pour mobile et desktop
- **Accessibilité** avec support clavier et lecteurs d'écran

### Navigation
- **Routes** : `/communities/:id/events` et `/communities/:communityId/events/:eventId`
- **Breadcrumbs** pour la navigation contextuelle
- **Liens** intégrés dans la page de détail de communauté

### États et Interactions
- **Loading states** avec squelettes animés
- **Empty states** avec actions suggérées
- **Error handling** avec messages informatifs
- **Optimistic updates** pour une UX fluide

## Configuration et Déploiement

### Scripts SQL
- `ADD_TEST_EVENTS.sql` - Ajout d'événements de test
- `ADD_EVENT_PARTICIPANTS.sql` - Ajout de participants de test

### Variables d'Environnement
Aucune configuration supplémentaire requise - utilise la configuration Supabase existante.

## Utilisation

### Pour les Organisateurs
1. **Créer un événement** via le bouton "Créer un événement"
2. **Remplir le formulaire** multi-étapes avec toutes les informations
3. **Gérer les participants** via l'interface d'administration
4. **Envoyer des notifications** pour rappels et mises à jour
5. **Consulter les statistiques** de participation

### Pour les Participants
1. **Découvrir les événements** via la page communauté ou le widget d'accueil
2. **Filtrer et rechercher** selon ses préférences
3. **S'inscrire** aux événements intéressants
4. **Recevoir des notifications** automatiques
5. **Consulter les détails** et l'historique

### Pour les Administrateurs
1. **Surveiller** l'activité des événements
2. **Modérer** le contenu si nécessaire
3. **Analyser** les statistiques globales
4. **Gérer** les communautés et leurs événements

## Évolutions Futures

### Fonctionnalités Planifiées
- **Paiements intégrés** pour événements payants
- **Streaming vidéo** pour événements en ligne
- **Géolocalisation avancée** avec zones de proximité
- **Intégration calendrier** externe (Google Calendar, Outlook)
- **Chat d'événement** pour les participants
- **Galerie photos** d'événements
- **Système de reviews** post-événement
- **Recommandations** d'événements personnalisées

### Améliorations Techniques
- **Cache intelligent** pour les performances
- **Notifications push** natives
- **Mode hors-ligne** pour consultation
- **API publique** pour intégrations tierces
- **Analytics avancées** avec métriques détaillées

## Support et Maintenance

### Monitoring
- **Logs d'événements** pour debugging
- **Métriques de performance** des requêtes
- **Alertes** en cas d'erreur système

### Maintenance
- **Nettoyage automatique** des anciens événements
- **Archivage** des événements passés
- **Optimisation** des requêtes fréquentes

---

*Ce système d'événements a été conçu pour renforcer les liens communautaires en facilitant l'organisation d'événements locaux et la participation des habitants de quartier.*
