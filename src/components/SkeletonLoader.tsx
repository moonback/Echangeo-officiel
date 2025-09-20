import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  className?: string;
  count?: number;
}

export const ItemCardSkeleton: React.FC<SkeletonLoaderProps> = ({ 
  className = '', 
  count = 1 
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div 
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1, duration: 0.3 }}
          className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden h-full flex flex-col hover:shadow-3xl transition-all duration-500 ${className}`}
        >
          <div className="aspect-[4/3] shimmer-enhanced bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
            {/* Effet de brillance animé */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full shimmer-shine" />
          </div>
          <div className="p-5 flex-1 flex flex-col">
            <div className="h-5 rounded-lg mb-2 shimmer bg-gradient-to-r from-gray-200 to-gray-300" />
            <div className="h-4 rounded-lg mb-3 w-3/4 shimmer bg-gradient-to-r from-gray-200 to-gray-300" />
            <div className="flex justify-between mt-auto">
              <div className="h-3 rounded-lg w-1/3 shimmer bg-gradient-to-r from-gray-200 to-gray-300" />
              <div className="h-3 rounded-lg w-1/4 shimmer bg-gradient-to-r from-gray-200 to-gray-300" />
            </div>
          </div>
        </motion.div>
      ))}
    </>
  );
};

export const ProfileSkeleton: React.FC<SkeletonLoaderProps> = ({ className = '' }) => (
  <div className={`${className}`}>
    <div className="flex items-center space-x-4 mb-6">
      <div className="w-16 h-16 rounded-full shimmer" />
      <div className="flex-1">
        <div className="h-6 rounded mb-2 w-1/2 shimmer" />
        <div className="h-4 rounded w-3/4 shimmer" />
      </div>
    </div>
    <div className="space-y-3">
      <div className="h-4 rounded shimmer" />
      <div className="h-4 rounded w-2/3 shimmer" />
      <div className="h-4 rounded w-1/2 shimmer" />
    </div>
  </div>
);
