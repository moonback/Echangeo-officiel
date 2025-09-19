import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MapPin, Users, Plus } from 'lucide-react';
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import Button from '../ui/Button';
import type { CreateItemForm } from '../../pages/CreateItemPage';

interface Community {
  id: string;
  name: string;
  city: string;
  postal_code?: string;
  member_count?: number;
  distance_km?: number;
}

interface Step4AvailabilityProps {
  register: UseFormRegister<CreateItemForm>;
  errors: FieldErrors<CreateItemForm>;
  watch: UseFormWatch<CreateItemForm>;
  setValue: UseFormSetValue<CreateItemForm>;
  userCommunities: Community[] | undefined;
  nearbyCommunities: Array<{
    community_id: string;
    community_name: string;
    distance_km: number;
    member_count: number;
  }> | undefined;
  selectedCommunity: string;
  setSelectedCommunity: (id: string) => void;
  userLocation: { lat: number; lng: number } | null;
  detectedAddress: string;
  isLocating: boolean;
  isSearchingNeighborhoods: boolean;
  communitiesLoading: boolean;
  onOpenNeighborhoodModal: () => void;
  onGetCurrentLocation: () => void;
}

const CommunityCard: React.FC<{
  community: Community;
  isSelected: boolean;
  onSelect: (id: string) => void;
  type: 'user' | 'nearby';
}> = ({ community, isSelected, onSelect, type }) => {
  const isUserCommunity = type === 'user';
  
  return (
    <motion.label
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
        isSelected 
          ? isUserCommunity 
            ? 'border-green-300 bg-green-50 shadow-sm' 
            : 'border-blue-300 bg-blue-50 shadow-sm'
          : isUserCommunity
            ? 'border-green-200 hover:bg-green-50 hover:border-green-300'
            : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
      }`}
    >
      <input
        type="radio"
        name="community"
        value={community.id}
        checked={isSelected}
        onChange={(e) => onSelect(e.target.value)}
        className={`w-4 h-4 ${
          isUserCommunity 
            ? 'text-green-600 border-green-300 focus:ring-green-500' 
            : 'text-blue-600 border-gray-300 focus:ring-blue-500'
        }`}
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div className={`font-medium ${
            isUserCommunity ? 'text-green-900' : 'text-gray-900'
          }`}>
            {community.name}
          </div>
          {isUserCommunity && (
            <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
              Membre
            </span>
          )}
        </div>
        <div className={`text-sm ${
          isUserCommunity ? 'text-green-600' : 'text-gray-500'
        }`}>
          {community.city} • {community.postal_code || 'N/A'}
          {community.distance_km && ` • ${community.distance_km.toFixed(1)} km`}
          {community.member_count && ` • ${community.member_count} membre${community.member_count > 1 ? 's' : ''}`}
        </div>
      </div>
    </motion.label>
  );
};

const Step4Availability: React.FC<Step4AvailabilityProps> = ({
  register,
  errors,
  watch,
  setValue,
  userCommunities,
  nearbyCommunities,
  selectedCommunity,
  setSelectedCommunity,
  userLocation,
  detectedAddress,
  isLocating,
  isSearchingNeighborhoods,
  communitiesLoading,
  onOpenNeighborhoodModal,
  onGetCurrentLocation,
}) => {
  const offerType = watch('offer_type');

  return (
    <>
      {/* Communautés de l'utilisateur */}
      {userCommunities && userCommunities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border border-green-200 bg-green-50 glass mb-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-green-600" />
            <label className="block text-sm font-medium text-green-800">
              Vos quartiers ({userCommunities.length})
            </label>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-green-700 mb-3">
              Vous êtes membre de {userCommunities.length} quartier{userCommunities.length > 1 ? 's' : ''}. 
              Votre objet sera automatiquement visible dans le quartier sélectionné.
            </p>
            
            <div className="space-y-2">
              {userCommunities.map((community) => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  isSelected={selectedCommunity === community.id}
                  onSelect={setSelectedCommunity}
                  type="user"
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Sélection de quartier */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl border border-gray-200 bg-white glass mb-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gray-600" />
            <label className="block text-sm font-medium text-gray-700">
              Quartier/Communauté
            </label>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onOpenNeighborhoodModal}
              disabled={isLocating}
              className="text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              <Sparkles className="w-4 h-4" />
              {isLocating ? 'Détection…' : 'Suggérer un quartier'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onGetCurrentLocation}
              disabled={isLocating || isSearchingNeighborhoods}
              className="text-blue-600 hover:text-blue-700"
            >
              {isLocating ? 'Localisation…' : isSearchingNeighborhoods ? 'Recherche de quartiers…' : 'Utiliser ma position'}
            </Button>
          </div>
        </div>
        
        {userLocation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
          >
            <p className="text-sm text-blue-800">
              📍 Adresse détectée : {detectedAddress ? detectedAddress : `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`}
            </p>
          </motion.div>
        )}

        {isSearchingNeighborhoods && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-3 p-3 bg-purple-50 rounded-lg border border-purple-200"
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-purple-800">
                ✨ Recherche automatique de quartiers en cours...
              </p>
            </div>
          </motion.div>
        )}

        {isLocating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-3 p-3 bg-purple-50 rounded-lg border border-purple-200"
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-purple-800">
                ✨ Détection de votre position pour suggérer des quartiers...
              </p>
            </div>
          </motion.div>
        )}

        {communitiesLoading ? (
          <div className="flex items-center gap-2 text-gray-600">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Recherche des quartiers proches...</span>
          </div>
        ) : nearbyCommunities && nearbyCommunities.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 mb-2">
              Quartiers trouvés à proximité ({nearbyCommunities.length}) :
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {nearbyCommunities.map((community) => (
                <CommunityCard
                  key={community.community_id}
                  community={{
                    id: community.community_id,
                    name: community.community_name,
                    city: '',
                    distance_km: community.distance_km,
                    member_count: community.member_count,
                  }}
                  isSelected={selectedCommunity === community.community_id}
                  onSelect={setSelectedCommunity}
                  type="nearby"
                />
              ))}
            </div>
          </div>
        ) : userLocation ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 bg-yellow-50 rounded-lg border border-yellow-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <Plus className="w-4 h-4 text-yellow-600" />
              <p className="text-sm text-yellow-800 font-medium">
                Aucun quartier trouvé dans un rayon de 10km
              </p>
            </div>
            <p className="text-sm text-yellow-700">
              Vous pouvez créer votre objet sans quartier spécifique ou créer un nouveau quartier.
            </p>
          </motion.div>
        ) : (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">
              Cliquez sur "Utiliser ma position" pour une sélection automatique, ou "Suggérer un quartier" pour voir plusieurs options basées sur votre adresse.
            </p>
          </div>
        )}

        {selectedCommunity && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200"
          >
            <p className="text-sm text-green-800">
              ✅ Quartier sélectionné : {
                userCommunities?.find(c => c.id === selectedCommunity)?.name ||
                nearbyCommunities?.find(c => c.community_id === selectedCommunity)?.community_name ||
                'Quartier sélectionné'
              }
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Champ caché pour la communauté */}
      <input type="hidden" {...register('community_id')} />
    </>
  );
};

export default Step4Availability;
