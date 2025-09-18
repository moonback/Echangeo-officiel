import { 
  Wrench, 
  Smartphone, 
  Book, 
  Dumbbell, 
  ChefHat, 
  Flower2, 
  Gamepad2,
  Package,
  Users,
  Shirt,
  Sofa,
  Music,
  Baby,
  Palette,
  Sparkles,
  Car,
  Briefcase
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
    fashion: Shirt,
    furniture: Sofa,
    music: Music,
    baby: Baby,
    art: Palette,
    beauty: Sparkles,
    auto: Car,
    office: Briefcase,
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
    fashion: 'Mode',
    furniture: 'Mobilier',
    music: 'Musique',
    baby: 'Bébé',
    art: 'Art & Loisirs créatifs',
    beauty: 'Beauté & Bien-être',
    auto: 'Auto & Moto',
    office: 'Bureau',
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
  { value: 'fashion', label: 'Mode' },
  { value: 'furniture', label: 'Mobilier' },
  { value: 'music', label: 'Musique' },
  { value: 'baby', label: 'Bébé' },
  { value: 'art', label: 'Art & Loisirs créatifs' },
  { value: 'beauty', label: 'Beauté & Bien-être' },
  { value: 'auto', label: 'Auto & Moto' },
  { value: 'office', label: 'Bureau' },
  { value: 'services', label: 'Services' },
  { value: 'other', label: 'Autre' },
];
