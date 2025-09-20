import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, MapPin, Navigation, Loader2 } from 'lucide-react';
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import Input from '../ui/Input';
import Button from '../ui/Button';
import type { CreateItemForm } from '../../pages/CreateItemPage';
import type { ItemCategory } from '../../types';

interface TagInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  className?: string;
}

const TagInput: React.FC<TagInputProps> = ({ value, onChange, suggestions, className = '' }) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const tags = value ? value.split(',').map(t => t.trim()).filter(Boolean) : [];

  const addTag = (tag: string) => {
    if (!tag.trim()) return;
    
    const existingTags = value ? value.split(',').map(t => t.trim()).filter(Boolean) : [];
    if (!existingTags.includes(tag.trim())) {
      const newTags = [...existingTags, tag.trim()].join(', ');
      onChange(newTags);
    }
    setInputValue('');
  };

  const removeTag = (tagToRemove: string) => {
    const existingTags = value ? value.split(',').map(t => t.trim()).filter(Boolean) : [];
    const newTags = existingTags.filter(tag => tag !== tagToRemove).join(', ');
    onChange(newTags);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Tapez un tag et appuyez sur Entrée"
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => addTag(inputValue)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Tags affichés */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.span>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="text-sm text-gray-600 font-medium">Suggestions :</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addTag(suggestion)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md border border-gray-300 transition-colors"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

interface Step3DetailsProps {
  register: UseFormRegister<CreateItemForm>;
  errors: FieldErrors<CreateItemForm>;
  watch: UseFormWatch<CreateItemForm>;
  setValue: UseFormSetValue<CreateItemForm>;
  aiAnalysisApplied: boolean;
  tagSuggestions: string[];
}

const Step3Details: React.FC<Step3DetailsProps> = ({
  register,
  errors,
  watch,
  setValue,
  aiAnalysisApplied,
  tagSuggestions,
}) => {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string>('');

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setLocationStatus('Géolocalisation non supportée par votre navigateur');
      return;
    }

    setIsGettingLocation(true);
    setLocationStatus('Recherche de votre position...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Mettre à jour les coordonnées dans le formulaire
        setValue('latitude', latitude);
        setValue('longitude', longitude);
        
        // Optionnel : essayer de récupérer une adresse depuis les coordonnées
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          const data = await response.json();
          
          if (data.display_name) {
            setValue('location_hint', data.display_name);
            setLocationStatus(`Position détectée: ${data.display_name}`);
          } else {
            setLocationStatus(`Position détectée: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
        } catch (error) {
          setLocationStatus(`Position détectée: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
        
        setIsGettingLocation(false);
      },
      (error) => {
        let message = 'Erreur de géolocalisation';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Permission de géolocalisation refusée';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Position non disponible';
            break;
          case error.TIMEOUT:
            message = 'Délai d\'attente dépassé';
            break;
        }
        setLocationStatus(message);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };
  const tagsValue = watch('tags') || '';

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
            Marque
          </label>
          <Input 
            {...register('brand')} 
            id="brand" 
            className={aiAnalysisApplied ? 'bg-purple-50/50 border-purple-200' : ''}
          />
        </div>
        <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
            Modèle
          </label>
          <Input 
            {...register('model')} 
            id="model" 
            className={aiAnalysisApplied ? 'bg-purple-50/50 border-purple-200' : ''}
          />
        </div>
      </div>

      <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
        <label htmlFor="estimated_value" className="block text-sm font-medium text-gray-700 mb-1">
          Valeur estimée (€)
        </label>
        <Input 
          {...register('estimated_value')} 
          type="number" 
          step="0.01" 
          min="0" 
          id="estimated_value" 
          className={aiAnalysisApplied ? 'bg-purple-50/50 border-purple-200' : ''}
        />
      </div>

      <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
          Tags
        </label>
        <TagInput
          value={tagsValue}
          onChange={(value) => setValue('tags', value, { shouldDirty: true, shouldTouch: true })}
          suggestions={tagSuggestions}
          className={aiAnalysisApplied ? 'bg-purple-50/50' : ''}
        />
        <input type="hidden" {...register('tags')} />
      </div>
      
      {/* Section Disponibilité et Localisation */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Disponibilité et Localisation</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
            <label htmlFor="available_from" className="block text-sm font-medium text-gray-700 mb-1">
              Disponible à partir du
            </label>
            <Input {...register('available_from')} type="date" id="available_from" />
          </div>
          <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
            <label htmlFor="available_to" className="block text-sm font-medium text-gray-700 mb-1">
              Disponible jusqu'au
            </label>
            <Input {...register('available_to')} type="date" id="available_to" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 bg-white glass mb-4">
          <label htmlFor="location_hint" className="block text-sm font-medium text-gray-700 mb-1">
            Indication de localisation
          </label>
          <div className="flex gap-2">
            <Input
              {...register('location_hint')}
              id="location_hint"
              placeholder="Saisissez une adresse ou cliquez sur le bouton GPS"
              className="flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              {isGettingLocation ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  GPS...
                </>
              ) : (
                <>
                  <Navigation size={16} />
                  GPS
                </>
              )}
            </Button>
          </div>
          
          {/* Statut de la géolocalisation */}
          {locationStatus && (
            <div className={`mt-2 text-sm ${
              locationStatus.includes('Position détectée') 
                ? 'text-green-600' 
                : locationStatus.includes('Erreur') || locationStatus.includes('Permission')
                ? 'text-red-600'
                : 'text-blue-600'
            }`}>
              <div className="flex items-center gap-2">
                <MapPin size={14} />
                <span>{locationStatus}</span>
              </div>
            </div>
          )}
        </div>

        {/* Coordonnées cachées - gérées automatiquement par la géolocalisation */}
        <input type="hidden" {...register('latitude')} />
        <input type="hidden" {...register('longitude')} />
      </div>
    </>
  );
};

export default Step3Details;
