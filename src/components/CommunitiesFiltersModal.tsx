import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Users, TrendingUp, Filter, RefreshCw } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';

interface CommunitiesFilters {
  search: string;
  sortBy: 'members' | 'activity' | 'name' | 'distance';
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
    { value: 'members', label: 'Par nombre de membres', icon: '👥' },
    { value: 'activity', label: 'Par activité récente', icon: '📈' },
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
          className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200/60"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-gradient-to-r from-brand-50 to-brand-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Filter className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Filtres des Quartiers</h2>
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
          <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50 to-brand-50/30">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Colonne 1: Filtres principaux */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 h-fit space-y-6"
                >
                  {/* Tri */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      Trier par
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => onFilterChange('sortBy', option.value)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                            filters.sortBy === option.value
                              ? 'border-brand-500 bg-gradient-to-br from-brand-50 to-brand-100 text-brand-700 shadow-md'
                              : 'border-gray-200 bg-white hover:border-brand-300 hover:bg-brand-50/50 shadow-sm hover:shadow-md'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-2">{option.icon}</div>
                            <span className="text-sm font-semibold">{option.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mode d'affichage */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      Affichage
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {viewModeOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => onFilterChange('viewMode', option.value)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                            filters.viewMode === option.value
                              ? 'border-brand-500 bg-gradient-to-br from-brand-50 to-brand-100 text-brand-700 shadow-md'
                              : 'border-gray-200 bg-white hover:border-brand-300 hover:bg-brand-50/50 shadow-sm hover:shadow-md'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-2">{option.icon}</div>
                            <span className="text-sm font-semibold">{option.label}</span>
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
                  className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 h-fit space-y-6"
                >
                  {/* Recherche */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Recherche</h3>
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => onFilterChange('search', e.target.value)}
                      placeholder="Nom, ville, description..."
                      className="input w-full px-4 py-3 text-sm"
                    />
                  </div>

                  {/* Ville */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      Ville
                    </h3>
                    <select
                      value={filters.selectedCity}
                      onChange={(e) => onFilterChange('selectedCity', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    >
                      <option value="">Toutes les villes</option>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  {/* Nombre minimum de membres */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      Membres minimum
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {memberRanges.map((range) => (
                        <button
                          key={range.value}
                          onClick={() => onFilterChange('minMembers', range.value)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 text-left hover:scale-105 ${
                            filters.minMembers === range.value
                              ? 'border-brand-500 bg-gradient-to-br from-brand-50 to-brand-100 text-brand-700 shadow-md'
                              : 'border-gray-200 bg-white hover:border-brand-300 hover:bg-brand-50/50 shadow-sm hover:shadow-md'
                          }`}
                        >
                          <span className="text-sm font-semibold">{range.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200/50 bg-white/95 backdrop-blur-sm">
            <Button
              variant="secondary"
              onClick={onResetFilters}
              leftIcon={<RefreshCw className="w-4 h-4" />}
              className="shadow-md hover:shadow-lg"
            >
              Réinitialiser
            </Button>
            <div className="flex items-center gap-3">
              <Button 
                variant="secondary" 
                onClick={onClose}
                className="shadow-md hover:shadow-lg"
              >
                Annuler
              </Button>
              <Button 
                onClick={onApplyFilters} 
                leftIcon={<Filter className="w-4 h-4" />}
                className="shadow-lg hover:shadow-xl"
              >
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
