import { useState, useCallback } from 'react';
import { useNearbyCommunities, useCreateCommunity } from './useCommunities';
import { supabase } from '../services/supabase';
import type { NeighborhoodSuggestion } from '../types';

interface UseCommunitySearchReturn {
  nearbyCommunities: any[] | undefined;
  communitiesLoading: boolean;
  isSearchingNeighborhoods: boolean;
  selectedNeighborhood: NeighborhoodSuggestion | null;
  allSuggestions: NeighborhoodSuggestion[];
  createdCommunityId: string;
  searchNeighborhoodsFromLocation: (lat: number, lng: number) => Promise<void>;
  handleSelectNeighborhood: (neighborhood: NeighborhoodSuggestion) => Promise<void>;
  handleSuggestionsFound: (suggestions: NeighborhoodSuggestion[]) => void;
  createAllSuggestedCommunities: (suggestions: NeighborhoodSuggestion[], selectedNeighborhood: NeighborhoodSuggestion) => Promise<void>;
}

export const useCommunitySearch = (
  userLocation: { lat: number; lng: number } | null,
  getAddressFromCoordinates: (lat: number, lng: number) => Promise<string | null>
): UseCommunitySearchReturn => {
  const [isSearchingNeighborhoods, setIsSearchingNeighborhoods] = useState(false);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<NeighborhoodSuggestion | null>(null);
  const [allSuggestions, setAllSuggestions] = useState<NeighborhoodSuggestion[]>([]);
  const [createdCommunityId, setCreatedCommunityId] = useState<string>('');

  const createCommunity = useCreateCommunity();
  
  // Récupérer les quartiers proches si la position est disponible
  const { data: nearbyCommunities, isLoading: communitiesLoading } = useNearbyCommunities(
    userLocation?.lat || 0,
    userLocation?.lng || 0,
    10 // 10km de rayon
  );

  const searchNeighborhoodsFromLocation = useCallback(async (lat: number, lng: number) => {
    setIsSearchingNeighborhoods(true);
    try {
      // Obtenir l'adresse à partir des coordonnées
      const address = await getAddressFromCoordinates(lat, lng);
      
      if (address) {
        console.log('Adresse détectée:', address);
        
        // Rechercher des quartiers basés sur cette adresse via l'IA
        const { suggestNeighborhoods } = await import('../services/neighborhoodSuggestionAI');
        // Utiliser une liste vide pour forcer la génération de nouveaux quartiers
        const suggestions = await suggestNeighborhoods(address, []);
        
        if (suggestions.length > 0) {
          // Stocker toutes les suggestions pour création ultérieure
          setAllSuggestions(suggestions);
          
          // Prendre la première suggestion (la plus pertinente)
          const bestSuggestion = suggestions[0];
          handleSelectNeighborhood(bestSuggestion);
          
          console.log('Quartier généré automatiquement par IA:', bestSuggestion.name);
        } else {
          console.log('Aucun quartier généré par l\'IA pour cette adresse');
        }
      } else {
        console.log('Impossible de détecter l\'adresse');
      }
    } catch (error) {
      console.error('Erreur lors de la recherche automatique de quartiers:', error);
    } finally {
      setIsSearchingNeighborhoods(false);
    }
  }, [getAddressFromCoordinates]);

  const createAllSuggestedCommunities = useCallback(async (suggestions: NeighborhoodSuggestion[], selectedNeighborhood: NeighborhoodSuggestion) => {
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
            radius_km: 2, // Rayon par défaut de 2km
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
  }, [createCommunity]);

  const handleSuggestionsFound = useCallback((suggestions: NeighborhoodSuggestion[]) => {
    setAllSuggestions(suggestions);
    console.log(`📋 ${suggestions.length} suggestions stockées pour création en masse`);
  }, []);

  const handleSelectNeighborhood = useCallback(async (neighborhood: NeighborhoodSuggestion) => {
    setSelectedNeighborhood(neighborhood);
    
    // Mettre à jour les coordonnées si disponibles
    if (neighborhood.coordinates) {
      // Les coordonnées seront mises à jour par le composant parent
    }

    // Créer toutes les communautés suggérées
    if (allSuggestions.length > 0) {
      await createAllSuggestedCommunities(allSuggestions, neighborhood);
    }
  }, [allSuggestions, createAllSuggestedCommunities]);

  return {
    nearbyCommunities,
    communitiesLoading,
    isSearchingNeighborhoods,
    selectedNeighborhood,
    allSuggestions,
    createdCommunityId,
    searchNeighborhoodsFromLocation,
    handleSelectNeighborhood,
    handleSuggestionsFound,
    createAllSuggestedCommunities,
  };
};
