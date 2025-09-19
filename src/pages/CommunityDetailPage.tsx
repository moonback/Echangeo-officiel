import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Calendar, 
  MessageCircle, 
  UserPlus,
  Navigation,
  TrendingUp,
  Star,
  Clock,
  Heart,
  Share2
} from 'lucide-react';
import { useCommunity, useJoinCommunity, useLeaveCommunity, useUserCommunities, useCommunityItems } from '../hooks/useCommunities';
import { useAuthStore } from '../store/authStore';
import CommunityEventCard from '../components/CommunityEventCard';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import CommunityDiscussionCard from '../components/CommunityDiscussionCard';
import ItemCard from '../components/ItemCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/EmptyState';

const CommunityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: community, isLoading } = useCommunity(id || '');
  const { data: userCommunities } = useUserCommunities(user?.id);
  const { data: communityItems, isLoading: itemsLoading } = useCommunityItems(id || '');
  const joinCommunity = useJoinCommunity();
  const leaveCommunity = useLeaveCommunity();

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const isMember = userCommunities?.some(uc => uc.id === community?.id) || false;
  const isJoining = joinCommunity.isPending;
  const isLeaving = leaveCommunity.isPending;

  // Fonction pour calculer la distance entre deux points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Géolocalisation de l'utilisateur
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn('La géolocalisation n\'est pas supportée');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
      },
      (error) => {
        console.warn('Erreur de géolocalisation:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  }, []);

  // Calcul de la distance quand on a les coordonnées
  useEffect(() => {
    if (userLocation && community?.center_latitude && community?.center_longitude) {
      const calculatedDistance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        community.center_latitude,
        community.center_longitude
      );
      setDistance(calculatedDistance);
    }
  }, [userLocation, community]);

  const handleJoinCommunity = async () => {
    if (!user || !community) return;
    
    try {
      await joinCommunity.mutateAsync({
        communityId: community.id,
        userId: user.id,
        role: 'member'
      });
    } catch (error) {
      console.error('Erreur lors de la rejointe de la communauté:', error);
    }
  };

  const handleLeaveCommunity = async () => {
    setShowLeaveConfirm(true);
  };

  const confirmLeaveCommunity = async () => {
    if (!user || !community) return;
    
    try {
      await leaveCommunity.mutateAsync({
        communityId: community.id,
        userId: user.id
      });
      setShowLeaveConfirm(false);
    } catch (error) {
      console.error('Erreur lors de la sortie de la communauté:', error);
    }
  };


  if (isLoading) {
    return (
      <div className="p-4 max-w1-2xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="p-4 max-w1-2xl mx-auto">
          <EmptyState
            icon={<Users className="w-12 h-12 mx-auto" />}
            title="Quartier introuvable"
            description="Ce quartier n'existe pas ou a été supprimé."
          action={
            <Button onClick={() => navigate('/communities')}>
              Retour aux quartiers
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
        {/* Header moderne avec navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <Button
              onClick={() => navigate('/communities')}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-white hover:shadow-md transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour aux quartiers
            </Button>
            
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-white hover:shadow-md transition-all duration-200"
              >
                <Share2 className="w-4 h-4" />
                Partager
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-white hover:shadow-md transition-all duration-200"
              >
                <Heart className="w-4 h-4" />
                Favoris
              </Button>
            </div>
          </div>

          {/* Hero Section moderne */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 border border-white/20 shadow-2xl backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5"></div>
            <div className="relative p-8 md:p-12">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <Badge 
                      className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200 px-4 py-2 text-sm font-medium"
                      variant="neutral"
                    >
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Quartier actif
                    </Badge>
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4">
                    {community.name}
                  </h1>
                  
                  <div className="flex items-center gap-4 text-gray-600 mb-6">
                    <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{community.city}</span>
                      {community.postal_code && (
                        <span className="text-gray-400">• {community.postal_code}</span>
                      )}
                    </div>
                    {distance !== null && (
                      <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50">
                        <Navigation className="w-4 h-4 text-green-600" />
                        <span className="font-medium">{distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}</span>
                      </div>
                    )}
                  </div>
                  
                  {community.description && (
                    <p className="text-gray-700 text-lg leading-relaxed max-w-3xl">{community.description}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-500 mb-1">Niveau d'activité</div>
                    <Badge 
                      className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200 px-4 py-2 text-sm font-medium"
                      variant="neutral"
                    >
                      <Star className="w-4 h-4 mr-1" />
                      Très actif
                    </Badge>
                  </div>
                  
                  {isMember ? (
                    <Button
                      onClick={handleLeaveCommunity}
                      disabled={isLeaving}
                      variant="danger"
                      size="lg"
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3"
                    >
                      {isLeaving ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Sortie...
                        </>
                      ) : (
                        'Quitter le quartier'
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleJoinCommunity}
                      disabled={isJoining || !user}
                      size="lg"
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3"
                    >
                      {isJoining ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Rejoindre...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Rejoindre le quartier
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Statistiques modernes */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200/50 p-6 hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {community.stats?.total_members || 0}
                    </div>
                    <div className="text-sm text-blue-600/80 font-medium">Membres</div>
                  </div>
                </div>
                <div className="text-xs text-blue-600/60">Communauté active</div>
              </div>
            </div>
            
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200/50 p-6 hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {community.stats?.total_exchanges || 0}
                    </div>
                    <div className="text-sm text-green-600/80 font-medium">Échanges</div>
                  </div>
                </div>
                <div className="text-xs text-green-600/60">Transactions réussies</div>
              </div>
            </div>
            
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200/50 p-6 hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-purple-600 mb-1">
                      {community.stats?.total_events || 0}
                    </div>
                    <div className="text-sm text-purple-600/80 font-medium">Événements</div>
                  </div>
                </div>
                <div className="text-xs text-purple-600/60">Activités organisées</div>
              </div>
            </div>
            
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200/50 p-6 hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-500 rounded-xl shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-orange-600 mb-1">
                      {community.stats?.total_items || 0}
                    </div>
                    <div className="text-sm text-orange-600/80 font-medium">Objets</div>
                  </div>
                </div>
                <div className="text-xs text-orange-600/60">Articles disponibles</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Objets du quartier - Section moderne */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Objets disponibles</h2>
                <p className="text-gray-600">Découvrez les articles partagés dans ce quartier</p>
              </div>
            </div>
            <Link 
              to={`/items?community=${community.id}`}
              className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span className="font-medium">Voir tout</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          {itemsLoading ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 p-8 shadow-xl">
              <div className="animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-64 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl"></div>
                  ))}
                </div>
              </div>
            </div>
          ) : communityItems && communityItems.length > 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 p-8 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {communityItems?.slice(0, 6).map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 p-12 shadow-xl text-center">
              <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl border border-orange-200/50 mb-8">
                <svg className="w-16 h-16 text-orange-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Aucun objet disponible</h3>
                <p className="text-gray-600 text-lg">Soyez le premier à proposer un objet dans ce quartier !</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate('/create-item')}
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3"
                  leftIcon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>}
                >
                  Proposer un objet
                </Button>
                <Button
                  onClick={() => navigate('/items')}
                  variant="secondary"
                  size="lg"
                  className="bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:bg-white hover:shadow-lg transition-all duration-200 px-8 py-3"
                >
                  Voir tous les objets
                </Button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Contenu principal moderne */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Événements récents - Section moderne */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Événements récents</h2>
                    <p className="text-gray-600 text-sm">Activités organisées dans le quartier</p>
                  </div>
                </div>
                <Link 
                  to={`/communities/${community.id}/events`}
                  className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <span className="text-sm font-medium">Voir tout</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              {community.events && community.events.length > 0 ? (
                <div className="space-y-4">
                  {community.events.slice(0, 3).map((event) => (
                    <CommunityEventCard
                      key={event.id}
                      event={event}
                      onJoin={(eventId) => {
                        // TODO: Implémenter l'inscription aux événements
                        console.log('Rejoindre événement:', eventId);
                      }}
                      onLeave={(eventId) => {
                        // TODO: Implémenter la désinscription des événements
                        console.log('Quitter événement:', eventId);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border border-purple-200/50 mb-6">
                    <Calendar className="w-16 h-16 mx-auto text-purple-500 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun événement prévu</h3>
                    <p className="text-gray-600">Soyez le premier à organiser un événement !</p>
                  </div>
                  <Button
                    onClick={() => navigate('/create-event')}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
                  >
                    Organiser un événement
                  </Button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Discussions récentes - Section moderne */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Discussions récentes</h2>
                    <p className="text-gray-600 text-sm">Conversations de la communauté</p>
                  </div>
                </div>
                <Link 
                  to={`/communities/${community.id}/discussions`}
                  className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <span className="text-sm font-medium">Voir tout</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              {community.discussions && community.discussions.length > 0 ? (
                <div className="space-y-4">
                  {community.discussions.slice(0, 3).map((discussion) => (
                    <CommunityDiscussionCard
                      key={discussion.id}
                      discussion={discussion}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl border border-blue-200/50 mb-6">
                    <MessageCircle className="w-16 h-16 mx-auto text-blue-500 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune discussion</h3>
                    <p className="text-gray-600">Commencez une conversation !</p>
                  </div>
                  <Button
                    onClick={() => navigate('/create-discussion')}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
                  >
                    Créer une discussion
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Membres récents - Section moderne */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-8"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Membres récents</h2>
                  <p className="text-gray-600 text-sm">Nouveaux membres du quartier</p>
                </div>
              </div>
              <Link 
                to={`/communities/${community.id}/members`}
                className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <span className="text-sm font-medium">Voir tout</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            {community.members && community.members.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {community.members.slice(0, 6).map((member) => (
                  <div key={member.id} className="group flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100/50 border border-gray-200/50 hover:from-green-50 hover:to-emerald-50 hover:border-green-200/50 transition-all duration-200 hover:shadow-lg">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                        {member.user?.avatar_url ? (
                          <img
                            src={member.user.avatar_url}
                            alt={member.user.full_name || member.user.email}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <Users className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">
                        {member.user?.full_name || member.user?.email}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(member.joined_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    <Badge 
                      className={
                        member.role === 'admin' 
                          ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-700 border-red-300 px-3 py-1'
                          : member.role === 'moderator'
                          ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 border-blue-300 px-3 py-1'
                          : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border-gray-300 px-3 py-1'
                      }
                      variant="neutral"
                    >
                      {member.role === 'admin' ? 'Admin' : 
                       member.role === 'moderator' ? 'Modérateur' : 'Membre'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border border-green-200/50 mb-6">
                  <Users className="w-16 h-16 mx-auto text-green-500 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun membre</h3>
                  <p className="text-gray-600">Soyez le premier à rejoindre ce quartier !</p>
                </div>
                <Button
                  onClick={handleJoinCommunity}
                  disabled={isJoining || !user}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
                >
                  {isJoining ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Rejoindre...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Rejoindre le quartier
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </motion.div>
        </motion.div>
      </div>

      {/* Dialog de confirmation pour quitter le quartier */}
      <ConfirmDialog
        isOpen={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={confirmLeaveCommunity}
        title="Quitter le quartier"
        message={`Êtes-vous sûr de vouloir quitter le quartier "${community?.name}" ? Vous perdrez l'accès aux fonctionnalités réservées aux membres.`}
        confirmText="Quitter le quartier"
        cancelText="Annuler"
        variant="danger"
        isLoading={isLeaving}
      />
    </div>
  );
};

export default CommunityDetailPage;
