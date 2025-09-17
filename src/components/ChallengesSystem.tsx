import React, { useState } from 'react';
import { Target, Trophy, Calendar, Users, Star, Gift } from 'lucide-react';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  target: number;
  current: number;
  reward: {
    points: number;
    badge?: string;
    title?: string;
  };
  icon: React.ReactNode;
  deadline?: Date;
}

interface ChallengesSystemProps {
  userStats: {
    completed_lends: number;
    completed_borrows: number;
    ratings_received: number;
    days_active: number;
  };
  onClaimReward: (challengeId: string) => void;
}

const ChallengesSystem: React.FC<ChallengesSystemProps> = ({
  userStats,
  onClaimReward
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const challenges: Challenge[] = [
    // Défis quotidiens
    {
      id: 'daily_help',
      title: 'Aide du jour',
      description: 'Aider un voisin aujourd\'hui',
      type: 'daily',
      target: 1,
      current: 0, // À calculer depuis les données
      reward: { points: 25 },
      icon: <Users className="w-5 h-5" />
    },
    {
      id: 'daily_rating',
      title: 'Évaluateur actif',
      description: 'Donner une évaluation aujourd\'hui',
      type: 'daily',
      target: 1,
      current: 0,
      reward: { points: 15 },
      icon: <Star className="w-5 h-5" />
    },
    
    // Défis hebdomadaires
    {
      id: 'weekly_lender',
      title: 'Prêteur de la semaine',
      description: 'Effectuer 3 prêts cette semaine',
      type: 'weekly',
      target: 3,
      current: userStats.completed_lends % 3,
      reward: { points: 100, badge: 'weekly_lender' },
      icon: <Trophy className="w-5 h-5" />
    },
    {
      id: 'weekly_community',
      title: 'Actif communautaire',
      description: 'Être actif 5 jours cette semaine',
      type: 'weekly',
      target: 5,
      current: Math.min(userStats.days_active % 7, 5),
      reward: { points: 75 },
      icon: <Calendar className="w-5 h-5" />
    },
    
    // Défis mensuels
    {
      id: 'monthly_super_lender',
      title: 'Super Prêteur',
      description: 'Effectuer 10 prêts ce mois',
      type: 'monthly',
      target: 10,
      current: userStats.completed_lends % 10,
      reward: { points: 500, badge: 'super_lender', title: 'Super Prêteur' },
      icon: <Trophy className="w-5 h-5" />
    },
    {
      id: 'monthly_rating_champion',
      title: 'Champion des évaluations',
      description: 'Recevoir 5 évaluations 5 étoiles ce mois',
      type: 'monthly',
      target: 5,
      current: userStats.ratings_received % 5,
      reward: { points: 300, badge: 'rating_champion' },
      icon: <Star className="w-5 h-5" />
    }
  ];

  const filteredChallenges = challenges.filter(c => c.type === activeTab);
  const completedChallenges = filteredChallenges.filter(c => c.current >= c.target);

  const getProgressPercentage = (challenge: Challenge) => {
    return Math.min((challenge.current / challenge.target) * 100, 100);
  };

  const getChallengeStatus = (challenge: Challenge) => {
    if (challenge.current >= challenge.target) return 'completed';
    if (challenge.current > 0) return 'in_progress';
    return 'not_started';
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-brand-600" />
            Défis et Objectifs
          </h3>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['daily', 'weekly', 'monthly'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'daily' && 'Quotidien'}
                {tab === 'weekly' && 'Hebdomadaire'}
                {tab === 'monthly' && 'Mensuel'}
              </button>
            ))}
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg bg-brand-50">
            <div className="text-xl font-bold text-brand-700">
              {completedChallenges.length}
            </div>
            <div className="text-sm text-brand-600">Défis accomplis</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-emerald-50">
            <div className="text-xl font-bold text-emerald-700">
              {completedChallenges.reduce((sum, c) => sum + c.reward.points, 0)}
            </div>
            <div className="text-sm text-emerald-600">Points gagnés</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-purple-50">
            <div className="text-xl font-bold text-purple-700">
              {filteredChallenges.length - completedChallenges.length}
            </div>
            <div className="text-sm text-purple-600">En cours</div>
          </div>
        </div>

        {/* Liste des défis */}
        <div className="space-y-4">
          {filteredChallenges.map((challenge) => {
            const status = getChallengeStatus(challenge);
            const progress = getProgressPercentage(challenge);
            const isCompleted = status === 'completed';

            return (
              <div
                key={challenge.id}
                className={`p-4 rounded-lg border transition-all ${
                  isCompleted
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {challenge.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{challenge.title}</h4>
                      <p className="text-sm text-gray-600">{challenge.description}</p>
                    </div>
                  </div>
                  
                  {isCompleted ? (
                    <Badge variant="success" className="flex items-center gap-1">
                      <Gift className="w-4 h-4" />
                      Récompense disponible
                    </Badge>
                  ) : (
                    <Badge variant="neutral">
                      {challenge.current}/{challenge.target}
                    </Badge>
                  )}
                </div>

                {/* Barre de progression */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progression</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-brand-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Récompense */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Récompense:</span>
                    <Badge variant="warning" size="sm">
                      {challenge.reward.points} points
                    </Badge>
                    {challenge.reward.badge && (
                      <Badge variant="info" size="sm">
                        Badge: {challenge.reward.title || challenge.reward.badge}
                      </Badge>
                    )}
                  </div>
                  
                  {isCompleted && (
                    <Button
                      size="sm"
                      onClick={() => onClaimReward(challenge.id)}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Gift className="w-4 h-4 mr-1" />
                      Récupérer
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredChallenges.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Aucun défi disponible pour cette période</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ChallengesSystem;
