import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  User, 
  Calendar,
  MessageCircle,
  Share2,
  Heart
} from 'lucide-react';
import { useItem } from '../hooks/useItems';
import { useCreateRequest } from '../hooks/useRequests';
import { getCategoryIcon, getCategoryLabel } from '../utils/categories';
import { useAuthStore } from '../store/authStore';

const ItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { data: item, isLoading } = useItem(id!);
  const createRequest = useCreateRequest();
  const [requestMessage, setRequestMessage] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
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
      <div className="p-4 max-w-4xl mx-auto text-center">
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
  const isOwner = user?.id === item.owner_id;

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRequest.mutateAsync({
        item_id: item.id,
        message: requestMessage,
      });
      setShowRequestForm(false);
      setRequestMessage('');
    } catch (error) {
      console.error('Error creating request:', error);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center mb-6"
      >
        <Link
          to="/items"
          className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 flex-1">
          Détails de l'objet
        </h1>
        <div className="flex space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <Heart size={20} />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <Share2 size={20} />
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
            {item.images && item.images.length > 0 ? (
              <img
                src={item.images[currentImageIndex]?.url || item.images[0].url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <CategoryIcon className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>
          
          {item.images && item.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {item.images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`aspect-square rounded-lg overflow-hidden ${
                    currentImageIndex === index ? 'ring-2 ring-blue-500' : ''
                  }`}
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
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <CategoryIcon className="w-4 h-4 mr-2" />
              {getCategoryLabel(item.category)}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              item.is_available 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {item.is_available ? 'Disponible' : 'Non disponible'}
            </span>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{item.title}</h1>
            {item.description && (
              <p className="text-gray-600 leading-relaxed">{item.description}</p>
            )}
          </div>

          {/* Owner Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Propriétaire</h3>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
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
          </div>

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

          {/* Additional fields */}
          {(item.brand || item.model || item.estimated_value || (item.tags && item.tags.length) || item.available_from || item.available_to || item.location_hint) && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-gray-900">Informations supplémentaires</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {item.brand && (
                  <div>
                    <span className="text-gray-500">Marque :</span>
                    <p className="font-medium text-gray-900">{item.brand}</p>
                  </div>
                )}
                {item.model && (
                  <div>
                    <span className="text-gray-500">Modèle :</span>
                    <p className="font-medium text-gray-900">{item.model}</p>
                  </div>
                )}
                {typeof item.estimated_value === 'number' && !isNaN(item.estimated_value) && (
                  <div>
                    <span className="text-gray-500">Valeur estimée :</span>
                    <p className="font-medium text-gray-900">{item.estimated_value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
                  </div>
                )}
                {(item.available_from || item.available_to) && (
                  <div className="sm:col-span-2">
                    <span className="text-gray-500">Période de disponibilité :</span>
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
                  <div className="sm:col-span-2">
                    <span className="text-gray-500">Indication de localisation :</span>
                    <p className="font-medium text-gray-900 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {item.location_hint}
                    </p>
                  </div>
                )}
                {(item.latitude !== undefined && item.longitude !== undefined) && (
                  <div className="sm:col-span-2">
                    <span className="text-gray-500">Position :</span>
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
                  <div className="sm:col-span-2">
                    <span className="text-gray-500">Tags :</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {item.tags.map((t) => (
                        <span key={t} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-200 text-gray-700">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          {!isOwner && item.is_available && (
            <div className="space-y-4">
              {!showRequestForm ? (
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowRequestForm(true)}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                  >
                    Demander à emprunter
                  </button>
                  <Link
                    to={`/profile/${item.owner_id}`}
                    className="flex items-center px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <MessageCircle size={20} />
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleRequestSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message (optionnel)
                    </label>
                    <textarea
                      id="message"
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      placeholder="Expliquez pourquoi vous souhaitez emprunter cet objet..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={createRequest.isPending}
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {createRequest.isPending ? 'Envoi...' : 'Envoyer la demande'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRequestForm(false)}
                      className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {isOwner && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-blue-800">
                C'est votre objet ! Vous pouvez le modifier depuis votre profil.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ItemDetailPage;