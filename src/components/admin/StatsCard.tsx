import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon: ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  loading?: boolean;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    border: 'border-blue-200'
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    border: 'border-green-200'
  },
  yellow: {
    bg: 'bg-yellow-50',
    icon: 'text-yellow-600',
    border: 'border-yellow-200'
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    border: 'border-red-200'
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    border: 'border-purple-200'
  }
};

export default function StatsCard({
  title,
  value,
  change,
  icon,
  color,
  loading = false
}: StatsCardProps) {
  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`
        bg-white rounded-xl border ${colors.border} p-6 
        hover:shadow-xl transition-all duration-300
        ${loading ? 'animate-pulse' : ''}
        relative overflow-hidden
      `}
    >
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-5`}></div>
      
      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          {loading ? (
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
          ) : (
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
          )}
          
          {change && !loading && (
            <div className="flex items-center">
              <span
                className={`
                  text-sm font-semibold px-2 py-1 rounded-full
                  ${change.type === 'increase' 
                    ? 'text-green-700 bg-green-100' 
                    : 'text-red-700 bg-red-100'
                  }
                `}
              >
                {change.type === 'increase' ? '↗' : '↘'} {Math.abs(change.value)}%
              </span>
              <span className="text-xs text-gray-500 ml-2">vs. mois dernier</span>
            </div>
          )}
        </div>
        
        <div className={`
          p-4 rounded-xl ${colors.bg} shadow-lg
          ${loading ? 'animate-pulse' : ''}
          transition-transform duration-200 hover:scale-110
        `}>
          <div className={`w-8 h-8 ${colors.icon}`}>
            {icon}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
