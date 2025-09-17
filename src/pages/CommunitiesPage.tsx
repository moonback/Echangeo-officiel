import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Plus, Users, TrendingUp } from 'lucide-react';
import { useCommunities } from '../hooks/useCommunities';
import CommunityCard from '../components/CommunityCard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/EmptyState';

const CommunitiesPage: React.FC = () => {
  const { data: communities, isLoading } = useCommunities();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortBy, setSortBy] = React.useState<'members' | 'activity' | 'name'>('members');

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

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'members':
          return (b.stats?.total_members || 0) - (a.stats?.total_members || 0);
        case 'activity':
          return new Date(b.stats?.last_activity || 0).getTime() - new Date(a.stats?.last_activity || 0).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [communities, searchQuery, sortBy]);

  if (isLoading) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
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
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 gradient-text">
          Quartiers
        </h1>
              <p className="text-gray-600 text-lg">
                Rejoignez votre quartier et participez à l'économie collaborative
              </p>
            </div>
            <Link to="/communities/create">
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Créer un quartier
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <Card className="p-6 glass-card">
            <div className="flex flex-row items-center justify-between gap-6">
              <div className="flex flex-col items-center flex-1">
                <span className="text-3xl font-bold text-brand-600">
                  {communities?.length || 0}
                </span>
                <span className="text-sm text-gray-600 mt-1">Quartiers actifs</span>
              </div>
              <div className="flex flex-col items-center flex-1">
                <span className="text-3xl font-bold text-green-600">
                  {communities?.reduce((sum, c) => sum + (c.stats?.total_members || 0), 0) || 0}
                </span>
                <span className="text-sm text-gray-600 mt-1">Membres total</span>
              </div>
              <div className="flex flex-col items-center flex-1">
                <span className="text-3xl font-bold text-blue-600">
                  {communities?.reduce((sum, c) => sum + (c.stats?.total_exchanges || 0), 0) || 0}
                </span>
                <span className="text-sm text-gray-600 mt-1">Échanges réalisés</span>
              </div>
              <div className="flex flex-col items-center flex-1">
                <span className="text-3xl font-bold text-purple-600">
                  {communities?.reduce((sum, c) => sum + (c.stats?.total_events || 0), 0) || 0}
                </span>
                <span className="text-sm text-gray-600 mt-1">Événements organisés</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-6"
        >
          <Card className="p-4 glass-card">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un quartier..."
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-300/60 bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all duration-200"
                />
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <TrendingUp className="text-brand-600" size={16} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'members' | 'activity' | 'name')}
                  className="flex-1 bg-white/60 backdrop-blur-sm border border-gray-300/60 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all duration-200"
                >
                  <option value="members">Par nombre de membres</option>
                  <option value="activity">Par activité récente</option>
                  <option value="name">Par nom</option>
                </select>
              </div>

              {/* Results count */}
              <div className="flex items-center justify-end">
                <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50">
                  <span className="text-sm font-medium text-gray-700">
                    {filteredCommunities.length} quartier{filteredCommunities.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Communities Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {filteredCommunities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCommunities.map((community) => (
                <CommunityCard
                  key={community.id}
                  community={community}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Users className="w-12 h-12 mx-auto" />}
              title="Aucun quartier trouvé"
              description={searchQuery ? 
                `Aucun quartier ne correspond à "${searchQuery}"` : 
                "Il n'y a pas encore de quartier actif"
              }
              action={
                <Link to="/communities/create">
                  <Button>Créer le premier quartier</Button>
                </Link>
              }
            />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CommunitiesPage;
