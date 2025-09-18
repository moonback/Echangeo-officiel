import React from 'react';
import { getOfferTypeIcon, getOfferTypeLabel } from '../../utils/offerTypes';
import { getOfferTypeBadgeClass } from '../../utils/offerTypeStyles';
import type { OfferType } from '../../types';

interface OfferTypeBadgeProps {
  offerType: OfferType;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const OfferTypeBadge: React.FC<OfferTypeBadgeProps> = ({ 
  offerType, 
  showIcon = true, 
  size = 'md',
  className = ''
}) => {
  const Icon = getOfferTypeIcon(offerType);
  const label = getOfferTypeLabel(offerType);
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  };
  
  const baseClass = `inline-flex items-center rounded-full font-medium text-white ${sizeClasses[size]}`;
  const colorClass = getOfferTypeBadgeClass(offerType).split(' ').slice(-1)[0]; // Récupère juste la classe de couleur
  
  return (
    <span className={`${baseClass} ${colorClass} ${className}`}>
      {showIcon && <Icon className={`${iconSizes[size]} mr-1`} />}
      {label}
    </span>
  );
};

export default OfferTypeBadge;
