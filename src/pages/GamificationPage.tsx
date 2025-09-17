import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Award, 
  Target, 
  TrendingUp, 
  Users, 
  Crown,
  Gift,
  Calendar,
  Zap
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import ReputationDisplay from '../components/ReputationDisplay';
import ChallengesSystem from '../components/ChallengesSystem';
import Leaderboard from '../components/Leaderboard';
import RewardsSystem from '../components/RewardsSystem';
import CommunityEvents from '../components/CommunityEvents';
import AdvancedStats from '../components/AdvancedStats';
import { 
  useGamificationStats, 
  useUserLevel, 
  useUserBadges, 
  useLeaderboard,
  useUserChallenges,
  useChallenges,
  useClaimChallengeReward,
  useCheckBadges,
  getLevelColor,
  getLevelIcon
} from '../hooks/useGamification';

const GamificationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'challenges' | 'leaderboard' | 'badges' | 'rewards' | 'events' | 'stats'>('overview');
  
  const { data: stats } = useGamificationStats();
  const { data: userLevel } = useUserLevel();
  const { data: userBadges } = useUserBadges();
  const { data: leaderboard } = useLeaderboard(20);
  const { data: userChallenges } = useUserChallenges();
  const { data: challenges } = useChallenges();
  const claimRewardMutation = useClaimChallengeReward();
  const checkBadgesMutation = useCheckBadges();

  const handleClaimReward = async (challengeId: string) => {
    try {
      await claimRewardMutation.mutateAsync(challengeId);
    } catch (error) {
      console.error('Erreur lors de la récupération de la récompense:', error);
    }
  };

  const handleCheckBadges = async () => {
    try {
      await checkBadgesMutation.mutateAsync();
    } catch (error) {
      console.error('Erreur lors de la vérification des badges:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: <Star className="w-4 h-4" /> },
    { id: 'challenges', label: 'Défis', icon: <Target className="w-4 h-4" /> },
    { id: 'leaderboard', label: 'Classement', icon: <Trophy className="w-4 h-4" /> },
    { id: 'badges', label: 'Badges', icon: <Award className="w-4 h-4" /> },
    { id: 'rewards', label: 'Récompenses', icon: <Gift className="w-4 h-4" /> },
    { id: 'events', label: 'Événements', icon: <Calendar className="w-4 h-4" /> },
    { id: 'stats', label: 'Statistiques', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Trophy className="w-8 h-8 text-brand-600" />
                Gamification
              </h1>
              <p className="text-gray-600 mt-2">
                Découvrez votre progression et vos accomplissements dans la communauté
              </p>
            </div>
            
            {userLevel && (
              <div className="text-right">
                <div className={`text-2xl font-bold ${getLevelColor(userLevel.level)}`}>
                  Niveau {userLevel.level}
                </div>
                <div className="text-sm text-gray-600">{userLevel.title}</div>
                <div className="text-sm text-gray-500">{userLevel.points} points</div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Navigation par onglets */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Contenu des onglets */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Statistiques rapides */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-brand-100 flex items-center justify-center">
                      <Star className="w-6 h-6 text-brand-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {stats?.points || 0}
                      </div>
                      <div className="text-sm text-gray-600">Points totaux</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {stats?.total_transactions || 0}
                      </div>
                      <div className="text-sm text-gray-600">Transactions</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Award className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {stats?.badges_count || 0}
                      </div>
                      <div className="text-sm text-gray-600">Badges</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {stats?.overall_score ? stats.overall_score.toFixed(1) : '—'}
                      </div>
                      <div className="text-sm text-gray-600">Réputation</div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Affichage de la réputation */}
              {stats && (
                <ReputationDisplay
                  reputation={{
                    overall_score: stats.overall_score,
                    ratings_count: stats.ratings_count,
                    avg_communication: stats.overall_score,
                    avg_punctuality: stats.overall_score,
                    avg_care: stats.overall_score,
                  }}
                  badges={userBadges?.map(ub => ({
                    badge_slug: ub.badge?.slug || '',
                    badge_label: ub.badge?.name || '',
                  })) || []}
                  level={userLevel ? {
                    level: userLevel.level,
                    points: userLevel.points,
                    title: userLevel.title,
                  } : undefined}
                  stats={{
                    completed_lends: stats.completed_lends,
                    completed_borrows: stats.completed_borrows,
                    total_transactions: stats.total_transactions,
                  }}
                />
              )}

              {/* Défis récents */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Target className="w-5 h-5 text-brand-600" />
                    Défis en cours
                  </h3>
                  <Button
                    size="sm"
                    onClick={handleCheckBadges}
                    disabled={checkBadgesMutation.isPending}
                  >
                    <Zap className="w-4 h-4 mr-1" />
                    Vérifier les badges
                  </Button>
                </div>
                
                {userChallenges && userChallenges.length > 0 ? (
                  <div className="space-y-3">
                    {userChallenges.slice(0, 3).map((challenge) => (
                      <div
                        key={challenge.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center">
                            <Target className="w-4 h-4 text-brand-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {challenge.challenge?.title}
                            </div>
                            <div className="text-sm text-gray-600">
                              {challenge.progress}/{challenge.challenge?.target_value}
                            </div>
                          </div>
                        </div>
                        
                        {challenge.is_completed && !challenge.claimed_at && (
                          <Button
                            size="sm"
                            onClick={() => handleClaimReward(challenge.challenge_id)}
                            disabled={claimRewardMutation.isPending}
                          >
                            <Gift className="w-4 h-4 mr-1" />
                            Récupérer
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Aucun défi en cours</p>
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'challenges' && (
            <ChallengesSystem
              userStats={{
                completed_lends: stats?.completed_lends || 0,
                completed_borrows: stats?.completed_borrows || 0,
                ratings_received: stats?.ratings_count || 0,
                days_active: 0, // À calculer
              }}
              onClaimReward={handleClaimReward}
            />
          )}

          {activeTab === 'leaderboard' && (
            <Leaderboard
              entries={leaderboard || []}
              currentUserId={stats?.profile_id}
              period="all_time"
            />
          )}

          {activeTab === 'badges' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-brand-600" />
                  Mes Badges ({userBadges?.length || 0})
                </h3>
                
                {userBadges && userBadges.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userBadges.map((userBadge) => (
                      <div
                        key={userBadge.id}
                        className="p-4 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
                            <Award className="w-5 h-5 text-brand-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {userBadge.badge?.name}
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              {userBadge.badge?.description}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={userBadge.badge?.rarity === 'legendary' ? 'warning' : 'success'}
                                size="sm"
                              >
                                {userBadge.badge?.rarity}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(userBadge.earned_at).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Aucun badge obtenu pour le moment</p>
                    <p className="text-sm mt-1">Continuez à participer pour débloquer vos premiers badges !</p>
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'rewards' && (
            <RewardsSystem
              userLevel={userLevel?.level || 1}
              userPoints={userLevel?.points || 0}
              userBadges={userBadges?.map(ub => ub.badge?.slug || '').filter(Boolean) || []}
              userTransactions={stats?.total_transactions || 0}
              onClaimReward={handleClaimReward}
            />
          )}

          {activeTab === 'events' && (
            <CommunityEvents
              userLevel={userLevel?.level || 1}
              userPoints={userLevel?.points || 0}
              onJoinEvent={(eventId) => {
                console.log('Rejoindre événement:', eventId);
              }}
              onClaimReward={handleClaimReward}
            />
          )}

          {activeTab === 'stats' && stats && (
            <AdvancedStats
              userStats={{
                level: userLevel?.level || 1,
                points: userLevel?.points || 0,
                completed_lends: stats.completed_lends,
                completed_borrows: stats.completed_borrows,
                total_transactions: stats.total_transactions,
                ratings_count: stats.ratings_count,
                overall_score: stats.overall_score,
                badges_count: stats.badges_count,
              }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default GamificationPage;
