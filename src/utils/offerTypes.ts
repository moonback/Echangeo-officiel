import { HandHeart, ArrowLeftRight, Gift } from 'lucide-react';
import type { OfferType } from '../types';

export function getOfferTypeIcon(offerType: OfferType) {
  const icons = {
    loan: HandHeart,
    trade: ArrowLeftRight,
    donation: Gift,
  };
  
  return icons[offerType] || HandHeart;
}

export function getOfferTypeLabel(offerType: OfferType) {
  const labels = {
    loan: 'Prêt',
    trade: 'Troc',
    donation: 'Don',
  };
  
  return labels[offerType] || 'Prêt';
}

export function getOfferTypeDescription(offerType: OfferType) {
  const descriptions = {
    loan: 'Prêter temporairement cet objet',
    trade: 'Échanger définitivement cet objet ou service',
    donation: 'Donner gratuitement cet objet',
  };
  
  return descriptions[offerType] || 'Prêter temporairement cet objet';
}

export const offerTypes: { value: OfferType; label: string; description: string }[] = [
  { 
    value: 'loan', 
    label: 'Prêt', 
    description: 'Prêter temporairement cet objet' 
  },
  { 
    value: 'trade', 
    label: 'Troc', 
    description: 'Échanger définitivement cet objet ou service' 
  },
  { 
    value: 'donation', 
    label: 'Don', 
    description: 'Donner gratuitement cet objet' 
  },
];
