import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, MessageCircle, TrendingUp, Shield, MapPin, Clock, Star, Lock } from 'lucide-react';
import { useItems } from '../hooks/useItems';
import { useRequests } from '../hooks/useRequests';
import ItemCard from '../components/ItemCard';
import { ItemCardSkeleton } from '../components/SkeletonLoader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/EmptyState';

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
        <Card className="overflow-hidden">
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

      {/* Comment ça marche */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[{
          title: '1. Ajoutez vos objets',
          desc: 'Indiquez une description, des photos et la disponibilité.',
          Icon: Plus
        }, {
          title: '2. Trouvez près de chez vous',
          desc: 'Cherchez par catégorie, tags, distance et période.',
          Icon: MapPin
        }, {
          title: '3. Échangez en toute sérénité',
          desc: 'Discutez, convenez d’un créneau et validez la demande.',
          Icon: MessageCircle
        }].map(({ title, desc, Icon }) => (
          <div key={title} className="card p-5">
            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center mb-3">
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600">{desc}</p>
          </div>
        ))}
      </motion.section>

      {/* Points forts */}
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Pourquoi TrocAll ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[{
            Icon: Shield,
            title: 'Confiance locale',
            desc: 'Profils publics et messagerie intégrée.'
          }, { Icon: Clock, title: 'Rapide', desc: 'Trouver et réserver en quelques clics.' }, { Icon: Star, title: 'Économique', desc: 'Évitez d’acheter ce que vous pouvez emprunter.' }, { Icon: Lock, title: 'Vos données', desc: 'Sécurisées par Supabase.' }].map(({ Icon, title, desc }) => (
            <div key={title} className="p-4 border border-gray-200 rounded-2xl">
              <Icon className="w-5 h-5 text-brand-700 mb-2" />
              <p className="font-medium text-gray-900">{title}</p>
              <p className="text-sm text-gray-600">{desc}</p>
            </div>
          ))}
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