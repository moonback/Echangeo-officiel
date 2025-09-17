import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Award, 
  Target, 
  TrendingUp, 
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
  useClaimChallengeReward,
  useCheckBadges,
  getLevelColor
} from '../hooks/useGamification';
import { diagnoseGamification } from '../utils/testGamification';

const GamificationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'challenges' | 'leaderboard' | 'badges' | 'rewards' | 'events' | 'stats'>('overview');
  
  const { data: stats, error: statsError } = useGamificationStats();
  const { data: userLevel, error: levelError } = useUserLevel();
  const { data: userBadges, error: badgesError } = useUserBadges();
  const { data: leaderboard } = useLeaderboard(20);
  const { data: userChallenges } = useUserChallenges();

  // Vérifier si les tables de gamification sont disponibles
  const isGamificationAvailable = !statsError && !levelError && !badgesError;
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

  const handleDiagnose = async () => {
    try {
      await diagnoseGamification();
    } catch (error) {
      console.error('Erreur lors du diagnostic:', error);
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
    <div className="w-full h-full">
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

        {/* Navigation par onglets - Version icônes uniquement */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 p-2 gap-1 w-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'challenges' | 'leaderboard' | 'badges' | 'rewards' | 'events' | 'stats')}
                className={`relative flex items-center justify-center flex-1 h-12 rounded-lg transition-all duration-200 group ${
                  activeTab === tab.id
                    ? 'bg-brand-600 text-white shadow-lg scale-105'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 hover:scale-105'
                }`}
                title={tab.label}
              >
                <div className="transition-transform duration-200 group-hover:scale-110">
                  {tab.icon}
                </div>
                
                {/* Indicateur de sélection */}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-brand-600 rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
          
          {/* Labels des onglets (optionnel, peut être masqué sur mobile) */}
          <div className="hidden md:flex justify-between mt-3 px-2">
            {tabs.map((tab) => (
              <span
                key={tab.id}
                className={`text-xs font-medium transition-colors text-center ${
                  activeTab === tab.id
                    ? 'text-brand-600'
                    : 'text-gray-500'
                }`}
              >
                {tab.label}
              </span>
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
          {/* Message d'information si les tables ne sont pas disponibles */}
          {!isGamificationAvailable && (
            <Card className="p-6 mb-6 border-amber-200 bg-amber-50">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-800 mb-2">
                    Système de gamification en cours de déploiement
                  </h3>
                  <p className="text-amber-700 text-sm mb-3">
                    Les fonctionnalités de gamification sont temporairement indisponibles. 
                    Les migrations de base de données sont en cours d'application.
                  </p>
                  <div className="text-xs text-amber-600 mb-3">
                    <p>• Niveaux et points</p>
                    <p>• Badges et récompenses</p>
                    <p>• Défis et classements</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleDiagnose}
                    className="border-amber-300 text-amber-700 hover:bg-amber-100 bg-transparent"
                  >
                    <Zap className="w-4 h-4 mr-1" />
                    Diagnostiquer
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Statistiques rapides */}
              <Card className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center">
                      <Star className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-900">
                        {stats?.points || 0}
                      </div>
                      <div className="text-xs text-gray-600">Points totaux</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-900">
                        {stats?.total_transactions || 0}
                      </div>
                      <div className="text-xs text-gray-600">Transactions</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Award className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-900">
                        {stats?.badges_count || 0}
                      </div>
                      <div className="text-xs text-gray-600">Badges</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-900">
                        {stats?.overall_score ? stats.overall_score.toFixed(1) : '—'}
                      </div>
                      <div className="text-xs text-gray-600">Réputation</div>
                    </div>
                  </div>
                </div>
              </Card>

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
              entries={(leaderboard || []).map(entry => ({
                id: entry.profile_id,
                name: entry.full_name,
                avatar_url: entry.avatar_url,
                score: entry.points,
                level: entry.level,
                badges: Array(entry.badges_count).fill('badge'),
                position: entry.position,
              }))}
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
