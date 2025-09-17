import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, X, Clock, MessageCircle, Star } from 'lucide-react';
import { useRequests, useUpdateRequestStatus } from '../hooks/useRequests';
import { useAuthStore } from '../store/authStore';
import { useUpsertItemRating, useUpsertUserRating } from '../hooks/useRatings';
import { supabase } from '../services/supabase';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/EmptyState';

const RequestsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { data: requests, isLoading } = useRequests();
  const updateStatus = useUpdateRequestStatus();
  const upsertRating = useUpsertItemRating();
  const upsertUserRating = useUpsertUserRating();
  const [openRatingFor, setOpenRatingFor] = React.useState<string | null>(null);
  const [ratingScore, setRatingScore] = React.useState<number>(5);
  const [ratingComment, setRatingComment] = React.useState<string>('');
  const [ratingStatsMap, setRatingStatsMap] = React.useState<Record<string, { average_rating?: number; ratings_count?: number }>>({});
  const [hasUserRatedMap, setHasUserRatedMap] = React.useState<Record<string, boolean>>({});
  const [openUserRatingFor, setOpenUserRatingFor] = React.useState<string | null>(null);
  const [commScore, setCommScore] = React.useState<number>(5);
  const [punctScore, setPunctScore] = React.useState<number>(5);
  const [careScore, setCareScore] = React.useState<number>(5);
  const [userRatingComment, setUserRatingComment] = React.useState<string>('');

  React.useEffect(() => {
    const loadStats = async () => {
      const ids = Array.from(new Set((requests ?? []).map(r => r.item_id).filter(Boolean))) as string[];
      if (ids.length === 0) return;
      const { data } = await supabase
        .from('item_rating_stats')
        .select('*')
        .in('item_id', ids);
      const map: Record<string, { average_rating?: number; ratings_count?: number }> = {};
      for (const row of data ?? []) {
        const item_id = (row as any).item_id as string;
        map[item_id] = {
          average_rating: (row as any).average_rating ?? undefined,
          ratings_count: (row as any).ratings_count ?? undefined,
        };
      }
      setRatingStatsMap(map);
    };
    loadStats();
  }, [requests]);

  React.useEffect(() => {
    const loadUserRatings = async () => {
      if (!user || !requests || requests.length === 0) return;
      const completedIds = requests.filter(r => r.status === 'completed').map(r => r.id);
      if (completedIds.length === 0) return;
      const { data, error } = await supabase
        .from('user_ratings')
        .select('request_id, rater_id')
        .in('request_id', completedIds)
        .eq('rater_id', user.id);
      if (error) return;
      const map: Record<string, boolean> = {};
      for (const row of (data ?? []) as { request_id: string; rater_id: string }[]) {
        map[row.request_id] = true;
      }
      setHasUserRatedMap(map);
    };
    loadUserRatings();
  }, [requests, user]);

  if (isLoading) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="h-4 bg-gray-200 rounded mb-2" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const myRequests = requests?.filter(r => r.requester_id === user?.id) || [];
  const receivedRequests = requests?.filter(r => r.item?.owner_id === user?.id) || [];

  const handleStatusUpdate = async (requestId: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ id: requestId, status });
    } catch (error) {
      console.error('Error updating request status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Acceptée';
      case 'rejected': return 'Refusée';
      case 'completed': return 'Terminée';
      default: return status;
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Mes demandes
        </h1>
        <p className="text-gray-600">
          Gérez vos demandes d'emprunt et celles que vous recevez
        </p>
      </motion.div>

      <div className="space-y-8">
        {/* Received Requests */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Demandes reçues ({receivedRequests.length})
          </h2>
          
          {receivedRequests.length === 0 ? (
            <EmptyState icon={<MessageCircle className="w-12 h-12" />} title="Aucune demande reçue" description="Vous n'avez pas encore reçu de demande." />
          ) : (
            <div className="space-y-4">
              {receivedRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-xl p-4 border border-gray-200 glass">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {request.requester?.full_name || 'Anonyme'} souhaite emprunter
                      </h3>
                      <Link 
                        to={`/items/${request.item_id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {request.item?.title}
                      </Link>
                      {ratingStatsMap[request.item_id] && (
                        <div className="mt-1 flex items-center text-xs text-gray-600">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className="font-medium">{ratingStatsMap[request.item_id].average_rating?.toFixed?.(1) ?? '—'}</span>
                          <span className="ml-1">({ratingStatsMap[request.item_id].ratings_count ?? 0})</span>
                        </div>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                      {getStatusLabel(request.status)}
                    </span>
                  </div>
                  
                  {request.message && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-gray-700 text-sm italic">"{request.message}"</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{new Date(request.created_at).toLocaleDateString('fr-FR')}</span>
                    
                    {request.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button variant="secondary" size="sm" onClick={() => handleStatusUpdate(request.id, 'approved')} leftIcon={<Check size={16} />}>Accepter</Button>
                        <Button variant="danger" size="sm" onClick={() => handleStatusUpdate(request.id, 'rejected')} leftIcon={<X size={16} />}>Refuser</Button>
                      </div>
                    )}
                    {request.status === 'completed' && (
                      <div className="flex items-center gap-2">
                        {!hasUserRatedMap[request.id] && (
                          <button
                            onClick={() => setOpenUserRatingFor(openUserRatingFor === request.id ? null : request.id)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            Évaluer l'emprunteur
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  {openUserRatingFor === request.id && (
                    <form
                      className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-3 glass"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const ratedUserId = request.requester_id as string | undefined;
                        if (!ratedUserId) return;
                        await upsertUserRating.mutateAsync({
                          request_id: request.id,
                          rated_user_id: ratedUserId,
                          communication_score: commScore,
                          punctuality_score: punctScore,
                          care_score: careScore,
                          comment: userRatingComment,
                        });
                        setOpenUserRatingFor(null);
                        setUserRatingComment('');
                      }}
                    >
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Communication</label>
                        <div className="flex items-center gap-2">
                          {[1,2,3,4,5].map((s) => (
                            <button key={`rc-${s}`} type="button" onClick={() => setCommScore(s)}
                              className={`w-7 h-7 rounded-full border ${commScore >= s ? 'bg-blue-500 border-blue-600' : 'border-gray-300'} hover:bg-blue-300`} />
                          ))}
                          <span className="text-xs text-gray-600 ml-2">{commScore}/5</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Ponctualité</label>
                        <div className="flex items-center gap-2">
                          {[1,2,3,4,5].map((s) => (
                            <button key={`rp-${s}`} type="button" onClick={() => setPunctScore(s)}
                              className={`w-7 h-7 rounded-full border ${punctScore >= s ? 'bg-blue-500 border-blue-600' : 'border-gray-300'} hover:bg-blue-300`} />
                          ))}
                          <span className="text-xs text-gray-600 ml-2">{punctScore}/5</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Soin de l'objet</label>
                        <div className="flex items-center gap-2">
                          {[1,2,3,4,5].map((s) => (
                            <button key={`rs-${s}`} type="button" onClick={() => setCareScore(s)}
                              className={`w-7 h-7 rounded-full border ${careScore >= s ? 'bg-blue-500 border-blue-600' : 'border-gray-300'} hover:bg-blue-300`} />
                          ))}
                          <span className="text-xs text-gray-600 ml-2">{careScore}/5</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Commentaire (optionnel)</label>
                        <textarea
                          value={userRatingComment}
                          onChange={(e) => setUserRatingComment(e.target.value)}
                          rows={2}
                          className="input"
                          placeholder="Partagez votre expérience..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="btn btn-primary btn-sm" disabled={upsertUserRating.isPending}>
                          {upsertUserRating.isPending ? 'Envoi...' : 'Publier'}
                        </button>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpenUserRatingFor(null)}>Annuler</button>
                      </div>
                    </form>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.section>

        {/* My Requests */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Mes demandes ({myRequests.length})
          </h2>
          
          {myRequests.length === 0 ? (
            <EmptyState
              icon={<Clock className="w-12 h-12" />}
              title="Aucune demande"
              description="Vous n'avez fait aucune demande pour le moment."
              action={<Link to="/items"><Button>Parcourir les objets</Button></Link>}
            />
          ) : (
            <div className="space-y-4">
              {myRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-xl p-4 border border-gray-200 glass">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        Demande pour
                      </h3>
                      <Link 
                        to={`/items/${request.item_id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {request.item?.title}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">
                        Propriétaire: {request.item?.owner?.full_name || 'Anonyme'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                      {getStatusLabel(request.status)}
                    </span>
                  </div>
                  
                  {request.message && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-gray-700 text-sm">Votre message: "{request.message}"</p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{new Date(request.created_at).toLocaleDateString('fr-FR')}</span>
                    
                    {request.status === 'approved' && (
                      <Button variant="secondary" size="sm" onClick={() => handleStatusUpdate(request.id, 'completed')}>
                        Marquer comme terminé
                      </Button>
                    )}
                    {request.status === 'completed' && request.requester_id === user?.id && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setOpenRatingFor(openRatingFor === request.id ? null : request.id)}
                          className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                        >
                          Laisser un avis
                        </button>
                        {!hasUserRatedMap[request.id] && (
                          <button
                            onClick={() => setOpenUserRatingFor(openUserRatingFor === request.id ? null : request.id)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            Évaluer le propriétaire
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  {openRatingFor === request.id && (
                    <form
                      className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2 glass"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!request.item_id) return;
                        await upsertRating.mutateAsync({ item_id: request.item_id, score: ratingScore, comment: ratingComment });
                        setOpenRatingFor(null);
                        setRatingComment('');
                      }}
                    >
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Note</label>
                        <div className="flex items-center gap-2">
                          {[1,2,3,4,5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setRatingScore(s)}
                              className={`w-7 h-7 rounded-full border ${ratingScore >= s ? 'bg-yellow-400 border-yellow-500' : 'border-gray-300'} hover:bg-yellow-300`}
                              aria-label={`Note ${s}`}
                            />
                          ))}
                          <span className="text-xs text-gray-600 ml-2">{ratingScore}/5</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Commentaire (optionnel)</label>
                        <textarea
                          value={ratingComment}
                          onChange={(e) => setRatingComment(e.target.value)}
                          rows={2}
                          className="input"
                          placeholder="Partagez votre expérience..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="btn btn-primary btn-sm" disabled={upsertRating.isPending}>
                          {upsertRating.isPending ? 'Envoi...' : 'Publier'}
                        </button>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpenRatingFor(null)}>Annuler</button>
                      </div>
                    </form>
                  )}
                  {openUserRatingFor === request.id && (
                    <form
                      className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-3 glass"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const ratedUserId = request.item?.owner_id as string | undefined;
                        if (!ratedUserId) return;
                        await upsertUserRating.mutateAsync({
                          request_id: request.id,
                          rated_user_id: ratedUserId,
                          communication_score: commScore,
                          punctuality_score: punctScore,
                          care_score: careScore,
                          comment: userRatingComment,
                        });
                        setOpenUserRatingFor(null);
                        setUserRatingComment('');
                      }}
                    >
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Communication</label>
                        <div className="flex items-center gap-2">
                          {[1,2,3,4,5].map((s) => (
                            <button key={`c-${s}`} type="button" onClick={() => setCommScore(s)}
                              className={`w-7 h-7 rounded-full border ${commScore >= s ? 'bg-blue-500 border-blue-600' : 'border-gray-300'} hover:bg-blue-300`} />
                          ))}
                          <span className="text-xs text-gray-600 ml-2">{commScore}/5</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Ponctualité</label>
                        <div className="flex items-center gap-2">
                          {[1,2,3,4,5].map((s) => (
                            <button key={`p-${s}`} type="button" onClick={() => setPunctScore(s)}
                              className={`w-7 h-7 rounded-full border ${punctScore >= s ? 'bg-blue-500 border-blue-600' : 'border-gray-300'} hover:bg-blue-300`} />
                          ))}
                          <span className="text-xs text-gray-600 ml-2">{punctScore}/5</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Soin de l'objet</label>
                        <div className="flex items-center gap-2">
                          {[1,2,3,4,5].map((s) => (
                            <button key={`s-${s}`} type="button" onClick={() => setCareScore(s)}
                              className={`w-7 h-7 rounded-full border ${careScore >= s ? 'bg-blue-500 border-blue-600' : 'border-gray-300'} hover:bg-blue-300`} />
                          ))}
                          <span className="text-xs text-gray-600 ml-2">{careScore}/5</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Commentaire (optionnel)</label>
                        <textarea
                          value={userRatingComment}
                          onChange={(e) => setUserRatingComment(e.target.value)}
                          rows={2}
                          className="input"
                          placeholder="Partagez votre expérience..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="btn btn-primary btn-sm" disabled={upsertUserRating.isPending}>
                          {upsertUserRating.isPending ? 'Envoi...' : 'Publier'}
                        </button>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpenUserRatingFor(null)}>Annuler</button>
                      </div>
                    </form>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
};

export default RequestsPage;