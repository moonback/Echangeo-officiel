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
      <motion.section 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="hidden md:block"
      >
        <Card className="overflow-hidden glass-strong">
          <div className="relative min-h-[500px] md:min-h-[600px] flex items-center justify-center">
            {/* Image de fond complète */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url('/hero-1.png')`
              }}
            />
            
            {/* Overlay sombre pour améliorer la lisibilité */}
            <div className="absolute inset-0 bg-black/40" />
            
            {/* Contenu centré */}
            <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
              >
                🌱 Partagez plus,<br />
                <span className="gradient-text bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  dépensez moins.
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-lg md:text-xl lg:text-2xl text-gray-100 mb-8 leading-relaxed max-w-3xl mx-auto font-light"
              >
                Avec <span className="font-bold text-white">TrocAll</span>, échangez et empruntez facilement des objets entre voisins.
                <br />
                Faites des économies, libérez de l'espace et renforcez les liens dans votre quartier.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="flex gap-4 justify-center items-center flex-wrap"
              >
                <Link to="/create">
                  <Button 
                    leftIcon={<Plus className="w-6 h-6" />} 
                    size="lg" 
                    className="min-w-[160px] h-12 text-lg font-semibold bg-white text-gray-900 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Ajouter un objet
                  </Button>
                </Link>
                <Link to="/items">
                  <Button 
                    variant="ghost" 
                    leftIcon={<Search className="w-6 h-6" />} 
                    size="lg" 
                    className="min-w-[160px] h-12 text-lg font-semibold text-white border-2 border-white/30 hover:border-white hover:bg-white/10 transition-all duration-300"
                  >
                    Parcourir
                  </Button>
                </Link>
              </motion.div>
              
              
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
      <motion.section 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="space-y-6 relative"
      >
        {/* Décorations de fond animées */}
        <motion.div 
          className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-200/20 to-purple-200/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-200/20 to-brand-200/20 rounded-full blur-xl translate-y-1/2 -translate-x-1/2 pointer-events-none"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ 
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        
        {/* Petites particules flottantes */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-2 h-2 bg-brand-300/30 rounded-full pointer-events-none"
          animate={{ 
            y: [-10, 10, -10],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-3/4 right-1/3 w-1.5 h-1.5 bg-purple-300/40 rounded-full pointer-events-none"
          animate={{ 
            y: [10, -10, 10],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h2 className="text-2xl font-bold mb-1">
              <span className="bg-gradient-to-r from-gray-900 via-brand-700 to-gray-900 bg-clip-text text-transparent">
                Objets récemment ajoutés
              </span>
            </h2>
            <p className="text-sm text-gray-600">Découvrez les dernières trouvailles de vos voisins</p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Link 
              to="/items" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl hover:from-brand-600 hover:to-brand-700 transition-all duration-300 hover:shadow-lg font-medium text-sm shadow-md"
            >
              Voir tout
              <motion.div
                animate={{ x: [0, 2, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Search className="w-4 h-4" />
              </motion.div>
            </Link>
          </motion.div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch relative z-10">
          {itemsLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="col-span-full"
            >
              <div className="text-center mb-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-500 rounded-full mx-auto mb-2" />
                </motion.div>
                <p className="text-sm text-gray-600">Chargement des objets...</p>
              </div>
              <ItemCardSkeleton count={4} />
            </motion.div>
          ) : recentItems.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="contents"
            >
              {recentItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    delay: index * 0.15, 
                    duration: 0.6, 
                    ease: "easeOut" 
                  }}
                  className="h-full"
                >
                  <ItemCard item={item} userLocation={userLoc || undefined} />
                </motion.div>
              ))}
            </motion.div>
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
