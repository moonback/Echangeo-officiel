import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, User } from 'lucide-react';
import Card from './ui/Card';
import Badge from './ui/Badge';
import type { CommunityEvent } from '../types';

interface CommunityEventCardProps {
  event: CommunityEvent;
  onJoin?: (eventId: string) => void;
  onLeave?: (eventId: string) => void;
  isParticipant?: boolean;
  canJoin?: boolean;
}

const CommunityEventCard: React.FC<CommunityEventCardProps> = ({
  event,
  onJoin,
  onLeave,
  isParticipant = false,
  canJoin = true
}) => {
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meetup': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'swap': return 'bg-green-100 text-green-700 border-green-200';
      case 'workshop': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'social': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'other': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'meetup': return 'Rencontre';
      case 'swap': return 'Troc';
      case 'workshop': return 'Atelier';
      case 'social': return 'Social';
      case 'other': return 'Autre';
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

  const startDate = formatDate(event.start_date);
  const endDate = event.end_date ? formatDate(event.end_date) : null;
  const participantCount = event.participants?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <Card className="p-6 hover:shadow-lg transition-all duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {event.title}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                className={getEventTypeColor(event.event_type)}
                variant="outline"
              >
                {getEventTypeLabel(event.event_type)}
              </Badge>
              {event.max_participants && (
                <span className="text-sm text-gray-600">
                  {participantCount}/{event.max_participants} participants
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {event.description}
          </p>
        )}

        {/* Date et heure */}
        <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
          <Calendar className="w-4 h-4 text-brand-600" />
          <span className="font-medium">{startDate.date}</span>
          <Clock className="w-4 h-4 text-gray-500 ml-2" />
          <span>{startDate.time}</span>
          {endDate && (
            <>
              <span className="text-gray-400">-</span>
              <span>{endDate.time}</span>
            </>
          )}
        </div>

        {/* Localisation */}
        {event.location && (
          <div className="flex items-center gap-2 text-sm text-gray-700 mb-4">
            <MapPin className="w-4 h-4 text-brand-600" />
            <span>{event.location}</span>
          </div>
        )}

        {/* Participants */}
        {event.participants && event.participants.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
              <Users className="w-4 h-4 text-brand-600" />
              <span className="font-medium">Participants ({participantCount})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {event.participants.slice(0, 5).map((participant) => (
                <div key={participant.id} className="flex items-center gap-1">
                  <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center">
                    {participant.user?.avatar_url ? (
                      <img
                        src={participant.user.avatar_url}
                        alt={participant.user.full_name || participant.user.email}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-3 h-3 text-brand-600" />
                    )}
                  </div>
                  <span className="text-xs text-gray-600">
                    {participant.user?.full_name || participant.user?.email}
                  </span>
                </div>
              ))}
              {participantCount > 5 && (
                <span className="text-xs text-gray-500">
                  +{participantCount - 5} autres
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Créé par {event.creator?.full_name || event.creator?.email}
          </div>
          
          <div className="flex gap-2">
            {isParticipant ? (
              <button
                onClick={() => onLeave?.(event.id)}
                className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                Se désinscrire
              </button>
            ) : (
              <button
                onClick={() => onJoin?.(event.id)}
                disabled={!canJoin || (event.max_participants && participantCount >= event.max_participants)}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {event.max_participants && participantCount >= event.max_participants 
                  ? 'Complet' 
                  : 'Rejoindre'
                }
              </button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default CommunityEventCard;
