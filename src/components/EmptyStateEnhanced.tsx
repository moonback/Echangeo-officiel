import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, RefreshCw, Plus } from 'lucide-react';
import Button from './ui/Button';

interface EmptyStateEnhancedProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  className?: string;
  action?: React.ReactNode;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
}

const EmptyStateEnhanced: React.FC<EmptyStateEnhancedProps> = ({
  icon = <Search className="w-16 h-16 text-gray-400" />,
  title,
  description,
  className = "",
  action,
  suggestions = [],
  onSuggestionClick,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        {icon}
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-semibold text-gray-900 mb-2"
      >
        {title}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-gray-600 mb-6 max-w-md"
      >
        {description}
      </motion.p>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <p className="text-sm text-gray-500 mb-3">Suggestions :</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={suggestion}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSuggestionClick?.(suggestion)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Action */}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {action}
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-8 flex flex-wrap gap-3 justify-center"
      >
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Modifier les filtres
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter un objet
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default EmptyStateEnhanced;
