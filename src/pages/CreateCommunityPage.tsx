import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, MapPin, Users, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { useCreateCommunity } from '../hooks/useCommunities';
import { useAuthStore } from '../store/authStore';
import { suggestCommunityFromAddress, type CommunitySuggestion } from '../services/aiService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import Card from '../components/ui/Card';

const createCommunitySchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom est trop long'),
  description: z.string().max(500, 'La description est trop longue').optional(),
  city: z.string().min(1, 'La ville est requise').max(100, 'Le nom de ville est trop long'),
  postal_code: z.string().max(10, 'Le code postal est trop long').optional(),
  radius_km: z.number().min(1, 'Le rayon doit être d\'au moins 1km').max(20, 'Le rayon ne peut pas dépasser 20km'),
});

type CreateCommunityForm = z.infer<typeof createCommunitySchema>;

const CreateCommunityPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const createCommunity = useCreateCommunity();
  const [isLocating, setIsLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [addressQuery, setAddressQuery] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<Array<{ label: string; lat: number; lon: number }>>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [addressDropdownOpen, setAddressDropdownOpen] = useState(false);
  const [aiCommunitySuggestion, setAiCommunitySuggestion] = useState<CommunitySuggestion | null>(null);
  const [isSuggestingCommunity, setIsSuggestingCommunity] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateCommunityForm>({
    resolver: zodResolver(createCommunitySchema),
    defaultValues: {
      radius_km: 5,
    },
  });

  // Recherche d'adresse (debounce)
  React.useEffect(() => {
    const q = addressQuery?.trim();
    if (!q || q.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setIsSearchingAddress(true);
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&addressdetails=1&limit=5`; 
        const res = await fetch(url, {
          headers: { 'Accept-Language': 'fr', 'User-Agent': 'TrocAll App (contact@example.com)' },
          signal: controller.signal,
        });
        const json = await res.json();
        const next = (json || []).map((r: any) => ({
          label: r.display_name as string,
          lat: Number(r.lat),
          lon: Number(r.lon),
        }));
        setAddressSuggestions(next);
        setAddressDropdownOpen(true);
      } catch (e) {
        if (!(e instanceof DOMException && e.name === 'AbortError')) {
          console.warn('Address search failed', e);
        }
      } finally {
        setIsSearchingAddress(false);
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [addressQuery]);

  // Suggérer un quartier quand une adresse est sélectionnée
  React.useEffect(() => {
    const city = watch('city');
    if (!city || city.length < 3) {
      setAiCommunitySuggestion(null);
      return;
    }

    const suggestCommunity = async () => {
      try {
        setIsSuggestingCommunity(true);
        const suggestion = await suggestCommunityFromAddress(city);
        setAiCommunitySuggestion(suggestion);
      } catch (error) {
        console.error('Erreur suggestion quartier IA:', error);
        setAiCommunitySuggestion(null);
      } finally {
        setIsSuggestingCommunity(false);
      }
    };

    const timeout = setTimeout(suggestCommunity, 1000); // Debounce 1 seconde
    return () => clearTimeout(timeout);
  }, [watch('city')]);

  // Appliquer la suggestion IA
  const applyAISuggestion = () => {
    if (!aiCommunitySuggestion) return;

    setValue('name', aiCommunitySuggestion.name, { shouldValidate: true, shouldDirty: true });
    setValue('description', aiCommunitySuggestion.description, { shouldValidate: true, shouldDirty: true });
    setValue('city', aiCommunitySuggestion.city, { shouldValidate: true, shouldDirty: true });
    if (aiCommunitySuggestion.postal_code) {
      setValue('postal_code', aiCommunitySuggestion.postal_code, { shouldValidate: true, shouldDirty: true });
    }
    setValue('radius_km', aiCommunitySuggestion.radius_km, { shouldValidate: true, shouldDirty: true });
    setAiCommunitySuggestion(null);
  };

  // Obtenir la géolocalisation de l'utilisateur
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(location);
        setIsLocating(false);
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error);
        setIsLocating(false);
        alert('Impossible d\'obtenir votre position. Veuillez autoriser la géolocalisation.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const onSubmit = async (data: CreateCommunityForm) => {
    if (!user) {
      alert('Vous devez être connecté pour créer un quartier');
      return;
    }

    try {
      await createCommunity.mutateAsync({
        ...data,
        center_latitude: userLocation?.lat,
        center_longitude: userLocation?.lng,
        created_by: user.id,
      });
      
      alert(`Quartier "${data.name}" créé avec succès !`);
      navigate('/communities');
    } catch (error) {
      console.error('Error creating community:', error);
      alert('Erreur lors de la création du quartier');
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/communities')}
            leftIcon={<ArrowLeft size={18} />}
            className="text-gray-600 hover:text-gray-800"
          >
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Créer un quartier</h1>
            <p className="text-gray-600 mt-1">
              Créez un nouveau quartier pour connecter vos voisins
            </p>
          </div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informations principales */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Informations du quartier
          </h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nom du quartier *
              </label>
              <Input
                {...register('name')}
                id="name"
                placeholder="ex: Centre-ville, Quartier des Arts, Résidence Les Pins"
                className={errors.name ? 'border-red-300' : ''}
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <TextArea
                {...register('description')}
                id="description"
                placeholder="Décrivez votre quartier, ses caractéristiques, ses activités..."
                rows={3}
                className={errors.description ? 'border-red-300' : ''}
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Localisation */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            Localisation
          </h2>
          
          <div className="space-y-4">
            {/* Recherche d'adresse avec suggestions */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Adresse ou ville *
              </label>
              <div className="relative">
                <Input
                  id="address"
                  value={addressQuery || (watch('city') || '')}
                  onChange={(e) => {
                    setAddressQuery(e.target.value);
                    setValue('city', e.target.value, { shouldDirty: true, shouldTouch: true });
                  }}
                  onFocus={() => {
                    if (addressSuggestions.length > 0) setAddressDropdownOpen(true);
                  }}
                  onBlur={() => {
                    setTimeout(() => setAddressDropdownOpen(false), 150);
                  }}
                  placeholder="Saisissez une adresse ou ville pour obtenir des suggestions"
                  className={errors.city ? 'border-red-300' : ''}
                />

                {/* Suggestions d'adresse */}
                {addressDropdownOpen && (addressSuggestions.length > 0 || isSearchingAddress) && (
                  <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {isSearchingAddress && (
                      <div className="px-3 py-2 text-sm text-gray-600">Recherche en cours…</div>
                    )}
                    {addressSuggestions.map((sugg, idx) => (
                      <button
                        key={`${sugg.label}-${idx}`}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                        onClick={() => {
                          // Renseigner l'adresse choisie
                          setValue('city', sugg.label, { shouldDirty: true, shouldTouch: true });
                          setAddressQuery(sugg.label);
                          setAddressDropdownOpen(false);
                          // Mettre à jour coordonnées + position utilisateur
                          const lat = Number(sugg.lat);
                          const lon = Number(sugg.lon);
                          setUserLocation({ lat, lng: lon });
                        }}
                      >
                        {sugg.label}
                      </button>
                    ))}
                    {!isSearchingAddress && addressSuggestions.length === 0 && (
                      <div className="px-3 py-2 text-sm text-gray-500">Aucune suggestion</div>
                    )}
                  </div>
                )}
              </div>
              {errors.city && (
                <p className="text-red-600 text-sm mt-1">{errors.city.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">
                  Code postal
                </label>
                <Input
                  {...register('postal_code')}
                  id="postal_code"
                  placeholder="ex: 75001"
                  className={errors.postal_code ? 'border-red-300' : ''}
                />
                {errors.postal_code && (
                  <p className="text-red-600 text-sm mt-1">{errors.postal_code.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="radius_km" className="block text-sm font-medium text-gray-700 mb-1">
                  Rayon du quartier (km) *
                </label>
                <Input
                  {...register('radius_km', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  max="20"
                  step="0.5"
                  id="radius_km"
                  className={errors.radius_km ? 'border-red-300' : ''}
                />
                {errors.radius_km && (
                  <p className="text-red-600 text-sm mt-1">{errors.radius_km.message}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Définissez la zone géographique de votre quartier (1-20 km)
                </p>
              </div>
            </div>

            {/* Suggestion de quartier par IA */}
            {isSuggestingCommunity && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 animate-pulse" />
                  <span className="text-sm text-purple-800">IA analyse l'adresse pour suggérer un quartier...</span>
                </div>
              </div>
            )}

            {aiCommunitySuggestion && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">Suggestion IA</span>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        {Math.round(aiCommunitySuggestion.confidence * 100)}% confiance
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900">{aiCommunitySuggestion.name}</p>
                      <p className="text-sm text-gray-600">{aiCommunitySuggestion.description}</p>
                      <p className="text-xs text-gray-500">
                        {aiCommunitySuggestion.city}
                        {aiCommunitySuggestion.postal_code && ` • ${aiCommunitySuggestion.postal_code}`}
                        {` • Rayon: ${aiCommunitySuggestion.radius_km}km`}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={applyAISuggestion}
                    className="ml-3 bg-purple-600 hover:bg-purple-700"
                  >
                    Appliquer cette suggestion
                  </Button>
                </div>
              </div>
            )}

            {/* Géolocalisation */}
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">Position centrale</h3>
                  <p className="text-sm text-gray-600">
                    Optionnel : Définissez le centre géographique de votre quartier
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={getCurrentLocation}
                  disabled={isLocating}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {isLocating ? 'Localisation…' : 'Utiliser ma position'}
                </Button>
              </div>
              
              {userLocation && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    📍 Position détectée : {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Résumé */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Résumé de votre quartier
          </h2>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Nom :</span>
              <span className="font-medium">{watch('name') || 'Non renseigné'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ville :</span>
              <span className="font-medium">{watch('city') || 'Non renseignée'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Rayon :</span>
              <span className="font-medium">{watch('radius_km') || 5} km</span>
            </div>
            {userLocation && (
              <div className="flex justify-between">
                <span className="text-gray-600">Position :</span>
                <span className="font-medium text-sm">
                  {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/communities')}
            className="flex-1 border border-gray-300"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={createCommunity.isPending}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {createCommunity.isPending ? 'Création...' : 'Créer le quartier'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateCommunityPage;