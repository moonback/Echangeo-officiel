import { motion } from 'framer-motion';
import { useAdminAuth } from '../../hooks/useAdmin';
import { Link } from 'react-router-dom';

interface AdminBadgeProps {
  className?: string;
  showText?: boolean;
  variant?: 'default' | 'compact';
}

export default function AdminBadge({ 
  className = '', 
  showText = true, 
  variant = 'default' 
}: AdminBadgeProps) {
  const { isAdmin, adminRole } = useAdminAuth();

  if (!isAdmin) return null;

  const roleLabels = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    moderator: 'Modérateur'
  };

  if (variant === 'compact') {
    return (
      <Link to="/admin">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          className={`
            inline-flex items-center px-2 py-1 rounded-full text-xs font-bold
            bg-gradient-to-r from-red-500 to-pink-500 text-white
            hover:from-red-600 hover:to-pink-600 transition-all duration-200
            shadow-lg cursor-pointer ${className}
          `}
        >
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          {showText && (adminRole ? roleLabels[adminRole] : 'ADMIN')}
        </motion.div>
      </Link>
    );
  }

  return (
    <Link to="/admin">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className={`
          inline-flex items-center px-3 py-2 rounded-lg font-medium
          bg-gradient-to-r from-red-50 to-pink-50 text-red-700
          border border-red-200 hover:border-red-300
          hover:from-red-100 hover:to-pink-100
          transition-all duration-200 cursor-pointer shadow-sm ${className}
        `}
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        {showText && (
          <span className="text-sm">
            {adminRole ? roleLabels[adminRole] : 'Administrateur'}
          </span>
        )}
        <svg className="w-4 h-4 ml-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </motion.div>
    </Link>
  );
}
