import { 
  Wrench, 
  Smartphone, 
  Book, 
  Dumbbell, 
  ChefHat, 
  Flower2, 
  Gamepad2,
  Package,
  Users
} from 'lucide-react';
import type { ItemCategory } from '../types';

export function getCategoryIcon(category: ItemCategory) {
  const icons = {
    tools: Wrench,
    electronics: Smartphone,
    books: Book,
    sports: Dumbbell,
    kitchen: ChefHat,
    garden: Flower2,
    toys: Gamepad2,
    services: Users,
    other: Package,
  };
  
  return icons[category] || Package;
}

export function getCategoryLabel(category: ItemCategory) {
  const labels = {
    tools: 'Outils',
    electronics: 'Électronique',
    books: 'Livres',
    sports: 'Sports',
    kitchen: 'Cuisine',
    garden: 'Jardin',
    toys: 'Jouets',
    services: 'Services',
    other: 'Autre',
  };
  
  return labels[category] || 'Autre';
}

export const categories: { value: ItemCategory; label: string }[] = [
  { value: 'tools', label: 'Outils' },
  { value: 'electronics', label: 'Électronique' },
  { value: 'books', label: 'Livres' },
  { value: 'sports', label: 'Sports' },
  { value: 'kitchen', label: 'Cuisine' },
  { value: 'garden', label: 'Jardin' },
  { value: 'toys', label: 'Jouets' },
  { value: 'services', label: 'Services' },
  { value: 'other', label: 'Autre' },
];