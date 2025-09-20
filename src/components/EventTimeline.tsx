import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Heart,
  Star,
  Plus,
  Share2,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { CommunityEvent } from '../types';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Button from './ui/Button';

interface EventTimelineProps {
  events: CommunityEvent[];
  onEventClick: (event: CommunityEvent) => void;
  onJoinEvent: (eventId: string) => void;
  onLeaveEvent: (eventId: string) => void;
  isUserParticipant: (event: CommunityEvent) => boolean;
  canJoinEvent: (event: CommunityEvent) => boolean;
}

const EventTimeline: React.FC<EventTimelineProps> = ({
  events,
  onEventClick,
  onJoinEvent,
  onLeaveEvent,
  isUserParticipant,
  canJoinEvent
}) => {
  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'meetup': return Users;
      case 'swap': return Heart;
      case 'workshop': return Star;
      case 'social': return Share2;
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
      case 'swap': return 'Troc';
      case 'workshop': return 'Atelier';
      case 'social': return 'Social';
      default: return 'Événement';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return {
        label: 'Aujourd\'hui',
        time: date.toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        color: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200'
      };
    } else if (diffDays === 1) {
      return {
        label: 'Demain',
        time: date.toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 border-orange-200'
      };
    } else if (diffDays > 0 && diffDays <= 7) {
      return {
        label: date.toLocaleDateString('fr-FR', { weekday: 'long' }),
        time: date.toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 border-blue-200'
      };
    } else {
      return {
        label: date.toLocaleDateString('fr-FR', { 
          day: 'numeric', 
          month: 'short' 
        }),
        time: date.toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        color: 'text-gray-600',
        bgColor: 'bg-gray-50 border-gray-200'
      };
    }
  };

  const getEventStatus = (event: CommunityEvent) => {
    const now = new Date();
    const startDate = new Date(event.start_date);
    const endDate = event.end_date ? new Date(event.end_date) : startDate;

    if (now < startDate) return { status: 'upcoming', label: 'À venir', color: 'blue' };
    if (now >= startDate && now <= endDate) return { status: 'ongoing', label: 'En cours', color: 'green' };
    return { status: 'past', label: 'Terminé', color: 'gray' };
  };

  const sortedEvents = events.sort((a, b) => 
    new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  );

  if (sortedEvents.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Aucun événement programmé
        </h3>
        <p className="text-gray-500">
          Il n'y a pas d'événements à afficher dans cette timeline.
        </p>
      </Card>
    );
  }

  return (
    <div className="relative">
      {/* Ligne de timeline */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

      <div className="space-y-8">
        {sortedEvents.map((event, index) => {
          const dateInfo = formatDate(event.start_date);
          const eventStatus = getEventStatus(event);
          const EventIcon = getEventTypeIcon(event.event_type);
          const participantCount = event.participants?.length || 0;
          const isParticipant = isUserParticipant(event);
          const canJoin = canJoinEvent(event);

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex gap-6"
            >
              {/* Point de timeline */}
              <div className="relative z-10 flex-shrink-0">
                <div className={`w-16 h-16 rounded-full border-4 border-white shadow-lg flex items-center justify-center ${
                  eventStatus.color === 'blue' ? 'bg-blue-500' :
                  eventStatus.color === 'green' ? 'bg-green-500' :
                  'bg-gray-500'
                }`}>
                  <EventIcon className="w-6 h-6 text-white" />
                </div>
                
                {/* Badge de date */}
                <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded-full text-xs font-medium border ${dateInfo.bgColor}`}>
                  <span className={dateInfo.color}>{dateInfo.label}</span>
                </div>
              </div>

              {/* Contenu de l'événement */}
              <div className="flex-1 min-w-0">
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {event.title}
                        </h3>
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

                      {event.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      {/* Informations de l'événement */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span className={dateInfo.color}>
                            {dateInfo.time}
                          </span>
                        </div>

                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate max-w-[200px]">{event.location}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>
                            {participantCount}
                            {event.max_participants && `/${event.max_participants}`}
                          </span>
                        </div>

                        {event.community && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {event.community.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                      {isParticipant ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onLeaveEvent(event.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Inscrit
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => onJoinEvent(event.id)}
                          disabled={!canJoin}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          {event.max_participants && participantCount >= event.max_participants 
                            ? 'Complet' 
                            : 'Rejoindre'
                          }
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEventClick(event)}
                      >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Voir détails
                      </Button>
                    </div>
                  </div>

                  {/* Barre de progression pour les participants */}
                  {event.max_participants && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>Participants</span>
                        <span>{participantCount}/{event.max_participants}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            participantCount / event.max_participants >= 0.9 
                              ? 'bg-red-500' 
                              : participantCount / event.max_participants >= 0.7 
                              ? 'bg-orange-500' 
                              : 'bg-green-500'
                          }`}
                          style={{ 
                            width: `${Math.min((participantCount / event.max_participants) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default EventTimeline;
