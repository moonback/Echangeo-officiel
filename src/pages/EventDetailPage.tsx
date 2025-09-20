import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  User,
  Share2,
  Heart,
  Star,
  Plus,
  Edit,
  Trash2,
  MessageSquare,
  Phone,
  Mail,
  Navigation,
  CheckCircle,
  AlertCircle,
  UserPlus,
  UserMinus
} from 'lucide-react';
import { useCommunityEvents, useJoinEvent } from '../hooks/useCommunities';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import EmptyState from '../components/EmptyState';
import EventManagementModal from '../components/EventManagementModal';
import { CommunityEvent } from '../types';
import { toast } from 'react-hot-toast';

const EventDetailPage: React.FC = () => {
  const { communityId, eventId } = useParams<{ communityId: string; eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const { data: events = [], isLoading } = useCommunityEvents(communityId || '');
  const joinEvent = useJoinEvent();

  const [showManagementModal, setShowManagementModal] = useState(false);

  const event = events.find(e => e.id === eventId);

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'meetup': return Users;
      case 'swap': return Heart;
      case 'workshop': return Star;
      case 'social': return Plus;
      default: return Calendar;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meetup': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'swap': return 'bg-green-100 text-green-700 border-green-200';
      case 'workshop': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'social': return 'bg-pink-100 text-pink-700 border-pink-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'meetup': return 'Rencontre';
      case 'swap': return 'Troc Party';
      case 'workshop': return 'Atelier';
      case 'social': return 'Événement social';
      default: return 'Événement';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const getEventStatus = () => {
    const now = new Date();
    const startDate = new Date(event?.start_date || '');
    const endDate = event?.end_date ? new Date(event.end_date) : startDate;

    if (now < startDate) return { status: 'upcoming', label: 'À venir', color: 'blue' };
    if (now >= startDate && now <= endDate) return { status: 'ongoing', label: 'En cours', color: 'green' };
    return { status: 'past', label: 'Terminé', color: 'gray' };
  };

  const isUserParticipant = (): boolean => {
    return event?.participants?.some(p => p.user_id === user?.id) || false;
  };

  const canJoinEvent = (): boolean => {
    if (!event) return false;
    if (isUserParticipant()) return false;
    if (event.max_participants && (event.participants?.length || 0) >= event.max_participants) return false;
    const status = getEventStatus();
    return status.status === 'upcoming' || status.status === 'ongoing';
  };

  const isUserOrganizer = (): boolean => {
    return event?.created_by === user?.id;
  };

  const handleJoinEvent = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!event) return;

    try {
      await joinEvent.mutateAsync({ eventId: event.id, userId: user.id });
      toast.success('Inscription réussie !');
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      toast.error('Erreur lors de l\'inscription');
    }
  };

  const handleLeaveEvent = async () => {
    // TODO: Implémenter la désinscription
    toast.info('Fonctionnalité de désinscription à venir');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: event?.description,
          url: window.location.href
        });
      } catch (error) {
        console.log('Erreur lors du partage:', error);
      }
    } else {
      // Fallback: copier dans le presse-papier
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papier');
    }
  };

  const getParticipantStatusColor = (status: string) => {
    switch (status) {
      case 'registered': return 'bg-blue-100 text-blue-700';
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getParticipantStatusLabel = (status: string) => {
    switch (status) {
      case 'registered': return 'Inscrit';
      case 'confirmed': return 'Confirmé';
      case 'cancelled': return 'Annulé';
      default: return 'Inconnu';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <EmptyState
          icon={Calendar}
          title="Événement introuvable"
          description="Cet événement n'existe pas ou a été supprimé."
          action={
            <Button onClick={() => navigate(`/communities/${communityId}/events`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux événements
            </Button>
          }
        />
      </div>
    );
  }

  const eventStatus = getEventStatus();
  const startDate = formatDate(event.start_date);
  const endDate = event.end_date ? formatDate(event.end_date) : null;
  const EventIcon = getEventTypeIcon(event.event_type);
  const participantCount = event.participants?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/communities/${communityId}/events`)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 truncate">
                  {event.title}
                </h1>
                <div className="flex items-center gap-2">
                  <Badge 
                    className={getEventTypeColor(event.event_type)}
                    variant="outline"
                    size="sm"
                  >
                    {getEventTypeLabel(event.event_type)}
                  </Badge>
                  <Badge 
                    className={`${
                      eventStatus.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                      eventStatus.color === 'green' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}
                    variant="outline"
                    size="sm"
                  >
                    {eventStatus.label}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
              
              {isUserOrganizer() && (
                <Button variant="outline" size="sm" onClick={() => setShowManagementModal(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Gérer
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
              {event.description ? (
                <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
              ) : (
                <p className="text-gray-500 italic">Aucune description fournie.</p>
              )}
            </Card>

            {/* Informations détaillées */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Date et heure</div>
                    <div className="text-gray-700">
                      {startDate.date} à {startDate.time}
                    </div>
                    {endDate && (
                      <div className="text-sm text-gray-500">
                        Fin: {endDate.date} à {endDate.time}
                      </div>
                    )}
                  </div>
                </div>

                {event.location && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Lieu</div>
                      <div className="text-gray-700">{event.location}</div>
                      {event.latitude && event.longitude && (
                        <Button variant="outline" size="sm" className="mt-2">
                          <Navigation className="w-4 h-4 mr-2" />
                          Itinéraire
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Participants</div>
                    <div className="text-gray-700">
                      {participantCount} participant{participantCount > 1 ? 's' : ''}
                      {event.max_participants && ` sur ${event.max_participants}`}
                    </div>
                    {event.max_participants && (
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-brand-600 h-2 rounded-full" 
                          style={{ width: `${Math.min((participantCount / event.max_participants) * 100, 100)}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Participants */}
            {event.participants && event.participants.length > 0 && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Participants ({participantCount})
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.participants.map((participant) => (
                    <div key={participant.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
                        {participant.user?.avatar_url ? (
                          <img
                            src={participant.user.avatar_url}
                            alt={participant.user.full_name || participant.user.email}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-brand-600 font-medium">
                            {(participant.user?.full_name || participant.user?.email || 'U').charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {participant.user?.full_name || 'Nom non renseigné'}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {participant.user?.email}
                        </div>
                      </div>
                      
                      <Badge 
                        className={getParticipantStatusColor(participant.status)}
                        variant="outline"
                        size="sm"
                      >
                        {getParticipantStatusLabel(participant.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
              
              <div className="space-y-3">
                {isUserParticipant() ? (
                  <Button 
                    variant="outline" 
                    onClick={handleLeaveEvent}
                    className="w-full"
                  >
                    <UserMinus className="w-4 h-4 mr-2" />
                    Se désinscrire
                  </Button>
                ) : (
                  <Button 
                    onClick={handleJoinEvent}
                    disabled={!canJoinEvent()}
                    className="w-full"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {event.max_participants && participantCount >= event.max_participants 
                      ? 'Complet' 
                      : 'Rejoindre l\'événement'
                    }
                  </Button>
                )}

                <Button variant="outline" onClick={handleShare} className="w-full">
                  <Share2 className="w-4 h-4 mr-2" />
                  Partager
                </Button>

                {isUserOrganizer() && (
                  <>
                    <Button variant="outline" onClick={() => setShowManagementModal(true)} className="w-full">
                      <Edit className="w-4 h-4 mr-2" />
                      Gérer l'événement
                    </Button>
                    <Button variant="outline" className="w-full">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contacter les participants
                    </Button>
                  </>
                )}
              </div>
            </Card>

            {/* Organisateur */}
            {event.creator && (
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Organisateur</h3>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center">
                    {event.creator.avatar_url ? (
                      <img
                        src={event.creator.avatar_url}
                        alt={event.creator.full_name || event.creator.email}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-brand-600 font-medium text-lg">
                        {(event.creator.full_name || event.creator.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {event.creator.full_name || 'Nom non renseigné'}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {event.creator.email}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                </div>
              </Card>
            )}

            {/* Statistiques rapides */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Statistiques</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Participants confirmés</span>
                  <span className="font-medium text-gray-900">
                    {event.participants?.filter(p => p.status === 'confirmed').length || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">En attente</span>
                  <span className="font-medium text-gray-900">
                    {event.participants?.filter(p => p.status === 'registered').length || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Taux de confirmation</span>
                  <span className="font-medium text-gray-900">
                    {participantCount > 0 
                      ? `${Math.round(((event.participants?.filter(p => p.status === 'confirmed').length || 0) / participantCount) * 100)}%`
                      : '0%'
                    }
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de gestion */}
      {showManagementModal && (
        <EventManagementModal
          event={event}
          onClose={() => setShowManagementModal(false)}
          onEdit={(event) => {
            setShowManagementModal(false);
            // TODO: Ouvrir le modal d'édition
          }}
          onDelete={(eventId) => {
            setShowManagementModal(false);
            // TODO: Confirmer la suppression
          }}
          onUpdateParticipantStatus={(participantId, status) => {
            // TODO: Mettre à jour le statut du participant
            console.log('Update participant status:', participantId, status);
          }}
          onSendNotification={(eventId, type) => {
            // TODO: Envoyer une notification
            console.log('Send notification:', eventId, type);
          }}
        />
      )}
    </div>
  );
};

export default EventDetailPage;
