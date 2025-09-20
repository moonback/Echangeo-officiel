import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, Plus, Users, TrendingUp, 
  Filter, Grid, List, RefreshCw, MapPin, Star
} from 'lucide-react';
import { useCommunities } from '../hooks/useCommunities';
import CommunityCard from '../components/CommunityCard';
import CommunitiesFiltersModal from '../components/CommunitiesFiltersModal';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/EmptyState';

const CommunitiesPage: React.FC = () => {
  const { data: communities, isLoading } = useCommunities();
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
  const handleFilterChange = (key: string, value: string | number) => {
    switch (key) {
      case 'search':
        setSearchQuery(value as string);
        break;
      case 'sortBy':
        setSortBy(value as 'members' | 'activity' | 'name' | 'distance');
        break;
      case 'viewMode':
        setViewMode(value as 'grid' | 'list');
        break;
      case 'selectedCity':
        setSelectedCity(value as string);
        break;
      case 'minMembers':
        setMinMembers(value as number);
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
            className="sticky top-16 z-10 bg-gray-50/80 backdrop-blur-sm border-b border-gray-200/50 -mx-4 px-4 mb-8"
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
                <Link to="/communities/create">
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Créer un quartier
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>


          {/* Barre de recherche simplifiée */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-6"
          >
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Barre de recherche principale */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher un quartier par nom, ville ou description..."
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Contrôles simplifiés */}
                <div className="flex items-center gap-3">
                  {/* Tri */}
                  <div className="flex items-center gap-2">
                    <TrendingUp className="text-brand-600" size={16} />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'members' | 'activity' | 'name' | 'distance')}
                      className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    >
                      <option value="members">Plus de membres</option>
                      <option value="activity">Plus actif</option>
                      <option value="name">A-Z</option>
                    </select>
                  </div>

                  {/* Mode d'affichage */}
                  <div className="flex bg-gray-100 rounded-lg p-0.5">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'grid' 
                          ? 'bg-white text-brand-600 shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      title="Vue grille"
                    >
                      <Grid size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'list' 
                          ? 'bg-white text-brand-600 shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      title="Vue liste"
                    >
                      <List size={16} />
                    </button>
                  </div>

                  {/* Filtres avancés */}
                  <button
                    onClick={() => setShowFiltersModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Filter size={16} />
                    <span className="text-sm font-medium">Filtres</span>
                    {activeFiltersCount > 0 && (
                      <span className="bg-brand-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Compteur de résultats */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="text-brand-600" size={16} />
                  <span className="text-sm font-medium text-gray-700">
                    {filteredCommunities.length} quartier{filteredCommunities.length > 1 ? 's' : ''} trouvé{filteredCommunities.length > 1 ? 's' : ''}
                  </span>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  title="Actualiser"
                >
                  <RefreshCw size={14} />
                  Actualiser
                </button>
              </div>
            </div>

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
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
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

          {/* Actions rapides */}
          {filteredCommunities.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-12"
            >
              <Card className="p-6 bg-gradient-to-br from-brand-50 to-blue-50 border-brand-200">
                <div className="text-center">
                  <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-brand-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Vous ne trouvez pas votre quartier ?
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    Créez votre propre communauté de quartier et invitez vos voisins à rejoindre l'économie collaborative. 
                    C'est gratuit et cela ne prend que quelques minutes !
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/communities/create">
                      <Button className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700">
                        <Plus size={16} />
                        Créer mon quartier
                      </Button>
                    </Link>
                    <Link to="/help">
                      <Button variant="secondary" className="flex items-center gap-2">
                        <Users size={16} />
                        Comment ça marche ?
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
