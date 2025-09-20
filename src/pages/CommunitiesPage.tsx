import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, Plus, Users, TrendingUp, 
  Filter, Grid, List, RefreshCw, Star
} from 'lucide-react';
import { useCommunities } from '../hooks/useCommunities';
import CommunityCard from '../components/CommunityCard';
import CommunitiesFiltersModal from '../components/CommunitiesFiltersModal';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/40 relative overflow-hidden">
      {/* Background Ultra-Moderne */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Grille subtile */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px] opacity-30" />
        
        {/* Dégradés radiaux animés */}
        <motion.div 
          className="absolute top-10 left-10 w-[600px] h-[600px] bg-gradient-radial from-brand-200/20 via-brand-300/10 to-transparent rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-gradient-radial from-emerald-200/20 via-teal-300/10 to-transparent rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4],
            x: [0, -40, 0],
            y: [0, 20, 0]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        
        {/* Éléments flottants */}
        <motion.div 
          className="absolute top-20 right-1/4 w-4 h-4 bg-brand-400/40 rounded-full"
          animate={{ 
            y: [0, -20, 0],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/3 left-1/3 w-6 h-6 bg-emerald-400/30 rounded-full"
          animate={{ 
            y: [0, 15, 0],
            x: [0, 10, 0],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      <div className="relative p-4 max-w-12xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Header fixe */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-4"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl shadow-md">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <motion.h1 
                        className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-brand-600 to-slate-900 bg-clip-text text-transparent leading-tight"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        Quartiers
                      </motion.h1>
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-brand-50 rounded-full border border-brand-200/50">
                        <Users className="text-brand-600" size={12} />
                        <span className="text-xs font-semibold text-brand-700">
                          {filteredCommunities.length} trouvé{filteredCommunities.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Rejoignez votre quartier et participez à l'économie collaborative
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/communities/create">
                  <Button 
                    size="md"
                    leftIcon={<Plus className="w-4 h-4" />}
                    className="shadow-md hover:shadow-lg"
                  >
                    Créer un quartier
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>


          {/* Barre de recherche sticky */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="sticky top-16 z-10 mb-4"
          >
            <Card className="p-4 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl">
              <div className="flex items-center gap-3">
                {/* Barre de recherche principale */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher un quartier..."
                      className="input w-full pl-9 pr-3 py-2 text-sm"
                    />
                  </div>
                </div>

                {/* Tri */}
                <div className="flex items-center gap-1">
                  <TrendingUp className="text-brand-600" size={14} />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'members' | 'activity' | 'name' | 'distance')}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <option value="members">Plus de membres</option>
                    <option value="activity">Plus actif</option>
                    <option value="name">A-Z</option>
                  </select>
                </div>

                {/* Mode d'affichage */}
                <div className="flex bg-gray-100 rounded-lg p-0.5 shadow-sm">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-all duration-200 ${
                      viewMode === 'grid' 
                        ? 'bg-white text-brand-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                    title="Vue grille"
                  >
                    <Grid size={14} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-all duration-200 ${
                      viewMode === 'list' 
                        ? 'bg-white text-brand-600 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                    title="Vue liste"
                  >
                    <List size={14} />
                  </button>
                </div>

                {/* Filtres avancés */}
                <Button
                  onClick={() => setShowFiltersModal(true)}
                  variant="ghost"
                  size="sm"
                  leftIcon={<Filter size={14} />}
                  rightIcon={activeFiltersCount > 0 ? (
                    <span className="bg-brand-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  ) : undefined}
                  className="text-xs px-3 py-1.5"
                >
                  Filtres
                </Button>

                {/* Bouton actualiser */}
                <button
                  onClick={() => window.location.reload()}
                  title="Actualiser"
                  className="p-1.5 rounded-lg text-gray-500 hover:text-brand-600 hover:bg-brand-50 transition-all duration-200"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            </Card>

          </motion.div>

        {/* Communities Grid/List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-6"
        >
          {filteredCommunities.length > 0 ? (
            <div className={`${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' 
                : 'space-y-3'
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
                    className="group"
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
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-8 text-center bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl">
                <div className="max-w-sm mx-auto">
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Users className="w-8 h-8 text-white" />
                  </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Aucun quartier trouvé
                </h3>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  {searchQuery || selectedCity || minMembers > 0 ? 
                    `Aucun quartier ne correspond à vos critères de recherche` : 
                    "Il n'y a pas encore de quartier actif dans votre région"}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {(searchQuery || selectedCity || minMembers > 0) && (
                    <Button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCity('');
                        setMinMembers(0);
                      }}
                      variant="ghost"
                      size="sm"
                      className="hover:bg-brand-50 hover:text-brand-700"
                    >
                      Effacer les filtres
                    </Button>
                  )}
                  <Link to="/communities/create">
                    <Button 
                      size="sm"
                      leftIcon={<Plus size={14} />}
                      className="shadow-md hover:shadow-lg"
                    >
                      Créer un quartier
                    </Button>
                  </Link>
                </div>
              </div>
              </Card>
            </motion.div>
          )}
        </motion.div>

          {/* Actions rapides */}
          {filteredCommunities.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-6"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="p-6 bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Vous ne trouvez pas votre quartier ?
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-xl mx-auto text-sm leading-relaxed">
                    Créez votre propre communauté de quartier et invitez vos voisins à rejoindre l'économie collaborative. 
                    C'est gratuit et cela ne prend que quelques minutes !
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to="/communities/create">
                      <Button 
                        size="sm"
                        leftIcon={<Plus size={14} />}
                        className="shadow-md hover:shadow-lg"
                      >
                        Créer mon quartier
                      </Button>
                    </Link>
                    <Link to="/help">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        leftIcon={<Users size={14} />}
                        className="shadow-md hover:shadow-lg"
                      >
                        Comment ça marche ?
                      </Button>
                    </Link>
                  </div>
                </div>
                </Card>
              </motion.div>
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
