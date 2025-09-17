import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, Tag, DollarSign, Eye, MessageCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ItemDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
}

interface ItemDetailsData {
  title: string;
  description?: string;
  category: string;
  condition: string;
  offer_type: string;
  brand?: string;
  estimated_value?: number;
  tags?: string[];
  available_from?: string;
  available_to?: string;
  is_available: boolean;
  suspended_by_admin?: boolean;
  suspension_reason?: string;
  suspended_at?: string;
  suspended_by?: string;
  created_at: string;
  updated_at: string;
  owner: {
    id: string;
    full_name?: string;
    avatar_url?: string;
    reputation_score?: number;
    email?: string;
    created_at?: string;
    updated_at?: string;
  };
  images: Array<{
    id: string;
    image_url: string;
    created_at: string;
  }>;
  stats?: {
    views_count: number;
    requests_count: number;
    reports_count: number;
  };
}

export default function ItemDetailsModal({ isOpen, onClose, itemId }: ItemDetailsModalProps) {
  const [item, setItem] = useState<ItemDetailsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && itemId) {
      fetchItemDetails();
    }
  }, [isOpen, itemId]);

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les détails complets de l'objet
      const { data: itemData, error: itemError } = await supabase
        .from('items')
        .select(`
          *,
          owner:profiles(id, full_name, avatar_url, reputation_score),
          images:item_images(id, image_url, created_at)
        `)
        .eq('id', itemId)
        .single();

      if (itemError) throw itemError;

      // Récupérer les statistiques (si elles existent)
      const [viewsResult, requestsResult, reportsResult] = await Promise.all([
        supabase.from('item_views').select('id', { count: 'exact' }).eq('item_id', itemId),
        supabase.from('requests').select('id', { count: 'exact' }).eq('item_id', itemId),
        supabase.from('reports').select('id', { count: 'exact' }).eq('target_id', itemId).eq('target_type', 'item')
      ]);

      const itemWithStats: ItemDetailsData = {
        ...(itemData as unknown as ItemDetailsData),
        stats: {
          views_count: viewsResult.count || 0,
          requests_count: requestsResult.count || 0,
          reports_count: reportsResult.count || 0
        }
      };

      setItem(itemWithStats);
    } catch (err) {
      console.error('Erreur lors de la récupération des détails:', err);
      setError('Erreur lors du chargement des détails de l\'objet');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      'electronics': 'Électronique',
      'clothing': 'Vêtements',
      'books': 'Livres',
      'furniture': 'Mobilier',
      'sports': 'Sport',
      'toys': 'Jouets',
      'tools': 'Outils',
      'other': 'Autre'
    };
    return categories[category] || category;
  };

  const getConditionLabel = (condition: string) => {
    const conditions: Record<string, string> = {
      'excellent': 'Excellent',
      'good': 'Bon',
      'fair': 'Correct',
      'poor': 'Mauvais'
    };
    return conditions[condition] || condition;
  };

  const getOfferTypeLabel = (offerType: string) => {
    const types: Record<string, string> = {
      'exchange': 'Échange',
      'loan': 'Prêt',
      'gift': 'Don',
      'sale': 'Vente'
    };
    return types[offerType] || offerType;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Détails de l'objet
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600">{error}</p>
              </div>
            ) : item ? (
              <div className="space-y-6">
                {/* Images */}
                {item.images && item.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {item.images.map((image) => (
                      <div key={image.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={image.image_url}
                          alt={item.title || 'Image de l\'objet'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Informations principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title || 'Objet'}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Tag className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {getCategoryLabel(item.category || 'Autre')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          État: {getConditionLabel(item.condition || 'Autre')}
                        </span>
                      </div>
                    </div>

                    {item.brand && item.brand !== 'Autre' && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          <strong>Marque:</strong> {item.brand}
                        </span>
                      </div>
                    )}

                    {item.estimated_value && item.estimated_value !== 0 && (
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Valeur estimée: {item.estimated_value}€
                        </span>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        <strong>Type d'offre:</strong> {getOfferTypeLabel(item.offer_type || 'Autre')}
                      </span>
                    </div>
                  </div>

                  {/* Propriétaire */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {item.owner.avatar_url ? (
                          <img
                            src={item.owner.avatar_url}
                            alt={item.owner.full_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {item.owner.full_name || 'Utilisateur anonyme'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Réputation: {item.owner.reputation_score?.toFixed(1) || 'N/A'}/5
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Créé {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: fr })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          Disponible: {item.is_available ? 'Oui' : 'Non'} {item.suspended_by_admin ? ' (Suspendu)' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistiques */}
                {item.stats && item.stats.views_count > 0 && item.stats.requests_count > 0 && item.stats.reports_count > 0 && (
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Eye className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{item.stats.views_count}</p>
                        <p className="text-sm text-gray-600">Vues</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <MessageCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{item.stats.requests_count}</p>
                        <p className="text-sm text-gray-600">Demandes</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <AlertTriangle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-900">{item.stats.reports_count}</p>
                        <p className="text-sm text-gray-600">Signalements</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {item.tags && item.tags.length > 0 && item.tags.some(tag => tag !== 'Autre') && (
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Disponibilité */}
                {(item.available_from || item.available_to) && (item.available_from !== item.available_to) ? (
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Disponibilité</h4>
                    <div className="space-y-2">
                      {item.available_from && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            Disponible à partir du: {new Date(item.available_from).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                      {item.available_to && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            Disponible jusqu'au: {new Date(item.available_to).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
