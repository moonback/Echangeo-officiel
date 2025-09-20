import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  ArrowRight,
  Heart,
  Star,
  Plus,
  Share2
} from 'lucide-react';
import { CommunityEvent } from '../types';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Button from './ui/Button';

interface UpcomingEventsWidgetProps {
  events: CommunityEvent[];
  communityId?: string;
  showAll?: boolean;
  maxEvents?: number;
}

const UpcomingEventsWidget: React.FC<UpcomingEventsWidgetProps> = ({
  events,
  communityId,
  showAll = false,
  maxEvents = 3
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
        color: 'text-red-600'
      };
    } else if (diffDays === 1) {
      return {
        label: 'Demain',
        time: date.toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        color: 'text-orange-600'
      };
    } else if (diffDays <= 7) {
      return {
        label: date.toLocaleDateString('fr-FR', { weekday: 'long' }),
        time: date.toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        color: 'text-blue-600'
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
        color: 'text-gray-600'
      };
    }
  };

  const getTimeUntilEvent = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    
    if (diffTime <= 0) return null;
    
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays}j ${diffHours}h`;
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    } else {
      return `${diffMinutes}m`;
    }
  };

  const sortedEvents = events
    .filter(event => new Date(event.start_date) > new Date())
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    .slice(0, showAll ? events.length : maxEvents);

  if (sortedEvents.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aucun événement à venir
          </h3>
          <p className="text-gray-500 mb-4">
            {communityId 
              ? "Cette communauté n'a pas d'événements programmés."
              : "Aucun événement n'est prévu dans vos communautés."
            }
          </p>
          {communityId && (
            <Button as={Link} to={`/communities/${communityId}/events/create`}>
              <Plus className="w-4 h-4 mr-2" />
              Créer un événement
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-600" />
            Événements à venir
          </h3>
          <p className="text-sm text-gray-500">
            {sortedEvents.length} événement{sortedEvents.length > 1 ? 's' : ''} programmé{sortedEvents.length > 1 ? 's' : ''}
          </p>
        </div>
        
        {communityId && (
          <Button as={Link} to={`/communities/${communityId}/events`} variant="outline" size="sm">
            Voir tout
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {sortedEvents.map((event, index) => {
          const dateInfo = formatDate(event.start_date);
          const timeUntil = getTimeUntilEvent(event.start_date);
          const EventIcon = getEventTypeIcon(event.event_type);
          const participantCount = event.participants?.length || 0;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <Link 
                to={communityId 
                  ? `/communities/${communityId}/events/${event.id}` 
                  : `/events/${event.id}`
                }
                className="block p-4 border border-gray-200 rounded-lg hover:border-brand-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  {/* Icône et badge */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-brand-100 flex items-center justify-center group-hover:bg-brand-200 transition-colors">
                      <EventIcon className="w-6 h-6 text-brand-600" />
                    </div>
                  </div>

                  {/* Contenu principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900 group-hover:text-brand-700 transition-colors line-clamp-1">
                          {event.title}
                        </h4>
                        {event.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            {event.description}
                          </p>
                        )}
                      </div>
                      
                      <Badge 
                        className={getEventTypeColor(event.event_type)}
                        variant="outline"
                        size="sm"
                      >
                        {getEventTypeLabel(event.event_type)}
                      </Badge>
                    </div>

                    {/* Informations de l'événement */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span className={dateInfo.color}>
                          {dateInfo.label} à {dateInfo.time}
                        </span>
                      </div>

                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate max-w-[120px]">{event.location}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>
                          {participantCount}
                          {event.max_participants && `/${event.max_participants}`}
                        </span>
                      </div>
                    </div>

                    {/* Timer jusqu'à l'événement */}
                    {timeUntil && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-brand-600">
                        <Clock className="w-3 h-3" />
                        <span>Dans {timeUntil}</span>
                      </div>
                    )}
                  </div>

                  {/* Indicateur de participation */}
                  {event.participants?.some(p => p.user_id === 'current-user') && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-green-500 rounded-full" title="Vous participez"></div>
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {!showAll && events.length > maxEvents && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <Button 
            as={Link} 
            to={communityId ? `/communities/${communityId}/events` : '/events'} 
            variant="outline" 
            className="w-full"
          >
            Voir tous les événements ({events.length})
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </Card>
  );
};

export default UpcomingEventsWidget;
