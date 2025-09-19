import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import Button from '../ui/Button';

interface NavigationProps {
  currentStep: number;
  totalSteps: number;
  isSubmitting: boolean;
  uploadProgress: { current: number; total: number; fileName?: string } | null;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onCancel: () => void;
}

const Navigation: React.FC<NavigationProps> = ({
  currentStep,
  totalSteps,
  isSubmitting,
  uploadProgress,
  onPrevious,
  onNext,
  onSubmit,
  onCancel,
}) => {
  const isLastStep = currentStep === totalSteps;
  const isFirstStep = currentStep === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3 sm:flex-row sm:space-x-4"
    >
      {/* Bouton Précédent/Annuler */}
      {isFirstStep ? (
        <Button 
          type="button" 
          variant="ghost" 
          onClick={onCancel} 
          className="flex-1 border border-gray-300 flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Annuler
        </Button>
      ) : (
        <Button 
          type="button" 
          variant="ghost" 
          onClick={onPrevious} 
          className="flex-1 border border-gray-300 flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Précédent
        </Button>
      )}

      {/* Bouton Suivant/Créer */}
      {isLastStep ? (
        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="flex-1 disabled:opacity-50 flex items-center justify-center gap-2"
          onClick={onSubmit}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Création...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Créer l'objet
            </>
          )}
        </Button>
      ) : (
        <Button 
          type="button" 
          onClick={onNext} 
          className="flex-1 flex items-center justify-center gap-2"
        >
          Suivant ({currentStep}/{totalSteps})
          <ArrowRight className="w-4 h-4" />
        </Button>
      )}

      {/* Indicateur de progression d'upload */}
      {uploadProgress && isLastStep && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-gray-600 flex items-center gap-2"
        >
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Upload {uploadProgress.current}/{uploadProgress.total} 
          {uploadProgress.fileName && `— ${uploadProgress.fileName}`}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Navigation;
