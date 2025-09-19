import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useItems } from './useItems';
import { useAuthStore } from '../store/authStore';
import type { ItemCategory, OfferType } from '../types';

type SortOption = 'newest' | 'oldest' | 'value_asc' | 'value_desc' | 'title_asc' | 'title_desc';
type ViewMode = 'grid' | 'list';

interface FilterState {
  search: string;
  selectedCategory: ItemCategory | undefined;
  condition: string | undefined;
  brand: string;
  minValue: string;
  maxValue: string;
  availableFrom: string;
  availableTo: string;
  hasImages: boolean;
  isAvailable: boolean;
  tags: string;
  favoritesOnly: boolean;
  offerType: OfferType | undefined;
  sortBy: SortOption;
  viewMode: ViewMode;
}

interface UseItemFiltersReturn {
  // États
  filters: FilterState;
  isLoading: boolean;
  items: any[] | undefined;
  sortedItems: any[];
  activeFiltersCount: number;
  showFilters: boolean;
  
  // Actions
  setSearch: (search: string) => void;
  setSelectedCategory: (category: ItemCategory | undefined) => void;
  setCondition: (condition: string | undefined) => void;
  setBrand: (brand: string) => void;
  setMinValue: (value: string) => void;
  setMaxValue: (value: string) => void;
  setAvailableFrom: (date: string) => void;
  setAvailableTo: (date: string) => void;
  setHasImages: (hasImages: boolean) => void;
  setIsAvailable: (isAvailable: boolean) => void;
  setTags: (tags: string) => void;
  setFavoritesOnly: (favoritesOnly: boolean) => void;
  setOfferType: (offerType: OfferType | undefined) => void;
  setSortBy: (sortBy: SortOption) => void;
  setViewMode: (viewMode: ViewMode) => void;
  setShowFilters: (show: boolean) => void;
  
  // Utilitaires
  resetFilters: () => void;
  refetch: () => void;
  updateURL: () => void;
}

