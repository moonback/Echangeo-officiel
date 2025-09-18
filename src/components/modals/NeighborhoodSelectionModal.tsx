import React, { useState, useEffect } from 'react';
import { X, MapPin, Search, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { suggestNeighborhoods, filterUniqueNeighborhoods } from '../../services/neighborhoodSuggestionAI';
import type { Community, NeighborhoodSuggestion } from '../../types';

interface NeighborhoodSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNeighborhood: (neighborhood: NeighborhoodSuggestion) => void;
  existingCommunities: Community[];
  userLocation?: { lat: number; lng: number };
  searchInput?: string; // Entrée de recherche pré-remplie
}

const NeighborhoodSelectionModal: React.FC<NeighborhoodSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectNeighborhood,
  existingCommunities,
  userLocation,
  searchInput = ''
}) => {
  const [inputValue, setInputValue] = useState(searchInput);
  const [suggestions, setSuggestions] = useState<NeighborhoodSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<NeighborhoodSuggestion | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setInputValue(searchInput);
      setSuggestions([]);
      setError(null);
      setSelectedSuggestion(null);
    }
  }, [isOpen, searchInput]);

  // Auto-search when modal opens with a provided address
  useEffect(() => {
    if (isOpen && searchInput && searchInput.trim()) {
      // Délai pour éviter les conflits avec le reset
      const timer = setTimeout(() => {
        handleSearch();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, searchInput]);

  const handleSearch = async () => {
    if (!inputValue.trim()) {
      setError('Veuillez saisir un code postal ou une ville');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const aiSuggestions = await suggestNeighborhoods(inputValue.trim(), existingCommunities);
      const uniqueSuggestions = filterUniqueNeighborhoods(aiSuggestions, existingCommunities);
      
      if (uniqueSuggestions.length === 0) {
        setError('Aucun quartier trouvé pour cette localisation. Essayez avec un autre code postal ou une autre ville.');
      } else {
        setSuggestions(uniqueSuggestions);
      }
    } catch (err: any) {
      console.error('Erreur lors de la recherche de quartiers:', err);
      setError(err.message || 'Erreur lors de la recherche de quartiers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestion: NeighborhoodSuggestion) => {
    setSelectedSuggestion(suggestion);
  };

  const handleConfirmSelection = () => {
    if (selectedSuggestion) {
      onSelectNeighborhood(selectedSuggestion);
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Rechercher un quartier
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Search Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code postal ou ville
              </label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ex: 75011, Paris, Lyon, Marseille..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
                    disabled={isLoading}
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={isLoading || !inputValue.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Rechercher
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 text-blue-600 mt-0.5">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Comment ça marche ?</p>
                  <p>
                    Saisissez un code postal ou une ville pour découvrir les quartiers disponibles. 
                    Notre IA vous suggérera les quartiers les plus pertinents pour l'économie collaborative locale.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3 text-gray-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Recherche de quartiers en cours...</span>
              </div>
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Quartiers suggérés ({suggestions.length})
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedSuggestion === suggestion
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleSelectSuggestion(suggestion)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-gray-900">
                            {suggestion.name}
                          </h4>
                          {suggestion.confidence > 0.8 && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              Recommandé
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {suggestion.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{suggestion.city}</span>
                          {suggestion.postalCode && (
                            <span>{suggestion.postalCode}</span>
                          )}
                          <span>{suggestion.department}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        {selectedSuggestion === suggestion ? (
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Suggestion Summary */}
          {selectedSuggestion && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">
                    Quartier sélectionné : {selectedSuggestion.name}
                  </p>
                  <p className="text-sm text-green-700">
                    {selectedSuggestion.city} • {selectedSuggestion.postalCode || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirmSelection}
            disabled={!selectedSuggestion}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Confirmer la sélection
          </button>
        </div>
      </div>
    </div>
  );
};

export default NeighborhoodSelectionModal;
