import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Users, 
  Clock,
  Heart,
  Star,
  Plus,
  Share2
} from 'lucide-react';
import { CommunityEvent } from '../types';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Button from './ui/Button';

interface EventCalendarProps {
  events: CommunityEvent[];
  onEventClick: (event: CommunityEvent) => void;
  onCreateEvent: () => void;
}

const EventCalendar: React.FC<EventCalendarProps> = ({
  events,
  onEventClick,
  onCreateEvent
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

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

  // Générer les jours du mois
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Ajouter les jours vides du mois précédent
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Ajouter les jours du mois
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  // Obtenir les événements pour une date donnée
  const getEventsForDate = (date: Date) => {
    if (!date) return [];
    
    return events.filter(event => {
      const eventDate = new Date(event.start_date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Navigation dans le calendrier
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const today = new Date();

  return (
    <Card className="p-6">
      {/* Header du calendrier */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-brand-100 rounded-lg">
            <Calendar className="w-5 h-5 text-brand-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Calendrier des événements
            </h3>
            <p className="text-sm text-gray-500">
              {events.length} événement{events.length > 1 ? 's' : ''} programmé{events.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCreateEvent}
          >
            <Plus className="w-4 h-4 mr-2" />
            Créer un événement
          </Button>
        </div>
      </div>

      {/* Navigation du calendrier */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPreviousMonth}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <h2 className="text-xl font-semibold text-gray-900 capitalize">
            {formatMonthYear(currentDate)}
          </h2>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextMonth}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
          >
            Aujourd'hui
          </Button>
          
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-sm ${
                viewMode === 'month' 
                  ? 'bg-brand-100 text-brand-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Mois
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-sm ${
                viewMode === 'week' 
                  ? 'bg-brand-100 text-brand-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 text-sm ${
                viewMode === 'day' 
                  ? 'bg-brand-100 text-brand-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Jour
            </button>
          </div>
        </div>
      </div>

      {/* Grille du calendrier */}
      {viewMode === 'month' && (
        <div className="grid grid-cols-7 gap-1 mb-4">
          {/* En-têtes des jours */}
          {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}

          {/* Jours du mois */}
          {daysInMonth.map((date, index) => {
            if (!date) {
              return <div key={index} className="h-24"></div>;
            }

            const dayEvents = getEventsForDate(date);
            const isCurrentDay = isToday(date);
            const isPast = isPastDate(date);

            return (
              <motion.div
                key={date.toISOString()}
                className={`h-24 border border-gray-200 p-1 cursor-pointer hover:bg-gray-50 transition-colors ${
                  isCurrentDay ? 'bg-brand-50 border-brand-200' : ''
                } ${isPast ? 'opacity-50' : ''}`}
                whileHover={{ scale: 1.02 }}
                onClick={() => dayEvents.length > 0 && onEventClick(dayEvents[0])}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isCurrentDay ? 'text-brand-600' : 'text-gray-900'
                }`}>
                  {date.getDate()}
                </div>
                
                {/* Événements du jour */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map(event => {
                    const EventIcon = getEventTypeIcon(event.event_type);
                    return (
                      <motion.div
                        key={event.id}
                        className={`text-xs p-1 rounded truncate ${
                          getEventTypeColor(event.event_type).split(' ')[0]
                        }`}
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="flex items-center gap-1">
                          <EventIcon className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{event.title}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                  
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{dayEvents.length - 2} autres
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Vue semaine (simplifiée) */}
      {viewMode === 'week' && (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Vue semaine à venir</p>
        </div>
      )}

      {/* Vue jour (simplifiée) */}
      {viewMode === 'day' && (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Vue jour à venir</p>
        </div>
      )}

      {/* Légende */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Types d'événements</h4>
        <div className="flex flex-wrap gap-3">
          {['meetup', 'swap', 'workshop', 'social'].map(type => {
            const EventIcon = getEventTypeIcon(type);
            return (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded flex items-center justify-center ${
                  getEventTypeColor(type).split(' ')[0]
                }`}>
                  <EventIcon className="w-3 h-3" />
                </div>
                <span className="text-sm text-gray-600">
                  {getEventTypeLabel(type)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default EventCalendar;
