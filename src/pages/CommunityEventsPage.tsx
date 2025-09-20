import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Users,
  Clock,
  Star,
  Heart,
  Share2,
  ChevronDown,
  Grid,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { useCommunity, useCommunityEvents, useJoinEvent } from '../hooks/useCommunities';
import { useAuthStore } from '../store/authStore';
import CommunityEventCard from '../components/CommunityEventCard';
import CreateEventModal from '../components/CreateEventModal';
import EventFiltersModal from '../components/EventFiltersModal';
import EventCalendar from '../components/EventCalendar';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import EmptyState from '../components/EmptyState';
import { CommunityEvent } from '../types';

type EventSortOption = 'date_asc' | 'date_desc' | 'participants_desc' | 'title_asc';
type EventViewMode = 'grid' | 'list';

const CommunityEventsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const { data: community, isLoading: communityLoading } = useCommunity(id || '');
  const { data: events = [], isLoading: eventsLoading, refetch } = useCommunityEvents(id || '');
  const joinEvent = useJoinEvent();

  // États locaux
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<EventSortOption>('date_asc');
  const [viewMode, setViewMode] = useState<EventViewMode>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // Vérifier si l'utilisateur est membre de la communauté
  const isMember = community?.members?.some(member => member.user_id === user?.id) || false;
  
  // Debug: afficher les informations de membre
  console.log('Community members:', community?.members);
  console.log('Current user ID:', user?.id);
  console.log('Is member:', isMember);

  // Types d'événements disponibles
  const eventTypes = [
    { id: 'all', label: 'Tous les événements', icon: Calendar },
    { id: 'meetup', label: 'Rencontres', icon: Users },
    { id: 'swap', label: 'Troc Party', icon: Heart },
    { id: 'workshop', label: 'Ateliers', icon: Star },
    { id: 'social', label: 'Événements sociaux', icon: Share2 },
    { id: 'other', label: 'Autres', icon: Plus }
  ];

  // Statuts d'événements
  const eventStatuses = [
    { id: 'all', label: 'Tous' },
    { id: 'upcoming', label: 'À venir' },
    { id: 'ongoing', label: 'En cours' },
    { id: 'past', label: 'Passés' }
  ];

  // Fonctions de filtrage et tri
  const getEventStatus = (event: CommunityEvent): string => {
    const now = new Date();
    const startDate = new Date(event.start_date);
    const endDate = event.end_date ? new Date(event.end_date) : startDate;

    if (now < startDate) return 'upcoming';
    if (now >= startDate && now <= endDate) return 'ongoing';
    return 'past';
  };

  const filteredEvents = events
    .filter(event => {
      // Filtre par recherche
      if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !event.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Filtre par type
      if (selectedType !== 'all' && event.event_type !== selectedType) {
        return false;
      }

      // Filtre par statut
      if (selectedStatus !== 'all') {
        const status = getEventStatus(event);
        if (status !== selectedStatus) return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':
          return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
        case 'date_desc':
          return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
        case 'participants_desc':
          return (b.participants?.length || 0) - (a.participants?.length || 0);
        case 'title_asc':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const handleJoinEvent = async (eventId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await joinEvent.mutateAsync({ eventId, userId: user.id });
      refetch();
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
    }
  };

  const handleLeaveEvent = async (eventId: string) => {
    // TODO: Implémenter la désinscription
    console.log('Désinscription à l\'événement:', eventId);
  };

  const isUserParticipant = (event: CommunityEvent): boolean => {
    return event.participants?.some(p => p.user_id === user?.id) || false;
  };

  const canJoinEvent = (event: CommunityEvent): boolean => {
    if (!isMember) return false;
    if (isUserParticipant(event)) return false;
    if (event.max_participants && (event.participants?.length || 0) >= event.max_participants) return false;
    return getEventStatus(event) === 'upcoming' || getEventStatus(event) === 'ongoing';
  };

  if (communityLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <EmptyState
          icon={Calendar}
          title="Communauté introuvable"
          description="Cette communauté n'existe pas ou a été supprimée."
          action={
            <Button onClick={() => navigate('/communities')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux communautés
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/communities/${id}`)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Événements - {community.name}
                </h1>
                <p className="text-sm text-gray-500">
                  {events.length} événement{events.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Temporaire: permettre à tous les utilisateurs de créer des événements */}
            <Button onClick={() => {
              console.log('Create event button clicked...');
              setShowCreateModal(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Créer un événement
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtres et recherche */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher un événement..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtres rapides */}
            <div className="flex flex-wrap gap-2">
              {/* Type d'événement */}
              <div className="relative">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  {eventTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Statut */}
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  {eventStatuses.map(status => (
                    <option key={status.id} value={status.id}>
                      {status.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Tri */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as EventSortOption)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                >
                  <option value="date_asc">Date ↑</option>
                  <option value="date_desc">Date ↓</option>
                  <option value="participants_desc">Participants ↓</option>
                  <option value="title_asc">Titre A-Z</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Mode d'affichage */}
              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-brand-100 text-brand-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-brand-100 text-brand-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Vue calendrier */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCalendar(!showCalendar)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                {showCalendar ? 'Vue liste' : 'Vue calendrier'}
              </Button>

              {/* Filtres avancés */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFiltersModal(true)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Plus de filtres
              </Button>
            </div>
          </div>
        </Card>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {filteredEvents.length}
                </div>
                <div className="text-sm text-gray-500">Événements</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {filteredEvents.reduce((sum, event) => sum + (event.participants?.length || 0), 0)}
                </div>
                <div className="text-sm text-gray-500">Participants</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {filteredEvents.filter(e => getEventStatus(e) === 'upcoming').length}
                </div>
                <div className="text-sm text-gray-500">À venir</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {filteredEvents.filter(e => getEventStatus(e) === 'ongoing').length}
                </div>
                <div className="text-sm text-gray-500">En cours</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Vue calendrier ou liste des événements */}
        {showCalendar ? (
          <EventCalendar
            events={filteredEvents}
            onEventClick={(event) => navigate(`/communities/${id}/events/${event.id}`)}
            onCreateEvent={() => setShowCreateModal(true)}
          />
        ) : eventsLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' 
                : 'grid-cols-1'
            }`}
          >
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CommunityEventCard
                  event={event}
                  onJoin={handleJoinEvent}
                  onLeave={handleLeaveEvent}
                  isParticipant={isUserParticipant(event)}
                  canJoin={canJoinEvent(event)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyState
            icon={Calendar}
            title="Aucun événement trouvé"
            description={
              searchQuery || selectedType !== 'all' || selectedStatus !== 'all'
                ? "Aucun événement ne correspond à vos critères de recherche."
                : "Cette communauté n'a pas encore d'événements. Soyez le premier à en créer un !"
            }
            action={
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Créer le premier événement
              </Button>
            }
          />
        )}
      </div>

      {/* Modales */}
      {showCreateModal && (
        <>
          {console.log('Rendering CreateEventModal...')}
          <CreateEventModal
            communityId={id || ''}
            onClose={() => {
              console.log('Closing CreateEventModal...');
              setShowCreateModal(false);
            }}
            onSuccess={() => {
              console.log('CreateEventModal success...');
              setShowCreateModal(false);
              refetch();
            }}
          />
        </>
      )}

      {showFiltersModal && (
        <EventFiltersModal
          onClose={() => setShowFiltersModal(false)}
          onApplyFilters={(filters) => {
            // Appliquer les filtres avancés
            setShowFiltersModal(false);
          }}
        />
      )}
    </div>
  );
};

export default CommunityEventsPage;
