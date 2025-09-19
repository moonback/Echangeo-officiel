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
  Navigation
} from 'lucide-react';
import { useCommunity, useJoinCommunity, useLeaveCommunity, useUserCommunities, useCommunityItems } from '../hooks/useCommunities';
import { useAuthStore } from '../store/authStore';
import CommunityEventCard from '../components/CommunityEventCard';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import CommunityDiscussionCard from '../components/CommunityDiscussionCard';
import ItemCard from '../components/ItemCard';
import Card from '../components/ui/Card';
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

  const getActivityColor = (level: string) => {
    switch (level) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'inactive': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getActivityLabel = (level: string) => {
    switch (level) {
      case 'active': return 'Très actif';
      case 'moderate': return 'Modérément actif';
      case 'inactive': return 'Peu actif';
      default: return 'Inconnu';
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
    <div className="p-4 max-w1-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Header avec bouton retour */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={() => navigate('/communities')}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 gradient-text">
                {community.name}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <MapPin className="w-4 h-4" />
                <span>{community.city}</span>
                {community.postal_code && (
                  <span className="text-gray-400">• {community.postal_code}</span>
                )}
                {distance !== null && (
                  <>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center gap-1">
                      <Navigation className="w-3 h-3" />
                      <span>{distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}</span>
                    </div>
                  </>
                )}
              </div>
              {community.description && (
                <p className="text-gray-600 text-lg mb-4">{community.description}</p>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <Badge 
                className={getActivityColor('moderate')}
                variant="neutral"
              >
                {getActivityLabel('moderate')}
              </Badge>
              
              {isMember ? (
                <Button
                  onClick={handleLeaveCommunity}
                  disabled={isLeaving}
                  variant="danger"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  {isLeaving ? 'Sortie...' : 'Quitter le quartier'}
                </Button>
              ) : (
                <Button
                  onClick={handleJoinCommunity}
                  disabled={isJoining || !user}
                  className="bg-brand-600 hover:bg-brand-700"
                >
                  {isJoining ? (
                    'Rejoindre...'
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
        </motion.div>

        {/* Statistiques */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <Card className="p-6 glass-card">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-600 mb-2">
                  {community.stats?.total_members || 0}
                </div>
                <div className="text-sm text-gray-600">Membres</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {community.stats?.total_exchanges || 0}
                </div>
                <div className="text-sm text-gray-600">Échanges</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {community.stats?.total_events || 0}
                </div>
                <div className="text-sm text-gray-600">Événements</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {community.stats?.total_items || 0}
                </div>
                <div className="text-sm text-gray-600">Objets</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Objets du quartier */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Objets disponibles
            </h2>
            <Link 
              to={`/items?community=${community.id}`}
              className="text-sm text-brand-600 hover:text-brand-700"
            >
              Voir tout →
            </Link>
          </div>
          
          {itemsLoading ? (
            <Card className="p-6">
              <div className="animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
            </Card>
          ) : communityItems && communityItems.length > 0 ? (
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {communityItems?.slice(0, 6).map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                  />
                ))}
              </div>
            </Card>
          ) : (
            <EmptyState
              icon={
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              }
              title="Aucun objet disponible"
              description="Soyez le premier à proposer un objet dans ce quartier !"
              action={
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => navigate('/create-item')}
                    variant="primary"
                    leftIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>}
                  >
                    Proposer un objet
                  </Button>
                  <Button
                    onClick={() => navigate('/items')}
                    variant="secondary"
                  >
                    Voir tous les objets
                  </Button>
                </div>
              }
            />
          )}
        </motion.div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Événements récents */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-600" />
                Événements récents
              </h2>
              <Link 
                to={`/communities/${community.id}/events`}
                className="text-sm text-brand-600 hover:text-brand-700"
              >
                Voir tout →
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
              <Card className="p-6 text-center">
                <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">Aucun événement prévu</p>
                <p className="text-sm text-gray-500 mt-1">
                  Soyez le premier à organiser un événement !
                </p>
              </Card>
            )}
          </motion.div>

          {/* Discussions récentes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-brand-600" />
                Discussions récentes
              </h2>
              <Link 
                to={`/communities/${community.id}/discussions`}
                className="text-sm text-brand-600 hover:text-brand-700"
              >
                Voir tout →
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
              <Card className="p-6 text-center">
                <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">Aucune discussion</p>
                <p className="text-sm text-gray-500 mt-1">
                  Commencez une conversation !
                </p>
              </Card>
            )}
          </motion.div>
        </div>

        {/* Membres récents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-600" />
              Membres récents
            </h2>
            <Link 
              to={`/communities/${community.id}/members`}
              className="text-sm text-brand-600 hover:text-brand-700"
            >
              Voir tout →
            </Link>
          </div>
          
          {community.members && community.members.length > 0 ? (
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {community.members.slice(0, 6).map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
                      {member.user?.avatar_url ? (
                        <img
                          src={member.user.avatar_url}
                          alt={member.user.full_name || member.user.email}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <Users className="w-5 h-5 text-brand-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {member.user?.full_name || member.user?.email}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(member.joined_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    <Badge 
                      className={
                        member.role === 'admin' 
                          ? 'bg-red-100 text-red-700 border-red-200'
                          : member.role === 'moderator'
                          ? 'bg-blue-100 text-blue-700 border-blue-200'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      }
                      variant="neutral"
                    >
                      {member.role === 'admin' ? 'Admin' : 
                       member.role === 'moderator' ? 'Modérateur' : 'Membre'}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card className="p-6 text-center">
              <Users className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600">Aucun membre</p>
              <p className="text-sm text-gray-500 mt-1">
                Soyez le premier à rejoindre ce quartier !
              </p>
            </Card>
          )}
        </motion.div>
      </motion.div>

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
