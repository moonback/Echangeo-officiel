import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, Search, MapPin, Users, 
  Heart, Gift, ArrowRight, Sparkles, Trophy, Zap,
  Navigation
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ItemCard from '../components/ItemCard';
import { useAuthStore } from '../store/authStore';
import { useItems } from '../hooks/useItems';
import { useCommunities, useUserSignupCommunity, useNearbyCommunities } from '../hooks/useCommunities';
import type { Item } from '../types';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  
  // État pour la géolocalisation
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // Hooks pour récupérer les données
  const { data: recentItems, isLoading: itemsLoading } = useItems();
  
  // Hooks pour récupérer les communautés
  const { data: nearbyCommunities, isLoading: nearbyCommunitiesLoading } = useNearbyCommunities(
    userLocation?.lat || 0, 
    userLocation?.lng || 0, 
    15 // 15km de rayon
  );
  
  const { data: allCommunities, isLoading: allCommunitiesLoading } = useCommunities();
  
  // Utiliser les communautés proches si géolocalisation disponible, sinon toutes les communautés
  const communities = userLocation ? nearbyCommunities : allCommunities;
  const communitiesLoading = userLocation ? nearbyCommunitiesLoading : allCommunitiesLoading;
  
  const { data: signupCommunity } = useUserSignupCommunity(profile?.id);

  // Récupérer la position de l'utilisateur
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Géolocalisation non disponible:', error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    }
  }, []);

  const quickActions = [
    {
      icon: <Plus className="w-6 h-6" />,
      title: "Publier un objet",
      description: "Partagez vos objets avec vos voisins",
      color: "from-blue-500 to-blue-600",
      action: () => navigate('/create')
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Rechercher",
      description: "Trouvez ce dont vous avez besoin",
      color: "from-green-500 to-green-600",
      action: () => navigate('/items')
    },
    
    {
      icon: <Users className="w-6 h-6" />,
      title: "Communautés",
      description: "Rejoignez votre quartier",
      color: "from-orange-500 to-orange-600",
      action: () => navigate('/communities')
    }
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-brand-50/30">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-brand-200/10 to-brand-300/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-tl from-brand-300/10 to-brand-200/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section moderne */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <Card className="relative overflow-hidden p-0">
            {/* Background decorations */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand-50/30 via-white to-brand-50/20"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-brand-200/10 to-brand-300/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-brand-200/10 to-brand-300/10 rounded-full blur-2xl"></div>
            
            <div className="relative p-8 md:p-12">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-4 bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl shadow-lg">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-4 py-2 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-medium">
                        🌟 Bienvenue
                      </span>
                {signupCommunity && (
                        <span className="px-3 py-1.5 text-xs bg-gradient-to-r from-brand-100 to-brand-200 text-brand-700 rounded-full font-medium border border-brand-200 shadow-sm">
                    🏠 {signupCommunity.name}
                  </span>
                )}
              </div>
            </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Bonjour {profile?.full_name || 'Voisin'} ! 👋
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200/50 shadow-sm">
                      <MapPin className="w-4 h-4 text-brand-600" />
                      <span className="font-medium text-gray-700">Votre quartier</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200/50 shadow-sm">
                      <Users className="w-4 h-4 text-brand-600" />
                      <span className="font-medium text-gray-700">Communauté active</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200/50 shadow-sm">
                      <Heart className="w-4 h-4 text-brand-600" />
                      <span className="font-medium text-gray-700">Partage responsable</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-lg leading-relaxed max-w-3xl">
                    Découvrez ce qui se passe dans votre quartier aujourd'hui. Empruntez, échangez ou donnez vos objets avec vos voisins dans une communauté bienveillante.
                  </p>
                </div>
                
                <div className="flex flex-col items-end gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-500 mb-2">Actions rapides</div>
                    <div className="flex flex-col gap-2">
              <Button 
                leftIcon={<Plus size={16} />}
                onClick={() => navigate('/create')}
                        size="md"
                        className="shadow-md hover:shadow-lg"
                      >
                        Publier un objet
                      </Button>
                      <Button 
                        variant="ghost"
                        leftIcon={<Search size={16} />}
                        onClick={() => navigate('/items')}
                        size="md"
                        className="hover:bg-brand-50 hover:text-brand-700"
                      >
                        Rechercher
              </Button>
            </div>
          </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Actions rapides */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-lg font-bold text-gray-900 mb-4">Actions rapides</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Card 
                      className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-white/90 backdrop-blur-sm"
                      onClick={action.action}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white flex items-center justify-center mb-3 shadow-md">
                        {action.icon}
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">{action.title}</h3>
                      <p className="text-xs text-gray-600">{action.description}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Objets récents */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Objets récents</h2>
                <Link 
                  to="/items" 
                  className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
                >
                  Voir tout <ArrowRight size={14} />
                </Link>
              </div>
              
              {itemsLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-gray-200 rounded-2xl h-48 animate-pulse" />
                  ))}
                </div>
              ) : !recentItems || recentItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Gift size={48} className="mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun objet récent</h3>
                  <p className="text-gray-600 mb-4">Soyez le premier à publier un objet dans votre quartier !</p>
                  <Button 
                    onClick={() => navigate('/create')}
                    leftIcon={<Plus size={14} />}
                    size="sm"
                    className="shadow-md hover:shadow-lg"
                  >
                    Publier un objet
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {recentItems?.slice(0, 8).map((item: Item, index: number) => (
      <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                    >
                      <ItemCard
                        item={item}
                        priority={index < 4}
                      />
      </motion.div>
                  ))}
                </div>
              )}
            </motion.section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Communautés proches */}
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Communautés proches</h3>
                {userLocation && (
                  <div className="flex items-center gap-1 text-xs text-green-600 bg-gradient-to-r from-green-100 to-emerald-100 px-3 py-1.5 rounded-full border border-green-200 shadow-sm">
                    <Navigation className="w-3 h-3" />
                    <span>Géolocalisé</span>
                  </div>
                )}
              </div>
              <Card className="p-0 border-0 bg-white/90 backdrop-blur-sm">
                {communitiesLoading ? (
                  <div className="space-y-3 p-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded animate-pulse mb-1" />
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                        </div>
                        <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : communities && communities.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {communities.slice(0, 5).map((community) => {
                      // Gérer les types différents
                      const communityId = 'id' in community ? community.id : community.community_id;
                      const communityName = 'name' in community ? community.name : community.community_name;
                      const memberCount = 'stats' in community ? community.stats?.total_members || 0 : community.member_count || 0;
                      const distance = 'distance_km' in community ? community.distance_km : undefined;
                      
                      return (
                        <div 
                          key={communityId}
                          className="p-4 hover:bg-gray-50/50 cursor-pointer transition-colors group"
                          onClick={() => navigate(`/communities/${communityId}`)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-lg transition-shadow">
                              {(communityName || 'C')[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate group-hover:text-brand-600 transition-colors">
                                {communityName}
                              </h4>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Users className="w-3 h-3" />
                                <span>{String(memberCount)} membres</span>
                                {distance && typeof distance === 'number' ? (
                                  <>
                                    <span className="text-gray-400">•</span>
                                    <span className="text-blue-600 font-medium">
                                      {distance < 1 
                                        ? `${Math.round(distance * 1000)}m` 
                                        : `${distance.toFixed(1)}km`
                                      }
                                    </span>
                                  </>
                                ) : null}
                              </div>
                            </div>
                            <ArrowRight size={16} className="text-gray-400 group-hover:text-brand-500 transition-colors" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-2">
                      {userLocation 
                        ? "Aucune communauté trouvée dans votre région"
                        : "Activez la géolocalisation pour voir les communautés proches"
                      }
                    </p>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => navigate('/communities')}
                      className="text-xs shadow-md hover:shadow-lg"
                    >
                      Voir toutes les communautés
                    </Button>
                  </div>
                )}
                <div className="p-4 border-t border-gray-100">
                  <Link 
                    to="/communities"
                    className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center justify-center gap-2"
                  >
                    Voir toutes les communautés <ArrowRight size={14} />
                  </Link>
                </div>
              </Card>
            </motion.aside>


            {/* Fonctionnalités IA */}
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="p-4 border-0 bg-gradient-to-br from-brand-50 to-brand-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 flex items-center justify-center shadow-md">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900">IA Assistant</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Découvrez nos fonctionnalités IA pour améliorer votre expérience
                </p>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="w-full shadow-md hover:shadow-lg"
                  onClick={() => navigate('/ai-features')}
                  leftIcon={<Zap size={14} />}
                >
                  Explorer l'IA
                </Button>
              </Card>
            </motion.aside>

            {/* Récompenses */}
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Card className="p-4 border-0 bg-gradient-to-br from-brand-50 to-brand-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 flex items-center justify-center shadow-md">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900">Mes Récompenses</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Gagnez des points et débloquez des badges en partageant
                </p>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="w-full shadow-md hover:shadow-lg"
                  onClick={() => navigate('/gamification')}
                  leftIcon={<Heart size={14} />}
                >
                  Voir mes points
                </Button>
              </Card>
            </motion.aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;