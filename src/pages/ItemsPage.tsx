import React, { useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Plus, Filter, TrendingUp, RefreshCw, Search } from 'lucide-react';
import { useItemFilters } from '../hooks/useItemFilters';
import { useGeolocation } from '../hooks/useGeolocation';
import ItemCard from '../components/ItemCard';
import { ItemCardSkeleton } from '../components/SkeletonLoader';
import SearchBar from '../components/SearchBar';
import FiltersModal from '../components/FiltersModal';
import EmptyStateEnhanced from '../components/EmptyStateEnhanced';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const ItemsPage: React.FC = () => {
  const [showSearch, setShowSearch] = React.useState(false);
  const [itemsToShow, setItemsToShow] = React.useState(20); // Limite initiale
  
  // Géolocalisation de l'utilisateur
  const { userLocation, getCurrentLocation } = useGeolocation();
  
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
    setOfferType,
    setSortBy,
    setViewMode,
    setShowFilters,
    resetFilters,
    refetch,
  } = useItemFilters();

  // Récupérer la position de l'utilisateur au chargement
  React.useEffect(() => {
    if (!userLocation) {
      getCurrentLocation().catch((error) => {
        console.log('Géolocalisation non disponible:', error.message);
      });
    }
  }, [userLocation, getCurrentLocation]);

  // Afficher automatiquement la recherche si un terme est déjà présent
  React.useEffect(() => {
    if (filters.search && !showSearch) {
      setShowSearch(true);
    }
  }, [filters.search, showSearch]);

  // Optimisation: mémorisation des statistiques des objets
  const itemsStats = useMemo(() => {
    if (!sortedItems) return { total: 0, withImages: 0 };
    
    const withImages = sortedItems.filter(item => item.images && item.images.length > 0).length;
    return {
      total: sortedItems.length,
      withImages
    };
  }, [sortedItems]);

  // Optimisation: objets à afficher avec pagination
  const displayedItems = useMemo(() => {
    if (!sortedItems) return [];
    return sortedItems.slice(0, itemsToShow);
  }, [sortedItems, itemsToShow]);

  // Reset pagination quand les filtres changent
  React.useEffect(() => {
    setItemsToShow(20);
  }, [filters.search, filters.selectedCategory, filters.offerType, activeFiltersCount]);

  // Optimisation: handlers mémorisés
  const handleSearchToggle = useCallback(() => {
    setShowSearch(!showSearch);
  }, [showSearch]);

  const handleFiltersToggle = useCallback(() => {
    setShowFilters(!showFilters);
  }, [showFilters, setShowFilters]);

  const handleCreateItem = useCallback(() => {
    window.location.href = '/create';
  }, []);

  const handleRequestsPage = useCallback(() => {
    window.location.href = '/requests';
  }, []);

  const handleLoadMore = useCallback(() => {
    setItemsToShow(prev => prev + 20);
  }, []);

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
      case 'offerType':
        setOfferType(value as typeof filters.offerType);
        break;
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-3 sm:p-4 max-w-12xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-6"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Parcourir les objets</h1>
                <p className="text-gray-600 text-base sm:text-lg">Découvrez les objets disponibles dans votre quartier</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Button variant="secondary" size="sm" onClick={refetch} disabled={isLoading} className="flex items-center gap-2 w-full sm:w-auto">
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Actualiser
                </Button>
                <Button className="flex items-center gap-2 w-full sm:w-auto" onClick={handleCreateItem}>
                  <Plus className="w-4 h-4" /> Publier un objet
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Sticky Search and Controls */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="sticky top-16 z-10 bg-gray-50/90 backdrop-blur-sm border-b border-gray-200/50 -mx-3 sm:-mx-4 px-3 sm:px-4 py-3 mb-6"
          >
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Search Toggle Button - Simple Icon */}
              <button
                onClick={handleSearchToggle}
                className={`p-2 rounded-lg transition-colors ${
                  showSearch 
                    ? 'bg-brand-100 text-brand-600' 
                    : 'text-gray-600 hover:text-brand-600 hover:bg-brand-50'
                }`}
                title={showSearch ? 'Masquer la recherche' : 'Afficher la recherche'}
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Search Bar - Conditionally Rendered */}
              <AnimatePresence>
                {showSearch && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 max-w-md"
                  >
                    <SearchBar 
                      value={filters.search} 
                      onChange={setSearch} 
                      isLoading={isLoading} 
                      placeholder="Rechercher un objet..." 
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <TrendingUp className="text-brand-600" size={16} />
                <select
                  value={filters.sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'value_asc' | 'value_desc' | 'title_asc' | 'title_desc')}
                  className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200 min-w-[120px] sm:min-w-[140px]"
                >
                  <option value="newest">Plus récent</option>
                  <option value="oldest">Plus ancien</option>
                  <option value="value_asc">Prix croissant</option>
                  <option value="value_desc">Prix décroissant</option>
                  <option value="title_asc">Nom A-Z</option>
                  <option value="title_desc">Nom Z-A</option>
                </select>
              </div>

              {/* Offer Type Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-0.5 sm:p-1">
                <button
                  onClick={() => setOfferType(undefined)}
                  className={`px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-medium transition-colors ${
                    !filters.offerType 
                      ? 'bg-white text-brand-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Tous
                </button>
                <button
                  onClick={() => setOfferType('loan')}
                  className={`px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-medium transition-colors ${
                    filters.offerType === 'loan' 
                      ? 'bg-white text-brand-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Prêt
                </button>
                <button
                  onClick={() => setOfferType('trade')}
                  className={`px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-medium transition-colors ${
                    filters.offerType === 'trade' 
                      ? 'bg-white text-brand-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Échange
                </button>
                <button
                  onClick={() => setOfferType('donation')}
                  className={`px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-medium transition-colors ${
                    filters.offerType === 'donation' 
                      ? 'bg-white text-brand-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Don
                </button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-0.5 sm:p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1 sm:p-1.5 rounded-md transition-colors ${
                    filters.viewMode === 'grid' 
                      ? 'bg-white text-brand-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Vue grille"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1 sm:p-1.5 rounded-md transition-colors ${
                    filters.viewMode === 'list' 
                      ? 'bg-white text-brand-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Vue liste"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Filters Button */}
              <button
                onClick={handleFiltersToggle}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
              >
                <Filter size={14} className="sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium">Filtres</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-brand-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Refresh Button */}
              <button
                onClick={refetch}
                disabled={isLoading}
                className="p-2 text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors disabled:opacity-50"
                title="Actualiser"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>

              {/* Active Search Indicator */}
              {filters.search && (
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  Recherche active
                </span>
              )}
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-6"
          >
            <FiltersModal
              isOpen={showFilters}
              onClose={() => setShowFilters(false)}
              filters={filters}
              activeFiltersCount={activeFiltersCount}
              onFilterChange={handleFilterChange}
              onResetFilters={resetFilters}
            />
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                {filters.search || filters.selectedCategory || activeFiltersCount > 0 ? (
                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-gray-900">
                      {itemsStats.total} résultat{itemsStats.total > 1 ? 's' : ''}
                    </p>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                      {filters.search && (
                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                      Recherche: &quot;{filters.search}&quot;
                    </span>
                      )}
                      {filters.selectedCategory && (
                        <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full">
                          Catégorie: {filters.selectedCategory}
                        </span>
                      )}
                      {activeFiltersCount > 0 && (
                        <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
                          {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-lg font-semibold text-gray-900">
                      {itemsStats.total} objet{itemsStats.total > 1 ? 's' : ''} disponible{itemsStats.total > 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-gray-600">
                      Tous les objets disponibles dans votre région
                    </p>
                  </div>
                )}
              </div>
              
              {/* Quick Actions */}
              {sortedItems && sortedItems.length > 0 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    
                    <span className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full">
                      <Image size={14} />
                      {itemsStats.withImages} avec photos
                    </span>
                  </div>
                  {activeFiltersCount > 0 && (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={resetFilters}
                      className="flex items-center gap-2"
                    >
                      <Filter size={14} />
                      Réinitialiser
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Results Grid/List */}
            <div className={filters.viewMode === 'grid' 
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4'
              : 'space-y-3 sm:space-y-4'
            }>
              {isLoading ? (
                <ItemCardSkeleton count={8} />
              ) : displayedItems && displayedItems.length > 0 ? (
                <AnimatePresence mode="wait">
                  {displayedItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      layout
                    >
                      <ItemCard 
                        item={item} 
                        userLocation={userLocation || undefined}
                        priority={index < 6} // Lazy loading optimisé pour les 6 premières cartes
                        className={filters.viewMode === 'list' ? 'flex flex-row items-center space-x-4' : ''}
                        showOwnerActions={true}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
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

            {/* Bouton "Voir plus" si nécessaire */}
            {sortedItems && sortedItems.length > itemsToShow && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-center"
              >
                <Button 
                  variant="secondary" 
                  onClick={handleLoadMore}
                  className="flex items-center gap-2"
                >
                  Voir plus d'objets ({sortedItems.length - itemsToShow} restants)
                </Button>
              </motion.div>
            )}
          </motion.div>

          {/* Quick Actions */}
          {sortedItems && sortedItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-12"
            >
              <Card className="p-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Vous ne trouvez pas ce que vous cherchez ?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Publiez votre propre objet ou demandez à la communauté ce dont vous avez besoin
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      className="flex items-center gap-2"
                      onClick={handleCreateItem}
                    >
                      <Plus size={16} />
                      Publier un objet
                    </Button>
                    <Button 
                      variant="secondary" 
                      className="flex items-center gap-2"
                      onClick={handleRequestsPage}
                    >
                      <TrendingUp size={16} />
                      Faire une demande
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ItemsPage;