export const useItemFilters = (): UseItemFiltersReturn => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // État initial des filtres
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    selectedCategory: undefined,
    condition: undefined,
    brand: '',
    minValue: '',
    maxValue: '',
    availableFrom: '',
    availableTo: '',
    hasImages: false,
    isAvailable: true,
    tags: '',
    favoritesOnly: false,
    offerType: undefined,
    sortBy: 'newest',
    viewMode: 'grid',
  });

  const [showFilters, setShowFilters] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.search]);

  // Chargement des données avec filtres
  const { data: items, isLoading, refetch } = useItems({
    category: filters.selectedCategory,
    search: debouncedSearch,
    condition: filters.condition,
    brand: filters.brand || undefined,
    minValue: filters.minValue !== '' ? Number(filters.minValue) : undefined,
    maxValue: filters.maxValue !== '' ? Number(filters.maxValue) : undefined,
    availableFrom: filters.availableFrom || undefined,
    availableTo: filters.availableTo || undefined,
    hasImages: filters.hasImages || undefined,
    isAvailable: filters.isAvailable,
    tags: filters.tags ? filters.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
    favoritesOnly: filters.favoritesOnly || undefined,
    userId: filters.favoritesOnly ? user?.id : undefined,
    offerType: filters.offerType,
  });

  // Tri des objets
  const sortedItems = useMemo(() => {
    if (!items) return [];
    
    const sorted = [...items].sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'value_asc':
          return (a.estimated_value || 0) - (b.estimated_value || 0);
        case 'value_desc':
          return (b.estimated_value || 0) - (a.estimated_value || 0);
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'title_desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
    
    return sorted;
  }, [items, filters.sortBy]);

  // Comptage des filtres actifs
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.selectedCategory) count++;
    if (filters.condition) count++;
    if (filters.brand) count++;
    if (filters.minValue || filters.maxValue) count++;
    if (filters.availableFrom || filters.availableTo) count++;
    if (filters.hasImages) count++;
    if (filters.tags) count++;
    if (filters.favoritesOnly) count++;
    if (filters.offerType) count++;
    return count;
  }, [filters]);

  // Fonctions de mise à jour des filtres
  const updateFilter = useCallback((key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Réinitialisation des filtres
  const resetFilters = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      selectedCategory: undefined,
      condition: undefined,
      brand: '',
      minValue: '',
      maxValue: '',
      availableFrom: '',
      availableTo: '',
      hasImages: false,
      tags: '',
      favoritesOnly: false,
      offerType: undefined,
    }));
  }, []);

  // Synchronisation avec l'URL
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    
    if (filters.search) params.set('search', filters.search);
    if (filters.selectedCategory) params.set('category', filters.selectedCategory);
    if (filters.condition) params.set('condition', filters.condition);
    if (filters.brand) params.set('brand', filters.brand);
    if (filters.minValue) params.set('minValue', filters.minValue);
    if (filters.maxValue) params.set('maxValue', filters.maxValue);
    if (filters.availableFrom) params.set('availableFrom', filters.availableFrom);
    if (filters.availableTo) params.set('availableTo', filters.availableTo);
    if (filters.hasImages) params.set('hasImages', 'true');
    if (filters.tags) params.set('tags', filters.tags);
    if (filters.favoritesOnly) params.set('favoritesOnly', 'true');
    if (filters.offerType) params.set('offerType', filters.offerType);
    if (filters.sortBy !== 'newest') params.set('sortBy', filters.sortBy);
    if (filters.viewMode !== 'grid') params.set('viewMode', filters.viewMode);

    const newSearch = params.toString();
    if (newSearch !== location.search.slice(1)) {
      navigate({ search: newSearch }, { replace: true });
    }
  }, [filters, location.search, navigate]);

  // Lecture des paramètres URL au chargement
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    setFilters(prev => ({
      ...prev,
      search: params.get('search') || '',
      selectedCategory: params.get('category') as ItemCategory || undefined,
      condition: params.get('condition') || undefined,
      brand: params.get('brand') || '',
      minValue: params.get('minValue') || '',
      maxValue: params.get('maxValue') || '',
      availableFrom: params.get('availableFrom') || '',
      availableTo: params.get('availableTo') || '',
      hasImages: params.get('hasImages') === 'true',
      tags: params.get('tags') || '',
      favoritesOnly: params.get('favoritesOnly') === 'true',
      offerType: params.get('offerType') as OfferType || undefined,
      sortBy: (params.get('sortBy') as SortOption) || 'newest',
      viewMode: (params.get('viewMode') as ViewMode) || 'grid',
    }));
  }, [location.search]);

  // Mise à jour de l'URL quand les filtres changent
  useEffect(() => {
    updateURL();
  }, [updateURL]);

  return {
    // États
    filters,
    isLoading,
    items,
    sortedItems,
    activeFiltersCount,
    showFilters,
    
    // Actions
    setSearch: (search: string) => updateFilter('search', search),
    setSelectedCategory: (category: ItemCategory | undefined) => updateFilter('selectedCategory', category),
    setCondition: (condition: string | undefined) => updateFilter('condition', condition),
    setBrand: (brand: string) => updateFilter('brand', brand),
    setMinValue: (value: string) => updateFilter('minValue', value),
    setMaxValue: (value: string) => updateFilter('maxValue', value),
    setAvailableFrom: (date: string) => updateFilter('availableFrom', date),
    setAvailableTo: (date: string) => updateFilter('availableTo', date),
    setHasImages: (hasImages: boolean) => updateFilter('hasImages', hasImages),
    setIsAvailable: (isAvailable: boolean) => updateFilter('isAvailable', isAvailable),
    setTags: (tags: string) => updateFilter('tags', tags),
    setFavoritesOnly: (favoritesOnly: boolean) => updateFilter('favoritesOnly', favoritesOnly),
    setOfferType: (offerType: OfferType | undefined) => updateFilter('offerType', offerType),
    setSortBy: (sortBy: SortOption) => updateFilter('sortBy', sortBy),
    setViewMode: (viewMode: ViewMode) => updateFilter('viewMode', viewMode),
    setShowFilters,
    
    // Utilitaires
    resetFilters,
    refetch,
    updateURL,
  };
};
