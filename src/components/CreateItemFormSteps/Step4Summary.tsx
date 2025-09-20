import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Sparkles, MapPin, Users } from 'lucide-react';
import { UseFormWatch } from 'react-hook-form';
import Card from '../ui/Card';
import type { CreateItemForm } from '../../pages/CreateItemPage';
import { categories } from '../../utils/categories';

const conditions = [
  { value: 'excellent' as const, label: 'Excellent' },
  { value: 'good' as const, label: 'Bon' },
  { value: 'fair' as const, label: 'Correct' },
  { value: 'poor' as const, label: 'Usé' },
];

interface Step4SummaryProps {
  watch: UseFormWatch<CreateItemForm>;
  selectedImages: File[];
  imagePreviews: string[];
  aiAnalysisApplied: boolean;
  selectedCommunity: string;
  userCommunities: any[];
  signupCommunity?: any;
}

const Step4Summary: React.FC<Step4SummaryProps> = ({
  watch,
  selectedImages,
  imagePreviews,
  aiAnalysisApplied,
  selectedCommunity,
  userCommunities,
  signupCommunity,
}) => {
  const formData = watch();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-6 glass-strong">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Récapitulatif de votre annonce
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Aperçu des photos */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Photos ({selectedImages.length})</h4>
            {selectedImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {imagePreviews.slice(0, 6).map((preview, index) => (
                  <motion.img
                    key={index}
                    src={preview}
                    alt={`Aperçu ${index + 1}`}
                    className="aspect-square object-cover rounded-lg border border-gray-200"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  />
                ))}
                {selectedImages.length > 6 && (
                  <div className="aspect-square bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-sm text-gray-600">
                    +{selectedImages.length - 6}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Aucune photo ajoutée</p>
            )}
          </div>
          
          {/* Informations principales */}
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-900">Titre</h4>
              <p className="text-sm text-gray-700">{formData.title || 'Non renseigné'}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Catégorie</h4>
              <p className="text-sm text-gray-700">
                {formData.category ? categories.find(c => c.value === formData.category)?.label : 'Non renseignée'}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">État</h4>
              <p className="text-sm text-gray-700 capitalize">
                {formData.condition ? conditions.find(c => c.value === formData.condition)?.label : 'Non renseigné'}
              </p>
            </div>
            {formData.estimated_value && (
              <div>
                <h4 className="font-medium text-gray-900">Valeur estimée</h4>
                <p className="text-sm text-gray-700">
                  {Number(formData.estimated_value).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
              </div>
            )}
            {selectedCommunity && (
              <div>
                <h4 className="font-medium text-gray-900">Quartier</h4>
                <p className="text-sm text-gray-700">
                  {userCommunities?.find(c => c.id === selectedCommunity)?.name ||
                   'Quartier sélectionné'}
                </p>
                {signupCommunity && selectedCommunity === signupCommunity.id && (
                  <div className="mt-1">
                    <p className="text-xs text-blue-600 font-medium">
                      🏠 Quartier d'inscription
                    </p>
                  </div>
                )}
                {userCommunities?.find(c => c.id === selectedCommunity) && (
                  <div className="mt-1">
                    <p className="text-xs text-green-600 font-medium">
                      ✅ Quartier où vous êtes membre
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {aiAnalysisApplied && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-purple-800 font-medium">
                Cette annonce a été enrichie par l'analyse IA
              </span>
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

export default Step4Summary;
