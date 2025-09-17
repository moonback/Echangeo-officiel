import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, MessageCircle, TrendingUp } from 'lucide-react';
import { useItems } from '../hooks/useItems';
import { useRequests } from '../hooks/useRequests';
import ItemCard from '../components/ItemCard';
import { ItemCardSkeleton } from '../components/SkeletonLoader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/EmptyState';
import MapboxMap from '../components/MapboxMap';

const HomePage: React.FC = () => {
  const { data: items, isLoading: itemsLoading } = useItems();
  const [userLoc, setUserLoc] = React.useState<{ lat: number; lng: number } | null>(null);
  React.useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  }, []);
  const { data: requests } = useRequests();

  const recentItems = items?.slice(0, 4) || [];
  const pendingRequests = requests?.filter(r => r.status === 'pending') || [];

  const stats = [
    {
      label: 'Objets disponibles',
      value: items?.length || 0,
      icon: Search,
      color: 'bg-blue-500',
    },
    {
      label: 'Demandes en attente',
      value: pendingRequests.length,
      icon: MessageCircle,
      color: 'bg-orange-500',
    },
    {
      label: 'Échanges réussis',
      value: requests?.filter(r => r.status === 'completed').length || 0,
      icon: TrendingUp,
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-12">
      {/* Hero */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden glass">
        <div className="relative p-6 md:p-10 bg-gradient-to-br from-brand-50 to-white">
          <div className="max-w-3xl">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Partagez. Empruntez. Réduisez. 🌱</h1>
            <p className="text-gray-600">TrocAll facilite le prêt et le troc d’objets entre voisins. Économisez de l’argent, gagnez de la place et créez du lien.</p>
            <div className="mt-6 flex gap-3">
              <Link to="/create"><Button leftIcon={<Plus className="w-4 h-4" />}>Ajouter un objet</Button></Link>
              <Link to="/items"><Button variant="ghost" leftIcon={<Search className="w-4 h-4" />}>Parcourir</Button></Link>
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 w-48 h-48 md:w-64 md:h-64 bg-brand-100 rounded-full blur-3xl opacity-40 pointer-events-none" />
        </div>
        </Card>
      </motion.section>

     

      {/* Stats */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-4">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${stat.color} text-white`}>
                <stat.icon size={18} />
              </div>
              <div className="ml-3">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.section>

      {/* Carte interactive */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-0 glass">
          <div className="p-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Autour de moi</h2>
            <span className="text-sm text-gray-600">{items?.length || 0} objets</span>
          </div>
          <div>
            <MapboxMap
              center={{ lat: userLoc?.lat ?? 48.8566, lng: userLoc?.lng ?? 2.3522 }}
              zoom={12}
              height={360}
              autoFit
              showUserLocation={!!userLoc}
              userLocation={userLoc || undefined}
              markers={(items || [])
                .filter((it) => typeof it.latitude === 'number' && typeof it.longitude === 'number')
                .map((it) => ({
                  id: it.id,
                  latitude: it.latitude as number,
                  longitude: it.longitude as number,
                  title: it.title,
                  imageUrl: it.images && it.images.length > 0 ? it.images[0].url : undefined,
                  category: it.category,
                }))}
              onMarkerClick={(id) => {
                window.location.href = `/items/${id}`;
              }}
            />
          </div>
        </Card>
      </motion.section>

      {/* Objets récents */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Objets récemment ajoutés</h2>
          <Link to="/items" className="text-brand-700 hover:text-brand-800 font-medium text-sm">Voir tout</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {itemsLoading ? (
            <ItemCardSkeleton count={4} />
          ) : recentItems.length > 0 ? (
            recentItems.map((item) => (
              <ItemCard key={item.id} item={item} userLocation={userLoc || undefined} />
            ))
          ) : (
            <EmptyState
              icon={<Search className="w-10 h-10" />}
              title="Aucun objet disponible"
              description="Soyez le premier à partager un objet avec vos voisins !"
              action={<Link to="/create"><Button leftIcon={<Plus className="w-4 h-4" />}>Ajouter un objet</Button></Link>}
              className="col-span-full"
            />
          )}
        </div>
      </motion.section>

      
    </div>
  );
};

export default HomePage;