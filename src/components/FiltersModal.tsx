import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter, RotateCcw, Gift, Handshake, RefreshCcw } from 'lucide-react';
import { categories, getCategoryIcon } from '../utils/categories';
import type { ItemCategory, OfferType } from '../types';
import Button from './ui/Button';
import Badge from './ui/Badge';

interface FilterState {
  selectedCategory: ItemCategory | undefined;
  condition: string | undefined;
  brand: string;
  minValue: string;
  maxValue: string;
  availableFrom: string;
  availableTo: string;
  hasImages: boolean;
  isAvailable: boolean;
  tags: string;
  favoritesOnly: boolean;
  offerType: OfferType | undefined;
}

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  activeFiltersCount: number;
  onFilterChange: (key: keyof FilterState, value: string | boolean | undefined) => void;
  onResetFilters: () => void;
}

const FiltersModal: React.FC<FiltersModalProps> = ({
  isOpen,
  onClose,
  filters,
  activeFiltersCount,
  onFilterChange,
  onResetFilters,
}) => {
  const conditionOptions = [
    { value: 'excellent', label: 'Excellent', color: 'text-green-600' },
    { value: 'good', label: 'Bon', color: 'text-blue-600' },
    { value: 'fair', label: 'Correct', color: 'text-yellow-600' },
    { value: 'poor', label: 'Moyen', color: 'text-orange-600' },
    { value: 'damaged', label: 'Endommagé', color: 'text-red-600' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 300,
              duration: 0.3
            }}
            className="fixed inset-2 md:inset-4 z-50 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[95vh]"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-brand-50 to-purple-50 border-b border-gray-200 flex-shrink-0"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-brand-500 to-purple-500 rounded-xl">
                    <Filter className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Filtres avancés</h2>
                    <p className="text-gray-600">Affinez votre recherche</p>
                  </div>
                  {activeFiltersCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Badge variant="brand" size="lg">
                        {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''}
                      </Badge>
                    </motion.div>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-3 hover:bg-white/50 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </motion.button>
              </motion.div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                <div className="max-w-12xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                    {/* Colonne 1: Catégories, Type et État */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 h-fit space-y-4"
                    >
                      <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Gift className="w-4 h-4 text-brand-600" />
                        Catégorie
                      </h3>
                      <div className="grid grid-cols-3 gap-2 mb-0">
                        <button
                          onClick={() => onFilterChange('selectedCategory', undefined)}
                          className={`p-2 rounded-lg border-2 transition-all duration-200 flex items-center gap-2 ${
                            !filters.selectedCategory
                              ? 'border-brand-500 bg-brand-50 text-brand-700'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="w-4 h-4 text-gray-400">
                            <svg fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="text-xs font-medium">Toutes</span>
                        </button>
                        {categories.map((category) => {
                          const Icon = getCategoryIcon(category.value);
                          return (
                            <button
                              key={category.value}
                              onClick={() => onFilterChange('selectedCategory', category.value)}
                              className={`p-2 rounded-lg border-2 transition-all duration-200 flex items-center gap-2 ${
                                filters.selectedCategory === category.value
                                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className="w-4 h-4">
                                <Icon className="w-full h-full" />
                              </div>
                              <span className="text-xs font-medium">{category.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Type d'échange */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Handshake className="w-4 h-4 text-brand-600" />
                          Type d'échange
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { value: undefined, label: 'Tous', icon: '🔄', color: 'bg-gray-100' },
                            { value: 'loan', label: 'Prêt', icon: '🤝', color: 'bg-blue-100' },
                            { value: 'trade', label: 'Échange', icon: '🔄', color: 'bg-green-100' },
                            { value: 'donation', label: 'Don', icon: '🎁', color: 'bg-purple-100' },
                          ].map((option) => (
                            <button
                              key={option.value || 'all'}
                              onClick={() => onFilterChange('offerType', option.value)}
                              className={`p-2 rounded-lg border-2 transition-all duration-200 ${
                                filters.offerType === option.value
                                  ? 'border-brand-500 bg-brand-50'
                                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className="text-center">
                                <div className={`w-6 h-6 mx-auto mb-1 rounded-full ${option.color} flex items-center justify-center text-sm`}>
                                  {option.icon}
                                </div>
                                <span className="text-xs font-medium text-gray-900">{option.label}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* État */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">État</h3>
                        <div className="grid grid-cols-3 gap-1">
                          {conditionOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => onFilterChange('condition', option.value)}
                              className={`p-2 rounded-lg border-2 transition-all duration-200 text-center ${
                                filters.condition === option.value
                                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <span className={`text-xs font-medium ${option.color}`}>{option.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>

                    {/* Colonne 2: Filtres avancés */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 h-fit space-y-4"
                    >
                      {/* Disponibilité */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Disponibilité</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Du</label>
                            <input
                              type="date"
                              value={filters.availableFrom}
                              onChange={(e) => onFilterChange('availableFrom', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Au</label>
                            <input
                              type="date"
                              value={filters.availableTo}
                              onChange={(e) => onFilterChange('availableTo', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200 text-sm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Mots-clés */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Mots-clés</h3>
                        <input
                          type="text"
                          value={filters.tags}
                          onChange={(e) => onFilterChange('tags', e.target.value)}
                          placeholder="Rechercher par mots-clés..."
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200 text-sm"
                        />
                      </div>

                      {/* Options */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Options</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Avec photos</h4>
                              <p className="text-xs text-gray-600">Objets avec images</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filters.hasImages}
                                onChange={(e) => onFilterChange('hasImages', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600"></div>
                            </label>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Disponible maintenant</h4>
                              <p className="text-xs text-gray-600">Actuellement disponibles</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filters.isAvailable}
                                onChange={(e) => onFilterChange('isAvailable', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600"></div>
                            </label>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Mes favoris</h4>
                              <p className="text-xs text-gray-600">Favoris uniquement</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filters.favoritesOnly}
                                onChange={(e) => onFilterChange('favoritesOnly', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                  </div>
                </div>
              </div>

              {/* Footer */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="p-4 bg-white border-t border-gray-200 flex-shrink-0"
              >
                <div className="flex items-center justify-between">
                  <Button
                    variant="secondary"
                    onClick={onResetFilters}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Réinitialiser
                  </Button>
                  <div className="flex items-center gap-3">
                    <Button variant="secondary" onClick={onClose}>
                      Annuler
                    </Button>
                    <Button onClick={onClose}>
                      Appliquer les filtres
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FiltersModal;
