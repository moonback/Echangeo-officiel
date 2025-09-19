import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, Plus, Users, TrendingUp, MapPin, Calendar, 
  Filter, Grid, List, Star, Shield, Zap, Heart, RefreshCw
} from 'lucide-react';
import { useCommunities } from '../hooks/useCommunities';
import CommunityCard from '../components/CommunityCard';
import CommunitiesFiltersModal from '../components/CommunitiesFiltersModal';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/EmptyState';
import { useAppStats } from '../hooks/useStats';

const CommunitiesPage: React.FC = () => {
  const { data: communities, isLoading } = useCommunities();
  const { data: appStats } = useAppStats();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortBy, setSortBy] = React.useState<'members' | 'activity' | 'name' | 'distance'>('members');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [showFiltersModal, setShowFiltersModal] = React.useState(false);
  const [selectedCity, setSelectedCity] = React.useState('');
  const [minMembers, setMinMembers] = React.useState(0);

  const filteredCommunities = React.useMemo(() => {
    let filtered = communities || [];

    // Filtrage par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(community =>
        community.name.toLowerCase().includes(query) ||
        community.city.toLowerCase().includes(query) ||
        community.description?.toLowerCase().includes(query)
      );
    }

    // Filtrage par ville
    if (selectedCity) {
      filtered = filtered.filter(community =>
        community.city.toLowerCase().includes(selectedCity.toLowerCase())
      );
    }

    // Filtrage par nombre minimum de membres
    if (minMembers > 0) {
      filtered = filtered.filter(community =>
        (community.stats?.total_members || 0) >= minMembers
      );
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'members':
          return (b.stats?.total_members || 0) - (a.stats?.total_members || 0);
        case 'activity':
          return new Date(b.stats?.last_activity || 0).getTime() - new Date(a.stats?.last_activity || 0).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'distance':
          // Pour l'instant, tri par nom si pas de géolocalisation
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [communities, searchQuery, sortBy, selectedCity, minMembers]);

  // Récupérer les villes uniques pour le filtre
  const cities = React.useMemo(() => {
    const citySet = new Set(communities?.map(c => c.city) || []);
    return Array.from(citySet).sort();
  }, [communities]);

  // Compter les filtres actifs
  const activeFiltersCount = React.useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedCity) count++;
    if (minMembers > 0) count++;
    return count;
  }, [searchQuery, selectedCity, minMembers]);

  // Gestion des filtres
  const handleFilterChange = (key: string, value: any) => {
    switch (key) {
      case 'search':
        setSearchQuery(value);
        break;
      case 'sortBy':
        setSortBy(value);
        break;
      case 'viewMode':
        setViewMode(value);
        break;
      case 'selectedCity':
        setSelectedCity(value);
        break;
      case 'minMembers':
        setMinMembers(value);
        break;
      default:
        break;
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCity('');
    setMinMembers(0);
    setSortBy('members');
  };

  const handleApplyFilters = () => {
    setShowFiltersModal(false);
  };

  const currentFilters = {
    search: searchQuery,
    sortBy,
    viewMode,
    selectedCity,
    minMembers
  };

  if (isLoading) {
    return (
      <div className="p-4 max-w-12xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="animate-pulse"
        >
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="h-10 bg-gray-200 rounded-lg w-64 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-96"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded-lg w-40"></div>
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-gray-50 rounded-xl">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Filters Skeleton */}
          <div className="mb-6">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="h-12 bg-gray-200 rounded-xl"></div>
                <div className="h-12 bg-gray-200 rounded-xl"></div>
                <div className="h-12 bg-gray-200 rounded-xl"></div>
                <div className="h-12 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>

          {/* Communities Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-6 bg-gray-50 rounded-xl">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Sticky Header */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="sticky top-16 z-10 bg-gray-50/80 backdrop-blur-sm border-b border-gray-200/50 -mx-4 px-4 py-6 mb-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  Quartiers
                </h1>
                <p className="text-gray-600 text-lg">
                  Rejoignez votre quartier et participez à l'économie collaborative
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link to="/map">
                  <Button variant="secondary" size="sm" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Voir sur la carte
                  </Button>
                </Link>
                <Link to="/communities/create">
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Créer un quartier
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Stats Overview */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8"
          >
            <Card className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center group">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900 block">
                    {communities?.length || 0}
                  </span>
                  <span className="text-sm text-gray-600">Quartiers actifs</span>
                  {appStats && (
                    <div className="text-xs text-gray-500 mt-1">
                      {appStats.totalCommunities} total
                    </div>
                  )}
                </div>
                <div className="text-center group">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900 block">
                    {communities?.reduce((sum, c) => sum + (c.stats?.total_members || 0), 0) || 0}
                  </span>
                  <span className="text-sm text-gray-600">Membres total</span>
                </div>
                <div className="text-center group">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900 block">
                    {communities?.reduce((sum, c) => sum + (c.stats?.total_exchanges || 0), 0) || 0}
                  </span>
                  <span className="text-sm text-gray-600">Échanges réalisés</span>
                </div>
                <div className="text-center group">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900 block">
                    {communities?.reduce((sum, c) => sum + (c.stats?.total_events || 0), 0) || 0}
                  </span>
                  <span className="text-sm text-gray-600">Événements</span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Compact Header */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
              {/* Search Toggle */}
              <button
                onClick={() => setSearchQuery(searchQuery ? '' : ' ')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Rechercher"
              >
                <Search className="w-4 h-4 text-gray-600" />
              </button>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <TrendingUp className="text-brand-600" size={14} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'members' | 'activity' | 'name' | 'distance')}
                  className="bg-transparent border-0 text-sm font-medium text-gray-700 focus:ring-0"
                >
                  <option value="members">Membres</option>
                  <option value="activity">Activité</option>
                  <option value="name">Nom</option>
                  <option value="distance">Distance</option>
                </select>
              </div>

              {/* View Mode */}
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white text-brand-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Grid size={14} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-brand-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <List size={14} />
                </button>
              </div>

              {/* Filters */}
              <button
                onClick={() => setShowFiltersModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
              >
                <Filter size={14} />
                <span className="text-sm font-medium">Filtres</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-brand-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Results Count */}
              <div className="ml-auto bg-brand-50 px-2 py-1 rounded-md border border-brand-200">
                <span className="text-sm font-medium text-brand-700">
                  {filteredCommunities.length} quartier{filteredCommunities.length > 1 ? 's' : ''}
                </span>
              </div>

              {/* Refresh */}
              <button
                onClick={() => window.location.reload()}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Actualiser"
              >
                <RefreshCw className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Search Bar */}
            <AnimatePresence>
              {searchQuery && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3"
                >
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher un quartier..."
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200 text-sm"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        {/* Communities Grid/List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {filteredCommunities.length > 0 ? (
            <div className={`${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-4'
            }`}>
              <AnimatePresence mode="wait">
                {filteredCommunities.map((community, index) => (
                  <motion.div
                    key={community.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    layout
                  >
                    <CommunityCard
                      community={community}
                      viewMode={viewMode}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <EmptyState
              icon={<Users className="w-16 h-16 mx-auto text-gray-400" />}
              title="Aucun quartier trouvé"
              description={
                searchQuery || selectedCity || minMembers > 0 ? 
                  `Aucun quartier ne correspond à vos critères de recherche` : 
                  "Il n'y a pas encore de quartier actif dans votre région"
              }
              action={
                <div className="space-y-3">
                  {(searchQuery || selectedCity || minMembers > 0) && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCity('');
                        setMinMembers(0);
                      }}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Effacer les filtres
                    </button>
                  )}
                  <Link to="/communities/create">
                    <Button className="flex items-center gap-2">
                      <Plus size={16} />
                      Créer un quartier
                    </Button>
                  </Link>
                </div>
              }
            />
          )}
        </motion.div>

          {/* Quick Actions */}
          {filteredCommunities.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-12"
            >
              <Card className="p-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Vous ne trouvez pas votre quartier ?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Créez votre propre communauté de quartier et invitez vos voisins à rejoindre l'économie collaborative
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/communities/create">
                      <Button className="flex items-center gap-2">
                        <Plus size={16} />
                        Créer un quartier
                      </Button>
                    </Link>
                    <Link to="/map">
                      <Button variant="secondary" className="flex items-center gap-2">
                        <MapPin size={16} />
                        Voir sur la carte
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Filters Modal */}
      <CommunitiesFiltersModal
        isOpen={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        filters={currentFilters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        onApplyFilters={handleApplyFilters}
        activeFiltersCount={activeFiltersCount}
        filteredCount={filteredCommunities.length}
        cities={cities}
      />
    </div>
  );
};

export default CommunitiesPage;
