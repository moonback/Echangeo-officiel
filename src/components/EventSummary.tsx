import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  Clock, 
  TrendingUp,
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

interface EventSummaryProps {
  events: CommunityEvent[];
  upcomingEvents: CommunityEvent[];
  pastEvents: CommunityEvent[];
  participatingEvents: CommunityEvent[];
  onViewAllEvents: () => void;
  onCreateEvent: () => void;
}

const EventSummary: React.FC<EventSummaryProps> = ({
  events,
  upcomingEvents,
  pastEvents,
  participatingEvents,
  onViewAllEvents,
  onCreateEvent
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
      case 'meetup': return 'bg-blue-100 text-blue-700';
      case 'swap': return 'bg-green-100 text-green-700';
      case 'workshop': return 'bg-purple-100 text-purple-700';
      case 'social': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'meetup': return 'Rencontres';
      case 'swap': return 'Troc Party';
      case 'workshop': return 'Ateliers';
      case 'social': return 'Événements sociaux';
      default: return 'Événements';
    }
  };

  const getEventStats = () => {
    const totalParticipants = events.reduce((sum, event) => sum + (event.participants?.length || 0), 0);
    const avgParticipants = events.length > 0 ? Math.round(totalParticipants / events.length) : 0;
    const participationRate = events.length > 0 ? 
      Math.round((participatingEvents.length / events.length) * 100) : 0;

    return {
      totalEvents: events.length,
      upcomingCount: upcomingEvents.length,
      pastCount: pastEvents.length,
      participatingCount: participatingEvents.length,
      totalParticipants,
      avgParticipants,
      participationRate
    };
  };

  const getEventTypeDistribution = () => {
    const distribution = events.reduce((acc, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(distribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 4);
  };

  const getNextEvent = () => {
    return upcomingEvents
      .filter(event => new Date(event.start_date) > new Date())
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())[0];
  };

  const formatTimeUntil = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    
    if (diffTime <= 0) return 'En cours';
    
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
      return `Dans ${diffDays}j ${diffHours}h`;
    } else if (diffHours > 0) {
      return `Dans ${diffHours}h ${diffMinutes}m`;
    } else {
      return `Dans ${diffMinutes}m`;
    }
  };

  const stats = getEventStats();
  const eventTypeDistribution = getEventTypeDistribution();
  const nextEvent = getNextEvent();

  return (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.totalEvents}
                </div>
                <div className="text-sm text-gray-500">Événements</div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.participatingCount}
                </div>
                <div className="text-sm text-gray-500">Votre participation</div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.upcomingCount}
                </div>
                <div className="text-sm text-gray-500">À venir</div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.participationRate}%
                </div>
                <div className="text-sm text-gray-500">Taux de participation</div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Prochain événement */}
      {nextEvent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-600" />
                Prochain événement
              </h3>
              <Badge 
                className="bg-blue-100 text-blue-700 border-blue-200"
                variant="outline"
              >
                {formatTimeUntil(nextEvent.start_date)}
              </Badge>
            </div>

            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                getEventTypeColor(nextEvent.event_type)
              }`}>
                {React.createElement(getEventTypeIcon(nextEvent.event_type), {
                  className: "w-6 h-6"
                })}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 mb-1">
                  {nextEvent.title}
                </h4>
                {nextEvent.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {nextEvent.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(nextEvent.start_date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>
                      {nextEvent.participants?.length || 0}
                      {nextEvent.max_participants && `/${nextEvent.max_participants}`}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={onViewAllEvents}
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Voir détails
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Distribution des types d'événements */}
      {eventTypeDistribution.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Types d'événements populaires
            </h3>
            
            <div className="space-y-3">
              {eventTypeDistribution.map(([type, count], index) => {
                const percentage = Math.round((count / stats.totalEvents) * 100);
                const Icon = getEventTypeIcon(type);
                
                return (
                  <div key={type} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      getEventTypeColor(type)
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {getEventTypeLabel(type)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            getEventTypeColor(type).split(' ')[0]
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Actions rapides */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Actions rapides
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={onViewAllEvents}
              className="flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Voir tous les événements
            </Button>
            
            <Button
              variant="outline"
              onClick={onCreateEvent}
              className="flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Créer un événement
            </Button>
            
            <Button
              variant="outline"
              onClick={onViewAllEvents}
              className="flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4" />
              Mes participations
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default EventSummary;
