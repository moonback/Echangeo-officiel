import React from 'react';
import { motion } from 'framer-motion';
import { Grid, List, ArrowUpDown, RefreshCw, Filter } from 'lucide-react';
import Button from './ui/Button';
import Badge from './ui/Badge';

type SortOption = 'newest' | 'oldest' | 'value_asc' | 'value_desc' | 'title_asc' | 'title_desc';
type ViewMode = 'grid' | 'list';

interface ViewControlsProps {
  sortBy: SortOption;
  viewMode: ViewMode;
  activeFiltersCount: number;
  showFilters: boolean;
  onSortChange: (sort: SortOption) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onToggleFilters: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

const ViewControls: React.FC<ViewControlsProps> = ({
  sortBy,
  viewMode,
  activeFiltersCount,
  showFilters,
  onSortChange,
  onViewModeChange,
  onToggleFilters,
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center justify-between gap-4"
    >
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
    </motion.div>
  );
};

export default ViewControls;
