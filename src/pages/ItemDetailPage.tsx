import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  User, 
  Calendar,
  MessageCircle,
  Share2,
  Heart,
  CheckCircle,
  X,
  AlertCircle,
  Sparkles,
  Wand2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useItem, useUpdateItem } from '../hooks/useItems';
import { useFavorites, useIsItemFavorited } from '../hooks/useFavorites';
import { useUpsertItemRating } from '../hooks/useRatings';
import { useCreateRequest, useRequests } from '../hooks/useRequests';
import { useRequestMessageGenerator } from '../hooks/useChatAI';
import { getCategoryIcon, getCategoryLabel } from '../utils/categories';
import { getOfferTypeIcon, getOfferTypeLabel } from '../utils/offerTypes';
import { useAuthStore } from '../store/authStore';
import { useProfile } from '../hooks/useProfiles';
import Button from '../components/ui/Button';
import CompatibilityScore from '../components/CompatibilityScore';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';

const ItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { data: item, isLoading } = useItem(id!);
  const { toggle } = useFavorites();
  const { data: isFavorited = false } = useIsItemFavorited(id);
  const updateItem = useUpdateItem();
  const upsertRating = useUpsertItemRating();
  const { data: allRequests } = useRequests();
  const createRequest = useCreateRequest();
  const [requestMessage, setRequestMessage] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState<string>('');
  const { generateMessage, isGenerating } = useRequestMessageGenerator();
  const { data: currentUserProfile } = useProfile(user?.id);
  const hasCompletedBorrow = !!(item && allRequests?.some(
    (r) => r.requester_id === user?.id && r.item_id === item.id && r.status === 'completed'
  ));
  
  const hasPendingRequest = !!(item && allRequests?.some(
    (r) => r.requester_id === user?.id && r.item_id === item.id && r.status === 'pending'
  ));

  if (isLoading) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="aspect-video bg-gray-200 rounded-xl mb-6" />
          <div className="h-8 bg-gray-200 rounded mb-4" />
          <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
          <div className="h-4 bg-gray-200 rounded mb-2 w-1/2" />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="p-4 max-w-7xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Objet non trouvé</h1>
        <Link 
          to="/items" 
          className="text-blue-600 hover:text-blue-700"
        >
          Retour aux objets
        </Link>
      </div>
    );
  }

  const CategoryIcon = getCategoryIcon(item.category);
  const OfferTypeIcon = getOfferTypeIcon(item.offer_type);
  const isOwner = user?.id === item.owner_id;

  // Gestion des événements clavier pour la lightbox
  useEffect(() => {
    if (!isLightboxOpen || !item?.images) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
      if (e.key === 'ArrowLeft') goPrevImage();
      if (e.key === 'ArrowRight') goNextImage();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isLightboxOpen, item?.images]);

  const goPrevImage = () => {
    if (!item?.images || item.images.length === 0) return;
    setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
  };

  const goNextImage = () => {
    if (!item?.images || item.images.length === 0) return;
    setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Effacer les messages précédents
      setErrorMessage(null);
      setShowSuccessMessage(false);
      
      await createRequest.mutateAsync({
        item_id: item.id,
        message: requestMessage,
      });
      setShowRequestForm(false);
      setRequestMessage('');
      setShowSuccessMessage(true);
      // Masquer le message après 5 secondes
      setTimeout(() => setShowSuccessMessage(false), 5000);
    } catch (error) {
      console.error('Error creating request:', error);
      setErrorMessage(
        item.offer_type === 'trade' 
          ? 'Erreur lors de l\'envoi de la proposition d\'échange. Veuillez réessayer.'
          : 'Erreur lors de l\'envoi de la demande d\'emprunt. Veuillez réessayer.'
      );
      // Masquer le message d'erreur après 5 secondes
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center mb-6"
      >
        <Link
          to="/items"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-white hover:shadow-sm transition-all mr-4 bg-white/70 backdrop-blur-sm"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Retour</span>
        </Link>
        <h1 className="text-2xl font-bold flex-1">
          <span className="bg-gradient-to-r from-gray-900 via-brand-700 to-gray-900 bg-clip-text text-transparent">Détails de l'objet</span>
        </h1>
        <div className="flex items-center gap-2">
          <button
            className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border transition-all backdrop-blur-sm shadow-sm hover:shadow ${isFavorited ? 'bg-red-500 text-white border-red-400 hover:bg-red-600' : 'bg-white/80 text-gray-700 border-gray-200 hover:bg-white'}`}
            onClick={async () => { if (!id) return; if (!user) { window.location.href = '/login'; return; } await toggle(id); }}
            aria-pressed={isFavorited}
            aria-label={isFavorited ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            title="Favori"
          >
            <Heart size={18} className={isFavorited ? 'fill-current' : ''} />
          </button>
          <button
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl border bg-white/80 text-gray-700 border-gray-200 hover:bg-white backdrop-blur-sm shadow-sm hover:shadow"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(window.location.href);
              } catch {}
            }}
            title="Copier le lien"
            aria-label="Copier le lien"
          >
            <Share2 size={18} />
          </button>
          {isOwner && (
            <Link
              to={`/items/${id}/edit`}
              className="px-3 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow"
            >
              Modifier
            </Link>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="aspect-square overflow-hidden mb-4 glass-strong cursor-zoom-in" onClick={() => item.images && item.images.length > 0 && setIsLightboxOpen(true)}>
            {item.images && item.images.length > 0 ? (
              <img
                src={item.images[currentImageIndex]?.url || item.images[0].url}
                alt={item.title}
                className="w-full h-full object-cover transition-all duration-700 hover:scale-[1.03]"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <CategoryIcon className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </Card>
          
          {item.images && item.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {item.images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`aspect-square rounded-lg overflow-hidden transition-all hover:scale-[1.03] border ${
                    currentImageIndex === index ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'
                  } bg-white/70 backdrop-blur-sm`}
                >
                  <img
                    src={image.url}
                    alt={`${item.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Category & Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="info" className="bg-white/90 backdrop-blur-sm border border-gray-200"><CategoryIcon className="w-4 h-4 mr-2 inline" />{getCategoryLabel(item.category)}</Badge>
              <Badge 
                className={`${
                  item.offer_type === 'trade' 
                    ? 'bg-orange-100/90 text-orange-700 border-orange-200' 
                    : 'bg-blue-100/90 text-blue-700 border-blue-200'
                }`}
              >
                <OfferTypeIcon className="w-4 h-4 mr-2 inline" />
                {getOfferTypeLabel(item.offer_type)}
              </Badge>
            </div>
            <Badge variant={item.is_available ? 'success' : 'danger'} className="shadow">
              {item.is_available ? 'Disponible' : 'Non disponible'}
            </Badge>
          </div>

          {typeof (item as any).average_rating === 'number' && (item as any).ratings_count ? (
            <div className="flex items-center text-sm text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-yellow-500 mr-1"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.285a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.034a1 1 0 00-.364 1.118l1.07 3.286c.3.92-.755 1.688-1.54 1.118l-2.802-2.034a1 1 0 00-1.175 0l-2.802 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.286a1 1 0 00-.364-1.118L2.98 8.712c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.285z" /></svg>
              <span className="font-medium">{(item as any).average_rating.toFixed(1)}</span>
              <span className="ml-1 text-gray-500">({(item as any).ratings_count})</span>
            </div>
          ) : null}

          <div>
            <h1 className="text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-gray-900 via-brand-700 to-gray-900 bg-clip-text text-transparent">{item.title}</span>
            </h1>
            {item.description && (
              <p className="text-gray-700 leading-relaxed mb-4">{item.description}</p>
            )}
            
            {item.offer_type === 'trade' && item.desired_items && (
              <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100/60 rounded-lg border border-orange-200">
                <h3 className="font-semibold text-orange-800 mb-2 flex items-center">
                  <OfferTypeIcon className="w-5 h-5 mr-2" />
                  Recherche en échange
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const allItems = item.desired_items
                      .split(/[,;\n]/g)
                      .map((s) => s.trim())
                      .filter((s) => s.length > 0);
                    const visibleItems = allItems.slice(0, 12);
                    const remainingCount = allItems.length - visibleItems.length;
                    
                    return (
                      <>
                        {visibleItems.map((d, i) => (
                          <span key={`${d}-${i}`} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white text-orange-700 border border-orange-200">
                            {d}
                          </span>
                        ))}
                        {remainingCount > 0 && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-200 text-orange-800 border border-orange-300">
                            +{remainingCount}
                          </span>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* Owner Info */}
          <Card className="p-4 bg-white/70 glass-card">
            <h3 className="font-semibold text-gray-900 mb-3">Propriétaire</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-brand-100 to-brand-200 border-2 border-white shadow-lg">
                  {item.owner?.avatar_url ? (
                    <img
                      src={item.owner.avatar_url}
                      alt={`Avatar de ${item.owner.full_name || 'Propriétaire'}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-6 h-6 text-brand-600" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {item.owner?.full_name || 'Anonyme'}
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>À proximité</span>
                  </div>
                </div>
              </div>
              <Link to={`/profile/${item.owner_id}`}>
                <Button variant="secondary" size="sm">Voir le profil</Button>
              </Link>
            </div>
          </Card>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">État :</span>
              <p className="font-medium text-gray-900 capitalize">{item.condition}</p>
            </div>
            <div>
              <span className="text-gray-500">Ajouté le :</span>
              <p className="font-medium text-gray-900">
                {new Date(item.created_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>


          {/* Message de succès */}
          {showSuccessMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-800">
                      {item.offer_type === 'trade' ? 'Proposition d\'échange envoyée !' : 'Demande d\'emprunt envoyée !'}
                    </p>
                    <p className="text-sm text-green-600">
                      {item.offer_type === 'trade' 
                        ? 'Le propriétaire va examiner votre proposition d\'échange.'
                        : 'Le propriétaire va examiner votre demande d\'emprunt.'
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSuccessMessage(false)}
                  className="text-green-600 hover:text-green-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Message d'erreur */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                  <div>
                    <p className="font-medium text-red-800">Erreur d'envoi</p>
                    <p className="text-sm text-red-600">{errorMessage}</p>
                  </div>
                </div>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Message demande en cours */}
          {!isOwner && item.is_available && hasPendingRequest && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-blue-800">
                    {item.offer_type === 'trade' ? 'Proposition d\'échange en cours' : 'Demande d\'emprunt en cours'}
                  </p>
                  <p className="text-sm text-blue-600">
                    Vous avez déjà envoyé une {item.offer_type === 'trade' ? 'proposition d\'échange' : 'demande d\'emprunt'} pour cet objet. 
                    Le propriétaire va vous répondre bientôt.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Score de compatibilité IA */}
          {!isOwner && currentUserProfile && item.owner && (
            <CompatibilityScore
              requesterProfile={currentUserProfile}
              ownerProfile={item.owner}
              item={item}
              requestHistory={allRequests?.filter(r => 
                (r.requester_id === user?.id && r.item?.owner_id === item.owner_id) ||
                (r.item?.owner_id === user?.id && r.requester_id === item.owner_id)
              )}
              className="mb-6"
            />
          )}

          {/* Actions */}
          {!isOwner && item.is_available && !hasPendingRequest && (
            <div className="space-y-4">
              {!showRequestForm ? (
                <div className="flex space-x-3">
                  <Button className="flex-1" onClick={() => setShowRequestForm(true)}>
                    {item.offer_type === 'trade' ? 'Proposer un échange' : 'Demander à emprunter'}
                  </Button>
                  <Link
                    to={`/profile/${item.owner_id}`}
                    className="flex items-center px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-white transition-colors bg-white/70 backdrop-blur-sm"
                  >
                    <MessageCircle size={20} />
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleRequestSubmit} className="space-y-4">
                  {/* Assistant IA pour générer le message */}
                  {import.meta.env.VITE_MISTRAL_API_KEY && (
                    <div className="bg-gradient-to-r from-purple-50/50 to-blue-50/50 border border-purple-200/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-gray-900">Assistant IA</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            try {
                              const generated = await generateMessage({
                                itemTitle: item.title,
                                itemCategory: item.category,
                                requestType: item.offer_type,
                                userMessage: requestMessage,
                              });
                              setRequestMessage(generated);
                            } catch (error) {
                              console.error('Erreur génération message:', error);
                            }
                          }}
                          disabled={isGenerating}
                          leftIcon={<Wand2 size={14} />}
                          className="border border-purple-200 text-purple-700 hover:bg-purple-50"
                        >
                          {isGenerating ? 'Génération...' : 'Générer un message'}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message (optionnel)
                    </label>
                    <textarea
                      id="message"
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      placeholder={
                        item.offer_type === 'trade' 
                          ? "Décrivez ce que vous proposez en échange..."
                          : "Expliquez pourquoi vous souhaitez emprunter cet objet..."
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>
                  <div className="flex space-x-3">
                    <Button type="submit" disabled={createRequest.isPending} className="flex-1 disabled:opacity-50">
                      {createRequest.isPending ? 'Envoi...' : (item.offer_type === 'trade' ? 'Envoyer la proposition' : 'Envoyer la demande')}
                    </Button>
                    <Button type="button" variant="ghost" className="border border-gray-300" onClick={() => setShowRequestForm(false)}>Annuler</Button>
                  </div>
                </form>
              )}
            </div>
          )}

          {isOwner && (
            <Card className="p-4 bg-blue-50 border border-blue-200">
              <div className="flex items-center justify-between">
                <p className="text-blue-800">C'est votre objet.</p>
                <div className="flex items-center gap-3">
                  <Link
                    to={`/items/${id}/edit`}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Modifier
                  </Link>
                  <Button
                    variant={item.is_available ? 'secondary' : 'primary'}
                    onClick={async () => {
                      if (!id) return;
                      await updateItem.mutateAsync({ id, payload: { is_available: !item.is_available } });
                    }}
                  >
                    {item.is_available ? 'Désactiver / Cacher' : 'Réactiver'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Rating Form (emprunteurs uniquement, demande terminée) */}
          {!isOwner && hasCompletedBorrow && (
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Laisser un avis</h3>
                <button
                  onClick={() => setShowRatingForm(!showRatingForm)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {showRatingForm ? 'Fermer' : 'Évaluer'}
                </button>
              </div>
              {showRatingForm && (
                <form
                  className="space-y-3"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await upsertRating.mutateAsync({ item_id: item.id, score: ratingScore, comment: ratingComment });
                    setShowRatingForm(false);
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
                          className={`w-8 h-8 rounded-full border ${ratingScore >= s ? 'bg-yellow-400 border-yellow-500' : 'border-gray-300'} hover:bg-yellow-300`}
                          aria-label={`Note ${s}`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-2">{ratingScore}/5</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Commentaire (optionnel)</label>
                    <textarea
                      value={ratingComment}
                      onChange={(e) => setRatingComment(e.target.value)}
                      rows={3}
                      className="input"
                      placeholder="Partagez votre expérience..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="btn btn-primary" disabled={upsertRating.isPending}>
                      {upsertRating.isPending ? 'Envoi...' : 'Publier l\'avis'}
                    </button>
                    <button type="button" className="btn btn-outline" onClick={() => setShowRatingForm(false)}>Annuler</button>
                  </div>
                </form>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Informations supplémentaires - Pleine largeur */}
      {(item.brand || item.model || item.estimated_value || (item.tags && item.tags.length) || item.available_from || item.available_to || item.location_hint) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <div className="bg-white/70 rounded-xl p-6 space-y-4 glass-card">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Informations supplémentaires</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 text-sm">
              {item.brand && (
                <div>
                  <span className="text-gray-500 block mb-1">Marque</span>
                  <p className="font-medium text-gray-900">{item.brand}</p>
                </div>
              )}
              {item.model && (
                <div>
                  <span className="text-gray-500 block mb-1">Modèle</span>
                  <p className="font-medium text-gray-900">{item.model}</p>
                </div>
              )}
              {typeof item.estimated_value === 'number' && !isNaN(item.estimated_value) && (
                <div>
                  <span className="text-gray-500 block mb-1">Valeur estimée</span>
                  <p className="font-medium text-gray-900">{item.estimated_value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
                </div>
              )}
              {(item.available_from || item.available_to) && (
                <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
                  <span className="text-gray-500 block mb-1">Période de disponibilité</span>
                  <p className="font-medium text-gray-900 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      {item.available_from ? new Date(item.available_from).toLocaleDateString('fr-FR') : '—'}
                      {' '}→{' '}
                      {item.available_to ? new Date(item.available_to).toLocaleDateString('fr-FR') : '—'}
                    </span>
                  </p>
                </div>
              )}
              {item.location_hint && (
                <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
                  <span className="text-gray-500 block mb-1">Indication de localisation</span>
                  <p className="font-medium text-gray-900 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {item.location_hint}
                  </p>
                </div>
              )}
              {(item.latitude !== undefined && item.longitude !== undefined) && (
                <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
                  <span className="text-gray-500 block mb-1">Position</span>
                  <p className="font-medium text-gray-900">
                    {item.latitude?.toFixed(6)}, {item.longitude?.toFixed(6)}{' '}
                    <a
                      className="text-blue-600 hover:text-blue-700 ml-2"
                      href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                      target="_blank" rel="noreferrer"
                    >
                      Ouvrir la carte
                    </a>
                  </p>
                </div>
              )}
              {item.tags && item.tags.length > 0 && (
                <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
                  <span className="text-gray-500 block mb-1">Tags</span>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((t) => (
                      <span key={t} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
      {/* Floating CTA for borrow request */}
      {!isOwner && item.is_available && !hasPendingRequest && (
        <div className="fixed inset-x-0 bottom-16 md:bottom-6 z-40 flex justify-center pointer-events-none">
          <div className="pointer-events-auto">
            {!showRequestForm ? (
              <button
                onClick={() => setShowRequestForm(true)}
                className={`px-6 py-3 rounded-full shadow-soft text-white font-medium focus-visible:outline-none focus-visible:ring-2 ${
                  item.offer_type === 'trade' 
                    ? 'bg-orange-600 hover:bg-orange-700 focus-visible:ring-orange-500' 
                    : 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500'
                }`}
                aria-label={item.offer_type === 'trade' ? 'Proposer un échange' : 'Demander à emprunter'}
              >
                {item.offer_type === 'trade' ? 'Proposer un échange' : 'Demander à emprunter'}
              </button>
            ) : null}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {isLightboxOpen && item.images && item.images.length > 0 && (
        <motion.div
          key="lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative w-full h-full max-w-5xl max-h-[90vh] p-4"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => { touchStartXRef.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              const startX = touchStartXRef.current;
              if (startX == null) return;
              const deltaX = e.changedTouches[0].clientX - startX;
              if (deltaX > 40) goPrevImage();
              if (deltaX < -40) goNextImage();
              touchStartXRef.current = null;
            }}
          >
            <button
              className="absolute top-2 right-2 p-2 rounded-full bg-white/90 text-gray-800 hover:bg-white shadow"
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Fermer"
            >
              <X size={18} />
            </button>

            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 text-gray-800 hover:bg-white shadow"
              onClick={goPrevImage}
              aria-label="Précédente"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/90 text-gray-800 hover:bg-white shadow"
              onClick={goNextImage}
              aria-label="Suivante"
            >
              <ChevronRight size={20} />
            </button>

            <div className="w-full h-full flex items-center justify-center">
              <img
                src={item.images[currentImageIndex]?.url || item.images[0].url}
                alt={item.title}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                draggable={false}
              />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ItemDetailPage;
