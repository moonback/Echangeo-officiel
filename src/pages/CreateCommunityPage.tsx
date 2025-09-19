import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, MapPin, Sparkles, CheckCircle, Loader2 } from 'lucide-react';
import { useCreateCommunity } from '../hooks/useCommunities';
import { supabase } from '../services/supabase';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import Card from '../components/ui/Card';
import NeighborhoodSelectionModal from '../components/modals/NeighborhoodSelectionModal';
import type { NeighborhoodSuggestion } from '../types';

const createCommunitySchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom est trop long'),
  description: z.string().max(500, 'La description est trop longue').optional(),
  city: z.string().min(1, 'La ville est requise').max(100, 'Le nom de ville est trop long'),
  postal_code: z.string().max(10, 'Le code postal est trop long').optional(),
  center_latitude: z
    .preprocess((v) => (v === '' || v === undefined ? undefined : Number(v)), z.number().min(-90).max(90).optional()),
  center_longitude: z
    .preprocess((v) => (v === '' || v === undefined ? undefined : Number(v)), z.number().min(-180).max(180).optional()),
  radius_km: z
    .preprocess((v) => (v === '' || v === undefined ? 2 : Number(v)), z.number().min(0.5).max(50)),
});

type CreateCommunityForm = z.infer<typeof createCommunitySchema>;

