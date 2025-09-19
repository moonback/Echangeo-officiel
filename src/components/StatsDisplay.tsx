import React from 'react';
import { motion } from 'framer-motion';
import { Users, Gift, Star, TrendingUp } from 'lucide-react';
import { useAppStats, useUserStats } from '../hooks/useStats';
import { useAuthStore } from '../store/authStore';

interface StatsDisplayProps {
  className?: string;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ className = '' }) => {
  const { user } = useAuthStore();
  const { data: appStats, isLoading: statsLoading } = useAppStats();
  const { data: userStats } = useUserStats(user?.id);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (statsLoading) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-2xl h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  const stats = [
    { 
      icon: <Users className="w-5 h-5" />, 
      label: "Utilisateurs actifs", 
      value: formatNumber(appStats?.activeUsersCount || 0), 
      color: "text-blue-600" 
    },
    { 
      icon: <Gift className="w-5 h-5" />, 
      label: "Objets disponibles", 
      value: formatNumber(appStats?.totalItems || 0), 
      color: "text-green-600" 
    },
    { 
      icon: <Star className="w-5 h-5" />, 
      label: "Échanges réussis", 
      value: formatNumber(appStats?.totalExchanges || 0), 
      color: "text-purple-600" 
    },
    { 
      icon: <TrendingUp className="w-5 h-5" />, 
      label: "Communautés", 
      value: formatNumber(appStats?.totalCommunities || 0), 
      color: "text-orange-600" 
    }
  ];

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + index * 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gray-100 ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsDisplay;
