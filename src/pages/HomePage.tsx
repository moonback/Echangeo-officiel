import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, Search, MapPin, Users, 
  Heart, Gift, ArrowRight, Sparkles, Trophy, Zap,
  Navigation, Star, Award, TrendingUp
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
      icon: <Plus className="w-5 h-5" />,
      title: "Publier un objet",
      description: "Partagez vos objets avec vos voisins",
      gradient: "from-blue-500 via-blue-600 to-indigo-600",
      glowColor: "blue-500/30",
      action: () => navigate('/create')
    },
    {
      icon: <Search className="w-5 h-5" />,
      title: "Rechercher",
      description: "Trouvez ce dont vous avez besoin",
      gradient: "from-emerald-500 via-green-600 to-teal-600",
      glowColor: "emerald-500/30",
      action: () => navigate('/items')
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Communautés",
      description: "Rejoignez votre quartier",
      gradient: "from-orange-500 via-amber-600 to-yellow-600",
      glowColor: "orange-500/30",
      action: () => navigate('/communities')
    },
    {
      icon: <Heart className="w-5 h-5" />,
      title: "Mes favoris",
      description: "Objets que vous aimez",
      gradient: "from-pink-500 via-rose-600 to-red-600",
      glowColor: "pink-500/30",
      action: () => navigate('/favorites')
    }
  ];


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
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-blue-200/15 via-indigo-300/8 to-transparent rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "linear"
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
        <motion.div 
          className="absolute top-1/3 right-20 w-3 h-3 bg-orange-400/50 rounded-full"
          animate={{ 
            y: [0, -25, 0],
            opacity: [0.5, 0.9, 0.5]
          }}
          transition={{ 
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2.5
          }}
        />
      </div>

      <div className="relative max-w-12xl mx-auto px-4 py-4 sm:py-8">
        {/* Hero Section Ultra-Moderne */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-16"
        >
          <motion.div 
            className="relative overflow-hidden rounded-3xl"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            {/* Effet de glow animé */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-br from-brand-400/20 via-brand-500/10 to-emerald-400/20 rounded-3xl blur-xl"
              animate={{ 
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Carte principale avec glassmorphism */}
            <div className="relative bg-white/90 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-xl sm:rounded-3xl sm:p-8 sm:shadow-2xl">
              {/* Éléments décoratifs flottants */}
              <motion.div 
                className="absolute top-6 right-6 w-20 h-20 bg-gradient-to-br from-brand-200/30 to-brand-300/20 rounded-full blur-2xl"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <motion.div 
                className="absolute bottom-6 left-6 w-16 h-16 bg-gradient-to-tr from-emerald-200/30 to-teal-300/20 rounded-full blur-xl"
                animate={{ 
                  scale: [1.2, 1, 1.2],
                  y: [0, -10, 0]
                }}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 sm:gap-8">
                  <div className="flex-1">
                    {/* Header avec badges redesignés */}
                    <motion.div 
                      className="flex items-center gap-3 mb-6 sm:gap-4 sm:mb-8"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <motion.div 
                        className="p-4 sm:p-5 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 rounded-2xl shadow-lg"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </motion.div>
                      <div className="flex items-center gap-3">
                        <motion.span 
                          className="px-4 py-2 sm:px-5 sm:py-3 bg-gradient-to-r from-emerald-100 via-green-100 to-emerald-100 text-emerald-700 border border-emerald-200/50 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold shadow-lg backdrop-blur-sm"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                          Bienvenue
                        </motion.span>
                        {signupCommunity && (
                          <motion.span 
                            className="px-4 py-2 text-xs bg-gradient-to-r from-brand-100 via-brand-200 to-brand-100 text-brand-700 rounded-2xl font-semibold border border-brand-200/50 shadow-md backdrop-blur-sm"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                            <MapPin className="w-3 h-3 inline mr-1" />
                            {signupCommunity.name}
                          </motion.span>
                        )}
                      </div>
                    </motion.div>
                    
                    {/* Titre avec gradient text */}
                    <motion.h1 
                      className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-slate-900 via-brand-600 to-slate-900 bg-clip-text text-transparent leading-tight"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      Bonjour {profile?.full_name || 'Voisin'} ! 👋
                    </motion.h1>
                    
                    {/* Badges informatifs redesignés */}
                    <motion.div 
                      className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6 sm:mb-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <motion.div 
                        className="flex items-center gap-2 sm:gap-3 bg-white/90 backdrop-blur-xl px-3 py-2 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-200/50 shadow-lg"
                        whileHover={{ scale: 1.05, y: -2 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg sm:rounded-xl">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </div>
                        <span className="text-sm sm:text-base font-semibold text-slate-700">Votre quartier</span>
                      </motion.div>
                      <motion.div 
                        className="flex items-center gap-2 sm:gap-3 bg-white/90 backdrop-blur-xl px-3 py-2 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-200/50 shadow-lg"
                        whileHover={{ scale: 1.05, y: -2 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="p-1.5 sm:p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg sm:rounded-xl">
                          <Users className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </div>
                        <span className="text-sm sm:text-base font-semibold text-slate-700">Communauté active</span>
                      </motion.div>
                      <motion.div 
                        className="flex items-center gap-2 sm:gap-3 bg-white/90 backdrop-blur-xl px-3 py-2 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl border border-slate-200/50 shadow-lg"
                        whileHover={{ scale: 1.05, y: -2 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="p-1.5 sm:p-2 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg sm:rounded-xl">
                          <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </div>
                        <span className="text-sm sm:text-base font-semibold text-slate-700">Partage responsable</span>
                      </motion.div>
                    </motion.div>
                    
                    {/* Description */}
                    <motion.p 
                      className="text-slate-600 text-lg sm:text-xl leading-relaxed max-w-3xl font-medium"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      Découvrez ce qui se passe dans votre quartier aujourd'hui. Empruntez, échangez ou donnez vos objets avec vos voisins dans une communauté bienveillante.
                    </motion.p>
                  </div>
                  
                  {/* Actions rapides redesignées */}
                  <motion.div 
                    className="flex flex-col items-stretch sm:items-end gap-4 sm:gap-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="text-center sm:text-right">
                      <div className="text-sm text-slate-500 mb-4 font-medium">Actions rapides</div>
                      <div className="flex flex-col gap-3">
                        <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                          <Button 
                            leftIcon={<Plus size={18} />}
                            onClick={() => navigate('/create')}
                            size="lg"
                            className="shadow-xl hover:shadow-2xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-semibold px-6 py-3 sm:px-8 sm:py-4 rounded-2xl w-full sm:w-auto"
                          >
                            Publier un objet
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                          <Button 
                            variant="ghost"
                            leftIcon={<Search size={18} />}
                            onClick={() => navigate('/items')}
                            size="lg"
                            className="hover:bg-brand-50 hover:text-brand-700 font-semibold px-6 py-3 sm:px-8 sm:py-4 rounded-2xl border border-slate-200/50 backdrop-blur-sm w-full sm:w-auto"
                          >
                            Rechercher
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Actions rapides redesignées */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <motion.h2 
                className="text-2xl font-bold text-slate-900 mb-8 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                Actions rapides
              </motion.h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.title}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ 
                      delay: 0.9 + index * 0.1,
                      duration: 0.5,
                      ease: "easeOut"
                    }}
                    whileHover={{ 
                      scale: 1.05, 
                      y: -8,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="relative group"
                  >
                    {/* Effet de glow au hover */}
                    <motion.div 
                      className={`absolute inset-0 bg-gradient-to-r ${action.gradient} opacity-0 group-hover:opacity-20 rounded-3xl blur-xl transition-opacity duration-300`}
                      whileHover={{ scale: 1.1 }}
                    />
                    
                    <Card 
                      className="relative p-4 sm:p-6 cursor-pointer border-0 bg-white/90 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl sm:rounded-3xl overflow-hidden"
                      onClick={action.action}
                    >
                      {/* Effet "Explorer" qui apparaît au hover */}
                      <motion.div 
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        initial={{ scale: 0 }}
                        whileHover={{ scale: 1 }}
                      >
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </motion.div>
                      
                      {/* Icône redesignée */}
                      <motion.div 
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-r ${action.gradient} text-white flex items-center justify-center mb-3 sm:mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {action.icon}
                      </motion.div>
                      
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-2 group-hover:text-brand-600 transition-colors duration-300">
                        {action.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {action.description}
                      </p>
                      
                      {/* Indicateur de progression */}
                      <motion.div 
                        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent w-0 group-hover:w-full transition-all duration-500"
                        initial={{ width: 0 }}
                        whileHover={{ width: "100%" }}
                      />
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Objets récents redesignés */}
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
            >
              <div className="flex items-center justify-between mb-8">
                <motion.h2 
                  className="text-2xl font-bold text-slate-900 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                >
                  Objets récents
                </motion.h2>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 }}
                >
                  <Link 
                    to="/items" 
                    className="text-sm text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-brand-50 transition-all duration-300"
                  >
                    Voir tout <ArrowRight size={16} />
                  </Link>
                </motion.div>
              </div>
              
              {itemsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.3 + i * 0.05 }}
                      className="relative overflow-hidden rounded-3xl"
                    >
                      {/* Skeleton avec gradient animé */}
                      <div className="bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 h-64 rounded-3xl animate-pulse">
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : !recentItems || recentItems.length === 0 ? (
                <motion.div 
                  className="text-center py-16"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 }}
                >
                  <motion.div 
                    className="text-slate-400 mb-6"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Gift size={64} className="mx-auto" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Aucun objet récent</h3>
                  <p className="text-slate-600 mb-8 text-lg">Soyez le premier à publier un objet dans votre quartier !</p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      onClick={() => navigate('/create')}
                      leftIcon={<Plus size={18} />}
                      size="lg"
                      className="shadow-xl hover:shadow-2xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-semibold px-8 py-4 rounded-2xl"
                    >
                      Publier un objet
                    </Button>
                  </motion.div>
                </motion.div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                  {recentItems?.slice(0, 8).map((item: Item, index: number) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 30, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        delay: 1.3 + index * 0.05,
                        duration: 0.5,
                        ease: "easeOut"
                      }}
                      whileHover={{ 
                        y: -5,
                        transition: { duration: 0.2 }
                      }}
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

          {/* Sidebar Premium */}
          <div className="space-y-8">
            {/* Communautés proches redesignées */}
            <motion.aside
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4, duration: 0.6 }}
            >
              <div className="flex items-center justify-between mb-6">
                <motion.h3 
                  className="text-xl font-bold text-slate-900 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 }}
                >
                  Communautés proches
                </motion.h3>
                {userLocation && (
                  <motion.div 
                    className="flex items-center gap-2 text-xs text-emerald-600 bg-gradient-to-r from-emerald-100 via-green-100 to-emerald-100 px-4 py-2 rounded-2xl border border-emerald-200/50 shadow-lg backdrop-blur-sm"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.6 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Navigation className="w-4 h-4" />
                    <span className="font-semibold">Géolocalisé</span>
                  </motion.div>
                )}
              </div>
              
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {/* Effet de glow */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-emerald-400/10 to-blue-400/20 rounded-3xl blur-xl opacity-0 hover:opacity-100 transition-opacity duration-500"
                />
                
                <Card className="relative p-0 border-0 bg-white/90 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden">
                  {communitiesLoading ? (
                    <div className="space-y-4 p-6">
                      {[...Array(3)].map((_, i) => (
                        <motion.div 
                          key={i} 
                          className="flex items-center gap-4"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.7 + i * 0.1 }}
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-slate-200 to-slate-100 rounded-2xl animate-pulse" />
                          <div className="flex-1">
                            <div className="h-5 bg-gradient-to-r from-slate-200 to-slate-100 rounded-lg animate-pulse mb-2" />
                            <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-100 rounded-lg animate-pulse w-2/3" />
                          </div>
                          <div className="h-8 w-16 bg-gradient-to-r from-slate-200 to-slate-100 rounded-xl animate-pulse" />
                        </motion.div>
                      ))}
                    </div>
                  ) : communities && communities.length > 0 ? (
                    <div className="divide-y divide-slate-100/50">
                      {communities.slice(0, 5).map((community, index) => {
                        // Gérer les types différents
                        const communityId = 'id' in community ? community.id : community.community_id;
                        const communityName = 'name' in community ? community.name : community.community_name;
                        const memberCount = 'stats' in community ? community.stats?.total_members || 0 : community.member_count || 0;
                        const distance = 'distance_km' in community ? community.distance_km : undefined;
                        
                        return (
                          <motion.div 
                            key={communityId}
                            className="p-6 hover:bg-gradient-to-r hover:from-brand-50/50 hover:to-emerald-50/50 cursor-pointer transition-all duration-300 group"
                            onClick={() => navigate(`/communities/${communityId}`)}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.7 + index * 0.1 }}
                            whileHover={{ x: 5 }}
                          >
                            <div className="flex items-center gap-4">
                              <motion.div 
                                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 flex items-center justify-center text-white font-bold shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                                whileHover={{ rotate: 5, scale: 1.1 }}
                              >
                                {(communityName || 'C')[0].toUpperCase()}
                              </motion.div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-900 truncate group-hover:text-brand-600 transition-colors duration-300 text-base">
                                  {communityName}
                                </h4>
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                  <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4 text-brand-500" />
                                    <span className="font-medium">{String(memberCount)} membres</span>
                                  </div>
                                  {distance && typeof distance === 'number' ? (
                                    <>
                                      <span className="text-slate-400">•</span>
                                      <div className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-emerald-500" />
                                        <span className="text-emerald-600 font-semibold">
                                          {distance < 1 
                                            ? `${Math.round(distance * 1000)}m` 
                                            : `${distance.toFixed(1)}km`
                                          }
                                        </span>
                                      </div>
                                    </>
                                  ) : null}
                                </div>
                              </div>
                              <motion.div
                                whileHover={{ x: 3 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ArrowRight size={18} className="text-slate-400 group-hover:text-brand-500 transition-colors duration-300" />
                              </motion.div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <motion.div 
                      className="p-8 text-center"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.7 }}
                    >
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      </motion.div>
                      <h4 className="text-lg font-bold text-slate-900 mb-3">
                        {userLocation 
                          ? "Aucune communauté trouvée"
                          : "Activez la géolocalisation"
                        }
                      </h4>
                      <p className="text-slate-600 mb-6 text-sm leading-relaxed">
                        {userLocation 
                          ? "dans votre région"
                          : "pour voir les communautés proches"
                        }
                      </p>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          variant="secondary" 
                          size="md"
                          onClick={() => navigate('/communities')}
                          className="shadow-lg hover:shadow-xl font-semibold px-6 py-3 rounded-2xl"
                        >
                          Voir toutes les communautés
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                  
                  <div className="p-6 border-t border-slate-100/50 bg-gradient-to-r from-slate-50/50 to-brand-50/30">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link 
                        to="/communities"
                        className="text-sm text-brand-600 hover:text-brand-700 font-semibold flex items-center justify-center gap-2 px-4 py-3 rounded-2xl hover:bg-brand-50/50 transition-all duration-300"
                      >
                        Voir toutes les communautés <ArrowRight size={16} />
                      </Link>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            </motion.aside>


            {/* Fonctionnalités IA redesignées */}
            <motion.aside
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.8, duration: 0.6 }}
            >
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {/* Effet de glow IA */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-indigo-400/10 to-blue-400/20 rounded-3xl blur-xl opacity-0 hover:opacity-100 transition-opacity duration-500"
                />
                
                <Card className="relative p-6 border-0 bg-gradient-to-br from-purple-50/80 via-indigo-50/60 to-blue-50/80 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden">
                  {/* Éléments décoratifs */}
                  <motion.div 
                    className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-purple-200/40 to-indigo-200/40 rounded-full blur-sm"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.div 
                    className="absolute bottom-4 left-4 w-6 h-6 bg-gradient-to-tr from-blue-200/40 to-purple-200/40 rounded-full blur-sm"
                    animate={{ 
                      scale: [1.2, 1, 1.2],
                      opacity: [0.4, 0.7, 0.4]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1
                    }}
                  />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <motion.div 
                        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600 flex items-center justify-center shadow-lg"
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Sparkles className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">IA Assistant</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-1 text-xs bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded-lg font-semibold border border-purple-200/50">
                            Nouveau
                          </span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            <Star className="w-3 h-3 text-yellow-500" />
                            <Star className="w-3 h-3 text-yellow-500" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-600 mb-6 leading-relaxed">
                      Découvrez nos fonctionnalités IA pour améliorer votre expérience de partage
                    </p>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        variant="secondary" 
                        size="md" 
                        className="w-full shadow-lg hover:shadow-xl font-semibold px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-100 to-indigo-100 hover:from-purple-200 hover:to-indigo-200 text-purple-700 border border-purple-200/50"
                        onClick={() => navigate('/ai-features')}
                        leftIcon={<Zap size={16} />}
                      >
                        Explorer l'IA
                      </Button>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            </motion.aside>

            {/* Récompenses redesignées */}
            <motion.aside
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.9, duration: 0.6 }}
            >
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {/* Effet de glow Récompenses */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-amber-400/20 via-orange-400/10 to-yellow-400/20 rounded-3xl blur-xl opacity-0 hover:opacity-100 transition-opacity duration-500"
                />
                
                <Card className="relative p-6 border-0 bg-gradient-to-br from-amber-50/80 via-orange-50/60 to-yellow-50/80 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden">
                  {/* Éléments décoratifs */}
                  <motion.div 
                    className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-amber-200/40 to-orange-200/40 rounded-full blur-sm"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.div 
                    className="absolute bottom-4 left-4 w-6 h-6 bg-gradient-to-tr from-yellow-200/40 to-amber-200/40 rounded-full blur-sm"
                    animate={{ 
                      scale: [1.2, 1, 1.2],
                      opacity: [0.4, 0.7, 0.4]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1.5
                    }}
                  />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <motion.div 
                        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-yellow-600 flex items-center justify-center shadow-lg"
                        whileHover={{ rotate: -10, scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Trophy className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">Mes Récompenses</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-1 text-xs bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 rounded-lg font-semibold border border-amber-200/50">
                            Points gagnés
                          </span>
                          <div className="flex items-center gap-1">
                            <Award className="w-3 h-3 text-amber-500" />
                            <TrendingUp className="w-3 h-3 text-emerald-500" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-600 mb-6 leading-relaxed">
                      Gagnez des points et débloquez des badges en partageant avec vos voisins
                    </p>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        variant="secondary" 
                        size="md" 
                        className="w-full shadow-lg hover:shadow-xl font-semibold px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 text-amber-700 border border-amber-200/50"
                        onClick={() => navigate('/gamification')}
                        leftIcon={<Heart size={16} />}
                      >
                        Voir mes points
                      </Button>
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            </motion.aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;