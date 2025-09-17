import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  Trophy, 
  Award, 
  Target, 
  Gift, 
  Star,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

export interface Notification {
  id: string;
  type: 'badge_earned' | 'challenge_completed' | 'level_up' | 'points_earned' | 'reward_available' | 'info';
  title: string;
  message: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  timestamp: Date;
  read: boolean;
  data?: any; // Données supplémentaires (badge, challenge, etc.)
}

interface NotificationSystemProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onDismiss: (notificationId: string) => void;
  onActionClick?: (notification: Notification) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onMarkAsRead,
  onDismiss,
  onActionClick
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (notification: Notification) => {
    if (notification.icon) return notification.icon;
    
    switch (notification.type) {
      case 'badge_earned':
        return <Award className="w-5 h-5 text-yellow-600" />;
      case 'challenge_completed':
        return <Target className="w-5 h-5 text-green-600" />;
      case 'level_up':
        return <Trophy className="w-5 h-5 text-purple-600" />;
      case 'points_earned':
        return <Star className="w-5 h-5 text-blue-600" />;
      case 'reward_available':
        return <Gift className="w-5 h-5 text-orange-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (notification: Notification) => {
    switch (notification.type) {
      case 'badge_earned':
        return 'border-yellow-200 bg-yellow-50';
      case 'challenge_completed':
        return 'border-green-200 bg-green-50';
      case 'level_up':
        return 'border-purple-200 bg-purple-50';
      case 'points_earned':
        return 'border-blue-200 bg-blue-50';
      case 'reward_available':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes}min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days}j`;
  };

  return (
    <div className="relative">
      {/* Bouton de notification */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 text-gray-600" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </button>

      {/* Panel des notifications */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-96 max-w-sm bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          >
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <Badge variant="danger" size="sm">
                    {unreadCount} non lues
                  </Badge>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Aucune notification</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 hover:bg-gray-50 transition-colors ${getNotificationColor(notification)} ${
                        !notification.read ? 'border-l-4 border-l-brand-500' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-gray-500">
                                  {formatTimestamp(notification.timestamp)}
                                </span>
                                {!notification.read && (
                                  <Badge variant="brand" size="sm">
                                    Nouveau
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1 ml-2">
                              {notification.action && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    onActionClick?.(notification);
                                    notification.action?.onClick();
                                  }}
                                  className="text-xs"
                                >
                                  {notification.action.label}
                                </Button>
                              )}
                              <button
                                onClick={() => onDismiss(notification.id)}
                                className="p-1 hover:bg-gray-200 rounded"
                                aria-label="Fermer"
                              >
                                <X className="w-4 h-4 text-gray-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    notifications.forEach(n => {
                      if (!n.read) onMarkAsRead(n.id);
                    });
                  }}
                  className="w-full"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Marquer tout comme lu
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Composant pour afficher une notification toast
export const NotificationToast: React.FC<{
  notification: Notification;
  onDismiss: () => void;
}> = ({ notification, onDismiss }) => {
  const getNotificationIcon = () => {
    if (notification.icon) return notification.icon;
    
    switch (notification.type) {
      case 'badge_earned':
        return <Award className="w-6 h-6 text-yellow-600" />;
      case 'challenge_completed':
        return <Target className="w-6 h-6 text-green-600" />;
      case 'level_up':
        return <Trophy className="w-6 h-6 text-purple-600" />;
      case 'points_earned':
        return <Star className="w-6 h-6 text-blue-600" />;
      case 'reward_available':
        return <Gift className="w-6 h-6 text-orange-600" />;
      default:
        return <Info className="w-6 h-6 text-gray-600" />;
    }
  };

  const getNotificationColor = () => {
    switch (notification.type) {
      case 'badge_earned':
        return 'bg-yellow-50 border-yellow-200';
      case 'challenge_completed':
        return 'bg-green-50 border-green-200';
      case 'level_up':
        return 'bg-purple-50 border-purple-200';
      case 'points_earned':
        return 'bg-blue-50 border-blue-200';
      case 'reward_available':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`fixed top-4 right-4 w-96 max-w-sm p-4 rounded-lg border shadow-lg z-50 ${getNotificationColor()}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {getNotificationIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-sm">
            {notification.title}
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            {notification.message}
          </p>
          
          {notification.action && (
            <div className="mt-3">
              <Button
                size="sm"
                onClick={() => {
                  notification.action?.onClick();
                  onDismiss();
                }}
              >
                {notification.action.label}
              </Button>
            </div>
          )}
        </div>
        
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 hover:bg-gray-200 rounded"
          aria-label="Fermer"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </motion.div>
  );
};

export default NotificationSystem;
