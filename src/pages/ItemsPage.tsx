import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Grid, List, MapPin, RefreshCw } from 'lucide-react';
import { useItems } from '../hooks/useItems';
import { useAuthStore } from '../store/authStore';
import ItemCard from '../components/ItemCard';
import { ItemCardSkeleton } from '../components/SkeletonLoader';
import { categories, getCategoryIcon } from '../utils/categories';
import type { ItemCategory } from '../types';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/EmptyState';
import { useLocation } from 'react-router-dom';

type SortOption = 'newest' | 'oldest' | 'value_asc' | 'value_desc' | 'title_asc' | 'title_desc';
type ViewMode = 'grid' | 'list';

const ItemsPage: React.FC = () => {
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [condition, setCondition] = useState<string | undefined>();
  const [brand, setBrand] = useState('');
  const [minValue, setMinValue] = useState<string>('');
  const [maxValue, setMaxValue] = useState<string>('');
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableTo, setAvailableTo] = useState('');
  const [hasImages, setHasImages] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [tags, setTags] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const { user } = useAuthStore();

  const { data: items, isLoading, refetch } = useItems({ 
    category: selectedCategory, 
    search: search,
    condition,
    brand: brand || undefined,
    minValue: minValue !== '' ? Number(minValue) : undefined,
    maxValue: maxValue !== '' ? Number(maxValue) : undefined,
    availableFrom: availableFrom || undefined,
    availableTo: availableTo || undefined,
    hasImages: hasImages || undefined,
    isAvailable,
    tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
    favoritesOnly: favoritesOnly || undefined,
    userId: favoritesOnly ? user?.id : undefined,
  });

  // Tri des objets
  const sortedItems = useMemo(() => {
    if (!items) return [];
    
    const sorted = [...items].sort((a, b) => {
      switch (sortBy) {
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
  }, [items, sortBy]);

  // Statistiques des filtres actifs
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory) count++;
    if (condition) count++;
    if (brand) count++;
    if (minValue || maxValue) count++;
    if (availableFrom || availableTo) count++;
    if (hasImages) count++;
    if (tags) count++;
    if (favoritesOnly) count++;
    return count;
  }, [selectedCategory, condition, brand, minValue, maxValue, availableFrom, availableTo, hasImages, tags, favoritesOnly]);

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSelectedCategory(undefined);
    setCondition(undefined);
    setBrand('');
    setMinValue('');
    setMaxValue('');
    setAvailableFrom('');
    setAvailableTo('');
    setHasImages(false);
    setTags('');
    setFavoritesOnly(false);
  };

  // Initialize search from URL and react to URL changes (from Topbar)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('search') || '';
    setSearch(q);
  }, [location.search]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Parcourir les objets
        </h1>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un objet..." className="pl-10" />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Filter size={20} />
              <span>Filtres</span>
              {activeFiltersCount > 0 && (
                <Badge variant="brand" size="sm">
                  {activeFiltersCount}
                </Badge>
              )}
            </button>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Trier par:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="newest">Plus récents</option>
                <option value="oldest">Plus anciens</option>
                <option value="value_asc">Valeur croissante</option>
                <option value="value_desc">Valeur décroissante</option>
                <option value="title_asc">Titre A-Z</option>
                <option value="title_desc">Titre Z-A</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              >
                <List size={16} />
              </button>
            </div>

            {/* Refresh Button */}
            <Button
              onClick={() => refetch()}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Actualiser
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Category Filters */}
      <motion.div 
        initial={{ height: 0, opacity: 0 }} 
        animate={{ height: showFilters ? 'auto' : 0, opacity: showFilters ? 1 : 0 }} 
        className="overflow-hidden mb-6"
      >
        <Card className="p-4 space-y-4 glass">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">Filtres</p>
            {activeFiltersCount > 0 && (
              <Button
                onClick={resetFilters}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                Réinitialiser
              </Button>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Catégories</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(undefined)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !selectedCategory 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Toutes
                </button>
                {categories.map((category) => {
                  const Icon = getCategoryIcon(category.value);
                  return (
                    <button
                      key={category.value}
                      onClick={() => setSelectedCategory(category.value)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                        selectedCategory === category.value 
                          ? 'bg-brand-50 text-brand-700' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Icon size={16} />
                      <span>{category.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Favorites Filter */}
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input 
                  type="checkbox" 
                  checked={favoritesOnly} 
                  onChange={(e) => setFavoritesOnly(e.target.checked)}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                Mes favoris
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-sm text-gray-700 mb-1">État</label>
                <select 
                  value={condition || ''} 
                  onChange={(e) => setCondition(e.target.value || undefined)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Tous</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Bon</option>
                  <option value="fair">Correct</option>
                  <option value="poor">Usé</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Marque</label>
                <input 
                  value={brand} 
                  onChange={(e) => setBrand(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" 
                  placeholder="ex: Bosch" 
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Tags</label>
                <input 
                  value={tags} 
                  onChange={(e) => setTags(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" 
                  placeholder="ex: perceuse, 18v" 
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Valeur min (€)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={minValue} 
                  onChange={(e) => setMinValue(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" 
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Valeur max (€)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={maxValue} 
                  onChange={(e) => setMaxValue(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" 
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Disponible entre</label>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="date" 
                    value={availableFrom} 
                    onChange={(e) => setAvailableFrom(e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" 
                  />
                  <input 
                    type="date" 
                    value={availableTo} 
                    onChange={(e) => setAvailableTo(e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" 
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <label className="text-sm text-gray-700">Avec photos</label>
                <input 
                  type="checkbox" 
                  checked={hasImages} 
                  onChange={(e) => setHasImages(e.target.checked)}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
              </div>
              <div className="flex items-center space-x-3">
                <label className="text-sm text-gray-700">Disponibles</label>
                <input 
                  type="checkbox" 
                  checked={isAvailable} 
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Results Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            {search || selectedCategory || activeFiltersCount > 0 ? (
              <p className="text-gray-600">
                {sortedItems?.length || 0} résultat(s) 
                {search && ` pour "${search}"`}
                {selectedCategory && ` dans "${categories.find(c => c.value === selectedCategory)?.label}"`}
                {activeFiltersCount > 0 && ` avec ${activeFiltersCount} filtre(s)`}
              </p>
            ) : (
              <p className="text-gray-600">
                {sortedItems?.length || 0} objet(s) disponible(s)
              </p>
            )}
          </div>
          
          {/* Quick Stats */}
          {sortedItems && sortedItems.length > 0 && (
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {sortedItems.filter(item => item.latitude && item.longitude).length} avec localisation
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                {sortedItems.filter(item => item.images && item.images.length > 0).length} avec photos
              </span>
            </div>
          )}
        </div>

        {/* Results Grid/List */}
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
        }>
          {isLoading ? (
            <ItemCardSkeleton count={8} />
          ) : sortedItems && sortedItems.length > 0 ? (
            sortedItems.map((item) => (
              <ItemCard 
                key={item.id} 
                item={item} 
                className={viewMode === 'list' ? 'flex flex-row items-center space-x-4' : ''}
              />
            ))
          ) : (
            <EmptyState
              icon={<Search className="w-12 h-12" />}
              title="Aucun objet trouvé"
              description="Essayez de modifier vos critères de recherche ou réinitialisez les filtres."
              className="col-span-full"
              action={
                activeFiltersCount > 0 ? (
                  <Button onClick={resetFilters} variant="primary">
                    Réinitialiser les filtres
                  </Button>
                ) : undefined
              }
            />
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ItemsPage;
