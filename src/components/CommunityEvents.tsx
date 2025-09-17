import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  Trophy, 
  Clock, 
  Star, 
  Gift,
  Target,
  Award,
  Zap,
  Heart
} from 'lucide-react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  type: 'challenge' | 'competition' | 'special' | 'seasonal';
  status: 'upcoming' | 'active' | 'completed';
  start_date: Date;
  end_date: Date;
  participants: number;
  max_participants?: number;
  rewards: {
    points: number;
    badges: string[];
    special_rewards: string[];
  };
  challenges: Array<{
    id: string;
    title: string;
    description: string;
    target: number;
    reward_points: number;
  }>;
  leaderboard?: Array<{
    position: number;
    name: string;
    score: number;
    avatar?: string;
  }>;
  icon: React.ReactNode;
  banner_color: string;
}

interface CommunityEventsProps {
  userLevel: number;
  userPoints: number;
  onJoinEvent: (eventId: string) => void;
  onClaimReward: (eventId: string, challengeId: string) => void;
}

const CommunityEvents: React.FC<CommunityEventsProps> = ({
  userLevel,
  userPoints,
  onJoinEvent,
  onClaimReward
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'completed'>('active');

  // Événements communautaires simulés
  const events: CommunityEvent[] = [
    {
      id: 'spring-challenge-2024',
      title: 'Défi Printemps 2024',
      description: 'Participez au grand défi communautaire du printemps ! Aidez vos voisins et débloquez des récompenses exclusives.',
      type: 'seasonal',
      status: 'active',
      start_date: new Date('2024-03-20'),
      end_date: new Date('2024-06-20'),
      participants: 1247,
      max_participants: 2000,
      rewards: {
        points: 500,
        badges: ['spring_helper', 'community_champion'],
        special_rewards: ['Accès Premium 1 mois', 'Badge Exclusif Printemps']
      },
      challenges: [
        {
          id: 'spring-lend-10',
          title: 'Super Prêteur Printemps',
          description: 'Effectuez 10 prêts pendant l\'événement',
          target: 10,
          reward_points: 200
        },
        {
          id: 'spring-help-5',
          title: 'Aide Communautaire',
          description: 'Aidez 5 voisins différents',
          target: 5,
          reward_points: 150
        },
        {
          id: 'spring-rating-5',
          title: 'Évaluateur Actif',
          description: 'Donnez 5 évaluations 5 étoiles',
          target: 5,
          reward_points: 100
        }
      ],
      leaderboard: [
        { position: 1, name: 'Marie Dubois', score: 1250, avatar: '/avatars/marie.jpg' },
        { position: 2, name: 'Pierre Martin', score: 1180, avatar: '/avatars/pierre.jpg' },
        { position: 3, name: 'Sophie Bernard', score: 1100, avatar: '/avatars/sophie.jpg' },
        { position: 4, name: 'Vous', score: 850, avatar: '/avatars/user.jpg' },
        { position: 5, name: 'Lucas Petit', score: 720, avatar: '/avatars/lucas.jpg' }
      ],
      icon: <Heart className="w-6 h-6" />,
      banner_color: 'bg-gradient-to-r from-green-400 to-blue-500'
    },
    {
      id: 'tools-week',
      title: 'Semaine des Outils',
      description: 'Une semaine spéciale dédiée aux outils de bricolage et jardinage. Partagez vos outils et découvrez ceux de vos voisins !',
      type: 'special',
      status: 'active',
      start_date: new Date('2024-01-15'),
      end_date: new Date('2024-01-22'),
      participants: 456,
      rewards: {
        points: 300,
        badges: ['tool_master'],
        special_rewards: ['Kit d\'outils premium']
      },
      challenges: [
        {
          id: 'tools-lend-5',
          title: 'Maître des Outils',
          description: 'Prêtez 5 outils différents',
          target: 5,
          reward_points: 150
        },
        {
          id: 'tools-review-3',
          title: 'Expert Outils',
          description: 'Évaluez 3 outils empruntés',
          target: 3,
          reward_points: 100
        }
      ],
      icon: <Target className="w-6 h-6" />,
      banner_color: 'bg-gradient-to-r from-orange-400 to-red-500'
    },
    {
      id: 'summer-championship',
      title: 'Championnat d\'Été',
      description: 'Le grand championnat annuel ! Compétition amicale entre tous les membres de la communauté.',
      type: 'competition',
      status: 'upcoming',
      start_date: new Date('2024-07-01'),
      end_date: new Date('2024-08-31'),
      participants: 0,
      max_participants: 5000,
      rewards: {
        points: 1000,
        badges: ['summer_champion', 'legend'],
        special_rewards: ['Voyage offert', 'Accès Premium à vie']
      },
      challenges: [
        {
          id: 'summer-transactions-50',
          title: 'Champion des Transactions',
          description: 'Effectuez 50 transactions pendant l\'été',
          target: 50,
          reward_points: 500
        },
        {
          id: 'summer-help-20',
          title: 'Héros Communautaire',
          description: 'Aidez 20 personnes différentes',
          target: 20,
          reward_points: 300
        }
      ],
      icon: <Trophy className="w-6 h-6" />,
      banner_color: 'bg-gradient-to-r from-yellow-400 to-orange-500'
    }
  ];

  const getFilteredEvents = () => {
    return events.filter(event => event.status === activeTab);
  };

  const getEventStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" className="flex items-center gap-1"><Zap className="w-3 h-3" />Actif</Badge>;
      case 'upcoming':
        return <Badge variant="info" className="flex items-center gap-1"><Clock className="w-3 h-3" />Bientôt</Badge>;
      case 'completed':
        return <Badge variant="neutral" className="flex items-center gap-1"><Award className="w-3 h-3" />Terminé</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getTimeRemaining = (endDate: Date) => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Terminé';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}j ${hours}h restantes`;
    return `${hours}h restantes`;
  };

  const filteredEvents = getFilteredEvents();

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-brand-600" />
            Événements Communautaires
          </h3>
          
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { id: 'active', label: 'Actifs', count: events.filter(e => e.status === 'active').length },
              { id: 'upcoming', label: 'À venir', count: events.filter(e => e.status === 'upcoming').length },
              { id: 'completed', label: 'Terminés', count: events.filter(e => e.status === 'completed').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Statistiques globales */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg bg-blue-50">
            <div className="text-xl font-bold text-blue-700">
              {events.reduce((sum, e) => sum + e.participants, 0)}
            </div>
            <div className="text-sm text-blue-600">Participants</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-green-50">
            <div className="text-xl font-bold text-green-700">
              {events.filter(e => e.status === 'active').length}
            </div>
            <div className="text-sm text-green-600">Événements actifs</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-purple-50">
            <div className="text-xl font-bold text-purple-700">
              {events.reduce((sum, e) => sum + e.rewards.points, 0)}
            </div>
            <div className="text-sm text-purple-600">Points à gagner</div>
          </div>
        </div>

        {/* Liste des événements */}
        <div className="space-y-6">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-lg border overflow-hidden ${event.banner_color}`}
              >
                {/* En-tête de l'événement */}
                <div className="p-6 text-white">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                        {event.icon}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold">{event.title}</h4>
                        <p className="text-white/90 text-sm">{event.description}</p>
                      </div>
                    </div>
                    {getEventStatusBadge(event.status)}
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(event.start_date)} - {formatDate(event.end_date)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {event.participants} participants
                      {event.max_participants && ` / ${event.max_participants}`}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {getTimeRemaining(event.end_date)}
                    </div>
                  </div>
                </div>

                {/* Contenu de l'événement */}
                <div className="bg-white p-6">
                  {/* Défis */}
                  <div className="mb-6">
                    <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-brand-600" />
                      Défis ({event.challenges.length})
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {event.challenges.map((challenge) => (
                        <div key={challenge.id} className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h6 className="font-medium text-gray-900">{challenge.title}</h6>
                              <p className="text-sm text-gray-600">{challenge.description}</p>
                            </div>
                            <Badge variant="warning" size="sm">
                              {challenge.reward_points} pts
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              Objectif: {challenge.target}
                            </span>
                            {event.status === 'active' && (
                              <Button size="sm" onClick={() => onClaimReward(event.id, challenge.id)}>
                                Participer
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Récompenses */}
                  <div className="mb-6">
                    <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Gift className="w-5 h-5 text-brand-600" />
                      Récompenses
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="warning">{event.rewards.points} points</Badge>
                      {event.rewards.badges.map((badge) => (
                        <Badge key={badge} variant="success">{badge}</Badge>
                      ))}
                      {event.rewards.special_rewards.map((reward) => (
                        <Badge key={reward} variant="info">{reward}</Badge>
                      ))}
                    </div>
                  </div>

                  {/* Classement */}
                  {event.leaderboard && event.leaderboard.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-brand-600" />
                        Classement
                      </h5>
                      <div className="space-y-2">
                        {event.leaderboard.slice(0, 5).map((entry) => (
                          <div key={entry.position} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">
                              {entry.position}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{entry.name}</div>
                            </div>
                            <div className="text-sm font-semibold text-gray-700">{entry.score} pts</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {event.status === 'active' && 'Événement en cours - Participez maintenant !'}
                        {event.status === 'upcoming' && 'Événement à venir - Inscrivez-vous !'}
                        {event.status === 'completed' && 'Événement terminé'}
                      </div>
                      {event.status === 'active' && (
                        <Button onClick={() => onJoinEvent(event.id)}>
                          <Users className="w-4 h-4 mr-2" />
                          Rejoindre
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>
                {activeTab === 'active' && 'Aucun événement actif pour le moment'}
                {activeTab === 'upcoming' && 'Aucun événement à venir'}
                {activeTab === 'completed' && 'Aucun événement terminé'}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CommunityEvents;
