import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Filter } from 'lucide-react';
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

interface FiltersPanelProps {
  filters: FilterState;
  activeFiltersCount: number;
  onFilterChange: (key: keyof FilterState, value: string | boolean | undefined) => void;
  onResetFilters: () => void;
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({
  filters,
  activeFiltersCount,
  onFilterChange,
  onResetFilters,
}) => {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden mb-6"
    >
      <Card className="p-6 space-y-6 glass">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-100 rounded-lg">
              <Filter className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Filtres avancés</h3>
              <p className="text-sm text-gray-500">Affinez votre recherche</p>
            </div>
            {activeFiltersCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Badge variant="brand" size="sm">
                  {activeFiltersCount} actif{activeFiltersCount > 1 ? 's' : ''}
                </Badge>
              </motion.div>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={onResetFilters}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Réinitialiser
              </Button>
            </motion.div>
          )}
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Categories */}
          <div className="lg:col-span-2 xl:col-span-1">
            <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-1 h-4 bg-brand-500 rounded-full"></div>
              Catégories
            </h4>
            <div className="space-y-4">
              {/* Bouton "Toutes" */}
              <button
                onClick={() => onFilterChange('selectedCategory', undefined)}
                className={`w-full flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  !filters.selectedCategory 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
                }`}
              >
                <span>Toutes les catégories</span>
                {!filters.selectedCategory && (
                  <div className="w-2 h-2 bg-white rounded-full ml-2" />
                )}
              </button>
              
              {/* Grille des catégories - 4 par ligne */}
              <div className="grid grid-cols-4 gap-3">
                {categories.map((category) => {
                  const Icon = getCategoryIcon(category.value);
                  return (
                    <button
                      key={category.value}
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
                        <Icon size={18} className={
                          filters.selectedCategory === category.value 
                            ? 'text-white' 
                            : 'text-gray-600'
                        } />
                      </div>
                      <span className="text-xs font-medium text-center leading-tight">
                        {category.label}
                      </span>
                      {filters.selectedCategory === category.value && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full mt-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Basic Filters */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Filtres de base</h4>
            
            {/* Favorites */}
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <input 
                type="checkbox" 
                checked={filters.favoritesOnly} 
                onChange={(e) => onFilterChange('favoritesOnly', e.target.checked)}
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm font-medium text-gray-700">Mes favoris uniquement</span>
            </label>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">État</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Marque</label>
              <input 
                value={filters.brand} 
                onChange={(e) => onFilterChange('brand', e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" 
                placeholder="ex: Bosch, Apple..." 
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <input 
                value={filters.tags} 
                onChange={(e) => onFilterChange('tags', e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" 
                placeholder="ex: perceuse, 18v..." 
              />
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Filtres avancés</h4>
            
            {/* Value Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Valeur estimée (€)</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={filters.minValue} 
                    onChange={(e) => onFilterChange('minValue', e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" 
                    placeholder="Min"
                  />
                </div>
                <div>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={filters.maxValue} 
                    onChange={(e) => onFilterChange('maxValue', e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" 
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Disponibilité</label>
              <div className="space-y-2">
                <input 
                  type="date" 
                  value={filters.availableFrom} 
                  onChange={(e) => onFilterChange('availableFrom', e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" 
                  placeholder="À partir du"
                />
                <input 
                  type="date" 
                  value={filters.availableTo} 
                  onChange={(e) => onFilterChange('availableTo', e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" 
                  placeholder="Jusqu'au"
                />
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input 
                  type="checkbox" 
                  checked={filters.hasImages} 
                  onChange={(e) => onFilterChange('hasImages', e.target.checked)}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm font-medium text-gray-700">Avec photos uniquement</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
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
      </Card>
    </motion.div>
  );
};

export default FiltersPanel;
