import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, MessageCircle, TrendingUp, Sparkles } from 'lucide-react';
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
      <motion.section 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Card className="overflow-hidden glass-strong">
          <div className="relative p-4 md:p-6 bg-gradient-to-br from-brand-50/80 via-white/60 to-purple-50/40">
            {/* Décorations de fond plus discrètes */}
            <div className="absolute top-0 right-0 w-40 h-40 md:w-64 md:h-64 bg-gradient-to-br from-brand-200/20 to-purple-200/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 md:w-40 md:h-40 bg-gradient-to-tr from-blue-200/20 to-brand-200/20 rounded-full blur-xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
            
            <div className="relative max-w-2xl md:max-w-3xl">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 leading-tight"
              >
                Partagez. Empruntez. <span className="gradient-text">Réduisez.</span> 🌱
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-base md:text-lg text-gray-600 mb-4 leading-relaxed max-w-xl"
              >
                TrocAll facilite le prêt et le troc d'objets entre voisins. Économisez, gagnez de la place et créez du lien dans votre quartier.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex gap-2 flex-col xs:flex-row"
              >
                <Link to="/create">
                  <Button leftIcon={<Plus className="w-5 h-5" />} size="md" className="min-w-[120px]">
                    Ajouter
                  </Button>
                </Link>
                <Link to="/items">
                  <Button variant="ghost" leftIcon={<Search className="w-5 h-5" />} size="md" className="min-w-[120px]">
                    Parcourir
                  </Button>
                </Link>
              </motion.div>
              
              {/* Badge IA compact */}
              {import.meta.env.VITE_MISTRAL_API_KEY && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="mt-4"
                >
                  <Link to="/ai-features">
                    <div className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-200/50 rounded-xl hover:from-purple-500/20 hover:to-blue-500/20 transition-all duration-200 hover:scale-105">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-semibold text-gray-900 leading-tight">Nouveau&nbsp;: IA intégrée</p>
                        <p className="text-[11px] text-gray-600">Reconnaissance, chat, etc.</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </Card>
      </motion.section>

     

      {/* Stats */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="group"
          >
            <Card className="p-6 glass-card hover-lift">
              <div className="flex items-center">
                <div className={`p-3 rounded-2xl ${stat.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                  <stat.icon size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-3xl font-bold text-gray-900 group-hover:text-brand-600 transition-colors duration-200">
                    {stat.value}
                  </p>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                </div>
              </div>
            </Card>
          </motion.div>
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
