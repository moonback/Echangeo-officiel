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
      className={`
        bg-white rounded-xl border ${colors.border} p-6 
        hover:shadow-lg transition-all duration-200
        ${loading ? 'animate-pulse' : ''}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          {loading ? (
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-gray-900">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
          )}
          
          {change && !loading && (
            <div className="flex items-center mt-2">
              <span
                className={`
                  text-sm font-medium
                  ${change.type === 'increase' ? 'text-green-600' : 'text-red-600'}
                `}
              >
                {change.type === 'increase' ? '↗' : '↘'} {Math.abs(change.value)}%
              </span>
              <span className="text-xs text-gray-500 ml-2">vs. mois dernier</span>
            </div>
          )}
        </div>
        
        <div className={`
          p-3 rounded-full ${colors.bg}
          ${loading ? 'animate-pulse' : ''}
        `}>
          <div className={`w-6 h-6 ${colors.icon}`}>
            {icon}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
