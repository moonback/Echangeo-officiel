import React from 'react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={["bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 text-center", className].join(' ')}
    >
      {icon && (
        <div className="mx-auto mb-4 text-gray-400 icon-tap">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-gray-600 mb-4">{description}</p>}
      {action}
    </motion.div>
  );
};

export default EmptyState;


