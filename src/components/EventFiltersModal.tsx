import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  Star,
  Filter,
  RotateCcw
} from 'lucide-react';
import Button from './ui/Button';
import Badge from './ui/Badge';

interface EventFiltersModalProps {
  onClose: () => void;
  onApplyFilters: (filters: EventFilters) => void;
}

interface EventFilters {
  types: string[];
  statuses: string[];
  dateRange: {
    start: string;
    end: string;
  };
  participantsRange: {
    min: number;
    max: number;
  };
  distance: number;
  hasLocation: boolean;
  isRecurring: boolean;
}

const EventFiltersModal: React.FC<EventFiltersModalProps> = ({
  onClose,
  onApplyFilters
}) => {
  const [filters, setFilters] = useState<EventFilters>({
    types: [],
    statuses: [],
    dateRange: {
      start: '',
      end: ''
    },
    participantsRange: {
      min: 0,
      max: 1000
    },
    distance: 10,
    hasLocation: false,
    isRecurring: false
  });

  const eventTypes = [
    { id: 'meetup', label: 'Rencontres', icon: Users },
    { id: 'swap', label: 'Troc Party', icon: Star },
    { id: 'workshop', label: 'Ateliers', icon: Calendar },
    { id: 'social', label: 'Événements sociaux', icon: Users },
    { id: 'other', label: 'Autres', icon: Filter }
  ];

  const eventStatuses = [
    { id: 'upcoming', label: 'À venir' },
    { id: 'ongoing', label: 'En cours' },
    { id: 'past', label: 'Passés' }
  ];

  const distanceOptions = [
    { value: 1, label: '1 km' },
    { value: 5, label: '5 km' },
    { value: 10, label: '10 km' },
    { value: 25, label: '25 km' },
    { value: 50, label: '50 km' },
    { value: 100, label: '100+ km' }
  ];

  const updateFilter = (key: keyof EventFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key: 'types' | 'statuses', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }));
  };

  const resetFilters = () => {
    setFilters({
      types: [],
      statuses: [],
      dateRange: {
        start: '',
        end: ''
      },
      participantsRange: {
        min: 0,
        max: 1000
      },
      distance: 10,
      hasLocation: false,
      isRecurring: false
    });
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.types.length > 0) count++;
    if (filters.statuses.length > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.participantsRange.min > 0 || filters.participantsRange.max < 1000) count++;
    if (filters.distance !== 10) count++;
    if (filters.hasLocation) count++;
    if (filters.isRecurring) count++;
    return count;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-brand-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Filtres avancés</h2>
                <p className="text-sm text-gray-500">
                  {getActiveFiltersCount() > 0 
                    ? `${getActiveFiltersCount()} filtre${getActiveFiltersCount() > 1 ? 's' : ''} actif${getActiveFiltersCount() > 1 ? 's' : ''}`
                    : 'Aucun filtre appliqué'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh] space-y-8">
            {/* Types d'événements */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Types d'événements</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {eventTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => toggleArrayFilter('types', type.id)}
                    className={`p-3 border-2 rounded-lg text-left transition-all ${
                      filters.types.includes(type.id)
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <type.icon className={`w-4 h-4 ${
                        filters.types.includes(type.id) ? 'text-brand-600' : 'text-gray-600'
                      }`} />
                      <span className="text-sm font-medium">{type.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Statuts */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Statut</h3>
              <div className="flex flex-wrap gap-2">
                {eventStatuses.map(status => (
                  <button
                    key={status.id}
                    onClick={() => toggleArrayFilter('statuses', status.id)}
                    className={`px-4 py-2 border-2 rounded-lg text-sm font-medium transition-all ${
                      filters.statuses.includes(status.id)
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Période */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Période</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, start: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, end: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    min={filters.dateRange.start}
                  />
                </div>
              </div>
              
              {/* Options rapides */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const today = new Date();
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    updateFilter('dateRange', {
                      start: today.toISOString().split('T')[0],
                      end: tomorrow.toISOString().split('T')[0]
                    });
                  }}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Aujourd'hui
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    const nextWeek = new Date(today);
                    nextWeek.setDate(nextWeek.getDate() + 7);
                    updateFilter('dateRange', {
                      start: today.toISOString().split('T')[0],
                      end: nextWeek.toISOString().split('T')[0]
                    });
                  }}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cette semaine
                </button>
                <button
                  onClick={() => {
                    const today = new Date();
                    const nextMonth = new Date(today);
                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                    updateFilter('dateRange', {
                      start: today.toISOString().split('T')[0],
                      end: nextMonth.toISOString().split('T')[0]
                    });
                  }}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Ce mois
                </button>
              </div>
            </div>

            {/* Nombre de participants */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Nombre de participants</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={filters.participantsRange.min}
                    onChange={(e) => updateFilter('participantsRange', { 
                      ...filters.participantsRange, 
                      min: parseInt(e.target.value) || 0 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={filters.participantsRange.max}
                    onChange={(e) => updateFilter('participantsRange', { 
                      ...filters.participantsRange, 
                      max: parseInt(e.target.value) || 1000 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Distance */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Distance maximale</h3>
              <div className="flex flex-wrap gap-2">
                {distanceOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => updateFilter('distance', option.value)}
                    className={`px-3 py-2 border-2 rounded-lg text-sm font-medium transition-all ${
                      filters.distance === option.value
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Options supplémentaires */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Options supplémentaires</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.hasLocation}
                    onChange={(e) => updateFilter('hasLocation', e.target.checked)}
                    className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Seulement les événements avec localisation précise
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.isRecurring}
                    onChange={(e) => updateFilter('isRecurring', e.target.checked)}
                    className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Seulement les événements récurrents
                  </span>
                </label>
              </div>
            </div>

            {/* Filtres actifs */}
            {getActiveFiltersCount() > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Filtres actifs</h3>
                <div className="flex flex-wrap gap-2">
                  {filters.types.map(type => (
                    <Badge
                      key={type}
                      variant="info"
                      className="flex items-center gap-1"
                    >
                      {eventTypes.find(t => t.id === type)?.label}
                      <button
                        onClick={() => toggleArrayFilter('types', type)}
                        className="ml-1 hover:bg-brand-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  
                  {filters.statuses.map(status => (
                    <Badge
                      key={status}
                      variant="success"
                      className="flex items-center gap-1"
                    >
                      {eventStatuses.find(s => s.id === status)?.label}
                      <button
                        onClick={() => toggleArrayFilter('statuses', status)}
                        className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}

                  {filters.dateRange.start && (
                    <Badge variant="warning" className="flex items-center gap-1">
                      {filters.dateRange.start} → {filters.dateRange.end || '∞'}
                      <button
                        onClick={() => updateFilter('dateRange', { start: '', end: '' })}
                        className="ml-1 hover:bg-yellow-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}

                  {filters.hasLocation && (
                    <Badge variant="info" className="flex items-center gap-1">
                      Avec localisation
                      <button
                        onClick={() => updateFilter('hasLocation', false)}
                        className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}

                  {filters.isRecurring && (
                    <Badge variant="info" className="flex items-center gap-1">
                      Récurrents
                      <button
                        onClick={() => updateFilter('isRecurring', false)}
                        className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <Button
              variant="ghost"
              onClick={resetFilters}
              disabled={getActiveFiltersCount() === 0}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Réinitialiser
            </Button>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button onClick={handleApplyFilters}>
                Appliquer les filtres ({getActiveFiltersCount()})
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EventFiltersModal;
