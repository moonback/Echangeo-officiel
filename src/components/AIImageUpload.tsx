import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  X, 
  Sparkles, 
  AlertCircle,
  CheckCircle,
  Zap
} from 'lucide-react';
import { useAIAnalysis } from '../hooks/useAIAnalysis';
import type { AIAnalysisResult } from '../services/aiService';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Card from './ui/Card';
import AIAnalysisCard from './AIAnalysisCard';

interface AIImageUploadProps {
  images: File[];
  imagePreviews: string[];
  onImagesChange: (images: File[], previews: string[]) => void;
  onAIAnalysisResult?: (analysis: AIAnalysisResult) => void;
  onApplyAIResults?: (analysis: AIAnalysisResult) => void;
  maxImages?: number;
  className?: string;
  error?: string | null;
}

const AIImageUpload: React.FC<AIImageUploadProps> = ({
  images,
  imagePreviews,
  onImagesChange,
  onAIAnalysisResult,
  onApplyAIResults,
  maxImages = 8,
  className = '',
  error,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [aiEnabled] = useState(true);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  
  const {
    isAnalyzing,
    result: aiResult,
    error: aiError,
    suggestions,
    analyzeImage,
    reset: resetAI,
    clearError,
  } = useAIAnalysis();

  const validateFile = useCallback((file: File): string | null => {
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Format non supporté. Utilisez JPG, PNG, WebP ou GIF.';
    }

    if (file.size > MAX_SIZE) {
      return 'Image trop volumineuse (5 Mo maximum).';
    }

    return null;
  }, []);

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        console.warn(`Fichier rejeté: ${file.name} - ${validationError}`);
        continue;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    if (validFiles.length === 0) return;

    // Limiter le nombre total d'images
    const totalImages = images.length + validFiles.length;
    if (totalImages > maxImages) {
      const allowedCount = maxImages - images.length;
      validFiles.splice(allowedCount);
      newPreviews.splice(allowedCount);
    }

    const updatedImages = [...images, ...validFiles];
    const updatedPreviews = [...imagePreviews, ...newPreviews];

    onImagesChange(updatedImages, updatedPreviews);

    // Analyser automatiquement la première image si l'IA est activée
    if (aiEnabled && !hasAnalyzed && validFiles.length > 0) {
      try {
        const analysis = await analyzeImage(validFiles[0]);
        setHasAnalyzed(true);
        if (onAIAnalysisResult) {
          onAIAnalysisResult(analysis);
        }
      } catch (error) {
        console.error('Erreur analyse IA:', error);
      }
    }
  }, [images, imagePreviews, onImagesChange, maxImages, validateFile, aiEnabled, hasAnalyzed, analyzeImage, onAIAnalysisResult]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const removeImage = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    // Nettoyer l'URL de prévisualisation
    URL.revokeObjectURL(imagePreviews[index]);
    
    onImagesChange(newImages, newPreviews);
  }, [images, imagePreviews, onImagesChange]);

  const setPrimaryImage = useCallback((index: number) => {
    if (index === 0) return;
    
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    
    const [img] = newImages.splice(index, 1);
    const [preview] = newPreviews.splice(index, 1);
    
    newImages.unshift(img);
    newPreviews.unshift(preview);
    
    onImagesChange(newImages, newPreviews);
  }, [images, imagePreviews, onImagesChange]);

  const retryAnalysis = useCallback(async () => {
    if (images.length > 0) {
      clearError();
      resetAI();
      try {
        const analysis = await analyzeImage(images[0]);
        setHasAnalyzed(true);
        if (onAIAnalysisResult) {
          onAIAnalysisResult(analysis);
        }
      } catch (error) {
        console.error('Erreur lors de la réanalyse:', error);
      }
    }
  }, [images, analyzeImage, onAIAnalysisResult, clearError, resetAI]);

  const applyAIResults = useCallback((analysis: AIAnalysisResult) => {
    if (onApplyAIResults) {
      onApplyAIResults(analysis);
    }
  }, [onApplyAIResults]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* En-tête avec toggle IA */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Photos de l'objet</h3>
          <span className="text-sm text-gray-500">
            {images.length}/{maxImages}
          </span>
        </div>
        
        {/* <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={aiEnabled}
              onChange={(e) => setAiEnabled(e.target.checked)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="flex items-center gap-1 text-gray-700">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Analyse IA
            </span>
          </label>
        </div> */}
      </div>

      {/* Zone d'upload */}
      <Card className="p-0 overflow-hidden w-full">
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
          {/* Images existantes */}
          {imagePreviews.map((preview, index) => (
            <motion.div
              key={`${preview}-${index}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="relative aspect-square group"
            >
              <img
                src={preview}
                alt={`Aperçu ${index + 1}`}
                className="w-full h-full object-cover rounded-xl border border-gray-200 group-hover:scale-105 transition-transform duration-200"
              />
              
              {/* Badge principale */}
              {index === 0 && (
                <div className="absolute top-2 left-2">
                  <Badge variant="success" size="sm" className="shadow-lg">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Principale
                  </Badge>
                </div>
              )}

              {/* Badge IA pour la première image */}
              {index === 0 && aiEnabled && hasAnalyzed && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200 shadow-lg" size="sm">
                    <Sparkles className="w-3 h-3 mr-1" />
                    IA
                  </Badge>
                </div>
              )}
              
              {/* Actions */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 rounded-xl">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                    aria-label="Supprimer l'image"
                  >
                    <X size={14} />
                  </button>
                </div>
                
                {index !== 0 && (
                  <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(index)}
                      className="px-2 py-1 bg-white/90 hover:bg-white text-gray-700 rounded-lg text-xs font-medium shadow-lg transition-colors"
                    >
                      Définir principale
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Zone d'upload */}
          {images.length < maxImages && (
            <motion.label
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 w-full ${
                dragActive
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="text-center p-4">
                {aiEnabled && images.length === 0 ? (
                  <div className="space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">Analyse IA activée</p>
                    <p className="text-xs text-gray-600">Upload pour une analyse automatique</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                    <p className="text-sm font-medium text-gray-700">
                      {dragActive ? 'Déposez vos images' : 'Glisser-déposer ou cliquer'}
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, WebP, GIF</p>
                  </div>
                )}
              </div>
              
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </motion.label>
          )}
        </div>

        {/* Erreur d'upload */}
        {error && (
          <div className="mx-4 mb-4">
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Résultats de l'analyse IA */}
      <AnimatePresence>
        {(isAnalyzing || aiResult || aiError) && (
          <AIAnalysisCard
            analysis={aiResult}
            isAnalyzing={isAnalyzing}
            error={aiError}
            suggestions={suggestions}
            onRetry={retryAnalysis}
            onApply={applyAIResults}
            onDismiss={resetAI}
          />
        )}
      </AnimatePresence>

      

      {/* Bouton d'analyse manuelle */}
      {!isAnalyzing && !aiResult && images.length > 0 && aiEnabled && !hasAnalyzed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <Button
            onClick={() => {
              if (images.length > 0) {
                analyzeImage(images[0]).then((analysis) => {
                  setHasAnalyzed(true);
                  if (onAIAnalysisResult) {
                    onAIAnalysisResult(analysis);
                  }
                }).catch(console.error);
              }
            }}
            leftIcon={<Zap size={16} />}
            variant="secondary"
            className="shadow-lg"
          >
            Analyser avec l'IA
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default AIImageUpload;
