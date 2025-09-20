import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Calendar, 
  UserPlus,
  Navigation,
  Clock,
  Heart,
  Share2,
  Building2,
  Package,
  Activity,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useCommunity, useJoinCommunity, useLeaveCommunity, useUserCommunities, useCommunityItems } from '../hooks/useCommunities';
import { useAuthStore } from '../store/authStore';
import CommunityEventCard from '../components/CommunityEventCard';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ItemCard from '../components/ItemCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
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
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Retour aux quartiers
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Share2 className="w-3 h-3" />}
                className="px-2 py-1 text-xs h-7"
              >
                Partager
              </Button>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Heart className="w-3 h-3" />}
                className="px-2 py-1 text-xs h-7"
              >
                Favoris
              </Button>
            </div>
          </div>

          {/* Hero Section Ultra-Moderne */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
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
            <Card className="relative p-0 border-0 bg-white/80 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-3xl overflow-hidden">
              <div className="relative bg-gradient-to-br from-brand-50/80 via-white/60 to-purple-50/40 p-6 md:p-8">
                {/* Background Decorations */}
                <motion.div 
                  className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-200/20 to-purple-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.4, 0.2]
                  }}
                  transition={{ 
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div 
                  className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-200/20 to-brand-200/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"
                  animate={{ 
                    scale: [1.2, 1, 1.2],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{ 
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                  }}
                />
                
                <div className="relative">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-4 bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl shadow-lg">
                      <Building2 className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200 px-4 py-2 text-sm font-medium"
                        variant="neutral"
                      >
                        <Activity className="w-4 h-4 mr-1" />
                        Quartier actif
                      </Badge>
                      {community.stats && community.stats.total_members > 0 && (
                        <Badge 
                          className="bg-gradient-to-r from-brand-100 to-brand-200 text-brand-700 border-brand-200 px-3 py-1 text-xs font-medium"
                          variant="neutral"
                        >
                          <Users className="w-3 h-3 mr-1" />
                          {community.stats.total_members} membres
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <motion.h1 
                    className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-slate-900 via-brand-600 to-slate-900 bg-clip-text text-transparent leading-tight"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {community.name}
                  </motion.h1>
                  
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200/50 shadow-sm">
                      <MapPin className="w-4 h-4 text-brand-600" />
                      <span className="font-medium text-gray-700">{community.city}</span>
                      {community.postal_code && (
                        <span className="text-gray-500">• {community.postal_code}</span>
                      )}
                    </div>
                    {distance !== null && (
                      <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200/50 shadow-sm">
                        <Navigation className="w-4 h-4 text-brand-600" />
                        <span className="font-medium text-gray-700">{distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200/50 shadow-sm">
                      <Calendar className="w-4 h-4 text-brand-600" />
                      <span className="font-medium text-gray-700">Créé le {new Date(community.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>
                  
                  {community.description && (
                    <p className="text-gray-600 text-lg leading-relaxed max-w-3xl">{community.description}</p>
                  )}
                </div>
                
                <div className="flex flex-col items-end gap-4">
                  
                  
                  {isMember ? (
                    <Button
                      onClick={handleLeaveCommunity}
                      disabled={isLeaving}
                      variant="danger"
                      size="md"
                      leftIcon={isLeaving ? <Clock className="w-3 h-3 animate-spin" /> : undefined}
                      className="px-4 py-2 text-sm"
                    >
                      {isLeaving ? 'Sortie...' : 'Quitter le quartier'}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleJoinCommunity}
                      disabled={isJoining || !user}
                      size="md"
                      leftIcon={isJoining ? <Clock className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3 h-3" />}
                      className="px-4 py-2 text-sm"
                    >
                      {isJoining ? 'Rejoindre...' : 'Rejoindre le quartier'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
              </div>
            </Card>
          </motion.div>


        {/* Objets du quartier - Section moderne */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Objets disponibles</h2>
                <p className="text-gray-600">Découvrez les articles partagés dans ce quartier</p>
              </div>
            </div>
            <Link to={`/items?community=${community.id}`}>
              <Button
                size="sm"
                rightIcon={<ChevronRight className="w-3 h-3" />}
                className="px-3 py-1 text-xs"
              >
                Voir tout
              </Button>
            </Link>
          </div>
          
          {itemsLoading ? (
            <Card className="p-8">
              <div className="animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-64 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl"></div>
                  ))}
                </div>
              </div>
            </Card>
          ) : communityItems && communityItems.length > 0 ? (
            <Card className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {communityItems?.slice(0, 6).map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                  />
                ))}
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <div className="p-6 bg-gradient-to-br from-brand-50 to-brand-100 rounded-3xl border border-brand-200/50 mb-8">
                <Package className="w-16 h-16 text-brand-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Aucun objet disponible</h3>
                <p className="text-gray-600 text-lg">Soyez le premier à proposer un objet dans ce quartier !</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => navigate('/create-item')}
                  size="md"
                  leftIcon={<Plus className="w-4 h-4" />}
                  className="px-4 py-2 text-sm"
                >
                  Proposer un objet
                </Button>
                <Button
                  onClick={() => navigate('/items')}
                  variant="secondary"
                  size="md"
                  className="px-4 py-2 text-sm"
                >
                  Voir tous les objets
                </Button>
              </div>
            </Card>
          )}
        </motion.div>

        {/* Contenu principal moderne */}
        <div className="mb-12">
          {/* Événements récents - Section moderne */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Événements récents</h2>
                    <p className="text-gray-600 text-sm">Activités organisées dans le quartier</p>
                  </div>
                </div>
                <Link to={`/communities/${community.id}/events`}>
                  <Button
                    size="sm"
                    rightIcon={<ChevronRight className="w-3 h-3" />}
                    className="px-2 py-1 text-xs h-7"
                  >
                    Voir tout
                  </Button>
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
                  <div className="p-6 bg-gradient-to-br from-brand-50 to-brand-100 rounded-3xl border border-brand-200/50 mb-6">
                    <Calendar className="w-16 h-16 mx-auto text-brand-500 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun événement prévu</h3>
                    <p className="text-gray-600">Soyez le premier à organiser un événement !</p>
                  </div>
                  <Button
                    onClick={() => navigate('/create-event')}
                    size="sm"
                    className="px-3 py-1 text-sm"
                  >
                    Organiser un événement
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Membres récents - Section moderne */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-8"
        >
          <Card className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Membres récents</h2>
                  <p className="text-gray-600 text-sm">Nouveaux membres du quartier</p>
                </div>
              </div>
              <Link to={`/communities/${community.id}/members`}>
                <Button
                  size="sm"
                  rightIcon={<ChevronRight className="w-3 h-3" />}
                  className="px-2 py-1 text-xs h-7"
                >
                  Voir tout
                </Button>
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
                <div className="p-6 bg-gradient-to-br from-brand-50 to-brand-100 rounded-3xl border border-brand-200/50 mb-6">
                  <Users className="w-16 h-16 mx-auto text-brand-500 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun membre</h3>
                  <p className="text-gray-600">Soyez le premier à rejoindre ce quartier !</p>
                </div>
                <Button
                  onClick={handleJoinCommunity}
                  disabled={isJoining || !user}
                  size="sm"
                  leftIcon={isJoining ? <Clock className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3 h-3" />}
                  className="px-3 py-1 text-sm"
                >
                  {isJoining ? 'Rejoindre...' : 'Rejoindre le quartier'}
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
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
