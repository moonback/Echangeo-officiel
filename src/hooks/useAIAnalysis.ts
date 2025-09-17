import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { analyzeImageWithAI, generateImprovementSuggestions, type AIAnalysisResult } from '../services/aiService';

export interface AIAnalysisState {
  isAnalyzing: boolean;
  result: AIAnalysisResult | null;
  error: string | null;
  suggestions: string[];
}

/**
 * Hook pour gérer l'analyse IA d'images d'objets
 */
export const useAIAnalysis = () => {
  const [state, setState] = useState<AIAnalysisState>({
    isAnalyzing: false,
    result: null,
    error: null,
    suggestions: [],
  });

  const analyzeImage = useMutation({
    mutationFn: async (file: File) => {
      setState(prev => ({ ...prev, isAnalyzing: true, error: null }));
      
      try {
        const result = await analyzeImageWithAI(file);
        const suggestions = generateImprovementSuggestions(result);
        
        setState(prev => ({
          ...prev,
          isAnalyzing: false,
          result,
          suggestions,
          error: null,
        }));
        
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'analyse';
        setState(prev => ({
          ...prev,
          isAnalyzing: false,
          error: errorMessage,
          result: null,
          suggestions: [],
        }));
        throw error;
      }
    },
  });

  const reset = useCallback(() => {
    setState({
      isAnalyzing: false,
      result: null,
      error: null,
      suggestions: [],
    });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    analyzeImage: analyzeImage.mutateAsync,
    reset,
    clearError,
    isLoading: analyzeImage.isPending || state.isAnalyzing,
  };
};

/**
 * Hook pour les suggestions d'amélioration basées sur l'IA
 */
export const useAISuggestions = () => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const generateSuggestions = useCallback((analysis: AIAnalysisResult) => {
    const newSuggestions = generateImprovementSuggestions(analysis);
    setSuggestions(newSuggestions);
    return newSuggestions;
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  return {
    suggestions,
    generateSuggestions,
    clearSuggestions,
  };
};

/**
 * Hook pour la validation des données IA
 */
export const useAIValidation = () => {
  const validateAnalysis = useCallback((analysis: AIAnalysisResult): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validation des champs obligatoires
    if (!analysis.title || analysis.title.length < 3) {
      errors.push('Le titre généré est trop court');
    }

    if (!analysis.category) {
      errors.push('Catégorie non détectée');
    }

    if (!analysis.condition) {
      errors.push('État non détecté');
    }

    // Avertissements pour les champs optionnels
    if (analysis.confidence < 0.6) {
      warnings.push('Confiance faible dans l\'analyse - vérifiez les informations');
    }

    if (!analysis.brand && analysis.category !== 'books') {
      warnings.push('Marque non détectée - ajoutez-la manuellement si possible');
    }

    if (!analysis.estimated_value) {
      warnings.push('Valeur non estimée - ajoutez une estimation pour faciliter les échanges');
    }

    if (analysis.tags.length < 2) {
      warnings.push('Peu de mots-clés détectés - ajoutez-en pour améliorer la visibilité');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }, []);

  return { validateAnalysis };
};
