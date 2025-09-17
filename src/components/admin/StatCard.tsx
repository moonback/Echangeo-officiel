import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  trend?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  loading?: boolean;
  className?: string;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    border: 'border-blue-200',
    gradient: 'from-blue-500 to-blue-600'
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    border: 'border-green-200',
    gradient: 'from-green-500 to-green-600'
  },
  yellow: {
    bg: 'bg-yellow-50',
    icon: 'text-yellow-600',
    border: 'border-yellow-200',
    gradient: 'from-yellow-500 to-yellow-600'
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    border: 'border-red-200',
    gradient: 'from-red-500 to-red-600'
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    border: 'border-purple-200',
    gradient: 'from-purple-500 to-purple-600'
  },
  indigo: {
    bg: 'bg-indigo-50',
    icon: 'text-indigo-600',
    border: 'border-indigo-200',
    gradient: 'from-indigo-500 to-indigo-600'
  }
};

export default function StatCard({
  title,
  value,
  icon,
  color,
  trend,
  loading = false,
  className = ''
}: StatCardProps) {
  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`
        bg-white rounded-xl border ${colors.border} p-4 lg:p-6
        hover:shadow-lg transition-all duration-300
        ${loading ? 'animate-pulse' : ''}
        relative overflow-hidden ${className}
      `}
    >
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-5`}></div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <div className={`
            p-2 rounded-lg ${colors.bg} shadow-sm
            ${loading ? 'animate-pulse' : ''}
          `}>
            <div className={`w-5 h-5 ${colors.icon}`}>
              {icon}
            </div>
          </div>
        </div>
        
        <div className="mb-2">
          {loading ? (
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
          ) : (
            <p className="text-2xl lg:text-3xl font-bold text-gray-900">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
          )}
        </div>
        
        {trend && !loading && (
          <div className="flex items-center">
            <span
              className={`
                text-xs font-medium px-2 py-1 rounded-full
                ${trend.type === 'increase' 
                  ? 'text-green-700 bg-green-100' 
                  : 'text-red-700 bg-red-100'
                }
              `}
            >
              {trend.type === 'increase' ? '↗' : '↘'} {Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-gray-500 ml-2">{trend.period}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
