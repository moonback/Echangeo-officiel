import React from 'react';
import { motion } from 'framer-motion';
import { useNeighbours } from '../hooks/useProfiles';
import { useCommunities } from '../hooks/useCommunities';
import { Link } from 'react-router-dom';
import { Search, MapPin, MessageCircle, User, ExternalLink, SortAsc, Users } from 'lucide-react';
import MapboxMap from '../components/MapboxMap';
import Card from '../components/ui/Card';

const NeighboursPage: React.FC = () => {
  const { data, isLoading } = useNeighbours();
  const { data: communities } = useCommunities();
  
  // Debug temporaire
  React.useEffect(() => {
    if (communities) {
      console.log('Communities data:', communities);
      communities.forEach((c: any) => {
        console.log(`Community ${c.name}:`, {
          stats: c.stats,
          total_members: c.stats?.total_members,
          stats_type: typeof c.stats,
          stats_length: Array.isArray(c.stats) ? c.stats.length : 'not array'
        });
      });
    }
  }, [communities]);
  const [query, setQuery] = React.useState('');
  const [sortBy, setSortBy] = React.useState<'distance' | 'name'>('distance');
  const [userLoc, setUserLoc] = React.useState<{ lat: number; lng: number } | null>(null);
  const [hasCoordsOnly, setHasCoordsOnly] = React.useState(false);
  const [showCommunities, setShowCommunities] = React.useState(true);

  React.useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  }, []);

  const neighbors = React.useMemo(() => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const calcDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
      return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    let list = (data || []).map((p) => {
      const hasCoords = typeof (p as any).latitude === 'number' && typeof (p as any).longitude === 'number';
      const distanceKm = userLoc && hasCoords
        ? calcDistance(userLoc.lat, userLoc.lng, (p as any).latitude as number, (p as any).longitude as number)
        : null;
      return { ...p, _distanceKm: distanceKm } as any;
    });

    if (hasCoordsOnly) {
      list = list.filter((p: any) => typeof p.latitude === 'number' && typeof p.longitude === 'number');
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((p: any) => (
        (p.full_name || '').toLowerCase().includes(q) ||
        (p.email || '').toLowerCase().includes(q) ||
        (p.address || '').toLowerCase().includes(q)
      ));
    }

    if (sortBy === 'name') {
      list.sort((a: any, b: any) => (a.full_name || a.email || '').localeCompare(b.full_name || b.email || ''));
    } else {
      list.sort((a: any, b: any) => {
        const da = a._distanceKm ?? Number.POSITIVE_INFINITY;
        const db = b._distanceKm ?? Number.POSITIVE_INFINITY;
        return da - db;
      });
    }

    return list;
  }, [data, query, sortBy, userLoc?.lat, userLoc?.lng, hasCoordsOnly]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 gradient-text">
            Mes voisins
          </h1>
          <p className="text-gray-600 text-lg">Découvrez et connectez-vous avec votre communauté locale</p>
        </motion.div>

        {/* Enhanced Toolbar */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6"
        >
          <Card className="p-4 glass-card">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher un voisin (nom, email, adresse)"
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-300/60 bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 focus:-translate-y-0.5 focus:shadow-lg transition-all duration-200"
                />
              </div>
              <div className="flex items-center justify-center">
                <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50">
                  <span className="text-sm font-medium text-gray-700">
                    {neighbors?.length || 0} voisin{(neighbors?.length || 0) > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-3">
                <label className="text-sm text-gray-700 inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-full border border-gray-200/50 hover:bg-white/80 transition-colors cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={hasCoordsOnly} 
                    onChange={(e) => setHasCoordsOnly(e.target.checked)}
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <MapPin className="w-4 h-4 text-brand-600" />
                  Avec position
                </label>
                
                <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-full border border-gray-200/50">
                  <SortAsc className="text-brand-600" size={16} />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent border-none text-sm font-medium text-gray-700 focus:ring-0 focus:outline-none"
                  >
                    <option value="distance">Par distance</option>
                    <option value="name">Par nom</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Enhanced Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card className="p-0 mb-6 glass-card overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-brand-50/50 to-purple-50/50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Carte des quartiers</h2>
                <p className="text-sm text-gray-600">Explorez les quartiers de votre communauté</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-brand-200/50">
                  <span className="text-sm font-semibold text-brand-700">
                    {communities?.length || 0} quartier{(communities?.length || 0) > 1 ? 's' : ''}
                  </span>
                </div>
                <label className="text-sm text-gray-700 inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-full border border-gray-200/50 hover:bg-white/80 transition-colors cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={showCommunities} 
                    onChange={(e) => setShowCommunities(e.target.checked)}
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <Users className="w-4 h-4 text-brand-600" />
                  Afficher quartiers
                </label>
              </div>
            </div>
            <div className="relative">
              <MapboxMap
                center={{ lat: userLoc?.lat ?? 48.8566, lng: userLoc?.lng ?? 2.3522 }}
                zoom={11}
                height={300}
                autoFit
                showUserLocation={!!userLoc}
                userLocation={userLoc || undefined}
                markers={showCommunities ? (communities || [])
                  .filter((c: any) => typeof c.center_latitude === 'number' && typeof c.center_longitude === 'number')
                  .map((c: any) => ({
                    id: c.id,
                    latitude: parseFloat(c.center_latitude),
                    longitude: parseFloat(c.center_longitude),
                    title: c.name,
                    description: `${c.city} - ${c.stats?.total_members || 0} membres`,
                    color: '#8B5CF6', // Couleur violette pour les quartiers
                  })) : (neighbors || [])
                  .filter((p: any) => typeof p.latitude === 'number' && typeof p.longitude === 'number')
                  .map((p: any) => ({
                    id: p.id,
                    latitude: p.latitude as number,
                    longitude: p.longitude as number,
                    title: p.full_name || p.email || 'Voisin',
                    color: '#3B82F6', // Couleur bleue pour les utilisateurs
                  }))}
                onMarkerClick={(id) => {
                  if (showCommunities) {
                    window.location.href = `/communities/${id}`;
                  } else {
                    window.location.href = `/profile/${id}`;
                  }
                }}
              />
            </div>
          </Card>
        </motion.div>

        {/* Quartiers disponibles */}
        {showCommunities && communities && communities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-6"
          >
            <Card className="p-6 glass-card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-600" />
                Quartiers disponibles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {communities.map((community: any) => (
                  <div key={community.id} className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 hover:bg-white/80 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{community.name}</h4>
                      <span className="text-xs text-gray-500">{community.city}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{community.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Users className="w-4 h-4" />
                        <span>{community.stats?.total_members || 0} membres</span>
                      </div>
                      <Link 
                        to={`/communities/${community.id}`}
                        className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                      >
                        Voir →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 glass">
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">Chargement…</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {neighbors?.map((p: any) => (
                <li key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50/80 transition-colors duration-200">
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-3">
                      <Link to={`/profile/${p.id}`} className="block">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-brand-100 to-brand-200 border-2 border-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer">
                          {p.avatar_url ? (
                            <img
                              src={p.avatar_url}
                              alt={`Avatar de ${p.full_name || p.email || 'Voisin'}`}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="w-5 h-5 text-brand-600" />
                            </div>
                          )}
                          
                          {/* Indicateur de profil complet */}
                          {p.avatar_url && p.full_name && p.bio && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse" 
                                 title="Profil complet" />
                          )}
                          
                          {/* Indicateur d'activité récente si pas de photo mais des objets */}
                          {!p.avatar_url && p.items_count > 0 && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-500 border-2 border-white rounded-full" 
                                 title="Utilisateur actif" />
                          )}
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-gray-900 truncate">{p.full_name || p.email}</div>
                          {p.items_count > 0 && (
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${
                              p.items_count >= 5 
                                ? 'bg-purple-100 text-purple-700 border-purple-200' 
                                : 'bg-brand-100 text-brand-700 border-brand-200'
                            }`}>
                              {p.items_count >= 5 && '⭐ '}
                              {p.items_count} objet{p.items_count > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        {p.bio && (
                          <div className="text-xs text-gray-500 truncate mt-0.5 italic">
                            "{p.bio}"
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-600 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="truncate">{p.address || 'Adresse non renseignée'}</span>
                      {typeof p._distanceKm === 'number' && (
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-medium">
                          {(p._distanceKm as number).toFixed(1)} km
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {typeof p.latitude === 'number' && typeof p.longitude === 'number' && (
                      <a
                        href={`https://www.google.com/maps?q=${p.latitude},${p.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 inline-flex items-center gap-1"
                        title="Voir sur la carte"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Carte
                      </a>
                    )}
                    <Link
                      to={`/profile/${p.id}`}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700"
                      title="Voir le profil"
                    >
                      Profil
                    </Link>
                    <Link
                      to={`/chat/${p.id}`}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white inline-flex items-center gap-1"
                      title="Discuter"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Discuter
                    </Link>
                  </div>
                </li>
              ))}
              {data?.length === 0 && (
                <li className="p-6 text-center text-gray-500">Aucun voisin trouvé.</li>
              )}
            </ul>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default NeighboursPage;
