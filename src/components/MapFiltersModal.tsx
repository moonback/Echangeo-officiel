import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Users, TrendingUp, Filter, RefreshCw, Target, Eye, Grid3X3, Layers, Gift, Handshake, RefreshCcw, Navigation } from 'lucide-react';
import Button from './ui/Button';
import Badge from './ui/Badge';

interface MapFilters {
  selectedCategory: string;
  selectedCondition: string;
  selectedType: string;
  maxDistance: number;
  showOnlyWithImages: boolean;
  viewMode: 'communities' | 'items';
}

interface MapFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: MapFilters;
  onFilterChange: (key: keyof MapFilters, value: any) => void;
  onResetFilters: () => void;
  onApplyFilters: () => void;
  activeFiltersCount: number;
  viewMode: 'communities' | 'items';
}

const MapFiltersModal: React.FC<MapFiltersModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onResetFilters,
  onApplyFilters,
  activeFiltersCount,
  viewMode
}) => {
  const categories = [
    { value: '', label: 'Toutes les catégories' },
    { value: 'tools', label: '🔨 Outils' },
    { value: 'electronics', label: '📱 Électronique' },
    { value: 'books', label: '📚 Livres' },
    { value: 'sports', label: '⚽ Sport' },
    { value: 'kitchen', label: '🍳 Cuisine' },
    { value: 'garden', label: '🌱 Jardin' },
    { value: 'toys', label: '🧸 Jouets' },
    { value: 'fashion', label: '👗 Mode' },
    { value: 'furniture', label: '🪑 Meubles' },
    { value: 'music', label: '🎵 Musique' },
    { value: 'baby', label: '👶 Bébé' },
    { value: 'art', label: '🎨 Art' },
    { value: 'beauty', label: '💄 Beauté' },
    { value: 'auto', label: '🚗 Auto' },
    { value: 'office', label: '💼 Bureau' },
    { value: 'services', label: '🛠️ Services' },
    { value: 'other', label: '📦 Autres' }
  ];

  const conditions = [
    { value: '', label: 'Tous les états' },
    { value: 'new', label: '✨ Neuf' },
    { value: 'excellent', label: '⭐ Excellent' },
    { value: 'good', label: '👍 Bon' },
    { value: 'fair', label: '✅ Correct' },
    { value: 'poor', label: '⚠️ Usé' }
  ];

  const offerTypes = [
    { value: '', label: 'Tous les types', icon: '🔄', color: 'bg-gray-100' },
    { value: 'donation', label: 'Don', icon: '🎁', color: 'bg-green-100' },
    { value: 'trade', label: 'Échange', icon: '🤝', color: 'bg-orange-100' },
    { value: 'loan', label: 'Prêt', icon: '🔄', color: 'bg-blue-100' }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-brand-50 to-purple-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-brand-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Filtres de la Carte</h2>
                <p className="text-sm text-gray-600">
                  {activeFiltersCount > 0 
                    ? `${activeFiltersCount} filtre${activeFiltersCount > 1 ? 's' : ''} appliqué${activeFiltersCount > 1 ? 's' : ''}`
                    : `Vue ${viewMode === 'communities' ? 'des quartiers' : 'des objets'}`
                  }
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-xl"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* Colonne 1: Filtres principaux */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 h-fit space-y-4"
                >
                  {/* Mode de vue */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-brand-600" />
                      Mode de vue
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onFilterChange('viewMode', 'communities')}
                        className={`p-2 rounded-lg border-2 transition-all duration-200 ${
                          filters.viewMode === 'communities'
                            ? 'border-brand-500 bg-brand-50 text-brand-700'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-lg mb-1">🏘️</div>
                          <span className="text-xs font-medium">Quartiers</span>
                        </div>
                      </button>
                      <button
                        onClick={() => onFilterChange('viewMode', 'items')}
                        className={`p-2 rounded-lg border-2 transition-all duration-200 ${
                          filters.viewMode === 'items'
                            ? 'border-brand-500 bg-brand-50 text-brand-700'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-lg mb-1">📦</div>
                          <span className="text-xs font-medium">Objets</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Distance */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4 text-brand-600" />
                      Rayon de recherche
                    </h3>
                    <div className="bg-gradient-to-r from-brand-50 to-blue-50 rounded-xl p-4 border border-brand-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-brand-700">{filters.maxDistance} km</span>
                        <Badge variant="brand" size="sm">
                          <Navigation size={12} className="mr-1" />
                          Rayon
                        </Badge>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={filters.maxDistance}
                        onChange={(e) => onFilterChange('maxDistance', Number(e.target.value))}
                        className="w-full h-2 bg-gradient-to-r from-brand-200 to-blue-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>1km</span>
                        <span>50km</span>
                      </div>
                    </div>
                  </div>

                  {/* Affichage avec photos */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-brand-600" />
                      Affichage
                    </h3>
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.showOnlyWithImages}
                          onChange={(e) => onFilterChange('showOnlyWithImages', e.target.checked)}
                          className="w-5 h-5 rounded-lg border-2 border-gray-300 text-brand-600 focus:ring-brand-500 focus:ring-2 transition-all"
                        />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-brand-700 transition-colors">
                          {viewMode === 'communities' 
                            ? 'Quartiers avec objets seulement' 
                            : 'Avec photos seulement'
                          }
                        </span>
                      </label>
                    </div>
                  </div>
                </motion.div>

                {/* Colonne 2: Filtres avancés (uniquement pour la vue objets) */}
                {viewMode === 'items' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 h-fit space-y-4"
                  >
                    {/* Catégorie */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Grid3X3 className="w-4 h-4 text-brand-600" />
                        Catégorie
                      </h3>
                      <div className="grid grid-cols-3 gap-1">
                        {categories.map((category) => (
                          <button
                            key={category.value}
                            onClick={() => onFilterChange('selectedCategory', category.value)}
                            className={`p-2 rounded-lg border-2 transition-all duration-200 text-center ${
                              filters.selectedCategory === category.value
                                ? 'border-brand-500 bg-brand-50 text-brand-700'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <span className="text-xs font-medium">{category.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* État */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-brand-600" />
                        État
                      </h3>
                      <div className="grid grid-cols-3 gap-1">
                        {conditions.map((condition) => (
                          <button
                            key={condition.value}
                            onClick={() => onFilterChange('selectedCondition', condition.value)}
                            className={`p-2 rounded-lg border-2 transition-all duration-200 text-center ${
                              filters.selectedCondition === condition.value
                                ? 'border-brand-500 bg-brand-50 text-brand-700'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <span className="text-xs font-medium">{condition.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Type d'offre */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Handshake className="w-4 h-4 text-brand-600" />
                        Type d'offre
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {offerTypes.map((type) => (
                          <button
                            key={type.value}
                            onClick={() => onFilterChange('selectedType', type.value)}
                            className={`p-2 rounded-lg border-2 transition-all duration-200 ${
                              filters.selectedType === type.value
                                ? 'border-brand-500 bg-brand-50 text-brand-700'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="text-center">
                              <div className={`w-6 h-6 mx-auto mb-1 rounded-full ${type.color} flex items-center justify-center text-sm`}>
                                {type.icon}
                              </div>
                              <span className="text-xs font-medium">{type.label}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Message pour la vue quartiers */}
                {viewMode === 'communities' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 h-fit"
                  >
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-brand-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-brand-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Vue des Quartiers
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        En mode quartiers, vous pouvez voir tous les quartiers actifs sur la carte. 
                        Cliquez sur un quartier pour voir les objets disponibles dans cette zone.
                      </p>
                      <div className="bg-gradient-to-r from-brand-50 to-blue-50 rounded-lg p-3 border border-brand-100">
                        <p className="text-xs text-brand-700 font-medium">
                          💡 Conseil : Activez la géolocalisation pour voir les quartiers près de chez vous
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-white">
            <Button
              variant="secondary"
              onClick={onResetFilters}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Réinitialiser
            </Button>
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={onClose}>
                Annuler
              </Button>
              <Button onClick={onApplyFilters} className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Appliquer les filtres
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MapFiltersModal;
