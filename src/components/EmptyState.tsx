import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action, className = '' }) => {
  return (
    <div className={["bg-white border border-gray-200 rounded-2xl p-8 text-center", className].join(' ')}>
      {icon && <div className="mx-auto mb-4 text-gray-400">{icon}</div>}
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-gray-600 mb-4">{description}</p>}
      {action}
    </div>
  );
};

export default EmptyState;


