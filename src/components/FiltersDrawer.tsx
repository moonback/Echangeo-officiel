import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter, RotateCcw } from 'lucide-react';
import { categories, getCategoryIcon } from '../utils/categories';
import type { ItemCategory } from '../types';
import Card from './ui/Card';
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
}

interface FiltersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  activeFiltersCount: number;
  onFilterChange: (key: keyof FilterState, value: any) => void;
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
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 lg:hidden overflow-y-auto"
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Filtres</h2>
                  {activeFiltersCount > 0 && (
                    <Badge variant="brand" size="sm">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Filters Content */}
              <div className="space-y-6">
                {/* Categories */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Catégories</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => onFilterChange('selectedCategory', undefined)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        !filters.selectedCategory 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span>Toutes les catégories</span>
                      {!filters.selectedCategory && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      )}
                    </button>
                    {categories.map((category) => {
                      const Icon = getCategoryIcon(category.value);
                      return (
                        <button
                          key={category.value}
                          onClick={() => onFilterChange('selectedCategory', category.value)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filters.selectedCategory === category.value 
                              ? 'bg-brand-50 text-brand-700' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon size={16} />
                            <span>{category.label}</span>
                          </div>
                          {filters.selectedCategory === category.value && (
                            <div className="w-2 h-2 bg-brand-600 rounded-full" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Favorites */}
                <div>
                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={filters.favoritesOnly} 
                      onChange={(e) => onFilterChange('favoritesOnly', e.target.checked)}
                      className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Mes favoris uniquement</span>
                  </label>
                </div>

                {/* Condition */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">État</h3>
                  <select 
                    value={filters.condition || ''} 
                    onChange={(e) => onFilterChange('condition', e.target.value || undefined)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="">Tous les états</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Bon</option>
                    <option value="fair">Correct</option>
                    <option value="poor">Usé</option>
                  </select>
                </div>

                {/* Brand */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Marque</h3>
                  <input 
                    value={filters.brand} 
                    onChange={(e) => onFilterChange('brand', e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" 
                    placeholder="ex: Bosch, Apple..." 
                  />
                </div>

                {/* Tags */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Tags</h3>
                  <input 
                    value={filters.tags} 
                    onChange={(e) => onFilterChange('tags', e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" 
                    placeholder="ex: perceuse, 18v..." 
                  />
                </div>

                {/* Value Range */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Valeur estimée</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Min (€)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={filters.minValue} 
                        onChange={(e) => onFilterChange('minValue', e.target.value)} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" 
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Max (€)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={filters.maxValue} 
                        onChange={(e) => onFilterChange('maxValue', e.target.value)} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" 
                        placeholder="∞"
                      />
                    </div>
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Disponibilité</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">À partir du</label>
                      <input 
                        type="date" 
                        value={filters.availableFrom} 
                        onChange={(e) => onFilterChange('availableFrom', e.target.value)} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Jusqu'au</label>
                      <input 
                        type="date" 
                        value={filters.availableTo} 
                        onChange={(e) => onFilterChange('availableTo', e.target.value)} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" 
                      />
                    </div>
                  </div>
                </div>

                {/* Options */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Options</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={filters.hasImages} 
                        onChange={(e) => onFilterChange('hasImages', e.target.checked)}
                        className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Avec photos uniquement</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={filters.isAvailable} 
                        onChange={(e) => onFilterChange('isAvailable', e.target.checked)}
                        className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Disponibles uniquement</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex gap-3">
                  <Button
                    onClick={onResetFilters}
                    variant="ghost"
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Réinitialiser
                  </Button>
                  <Button
                    onClick={onClose}
                    className="flex-1"
                  >
                    Appliquer
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FiltersDrawer;