const CreateCommunityPage: React.FC = () => {
  const navigate = useNavigate();
  const createCommunity = useCreateCommunity();
  
  const [isLocating, setIsLocating] = useState(false);
  const [isNeighborhoodModalOpen, setIsNeighborhoodModalOpen] = useState(false);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<NeighborhoodSuggestion | null>(null);
  const [allSuggestions, setAllSuggestions] = useState<NeighborhoodSuggestion[]>([]);
  const [createdCommunityId, setCreatedCommunityId] = useState<string>('');
  const [detectedAddress, setDetectedAddress] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<CreateCommunityForm>({
    resolver: zodResolver(createCommunitySchema),
    defaultValues: {
      radius_km: 2
    }
  });

  // Obtenir l'adresse à partir des coordonnées GPS
  const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'fr',
            'User-Agent': 'Échangeo App (contact@example.com)'
          }
        }
      );
      
      const data = await response.json();
      
      if (data && data.address) {
        const address = data.address;
        const parts = [];
        
        if (address.postcode) parts.push(address.postcode);
        if (address.city || address.town || address.village) {
          parts.push(address.city || address.town || address.village);
        }
        
        return parts.length > 0 ? parts.join(', ') : null;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'adresse:', error);
      return null;
    }
  };

  // Créer toutes les communautés suggérées en une seule fois
  const createAllSuggestedCommunities = async (suggestions: NeighborhoodSuggestion[], selectedNeighborhood: NeighborhoodSuggestion) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.error('Utilisateur non connecté');
        return;
      }

      console.log(`🏘️ Création de ${suggestions.length} communautés suggérées...`);
      
      // Créer toutes les communautés en parallèle
      const communityPromises = suggestions.map(async (suggestion) => {
        try {
          const newCommunity = await createCommunity.mutateAsync({
            name: suggestion.name,
            description: `Quartier ${suggestion.name} à ${suggestion.city}. ${suggestion.description}`,
            city: suggestion.city,
            postal_code: suggestion.postalCode,
            center_latitude: suggestion.coordinates?.latitude,
            center_longitude: suggestion.coordinates?.longitude,
            radius_km: 2,
            created_by: user.user.id
          });
          
          console.log(`✅ Communauté créée: ${suggestion.name} (${suggestion.city})`);
          return { suggestion, community: newCommunity };
        } catch (error) {
          console.error(`❌ Erreur création ${suggestion.name}:`, error);
          return { suggestion, community: null };
        }
      });

      // Attendre que toutes les créations se terminent
      const results = await Promise.all(communityPromises);
      
      // Trouver la communauté correspondant au quartier sélectionné
      const selectedResult = results.find(r => r.suggestion.name === selectedNeighborhood.name);
      
      if (selectedResult && selectedResult.community) {
        setCreatedCommunityId(selectedResult.community.id);
        console.log(`🎯 Quartier sélectionné: ${selectedNeighborhood.name} (ID: ${selectedResult.community.id})`);
      }

      // Compter les succès
      const successCount = results.filter(r => r.community !== null).length;
      console.log(`📊 Résultat: ${successCount}/${suggestions.length} communautés créées avec succès`);
      
    } catch (error) {
      console.error('Erreur lors de la création des communautés:', error);
    }
  };

  // Callback pour stocker toutes les suggestions trouvées dans le modal
  const handleSuggestionsFound = (suggestions: NeighborhoodSuggestion[]) => {
    setAllSuggestions(suggestions);
    console.log(`📋 ${suggestions.length} suggestions stockées pour création en masse`);
  };

  // Gérer la sélection d'un quartier suggéré et créer toutes les communautés
  const handleSelectNeighborhood = async (neighborhood: NeighborhoodSuggestion) => {
    setSelectedNeighborhood(neighborhood);
    
    // Mettre à jour les coordonnées si disponibles
    if (neighborhood.coordinates) {
      setValue('center_latitude', neighborhood.coordinates.latitude);
      setValue('center_longitude', neighborhood.coordinates.longitude);
    }

    // Mettre à jour les autres champs
    setValue('name', neighborhood.name);
    setValue('city', neighborhood.city);
    setValue('postal_code', neighborhood.postalCode || '');
    setValue('description', `Quartier ${neighborhood.name} à ${neighborhood.city}. ${neighborhood.description}`);

    // Créer toutes les communautés suggérées
    if (allSuggestions.length > 0) {
      await createAllSuggestedCommunities(allSuggestions, neighborhood);
    }
  };

  // Géolocalisation pour suggestion de quartiers
  const handleOpenNeighborhoodModal = async () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        setValue('center_latitude', location.lat);
        setValue('center_longitude', location.lng);
        setIsLocating(false);
        
        // Obtenir l'adresse à partir des coordonnées
        const address = await getAddressFromCoordinates(location.lat, location.lng);
        if (address) {
          setDetectedAddress(address);
          setIsNeighborhoodModalOpen(true);
        } else {
          alert('Impossible de détecter votre adresse. Veuillez saisir manuellement un code postal ou une ville.');
          setIsNeighborhoodModalOpen(true);
        }
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error);
        setIsLocating(false);
        alert('Impossible d\'obtenir votre position. Veuillez autoriser la géolocalisation ou saisir manuellement.');
        setIsNeighborhoodModalOpen(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  // Géolocalisation simple
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue('center_latitude', position.coords.latitude);
        setValue('center_longitude', position.coords.longitude);
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
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        alert('Vous devez être connecté pour créer une communauté');
        return;
      }

      await createCommunity.mutateAsync({
        ...data,
        created_by: user.user.id
      });
      
      navigate('/communities');
    } catch (error) {
      console.error('Error creating community:', error);
    }
  };

  return (
    <div className="p-4 max-w-12xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center mb-6"
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          Créer une communauté
        </h1>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* Section suggestion IA */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Suggestion de quartier avec IA
            </h2>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Utilisez l'IA pour découvrir et suggérer des quartiers pertinents basés sur votre position ou une adresse.
          </p>

          <div className="flex gap-3 mb-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleOpenNeighborhoodModal}
              disabled={isLocating}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isLocating ? 'Détection…' : 'Suggérer un quartier'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={getCurrentLocation}
              disabled={isLocating}
              className="flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              {isLocating ? 'Localisation…' : 'Utiliser ma position'}
            </Button>
          </div>

          {selectedNeighborhood && (
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-800 font-medium">
                ✨ Quartier suggéré par IA : {selectedNeighborhood.name}
              </p>
              <p className="text-xs text-purple-600 mt-1">
                {selectedNeighborhood.city} • {selectedNeighborhood.postalCode || 'N/A'} • {selectedNeighborhood.description}
              </p>
              {createdCommunityId && (
                <div className="mt-2">
                  <p className="text-xs text-green-600 font-medium">
                    ✅ Communauté sélectionnée créée automatiquement
                  </p>
                  {allSuggestions.length > 1 && (
                    <p className="text-xs text-blue-600 mt-1">
                      📊 {allSuggestions.length} communautés créées en masse pour économiser les appels API
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Informations de base */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Informations de base
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Nom de la communauté"
                {...register('name')}
                error={errors.name?.message}
                placeholder="Ex: Belleville, République..."
              />
            </div>
            
            <div>
              <Input
                label="Ville"
                {...register('city')}
                error={errors.city?.message}
                placeholder="Ex: Paris, Lyon..."
              />
            </div>
            
            <div>
              <Input
                label="Code postal"
                {...register('postal_code')}
                error={errors.postal_code?.message}
                placeholder="Ex: 75011"
              />
            </div>
            
            <div>
              <Input
                label="Rayon (km)"
                type="number"
                step="0.1"
                min="0.5"
                max="50"
                {...register('radius_km')}
                error={errors.radius_km?.message}
              />
            </div>
          </div>
          
          <div className="mt-4">
            <TextArea
              label="Description"
              {...register('description')}
              error={errors.description?.message}
              placeholder="Décrivez votre communauté..."
              rows={3}
            />
          </div>
        </Card>

        {/* Coordonnées */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Coordonnées géographiques
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Latitude"
                type="number"
                step="any"
                {...register('center_latitude')}
                error={errors.center_latitude?.message}
                placeholder="Ex: 48.8566"
              />
            </div>
            
            <div>
              <Input
                label="Longitude"
                type="number"
                step="any"
                {...register('center_longitude')}
                error={errors.center_longitude?.message}
                placeholder="Ex: 2.3522"
              />
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-2">
            Les coordonnées sont automatiquement remplies lors de la géolocalisation ou de la suggestion de quartier.
          </p>
        </Card>

        {/* Boutons d'action */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(-1)}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {isSubmitting ? 'Création...' : 'Créer la communauté'}
          </Button>
        </div>
      </motion.form>

      {/* Modal de suggestion de quartiers */}
      <NeighborhoodSelectionModal
        isOpen={isNeighborhoodModalOpen}
        onClose={() => setIsNeighborhoodModalOpen(false)}
        onSelectNeighborhood={handleSelectNeighborhood}
        onSuggestionsFound={handleSuggestionsFound}
        existingCommunities={[]}
        searchInput={detectedAddress}
      />
    </div>
  );
};

export default CreateCommunityPage;
