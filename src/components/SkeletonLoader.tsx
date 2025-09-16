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
          className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse ${className}`}
        >
          <div className="aspect-video bg-gray-200" />
          <div className="p-4">
            <div className="h-5 bg-gray-200 rounded mb-2" />
            <div className="h-4 bg-gray-200 rounded mb-3 w-3/4" />
            <div className="flex justify-between">
              <div className="h-3 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export const ProfileSkeleton: React.FC<SkeletonLoaderProps> = ({ className = '' }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="flex items-center space-x-4 mb-6">
      <div className="w-16 h-16 bg-gray-200 rounded-full" />
      <div className="flex-1">
        <div className="h-6 bg-gray-200 rounded mb-2 w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>
    </div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  </div>
);