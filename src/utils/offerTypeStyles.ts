import type { OfferType } from '../types';

export function getOfferTypeColor(offerType: OfferType): string {
  const colors = {
    loan: 'bg-blue-500',
    trade: 'bg-purple-500', 
    donation: 'bg-green-500',
  };
  
  return colors[offerType] || 'bg-blue-500';
}

export function getOfferTypeTextColor(offerType: OfferType): string {
  const colors = {
    loan: 'text-blue-600',
    trade: 'text-purple-600',
    donation: 'text-green-600',
  };
  
  return colors[offerType] || 'text-blue-600';
}

export function getOfferTypeBorderColor(offerType: OfferType): string {
  const colors = {
    loan: 'border-blue-200',
    trade: 'border-purple-200',
    donation: 'border-green-200',
  };
  
  return colors[offerType] || 'border-blue-200';
}

export function getOfferTypeGradient(offerType: OfferType): string {
  const gradients = {
    loan: 'from-blue-500 to-blue-600',
    trade: 'from-purple-500 to-purple-600',
    donation: 'from-green-500 to-green-600',
  };
  
  return gradients[offerType] || 'from-blue-500 to-blue-600';
}

export function getOfferTypeBadgeClass(offerType: OfferType): string {
  const baseClass = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white';
  const colorClass = getOfferTypeColor(offerType);
  
  return `${baseClass} ${colorClass}`;
}

export function getOfferTypeCardClass(offerType: OfferType): string {
  const baseClass = 'border rounded-lg p-4 transition-all duration-200 hover:shadow-md';
  const borderClass = getOfferTypeBorderColor(offerType);
  
  return `${baseClass} ${borderClass}`;
}
