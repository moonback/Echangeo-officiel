import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../store/authStore';
import type { Notification } from '../components/NotificationSystem';

// Types pour les notifications en base
interface NotificationRecord {
  id: string;
  profile_id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  read: boolean;
  created_at: string;
  expires_at?: string;
}

// Hook principal pour la gestion des notifications
export function useNotifications() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [toastNotifications, setToastNotifications] = useState<Notification[]>([]);

  // Récupérer les notifications depuis la base de données
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async (): Promise<Notification[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('profile_id', user.id)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map(record => ({
        id: record.id,
        type: record.type as any,
        title: record.title,
        message: record.message,
        timestamp: new Date(record.created_at),
        read: record.read,
        data: record.data,
      }));
    },
    enabled: !!user,
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  });

  // Marquer une notification comme lue
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Supprimer une notification
  const dismissMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Créer une nouvelle notification
  const createNotificationMutation = useMutation({
    mutationFn: async (notification: Omit<NotificationRecord, 'id' | 'created_at'>) => {
      const { error } = await supabase
        .from('notifications')
        .insert(notification);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Fonctions utilitaires
  const markAsRead = useCallback((notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  }, [markAsReadMutation]);

  const dismiss = useCallback((notificationId: string) => {
    dismissMutation.mutate(notificationId);
  }, [dismissMutation]);

  const createNotification = useCallback((notification: Omit<NotificationRecord, 'id' | 'created_at'>) => {
    createNotificationMutation.mutate(notification);
  }, [createNotificationMutation]);

  // Ajouter une notification toast temporaire
  const addToastNotification = useCallback((notification: Notification) => {
    setToastNotifications(prev => [...prev, notification]);
    
    // Auto-dismiss après 5 secondes
    setTimeout(() => {
      setToastNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  }, []);

  const removeToastNotification = useCallback((notificationId: string) => {
    setToastNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  return {
    notifications,
    toastNotifications,
    isLoading,
    markAsRead,
    dismiss,
    createNotification,
    addToastNotification,
    removeToastNotification,
  };
}

// Hook spécialisé pour les notifications de gamification
export function useGamificationNotifications() {
  const { createNotification, addToastNotification } = useNotifications();
  const { user } = useAuthStore();

  // Notification pour un nouveau badge
  const notifyBadgeEarned = useCallback((badge: { name: string; description: string; icon?: string }) => {
    if (!user) return;

    const notification: Notification = {
      id: `badge-${Date.now()}`,
      type: 'badge_earned',
      title: '🎉 Nouveau Badge Débloqué !',
      message: `Félicitations ! Vous avez obtenu le badge "${badge.name}" : ${badge.description}`,
      timestamp: new Date(),
      read: false,
      data: { badge },
    };

    // Ajouter en base
    createNotification({
      profile_id: user.id,
      type: 'badge_earned',
      title: notification.title,
      message: notification.message,
      data: { badge },
      read: false,
    });

    // Ajouter comme toast
    addToastNotification(notification);
  }, [user, createNotification, addToastNotification]);

  // Notification pour un niveau supérieur
  const notifyLevelUp = useCallback((level: number, title: string, points: number) => {
    if (!user) return;

    const notification: Notification = {
      id: `level-${Date.now()}`,
      type: 'level_up',
      title: '🚀 Niveau Supérieur !',
      message: `Félicitations ! Vous êtes maintenant ${title} (Niveau ${level}) avec ${points} points !`,
      timestamp: new Date(),
      read: false,
      data: { level, title, points },
    };

    createNotification({
      profile_id: user.id,
      type: 'level_up',
      title: notification.title,
      message: notification.message,
      data: { level, title, points },
      read: false,
    });

    addToastNotification(notification);
  }, [user, createNotification, addToastNotification]);

  // Notification pour des points gagnés
  const notifyPointsEarned = useCallback((points: number, reason: string) => {
    if (!user) return;

    const notification: Notification = {
      id: `points-${Date.now()}`,
      type: 'points_earned',
      title: '⭐ Points Gagnés !',
      message: `+${points} points pour : ${reason}`,
      timestamp: new Date(),
      read: false,
      data: { points, reason },
    };

    createNotification({
      profile_id: user.id,
      type: 'points_earned',
      title: notification.title,
      message: notification.message,
      data: { points, reason },
      read: false,
    });

    addToastNotification(notification);
  }, [user, createNotification, addToastNotification]);

  // Notification pour un défi complété
  const notifyChallengeCompleted = useCallback((challenge: { title: string; reward_points: number }) => {
    if (!user) return;

    const notification: Notification = {
      id: `challenge-${Date.now()}`,
      type: 'challenge_completed',
      title: '🎯 Défi Accompli !',
      message: `Vous avez terminé le défi "${challenge.title}" ! Récupérez vos ${challenge.reward_points} points.`,
      timestamp: new Date(),
      read: false,
      data: { challenge },
      action: {
        label: 'Récupérer',
        onClick: () => {
          // Logique pour récupérer la récompense
          console.log('Récupération de la récompense...');
        },
      },
    };

    createNotification({
      profile_id: user.id,
      type: 'challenge_completed',
      title: notification.title,
      message: notification.message,
      data: { challenge },
      read: false,
    });

    addToastNotification(notification);
  }, [user, createNotification, addToastNotification]);

  // Notification pour une récompense disponible
  const notifyRewardAvailable = useCallback((reward: { title: string; description: string; type: string }) => {
    if (!user) return;

    const notification: Notification = {
      id: `reward-${Date.now()}`,
      type: 'reward_available',
      title: '🎁 Récompense Disponible !',
      message: `${reward.title} : ${reward.description}`,
      timestamp: new Date(),
      read: false,
      data: { reward },
      action: {
        label: 'Voir',
        onClick: () => {
          console.log('Voir la récompense...');
        },
      },
    };

    createNotification({
      profile_id: user.id,
      type: 'reward_available',
      title: notification.title,
      message: notification.message,
      data: { reward },
      read: false,
    });

    addToastNotification(notification);
  }, [user, createNotification, addToastNotification]);

  return {
    notifyBadgeEarned,
    notifyLevelUp,
    notifyPointsEarned,
    notifyChallengeCompleted,
    notifyRewardAvailable,
  };
}

// Hook pour les notifications de transaction
export function useTransactionNotifications() {
  const { createNotification, addToastNotification } = useNotifications();
  const { user } = useAuthStore();

  const notifyTransactionUpdate = useCallback((transaction: {
    type: 'request' | 'approval' | 'completion' | 'rating';
    itemTitle: string;
    otherUserName: string;
    message?: string;
  }) => {
    if (!user) return;

    let title = '';
    let message = '';

    switch (transaction.type) {
      case 'request':
        title = '📝 Nouvelle Demande';
        message = `${transaction.otherUserName} souhaite emprunter "${transaction.itemTitle}"`;
        break;
      case 'approval':
        title = '✅ Demande Approuvée';
        message = `${transaction.otherUserName} a approuvé votre demande pour "${transaction.itemTitle}"`;
        break;
      case 'completion':
        title = '🎉 Transaction Terminée';
        message = `La transaction pour "${transaction.itemTitle}" avec ${transaction.otherUserName} est terminée`;
        break;
      case 'rating':
        title = '⭐ Nouvelle Évaluation';
        message = `${transaction.otherUserName} vous a évalué pour "${transaction.itemTitle}"`;
        break;
    }

    const notification: Notification = {
      id: `transaction-${Date.now()}`,
      type: 'info',
      title,
      message: transaction.message || message,
      timestamp: new Date(),
      read: false,
      data: { transaction },
    };

    createNotification({
      profile_id: user.id,
      type: 'transaction_update',
      title: notification.title,
      message: notification.message,
      data: { transaction },
      read: false,
    });

    addToastNotification(notification);
  }, [user, createNotification, addToastNotification]);

  return {
    notifyTransactionUpdate,
  };
}
