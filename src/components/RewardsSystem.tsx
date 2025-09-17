import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Gift, 
  Star, 
  Crown, 
  Zap, 
  Shield, 
  Heart,
  CheckCircle,
  Clock,
  Award,
  Trophy
} from 'lucide-react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

export interface Reward {
  id: string;
  type: 'discount' | 'premium_access' | 'exclusive_badge' | 'bonus_points' | 'special_feature';
  title: string;
  description: string;
  icon: React.ReactNode;
  value: string; // Valeur de la récompense (ex: "10%", "1 mois", "500 pts")
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirements: {
    level?: number;
    points?: number;
    badges?: string[];
    transactions?: number;
  };
  expires_at?: Date;
  is_claimed: boolean;
  claimed_at?: Date;
}

interface RewardsSystemProps {
  userLevel: number;
  userPoints: number;
  userBadges: string[];
  userTransactions: number;
  onClaimReward: (rewardId: string) => void;
}

const RewardsSystem: React.FC<RewardsSystemProps> = ({
  userLevel,
  userPoints,
  userBadges,
  userTransactions,
  onClaimReward
}) => {
  const [activeCategory, setActiveCategory] = useState<'available' | 'claimed' | 'locked'>('available');

  // Définition des récompenses disponibles
  const allRewards: Reward[] = [
    // Récompenses de niveau
    {
      id: 'level-5-premium',
      type: 'premium_access',
      title: 'Accès Premium 1 Mois',
      description: 'Débloquez toutes les fonctionnalités premium pendant 1 mois',
      icon: <Crown className="w-6 h-6" />,
      value: '1 mois',
      rarity: 'rare',
      requirements: { level: 5 },
      is_claimed: false,
    },
    {
      id: 'level-10-discount',
      type: 'discount',
      title: 'Réduction Premium 20%',
      description: 'Obtenez 20% de réduction sur votre abonnement premium',
      icon: <Star className="w-6 h-6" />,
      value: '20%',
      rarity: 'epic',
      requirements: { level: 10 },
      is_claimed: false,
    },
    
    // Récompenses de points
    {
      id: 'points-1000-bonus',
      type: 'bonus_points',
      title: 'Bonus Points x2',
      description: 'Doublez vos points pendant 24h',
      icon: <Zap className="w-6 h-6" />,
      value: 'x2',
      rarity: 'common',
      requirements: { points: 1000 },
      is_claimed: false,
    },
    {
      id: 'points-5000-exclusive',
      type: 'exclusive_badge',
      title: 'Badge Exclusif "Légende"',
      description: 'Badge unique réservé aux membres légendaires',
      icon: <Award className="w-6 h-6" />,
      value: 'Exclusif',
      rarity: 'legendary',
      requirements: { points: 5000 },
      is_claimed: false,
    },
    
    // Récompenses de transactions
    {
      id: 'transactions-50-feature',
      type: 'special_feature',
      title: 'Accès Prioritaire',
      description: 'Vos demandes sont traitées en priorité',
      icon: <Shield className="w-6 h-6" />,
      value: 'Permanent',
      rarity: 'rare',
      requirements: { transactions: 50 },
      is_claimed: false,
    },
    {
      id: 'transactions-100-premium',
      type: 'premium_access',
      title: 'Accès Premium 3 Mois',
      description: 'Accès premium gratuit pendant 3 mois',
      icon: <Crown className="w-6 h-6" />,
      value: '3 mois',
      rarity: 'epic',
      requirements: { transactions: 100 },
      is_claimed: false,
    },
    
    // Récompenses spéciales
    {
      id: 'early-adopter',
      type: 'exclusive_badge',
      title: 'Badge "Pionnier"',
      description: 'Pour les premiers utilisateurs de la plateforme',
      icon: <Heart className="w-6 h-6" />,
      value: 'Exclusif',
      rarity: 'legendary',
      requirements: { level: 3, transactions: 10 },
      is_claimed: false,
    },
  ];

  // Filtrer les récompenses selon la catégorie
  const getFilteredRewards = () => {
    return allRewards.filter(reward => {
      const isAvailable = checkRewardAvailability(reward) && !reward.is_claimed;
      const isClaimed = reward.is_claimed;
      const isLocked = !checkRewardAvailability(reward) && !reward.is_claimed;

      switch (activeCategory) {
        case 'available':
          return isAvailable;
        case 'claimed':
          return isClaimed;
        case 'locked':
          return isLocked;
        default:
          return false;
      }
    });
  };

  // Vérifier si une récompense est disponible
  const checkRewardAvailability = (reward: Reward): boolean => {
    const { requirements } = reward;
    
    if (requirements.level && userLevel < requirements.level) return false;
    if (requirements.points && userPoints < requirements.points) return false;
    if (requirements.transactions && userTransactions < requirements.transactions) return false;
    if (requirements.badges && requirements.badges.some(badge => !userBadges.includes(badge))) return false;
    
    return true;
  };

  // Obtenir la couleur de rareté
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'border-gray-300 bg-gray-50';
      case 'rare':
        return 'border-blue-300 bg-blue-50';
      case 'epic':
        return 'border-purple-300 bg-purple-50';
      case 'legendary':
        return 'border-yellow-300 bg-yellow-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  // Obtenir la couleur du badge de rareté
  const getRarityBadgeColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'neutral';
      case 'rare':
        return 'info';
      case 'epic':
        return 'warning';
      case 'legendary':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  const filteredRewards = getFilteredRewards();

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Gift className="w-6 h-6 text-brand-600" />
            Récompenses Spéciales
          </h3>
          
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { id: 'available', label: 'Disponibles', count: allRewards.filter(r => checkRewardAvailability(r) && !r.is_claimed).length },
              { id: 'claimed', label: 'Récupérées', count: allRewards.filter(r => r.is_claimed).length },
              { id: 'locked', label: 'Verrouillées', count: allRewards.filter(r => !checkRewardAvailability(r) && !r.is_claimed).length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  activeCategory === tab.id
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 rounded-lg bg-green-50">
            <div className="text-xl font-bold text-green-700">
              {allRewards.filter(r => checkRewardAvailability(r) && !r.is_claimed).length}
            </div>
            <div className="text-sm text-green-600">Disponibles</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-blue-50">
            <div className="text-xl font-bold text-blue-700">
              {allRewards.filter(r => r.is_claimed).length}
            </div>
            <div className="text-sm text-blue-600">Récupérées</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-purple-50">
            <div className="text-xl font-bold text-purple-700">
              {allRewards.filter(r => !checkRewardAvailability(r) && !r.is_claimed).length}
            </div>
            <div className="text-sm text-purple-600">À débloquer</div>
          </div>
        </div>

        {/* Liste des récompenses */}
        <div className="space-y-4">
          {filteredRewards.length > 0 ? (
            filteredRewards.map((reward) => {
              const isAvailable = checkRewardAvailability(reward) && !reward.is_claimed;
              const isClaimed = reward.is_claimed;
              const isLocked = !checkRewardAvailability(reward) && !reward.is_claimed;

              return (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border transition-all ${
                    isClaimed 
                      ? 'bg-green-50 border-green-200' 
                      : isAvailable 
                        ? 'bg-white border-gray-200 hover:border-gray-300' 
                        : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      isClaimed 
                        ? 'bg-green-100 text-green-700' 
                        : isAvailable 
                          ? 'bg-brand-100 text-brand-700' 
                          : 'bg-gray-100 text-gray-500'
                    }`}>
                      {reward.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{reward.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{reward.description}</p>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Badge variant={getRarityBadgeColor(reward.rarity) as any}>
                            {reward.rarity}
                          </Badge>
                          {isClaimed && (
                            <Badge variant="success" className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Récupéré
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-lg font-semibold text-brand-700">
                            {reward.value}
                          </div>
                          
                          {!isClaimed && (
                            <div className="text-sm text-gray-500">
                              {reward.requirements.level && (
                                <span>Niveau {reward.requirements.level} </span>
                              )}
                              {reward.requirements.points && (
                                <span>{reward.requirements.points} points </span>
                              )}
                              {reward.requirements.transactions && (
                                <span>{reward.requirements.transactions} transactions </span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {isAvailable && (
                          <Button
                            size="sm"
                            onClick={() => onClaimReward(reward.id)}
                            className="bg-brand-600 hover:bg-brand-700"
                          >
                            <Gift className="w-4 h-4 mr-1" />
                            Récupérer
                          </Button>
                        )}
                        
                        {isLocked && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            Verrouillé
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Gift className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>
                {activeCategory === 'available' && 'Aucune récompense disponible pour le moment'}
                {activeCategory === 'claimed' && 'Aucune récompense récupérée'}
                {activeCategory === 'locked' && 'Aucune récompense verrouillée'}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default RewardsSystem;
