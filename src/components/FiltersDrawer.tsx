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

interface FiltersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  activeFiltersCount: number;
  onFilterChange: (key: keyof FilterState, value: string | boolean | undefined) => void;
  onResetFilters: () => void;
}

const FiltersDrawer: React.FC<FiltersDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  activeFiltersCount,
  onFilterChange,
  onResetFilters,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ 
              type: 'spring', 
              damping: 30, 
              stiffness: 300,
              opacity: { duration: 0.2 }
            }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 lg:hidden overflow-y-auto border-l border-gray-200"
          >
            <div className="p-6 bg-gradient-to-b from-white to-gray-50 min-h-full">
              {/* Header */}
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-100 rounded-lg">
                    <Filter className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Filtres</h2>
                    <p className="text-sm text-gray-500">Affinez votre recherche</p>
                  </div>
                  {activeFiltersCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Badge variant="brand" size="sm" className="ml-2">
                        {activeFiltersCount}
                      </Badge>
                    </motion.div>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </motion.button>
              </motion.div>

              {/* Filters Content */}
              <div className="space-y-6">
                {/* Categories */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-4 bg-brand-500 rounded-full"></div>
                    Catégories
                  </h3>
                  <div className="space-y-4">
                    {/* Bouton "Toutes" */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onFilterChange('selectedCategory', undefined)}
                      className={`w-full flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        !filters.selectedCategory 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
                      }`}
                    >
                      <span>Toutes les catégories</span>
                      {!filters.selectedCategory && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 bg-white rounded-full ml-2" 
                        />
                      )}
                    </motion.button>
                    
                    {/* Grille des catégories - 4 par ligne */}
                    <div className="grid grid-cols-4 gap-3">
                      {categories.map((category, index) => {
                        const Icon = getCategoryIcon(category.value);
                        return (
                          <motion.button
                            key={category.value}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onFilterChange('selectedCategory', category.value)}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 ${
                              filters.selectedCategory === category.value 
                                ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/25' 
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm hover:shadow-md'
                            }`}
                            title={category.label}
                          >
                            <div className={`p-2 rounded-lg mb-2 ${
                              filters.selectedCategory === category.value 
                                ? 'bg-white/20' 
                                : 'bg-gray-100'
                            }`}>
                              <Icon size={20} className={
                                filters.selectedCategory === category.value 
                                  ? 'text-white' 
                                  : 'text-gray-600'
                              } />
                            </div>
                            <span className="text-xs font-medium text-center leading-tight">
                              {category.label}
                            </span>
                            {filters.selectedCategory === category.value && (
                              <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-1.5 h-1.5 bg-white rounded-full mt-1" 
                              />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>

                {/* Favorites */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-4 bg-brand-500 rounded-full"></div>
                    Options rapides
                  </h3>
                  <motion.label 
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-4 p-4 bg-white rounded-xl cursor-pointer border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={filters.favoritesOnly} 
                        onChange={(e) => onFilterChange('favoritesOnly', e.target.checked)}
                        className="w-5 h-5 rounded border-2 border-gray-300 text-brand-600 focus:ring-brand-500 focus:ring-2"
                      />
                      {filters.favoritesOnly && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <div className="w-3 h-3 bg-brand-600 rounded-sm"></div>
                        </motion.div>
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Mes favoris uniquement</span>
                      <p className="text-xs text-gray-500">Afficher seulement mes objets favoris</p>
                    </div>
                  </motion.label>
                </motion.div>

                {/* Type d'offre */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-4 bg-brand-500 rounded-full"></div>
                    Type d'offre
                  </h3>
                  <div className="space-y-3">
                    {/* Bouton "Tous" */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onFilterChange('offerType', undefined)}
                      className={`w-full flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        !filters.offerType 
                          ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/25' 
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
                      }`}
                    >
                      <span>Tous les types</span>
                      {!filters.offerType && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 bg-white rounded-full ml-2" 
                        />
                      )}
                    </motion.button>
                    
                    {/* Boutons par type d'offre */}
                    <div className="grid grid-cols-1 gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onFilterChange('offerType', filters.offerType === 'donation' ? undefined : 'donation')}
                        className={`flex items-center gap-3 p-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                          filters.offerType === 'donation' 
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25' 
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          filters.offerType === 'donation' 
                            ? 'bg-white/20' 
                            : 'bg-gray-100'
                        }`}>
                          <Gift size={20} className={
                            filters.offerType === 'donation' 
                              ? 'text-white' 
                              : 'text-gray-600'
                          } />
                        </div>
                        <div className="flex-1 text-left">
                          <span className="font-medium">Dons</span>
                          <p className="text-xs opacity-80">Objets offerts gratuitement</p>
                        </div>
                        {filters.offerType === 'donation' && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 bg-white rounded-full" 
                          />
                        )}
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onFilterChange('offerType', filters.offerType === 'trade' ? undefined : 'trade')}
                        className={`flex items-center gap-3 p-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                          filters.offerType === 'trade' 
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25' 
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          filters.offerType === 'trade' 
                            ? 'bg-white/20' 
                            : 'bg-gray-100'
                        }`}>
                          <Handshake size={20} className={
                            filters.offerType === 'trade' 
                              ? 'text-white' 
                              : 'text-gray-600'
                          } />
                        </div>
                        <div className="flex-1 text-left">
                          <span className="font-medium">Échanges</span>
                          <p className="text-xs opacity-80">Échanger contre autre chose</p>
                        </div>
                        {filters.offerType === 'trade' && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 bg-white rounded-full" 
                          />
                        )}
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onFilterChange('offerType', filters.offerType === 'loan' ? undefined : 'loan')}
                        className={`flex items-center gap-3 p-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                          filters.offerType === 'loan' 
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          filters.offerType === 'loan' 
                            ? 'bg-white/20' 
                            : 'bg-gray-100'
                        }`}>
                          <RefreshCcw size={20} className={
                            filters.offerType === 'loan' 
                              ? 'text-white' 
                              : 'text-gray-600'
                          } />
                        </div>
                        <div className="flex-1 text-left">
                          <span className="font-medium">Prêts</span>
                          <p className="text-xs opacity-80">Emprunter temporairement</p>
                        </div>
                        {filters.offerType === 'loan' && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 bg-white rounded-full" 
                          />
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>

                {/* Condition */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-4 bg-brand-500 rounded-full"></div>
                    État de l'objet
                  </h3>
                  <select 
                    value={filters.condition || ''} 
                    onChange={(e) => onFilterChange('condition', e.target.value || undefined)} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white shadow-sm"
                  >
                    <option value="">Tous les états</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Bon</option>
                    <option value="fair">Correct</option>
                    <option value="poor">Usé</option>
                  </select>
                </motion.div>

                {/* Brand */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-4 bg-brand-500 rounded-full"></div>
                    Marque
                  </h3>
                  <input 
                    value={filters.brand} 
                    onChange={(e) => onFilterChange('brand', e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white shadow-sm" 
                    placeholder="ex: Bosch, Apple..." 
                  />
                </motion.div>

                {/* Tags */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-4 bg-brand-500 rounded-full"></div>
                    Tags
                  </h3>
                  <input 
                    value={filters.tags} 
                    onChange={(e) => onFilterChange('tags', e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white shadow-sm" 
                    placeholder="ex: perceuse, 18v..." 
                  />
                </motion.div>

                {/* Value Range */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-4 bg-brand-500 rounded-full"></div>
                    Valeur estimée
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-2 font-medium">Min (€)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={filters.minValue} 
                        onChange={(e) => onFilterChange('minValue', e.target.value)} 
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white shadow-sm" 
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-2 font-medium">Max (€)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={filters.maxValue} 
                        onChange={(e) => onFilterChange('maxValue', e.target.value)} 
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white shadow-sm" 
                        placeholder="∞"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Availability */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-4 bg-brand-500 rounded-full"></div>
                    Disponibilité
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-2 font-medium">À partir du</label>
                      <input 
                        type="date" 
                        value={filters.availableFrom} 
                        onChange={(e) => onFilterChange('availableFrom', e.target.value)} 
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white shadow-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-2 font-medium">Jusqu'au</label>
                      <input 
                        type="date" 
                        value={filters.availableTo} 
                        onChange={(e) => onFilterChange('availableTo', e.target.value)} 
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white shadow-sm" 
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Options */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-4 bg-brand-500 rounded-full"></div>
                    Options avancées
                  </h3>
                  <div className="space-y-3">
                    <motion.label 
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center gap-4 p-4 bg-white rounded-xl cursor-pointer border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          checked={filters.hasImages} 
                          onChange={(e) => onFilterChange('hasImages', e.target.checked)}
                          className="w-5 h-5 rounded border-2 border-gray-300 text-brand-600 focus:ring-brand-500 focus:ring-2"
                        />
                        {filters.hasImages && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <div className="w-3 h-3 bg-brand-600 rounded-sm"></div>
                          </motion.div>
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Avec photos uniquement</span>
                        <p className="text-xs text-gray-500">Filtrer les objets avec des images</p>
                      </div>
                    </motion.label>
                    <motion.label 
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center gap-4 p-4 bg-white rounded-xl cursor-pointer border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          checked={filters.isAvailable} 
                          onChange={(e) => onFilterChange('isAvailable', e.target.checked)}
                          className="w-5 h-5 rounded border-2 border-gray-300 text-brand-600 focus:ring-brand-500 focus:ring-2"
                        />
                        {filters.isAvailable && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <div className="w-3 h-3 bg-brand-600 rounded-sm"></div>
                          </motion.div>
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Disponibles uniquement</span>
                        <p className="text-xs text-gray-500">Filtrer les objets disponibles</p>
                      </div>
                    </motion.label>
                  </div>
                </motion.div>
              </div>

              {/* Footer */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="mt-8 pt-6 border-t border-gray-200"
              >
                <div className="flex gap-3">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <Button
                      onClick={onResetFilters}
                      variant="ghost"
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Réinitialiser
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <Button
                      onClick={onClose}
                      className="w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 shadow-lg shadow-brand-500/25"
                    >
                      Appliquer les filtres
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FiltersDrawer;
