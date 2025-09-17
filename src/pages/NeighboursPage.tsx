import React from 'react';
import { motion } from 'framer-motion';
import { useNeighbours } from '../hooks/useProfiles';
import { Link } from 'react-router-dom';
import { Search, MapPin, MessageCircle, User, ExternalLink, SortAsc } from 'lucide-react';
import MapboxMap from '../components/MapboxMap';
import Card from '../components/ui/Card';

const NeighboursPage: React.FC = () => {
  const { data, isLoading } = useNeighbours();
  const [query, setQuery] = React.useState('');
  const [sortBy, setSortBy] = React.useState<'distance' | 'name'>('distance');
  const [userLoc, setUserLoc] = React.useState<{ lat: number; lng: number } | null>(null);
  const [hasCoordsOnly, setHasCoordsOnly] = React.useState(false);

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
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Mes voisins
        </h1>
        {/* Toolbar */}
        <div className="mb-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un voisin (nom, email, adresse)"
              className="w-full pl-9 pr-3 h-10 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center sm:justify-center">
            <span className="text-sm text-gray-600">{neighbors?.length || 0} résultat(s)</span>
          </div>
          <div className="flex items-center sm:justify-end gap-3">
            <label className="text-sm text-gray-700 inline-flex items-center gap-1">
              <input type="checkbox" checked={hasCoordsOnly} onChange={(e) => setHasCoordsOnly(e.target.checked)} />
              Avec coordonnées
            </label>
            <SortAsc className="text-gray-500" size={18} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-10 rounded-xl border border-gray-300 px-3"
            >
              <option value="distance">Par distance</option>
              <option value="name">Par nom</option>
            </select>
          </div>
        </div>

        {/* Mini-carte */}
        <Card className="p-0 mb-4 glass">
          <div className="p-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-900">Autour de moi</h2>
            <span className="text-xs text-gray-600">{neighbors?.filter((p: any) => typeof p.latitude === 'number' && typeof p.longitude === 'number').length || 0} voisins</span>
          </div>
          <MapboxMap
            center={{ lat: userLoc?.lat ?? 48.8566, lng: userLoc?.lng ?? 2.3522 }}
            zoom={12}
            height={260}
            autoFit
            showUserLocation={!!userLoc}
            userLocation={userLoc || undefined}
            markers={(neighbors || [])
              .filter((p: any) => typeof p.latitude === 'number' && typeof p.longitude === 'number')
              .map((p: any) => ({
                id: p.id,
                latitude: p.latitude as number,
                longitude: p.longitude as number,
                title: p.full_name || p.email || 'Voisin',
              }))}
            onMarkerClick={(id) => {
              window.location.href = `/profile/${id}`;
            }}
          />
        </Card>

        <div className="bg-white rounded-xl border border-gray-200 glass">
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">Chargement…</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {neighbors?.map((p: any) => (
                <li key={p.id} className="p-4 flex items-center justify-between">
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="font-medium text-gray-900 truncate">{p.full_name || p.email}</div>
                    </div>
                    <div className="mt-1 text-xs text-gray-600 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="truncate">{p.address || 'Adresse non renseignée'}</span>
                      {typeof p._distanceKm === 'number' && (
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px]">
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