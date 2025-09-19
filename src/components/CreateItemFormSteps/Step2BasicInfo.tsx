import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { categories } from '../../utils/categories';
import { offerTypes } from '../../utils/offerTypes';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import TextArea from '../ui/TextArea';
import type { CreateItemForm } from '../../pages/CreateItemPage';

const conditions = [
  { value: 'excellent' as const, label: 'Excellent' },
  { value: 'good' as const, label: 'Bon' },
  { value: 'fair' as const, label: 'Correct' },
  { value: 'poor' as const, label: 'Usé' },
];

interface Step2BasicInfoProps {
  register: UseFormRegister<CreateItemForm>;
  errors: FieldErrors<CreateItemForm>;
  watch: UseFormWatch<CreateItemForm>;
  setValue: UseFormSetValue<CreateItemForm>;
  aiAnalysisApplied: boolean;
  selectedImages: File[];
  onStepChange: (step: number) => void;
  onFieldBlur: (fieldName: string) => Promise<void>;
}

const Step2BasicInfo: React.FC<Step2BasicInfoProps> = ({
  register,
  errors,
  watch,
  setValue,
  aiAnalysisApplied,
  selectedImages,
  onStepChange,
  onFieldBlur,
}) => {
  const offerType = watch('offer_type');

  return (
    <>
      {/* Indicateur IA si des données ont été appliquées */}
      {aiAnalysisApplied && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-xl">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-purple-800 font-medium">
              Informations pré-remplies par l'IA - Vous pouvez les modifier
            </span>
          </div>
        </motion.div>
      )}
      
      {/* Message informatif si pas de photos */}
      {selectedImages.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-amber-800">
                Aucune photo ajoutée - Remplissez manuellement les informations
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onStepChange(1)}
              className="text-amber-700 hover:bg-amber-100 border border-amber-300"
            >
              Ajouter des photos
            </Button>
          </div>
        </motion.div>
      )}
      
      {/* Résumé des photos ajoutées */}
      {selectedImages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800">
                {selectedImages.length} photo{selectedImages.length > 1 ? 's' : ''} ajoutée{selectedImages.length > 1 ? 's' : ''}
                {aiAnalysisApplied ? ' - Analysées par IA' : ''}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onStepChange(1)}
              className="text-green-700 hover:bg-green-100 border border-green-300"
            >
              Modifier les photos
            </Button>
          </div>
        </motion.div>
      )}
      
      <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
        <Input 
          label="Titre *" 
          placeholder="Ex: Perceuse électrique Bosch" 
          {...register('title', { onBlur: () => onFieldBlur('title') })} 
          error={errors.title?.message}
          className={aiAnalysisApplied ? 'bg-purple-50/50 border-purple-200' : ''}
        />
        <div className="text-xs text-gray-500 mt-1">{(watch('title')?.length || 0)}/100</div>
      </div>
      
      <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Catégorie *
        </label>
        <Select 
          {...register('category', { onBlur: () => onFieldBlur('category') })} 
          id="category"
          className={aiAnalysisApplied ? 'bg-purple-50/50 border-purple-200' : ''}
        >
          <option value="">Choisissez une catégorie</option>
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </Select>
        {errors.category && (
          <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>
        )}
      </div>
      
      <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
        <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
          État *
        </label>
        <Select 
          {...register('condition', { onBlur: () => onFieldBlur('condition') })} 
          id="condition"
          className={aiAnalysisApplied ? 'bg-purple-50/50 border-purple-200' : ''}
        >
          <option value="">Choisissez l'état</option>
          {conditions.map((condition) => (
            <option key={condition.value} value={condition.value}>
              {condition.label}
            </option>
          ))}
        </Select>
        {errors.condition && (
          <p className="text-red-500 text-xs mt-1">{errors.condition.message}</p>
        )}
      </div>
      
      <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
        <label htmlFor="offer_type" className="block text-sm font-medium text-gray-700 mb-1">
          Type d'offre *
        </label>
        <Select {...register('offer_type', { onBlur: () => onFieldBlur('offer_type') })} id="offer_type">
          <option value="">Choisissez le type d'offre</option>
          {offerTypes.map((offerType) => (
            <option key={offerType.value} value={offerType.value}>
              {offerType.label}
            </option>
          ))}
        </Select>
        <div className="text-xs text-gray-500 mt-1">
          {offerType === 'loan' && 'Prêt temporaire de votre objet'}
          {offerType === 'trade' && 'Échange définitif contre autre chose'}
          {offerType === 'donation' && 'Don gratuit à un voisin'}
        </div>
        {errors.offer_type && (
          <p className="text-red-500 text-xs mt-1">{errors.offer_type.message}</p>
        )}
      </div>
      
      {/* Champ désiré_items avec animation conditionnelle */}
      <motion.div
        initial={false}
        animate={{ 
          opacity: offerType === 'trade' ? 1 : 0,
          height: offerType === 'trade' ? 'auto' : 0,
          marginBottom: offerType === 'trade' ? '1rem' : 0
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        {offerType === 'trade' && (
          <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
            <label htmlFor="desired_items" className="block text-sm font-medium text-gray-700 mb-1">
              Ce que vous recherchez en échange
            </label>
            <TextArea 
              {...register('desired_items')} 
              id="desired_items" 
              rows={3}
              placeholder="Décrivez ce que vous aimeriez recevoir en échange (ex: livre de cuisine, outil de jardinage, service de bricolage...)"
            />
            <div className="text-xs text-gray-500 mt-1">
              {(watch('desired_items')?.length || 0)}/500 caractères
            </div>
            {errors.desired_items && (
              <p className="text-red-500 text-xs mt-1">{errors.desired_items.message}</p>
            )}
          </div>
        )}
      </motion.div>
      
      <div className="p-4 rounded-xl border border-gray-200 bg-white glass">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <TextArea 
          {...register('description')} 
          id="description" 
          rows={4} 
          placeholder="Décrivez votre objet, son état, ses accessoires..."
          className={aiAnalysisApplied ? 'bg-purple-50/50 border-purple-200' : ''}
        />
        <div className="text-xs text-gray-500 mt-1">{(watch('description')?.length ?? 0)} caractères</div>
      </div>
    </>
  );
};

export default Step2BasicInfo;
