import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import AIImageUpload from '../AIImageUpload';
import type { AIAnalysisResult } from '../../services/aiService';

interface Step1PhotosProps {
  selectedImages: File[];
  imagePreviews: string[];
  imagesError: string | null;
  onImagesChange: (images: File[], previews: string[]) => void;
  onAIAnalysisResult: (analysis: AIAnalysisResult) => void;
  onApplyAIResults: (analysis: AIAnalysisResult) => void;
}

const Step1Photos: React.FC<Step1PhotosProps> = ({
  selectedImages,
  imagePreviews,
  imagesError,
  onImagesChange,
  onAIAnalysisResult,
  onApplyAIResults,
}) => {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Ajoutez vos photos 
        </h2>
        <p className="text-gray-600">
          Notre IA analysera vos photos pour pré-remplir automatiquement les informations de l'objet
        </p>
      </div>
      
      <AIImageUpload
        images={selectedImages}
        imagePreviews={imagePreviews}
        onImagesChange={onImagesChange}
        onAIAnalysisResult={onAIAnalysisResult}
        onApplyAIResults={onApplyAIResults}
        maxImages={8}
        error={imagesError}
      />
    </div>
  );
};

export default Step1Photos;
