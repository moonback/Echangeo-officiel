import React from 'react';

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
        <div 
          key={index}
          className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-gray-200/60 overflow-hidden ${className}`}
        >
          <div className="aspect-video shimmer" />
          <div className="p-4">
            <div className="h-5 rounded mb-2 shimmer" />
            <div className="h-4 rounded mb-3 w-3/4 shimmer" />
            <div className="flex justify-between">
              <div className="h-3 rounded w-1/3 shimmer" />
              <div className="h-3 rounded w-1/4 shimmer" />
            </div>
          </div>
        </div>
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
