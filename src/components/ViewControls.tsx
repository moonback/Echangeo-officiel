import React from 'react';
import { motion } from 'framer-motion';
import { Grid, List, ArrowUpDown, RefreshCw, Filter, Gift, RefreshCcw, Handshake } from 'lucide-react';
import Button from './ui/Button';
import Badge from './ui/Badge';
import type { OfferType } from '../types';

type SortOption = 'newest' | 'oldest' | 'value_asc' | 'value_desc' | 'title_asc' | 'title_desc';
type ViewMode = 'grid' | 'list';

interface ViewControlsProps {
  sortBy: SortOption;
  viewMode: ViewMode;
  activeFiltersCount: number;
  showFilters: boolean;
  offerType?: OfferType;
  onSortChange: (sort: SortOption) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onToggleFilters: () => void;
  onOfferTypeChange: (offerType: OfferType | undefined) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

const ViewControls: React.FC<ViewControlsProps> = ({
  sortBy,
  viewMode,
  activeFiltersCount,
  showFilters,
  offerType,
  onSortChange,
  onViewModeChange,
  onToggleFilters,
  onOfferTypeChange,
  onRefresh,
  isLoading = false,
}) => {
  const sortOptions = [
    { value: 'newest', label: 'Plus récents', icon: '🕒' },
    { value: 'oldest', label: 'Plus anciens', icon: '📅' },
    { value: 'value_asc', label: 'Valeur croissante', icon: '💰' },
    { value: 'value_desc', label: 'Valeur décroissante', icon: '💎' },
    { value: 'title_asc', label: 'Titre A-Z', icon: '🔤' },
    { value: 'title_desc', label: 'Titre Z-A', icon: '🔤' },
  ] as const;

  const offerTypeOptions = [
    { value: 'donation', label: 'Dons', icon: Gift, color: 'from-green-500 to-green-600' },
    { value: 'trade', label: 'Échanges', icon: Handshake, color: 'from-orange-500 to-orange-600' },
    { value: 'loan', label: 'Prêts', icon: RefreshCcw, color: 'from-blue-500 to-blue-600' },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Première ligne : Filtres et Tri */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Filter Toggle */}
          <Button
            onClick={onToggleFilters}
            variant="ghost"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              showFilters 
                ? 'bg-brand-100 text-brand-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Filter size={18} />
            <span className="hidden sm:inline">Filtres</span>
            {activeFiltersCount > 0 && (
              <Badge variant="brand" size="sm">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              <Grid size={16} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            >
              <List size={16} />
            </motion.button>
          </div>

          {/* Refresh Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={onRefresh}
              variant="ghost"
              size="sm"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw 
                size={16} 
                className={isLoading ? 'animate-spin' : ''} 
              />
              <span className="hidden sm:inline">Actualiser</span>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Deuxième ligne : Boutons de filtrage par type d'offre */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Type d'offre :</span>
        <div className="flex items-center gap-2">
          {/* Bouton "Tous" */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onOfferTypeChange(undefined)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              !offerType 
                ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/25' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
            }`}
          >
            <span>Tous</span>
            {!offerType && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-2 h-2 bg-white rounded-full" 
              />
            )}
          </motion.button>

          {/* Boutons par type d'offre */}
          {offerTypeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = offerType === option.value;
            return (
              <motion.button
                key={option.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onOfferTypeChange(isActive ? undefined : option.value as OfferType)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? `bg-gradient-to-r ${option.color} text-white shadow-lg shadow-${option.color.split(' ')[1]}/25` 
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
                }`}
              >
                <Icon size={16} />
                <span>{option.label}</span>
                {isActive && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 bg-white rounded-full" 
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default ViewControls;
