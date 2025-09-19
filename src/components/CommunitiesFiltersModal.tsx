import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Users, TrendingUp, Filter, RefreshCw } from 'lucide-react';
import Button from './ui/Button';

interface CommunitiesFilters {
  search: string;
  sortBy: 'activity' | 'members' | 'activity_date' | 'name' | 'distance';
  selectedCity: string;
  minMembers: number;
  viewMode: 'grid' | 'list';
}

interface CommunitiesFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: CommunitiesFilters;
  onFilterChange: (key: keyof CommunitiesFilters, value: any) => void;
  onResetFilters: () => void;
  onApplyFilters: () => void;
  activeFiltersCount: number;
  filteredCount: number;
  cities: string[];
}

const CommunitiesFiltersModal: React.FC<CommunitiesFiltersModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onResetFilters,
  onApplyFilters,
  activeFiltersCount,
  filteredCount,
  cities
}) => {
  const sortOptions = [
    { value: 'activity', label: 'Par activité globale', icon: '🔥' },
    { value: 'members', label: 'Par nombre de membres', icon: '👥' },
    { value: 'activity_date', label: 'Par activité récente', icon: '📈' },
    { value: 'name', label: 'Par nom', icon: '🔤' },
    { value: 'distance', label: 'Par distance', icon: '📍' }
  ];

  const viewModeOptions = [
    { value: 'grid', label: 'Grille', icon: '⊞' },
    { value: 'list', label: 'Liste', icon: '☰' }
  ];

  const memberRanges = [
    { value: 0, label: 'Tous' },
    { value: 10, label: '10+ membres' },
    { value: 25, label: '25+ membres' },
    { value: 50, label: '50+ membres' },
    { value: 100, label: '100+ membres' }
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
                <h2 className="text-xl font-bold text-gray-900">Filtres des Quartiers</h2>
                <p className="text-sm text-gray-600">
                  {activeFiltersCount > 0 
                    ? `${activeFiltersCount} filtre${activeFiltersCount > 1 ? 's' : ''} appliqué${activeFiltersCount > 1 ? 's' : ''} • ${filteredCount} résultat${filteredCount > 1 ? 's' : ''}`
                    : `${filteredCount} quartier${filteredCount > 1 ? 's' : ''} disponible${filteredCount > 1 ? 's' : ''}`
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
                  {/* Tri */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-brand-600" />
                      Trier par
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => onFilterChange('sortBy', option.value)}
                          className={`p-2 rounded-lg border-2 transition-all duration-200 ${
                            filters.sortBy === option.value
                              ? 'border-brand-500 bg-brand-50 text-brand-700'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-lg mb-1">{option.icon}</div>
                            <span className="text-xs font-medium">{option.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mode d'affichage */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4 text-brand-600" />
                      Affichage
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {viewModeOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => onFilterChange('viewMode', option.value)}
                          className={`p-2 rounded-lg border-2 transition-all duration-200 ${
                            filters.viewMode === option.value
                              ? 'border-brand-500 bg-brand-50 text-brand-700'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-lg mb-1">{option.icon}</div>
                            <span className="text-xs font-medium">{option.label}</span>
                          </div>
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
                  {/* Recherche */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Recherche</h3>
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => onFilterChange('search', e.target.value)}
                      placeholder="Nom, ville, description..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200"
                    />
                  </div>

                  {/* Ville */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-brand-600" />
                      Ville
                    </h3>
                    <select
                      value={filters.selectedCity}
                      onChange={(e) => onFilterChange('selectedCity', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200"
                    >
                      <option value="">Toutes les villes</option>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  {/* Nombre minimum de membres */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4 text-brand-600" />
                      Membres minimum
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {memberRanges.map((range) => (
                        <button
                          key={range.value}
                          onClick={() => onFilterChange('minMembers', range.value)}
                          className={`p-2 rounded-lg border-2 transition-all duration-200 text-left ${
                            filters.minMembers === range.value
                              ? 'border-brand-500 bg-brand-50 text-brand-700'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-sm font-medium">{range.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
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

export default CommunitiesFiltersModal;
