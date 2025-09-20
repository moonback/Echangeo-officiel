import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Calendar, 
  MapPin, 
  Clock, 
  X, 
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { useUpcomingUserEvents } from '../hooks/useEvents';
import { useAuthStore } from '../store/authStore';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Button from './ui/Button';

interface EventNotification {
  id: string;
  type: 'reminder' | 'new_event' | 'event_updated' | 'event_cancelled';
  title: string;
  message: string;
  eventId: string;
  eventTitle: string;
  communityName: string;
  timestamp: Date;
  isRead: boolean;
}

const EventNotifications: React.FC = () => {
  const { profile } = useAuthStore();
  const { data: upcomingEvents } = useUpcomingUserEvents(profile?.id);
  const [notifications, setNotifications] = useState<EventNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Générer des notifications basées sur les événements à venir
  useEffect(() => {
    if (!upcomingEvents || upcomingEvents.length === 0) return;

    const newNotifications: EventNotification[] = [];

    upcomingEvents.forEach(event => {
      const now = new Date();
      const eventDate = new Date(event.start_date);
      const timeDiff = eventDate.getTime() - now.getTime();
      const hoursUntilEvent = timeDiff / (1000 * 60 * 60);

      // Notification pour événement dans 24h
      if (hoursUntilEvent <= 24 && hoursUntilEvent > 0) {
        newNotifications.push({
          id: `reminder-${event.id}`,
          type: 'reminder',
          title: 'Rappel d\'événement',
          message: `${event.title} commence dans ${Math.ceil(hoursUntilEvent)}h`,
          eventId: event.id,
          eventTitle: event.title,
          communityName: event.community?.name || 'Votre communauté',
          timestamp: now,
          isRead: false
        });
      }

      // Notification pour événement dans 2h
      if (hoursUntilEvent <= 2 && hoursUntilEvent > 0) {
        newNotifications.push({
          id: `urgent-${event.id}`,
          type: 'reminder',
          title: 'Événement bientôt !',
          message: `${event.title} commence dans ${Math.ceil(hoursUntilEvent * 60)} minutes`,
          eventId: event.id,
          eventTitle: event.title,
          communityName: event.community?.name || 'Votre communauté',
          timestamp: now,
          isRead: false
        });
      }
    });

    setNotifications(prev => {
      // Éviter les doublons
      const existingIds = prev.map(n => n.id);
      const uniqueNewNotifications = newNotifications.filter(n => !existingIds.includes(n.id));
      return [...uniqueNewNotifications, ...prev].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    });
  }, [upcomingEvents]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reminder': return Clock;
      case 'new_event': return Calendar;
      case 'event_updated': return Info;
      case 'event_cancelled': return AlertCircle;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'reminder': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'new_event': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'event_updated': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'event_cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case 'reminder': return 'bg-orange-500';
      case 'new_event': return 'bg-blue-500';
      case 'event_updated': return 'bg-yellow-500';
      case 'event_cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (notifications.length === 0) {
    return null;
  }

  return (
    <>
      {/* Bouton de notification */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`absolute -top-1 -right-1 w-5 h-5 ${getNotificationBadgeColor('reminder')} rounded-full flex items-center justify-center`}
            >
              <span className="text-xs font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </motion.div>
          )}
        </Button>

        {/* Dropdown des notifications */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-80 z-50"
            >
              <Card className="p-0 shadow-xl border-0 overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="text-xs text-brand-600 hover:text-brand-700"
                      >
                        Tout marquer comme lu
                      </Button>
                    )}
                  </div>
                </div>

                {/* Liste des notifications */}
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type);
                    const timeAgo = getTimeAgo(notification.timestamp);
                    
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          !notification.isRead ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            getNotificationColor(notification.type).split(' ')[0]
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-gray-900 text-sm">
                                    {notification.title}
                                  </h4>
                                  {!notification.isRead && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-2">
                                  {notification.message}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span>{notification.communityName}</span>
                                  <span>•</span>
                                  <span>{timeAgo}</span>
                                </div>
                              </div>
                              
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => removeNotification(notification.id)}
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                >
                                  <X className="w-3 h-3 text-gray-400" />
                                </button>
                                {!notification.isRead && (
                                  <button
                                    onClick={() => markAsRead(notification.id)}
                                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                                  >
                                    <CheckCircle className="w-3 h-3 text-gray-400" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="w-full text-xs text-gray-600 hover:text-gray-800"
                    >
                      Fermer
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Overlay pour fermer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

// Fonction utilitaire pour calculer le temps écoulé
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins}m`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  });
}

export default EventNotifications;
