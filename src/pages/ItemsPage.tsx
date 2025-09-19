import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Image } from 'lucide-react';
import { useItemFilters } from '../hooks/useItemFilters';
import ItemCard from '../components/ItemCard';
import { ItemCardSkeleton } from '../components/SkeletonLoader';
import SearchBar from '../components/SearchBar';
import ViewControls from '../components/ViewControls';
import FiltersPanel from '../components/FiltersPanel';
import FiltersDrawer from '../components/FiltersDrawer';
import EmptyStateEnhanced from '../components/EmptyStateEnhanced';
import { useMediaQuery } from '../hooks/useMediaQuery';
import Button from '../components/ui/Button';

const ItemsPage: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  
  const {
    filters,
    isLoading,
    sortedItems,
    activeFiltersCount,
    showFilters,
    setSearch,
    setSelectedCategory,
    setCondition,
    setBrand,
    setMinValue,
    setMaxValue,
    setAvailableFrom,
    setAvailableTo,
    setHasImages,
    setIsAvailable,
    setTags,
    setFavoritesOnly,
    setSortBy,
    setViewMode,
    setShowFilters,
    resetFilters,
    refetch,
  } = useItemFilters();

  const handleFilterChange = (key: keyof typeof filters, value: string | boolean | undefined) => {
    switch (key) {
      case 'selectedCategory':
        setSelectedCategory(value as typeof filters.selectedCategory);
        break;
      case 'condition':
        setCondition(value as typeof filters.condition);
        break;
      case 'brand':
        setBrand(value as typeof filters.brand);
        break;
      case 'minValue':
        setMinValue(value as typeof filters.minValue);
        break;
      case 'maxValue':
        setMaxValue(value as typeof filters.maxValue);
        break;
      case 'availableFrom':
        setAvailableFrom(value as typeof filters.availableFrom);
        break;
      case 'availableTo':
        setAvailableTo(value as typeof filters.availableTo);
        break;
      case 'hasImages':
        setHasImages(value as typeof filters.hasImages);
        break;
      case 'isAvailable':
        setIsAvailable(value as typeof filters.isAvailable);
        break;
      case 'tags':
        setTags(value as typeof filters.tags);
        break;
      case 'favoritesOnly':
        setFavoritesOnly(value as typeof filters.favoritesOnly);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="p-4 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-2xl font-bold text-gray-900">
              Parcourir les objets
            </h1>

            {/* Search Bar */}
            <SearchBar
              value={filters.search}
              onChange={setSearch}
              isLoading={isLoading}
              placeholder="Rechercher un objet..."
            />

            {/* Controls */}
            <ViewControls
              sortBy={filters.sortBy}
              viewMode={filters.viewMode}
              activeFiltersCount={activeFiltersCount}
              showFilters={showFilters}
              onSortChange={setSortBy}
              onViewModeChange={setViewMode}
              onToggleFilters={() => setShowFilters(!showFilters)}
              onRefresh={refetch}
              isLoading={isLoading}
            />
          </motion.div>
        </div>
      </div>

      <div className="p-4 max-w-7xl mx-auto">

        {/* Filters */}
        {!isMobile ? (
          <FiltersPanel
            filters={filters}
            activeFiltersCount={activeFiltersCount}
            onFilterChange={handleFilterChange}
            onResetFilters={resetFilters}
          />
        ) : (
          <FiltersDrawer
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
            filters={filters}
            activeFiltersCount={activeFiltersCount}
            onFilterChange={handleFilterChange}
            onResetFilters={resetFilters}
          />
        )}

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              {filters.search || filters.selectedCategory || activeFiltersCount > 0 ? (
                <p className="text-gray-600">
                  {sortedItems?.length || 0} résultat(s) 
                  {filters.search && ` pour "${filters.search}"`}
                  {filters.selectedCategory && ` dans "${filters.selectedCategory}"`}
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
                  <Image size={14} />
                  {sortedItems.filter(item => item.images && item.images.length > 0).length} avec photos
                </span>
              </div>
            )}
          </div>

          {/* Results Grid/List */}
          <div className={filters.viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {isLoading ? (
              <ItemCardSkeleton count={8} />
            ) : sortedItems && sortedItems.length > 0 ? (
              sortedItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -2 }}
                >
                  <ItemCard 
                    item={item} 
                    className={filters.viewMode === 'list' ? 'flex flex-row items-center space-x-4' : ''}
                  />
                </motion.div>
              ))
            ) : (
              <EmptyStateEnhanced
                title="Aucun objet trouvé"
                description="Essayez de modifier vos critères de recherche ou réinitialisez les filtres."
                className="col-span-full"
                suggestions={[
                  'Réinitialiser les filtres',
                  'Changer de catégorie',
                  'Modifier la recherche',
                  'Voir tous les objets'
                ]}
                onSuggestionClick={(suggestion) => {
                  if (suggestion === 'Réinitialiser les filtres') {
                    resetFilters();
                  } else if (suggestion === 'Voir tous les objets') {
                    resetFilters();
                  }
                }}
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
    </div>
  );
};

export default ItemsPage;
