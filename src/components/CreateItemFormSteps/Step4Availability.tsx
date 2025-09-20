import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users } from 'lucide-react';
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
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
  selectedCommunity: string;
  setSelectedCommunity: (id: string) => void;
  signupCommunity?: Community | null;
}

const CommunityCard: React.FC<{
  community: Community;
  isSelected: boolean;
  onSelect: (id: string) => void;
  type: 'user' | 'nearby';
  isSignupCommunity?: boolean;
}> = ({ community, isSelected, onSelect, type, isSignupCommunity = false }) => {
  const isUserCommunity = type === 'user';
  
  return (
    <motion.label
      whileHover={{ scale: 1.02 }}
      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
        isSelected
          ? isUserCommunity 
            ? 'border-green-500 bg-green-50' 
            : 'border-blue-500 bg-blue-50'
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
          {isSignupCommunity && (
            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
              🏠 Quartier d'inscription
            </span>
          )}
          {isUserCommunity && !isSignupCommunity && (
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
  selectedCommunity,
  setSelectedCommunity,
  signupCommunity,
}) => {
  const offerType = watch('offer_type');

  // Debug pour voir les données reçues
  console.log('🔍 Debug Step4Availability:', {
    userCommunities,
    signupCommunity,
    selectedCommunity,
    userCommunitiesLength: userCommunities?.length
  });

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
              {signupCommunity && selectedCommunity === signupCommunity.id ? (
                <span className="block mt-1 text-green-800 font-medium">
                  🏠 Votre quartier d'inscription est sélectionné par défaut
                </span>
              ) : (
                'Votre objet sera automatiquement visible dans le quartier sélectionné.'
              )}
            </p>
            
            <div className="space-y-2">
              {userCommunities.map((community) => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  isSelected={selectedCommunity === community.id}
                  onSelect={setSelectedCommunity}
                  type="user"
                  isSignupCommunity={signupCommunity?.id === community.id}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Message informatif si aucun quartier */}
      {(!userCommunities || userCommunities.length === 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border border-blue-200 bg-blue-50 glass mb-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-blue-600" />
            <label className="block text-sm font-medium text-blue-800">
              Information
            </label>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-blue-700 mb-3">
              Vous n'êtes membre d'aucun quartier pour le moment. 
              Votre objet sera visible par tous les utilisateurs de la plateforme.
            </p>
            <p className="text-xs text-blue-600">
              💡 Vous pouvez rejoindre des quartiers depuis votre profil pour une meilleure visibilité locale.
            </p>
          </div>
        </motion.div>
      )}

      {/* Confirmation de sélection */}
      {selectedCommunity && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200"
        >
          <p className="text-sm text-green-800">
            ✅ Quartier sélectionné : {
              userCommunities?.find(c => c.id === selectedCommunity)?.name ||
              'Quartier sélectionné'
            }
          </p>
        </motion.div>
      )}

      {/* Champ caché pour la communauté */}
      <input type="hidden" {...register('community_id')} />
    </>
  );
};

export default Step4Availability;