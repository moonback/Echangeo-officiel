import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, Search, MapPin, Users, Clock, 
  Heart, Gift, ArrowRight, Sparkles, Trophy, Zap
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useAuthStore } from '../store/authStore';
import { useItems } from '../hooks/useItems';
import { useCommunities, useUserSignupCommunity } from '../hooks/useCommunities';
import type { Item, CommunityOverview } from '../types';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  
  // Hooks pour récupérer les données
  const { data: recentItems, isLoading: itemsLoading } = useItems();
  
  const { data: nearbyCommunities, isLoading: communitiesLoading } = useCommunities();
  const { data: signupCommunity } = useUserSignupCommunity(profile?.id);

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
      icon: <MapPin className="w-6 h-6" />,
      title: "Voir la carte",
      description: "Explorez votre quartier",
      color: "from-purple-500 to-purple-600",
      action: () => navigate('/map')
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
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-brand-200/10 to-purple-200/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-tl from-blue-200/10 to-brand-200/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8">
        {/* Header de bienvenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Bonjour {profile?.full_name || 'Voisin'} ! 👋
              </h1>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-gray-600">
                  Découvrez ce qui se passe dans votre quartier aujourd'hui
                </p>
                {signupCommunity && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
                    🏠 {signupCommunity.name}
                  </span>
                )}
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <Button 
                variant="primary" 
                leftIcon={<Plus size={16} />}
                onClick={() => navigate('/create')}
              >
                Publier
              </Button>
              <Button 
                variant="secondary" 
                leftIcon={<MapPin size={16} />}
                onClick={() => navigate('/map')}
              >
                Carte
              </Button>
            </div>
          </div>

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
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions rapides</h2>
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
                      className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-white/80 backdrop-blur-sm"
                      onClick={action.action}
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.color} text-white flex items-center justify-center mb-3`}>
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
                <h2 className="text-xl font-semibold text-gray-900">Objets récents</h2>
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
                    variant="primary" 
                    onClick={() => navigate('/create')}
                    leftIcon={<Plus size={16} />}
                  >
                    Publier un objet
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {recentItems?.slice(0, 8).map((item: Item, index: number) => (
      <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      whileHover={{ y: -4 }}
                    >
                      <Card 
                        className="p-0 overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 border-0 bg-white/80 backdrop-blur-sm h-full"
                        onClick={() => navigate(`/items/${item.id}`)}
                      >
                        {item.images && item.images.length > 0 ? (
                          <div className="aspect-square bg-gray-100 relative overflow-hidden">
                            <img 
                              src={item.images[0].url} 
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                              {item.offer_type && (
                                <span className={`text-xs px-2 py-1 rounded-full text-white font-medium ${
                                  item.offer_type === 'donation' ? 'bg-green-500' : 
                                  item.offer_type === 'trade' ? 'bg-purple-500' : 'bg-blue-500'
                                }`}>
                                  {item.offer_type === 'donation' ? 'Don' : 
                                   item.offer_type === 'trade' ? 'Échange' : 'Prêt'}
                                </span>
                              )}
                              {item.images && item.images.length > 1 && (
                                <div className="bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                                  +{item.images.length - 1}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden flex items-center justify-center">
                            <div className="text-center text-gray-400">
                              <Gift size={32} className="mx-auto mb-2" />
                              <p className="text-xs font-medium">Pas d'image</p>
                            </div>
                            {item.offer_type && (
                              <div className="absolute top-2 left-2">
                                <span className={`text-xs px-2 py-1 rounded-full text-white font-medium ${
                                  item.offer_type === 'donation' ? 'bg-green-500' : 
                                  item.offer_type === 'trade' ? 'bg-purple-500' : 'bg-blue-500'
                                }`}>
                                  {item.offer_type === 'donation' ? 'Don' : 
                                   item.offer_type === 'trade' ? 'Échange' : 'Prêt'}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="p-3">
                          <div className="mb-2">
                            <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                              {item.title}
                            </h3>
                          </div>
                          
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                            {item.description || ''}
                          </p>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              item.category === 'tools' ? 'bg-blue-100 text-blue-700' :
                              item.category === 'electronics' ? 'bg-purple-100 text-purple-700' :
                              item.category === 'books' ? 'bg-green-100 text-green-700' :
                              item.category === 'sports' ? 'bg-orange-100 text-orange-700' :
                              item.category === 'kitchen' ? 'bg-red-100 text-red-700' :
                              item.category === 'fashion' ? 'bg-pink-100 text-pink-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {item.category === 'tools' ? '🔧 Outils' :
                               item.category === 'electronics' ? '📱 Électronique' :
                               item.category === 'books' ? '📚 Livres' :
                               item.category === 'sports' ? '⚽ Sport' :
                               item.category === 'kitchen' ? '🍳 Cuisine' :
                               item.category === 'fashion' ? '👗 Mode' :
                               item.category}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              item.condition === 'excellent' ? 'bg-green-100 text-green-700' :
                              item.condition === 'good' ? 'bg-blue-100 text-blue-700' :
                              item.condition === 'fair' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {item.condition === 'excellent' ? '✨ Excellent' :
                               item.condition === 'good' ? '👍 Bon état' :
                               item.condition === 'fair' ? '⚠️ État moyen' :
                               item.condition === 'poor' ? '🔧 À réparer' :
                               item.condition}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1 text-gray-500">
                              <MapPin size={10} />
                              <span>{(item as Item & { neighborhood?: string }).neighborhood || 'Quartier'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-500">
                              <Clock size={10} />
                              <span>{new Date(item.created_at).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>
                          
                          {item.owner && (
                            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-brand-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                {(item.owner.full_name || item.owner.email)[0].toUpperCase()}
                              </div>
                              <span className="text-xs text-gray-600 truncate">
                                {item.owner.full_name || 'Utilisateur'}
                              </span>
                            </div>
                          )}
                        </div>
                      </Card>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Communautés proches</h3>
              <Card className="p-0 border-0 bg-white/80 backdrop-blur-sm">
                {communitiesLoading ? (
                  <div className="space-y-3 p-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded animate-pulse mb-1" />
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {nearbyCommunities?.slice(0, 5).map((community: CommunityOverview) => (
                      <div 
                        key={community.id}
                        className="p-4 hover:bg-gray-50/50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/communities/${community.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-brand-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {(community.name || 'C')[0].toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">{community.name}</h4>
                            <p className="text-sm text-gray-600">
                              {community.stats?.total_members || 0} membres
                            </p>
                          </div>
                          <ArrowRight size={16} className="text-gray-400" />
                        </div>
                      </div>
                    ))}
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
              <Card className="p-4 border-0 bg-gradient-to-br from-purple-50 to-blue-50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">IA Assistant</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Découvrez nos fonctionnalités IA pour améliorer votre expérience
                </p>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="w-full"
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
              <Card className="p-4 border-0 bg-gradient-to-br from-yellow-50 to-orange-50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Mes Récompenses</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Gagnez des points et débloquez des badges en partageant
                </p>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="w-full"
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