import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Sparkles, 
  CheckCircle, 
  AlertCircle,
  Lightbulb,
  TrendingUp
} from 'lucide-react';
import { analyzeTextForCategory, generateCategoryKeywords } from '../services/categoryDetection';
import { getCategoryLabel, getCategoryIcon } from '../utils/categories';
import type { ItemCategory } from '../types';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Card from './ui/Card';

interface SmartCategorySelectorProps {
  value: ItemCategory;
  onChange: (category: ItemCategory) => void;
  title?: string;
  description?: string;
  className?: string;
  showSuggestions?: boolean;
}

const SmartCategorySelector: React.FC<SmartCategorySelectorProps> = ({
  value,
  onChange,
  title = '',
  description = '',
  className = '',
  showSuggestions = true
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const categories: ItemCategory[] = [
    'tools', 'electronics', 'books', 'sports', 
    'kitchen', 'garden', 'toys', 'fashion', 'furniture', 
    'music', 'baby', 'art', 'beauty', 'auto', 'office', 
    'services', 'other'
  ];

  // Analyser le texte pour suggérer une catégorie
  useEffect(() => {
    if (title || description) {
      setIsAnalyzing(true);
      
      // Simuler un délai d'analyse
      setTimeout(() => {
        try {
          const result = analyzeTextForCategory(title, description);
          setAnalysisResult(result);
        } catch (error) {
          console.error('Erreur analyse catégorie:', error);
        } finally {
          setIsAnalyzing(false);
        }
      }, 500);
    }
  }, [title, description]);

  const handleCategorySelect = (category: ItemCategory) => {
    onChange(category);
    setShowAllCategories(false);
  };

  const getCategoryColor = (category: ItemCategory) => {
    const colors = {
      tools: 'bg-orange-100 text-orange-800 border-orange-200',
      electronics: 'bg-blue-100 text-blue-800 border-blue-200',
      books: 'bg-green-100 text-green-800 border-green-200',
      sports: 'bg-red-100 text-red-800 border-red-200',
      kitchen: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      garden: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      toys: 'bg-pink-100 text-pink-800 border-pink-200',
      fashion: 'bg-purple-100 text-purple-800 border-purple-200',
      furniture: 'bg-amber-100 text-amber-800 border-amber-200',
      music: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      baby: 'bg-rose-100 text-rose-800 border-rose-200',
      art: 'bg-violet-100 text-violet-800 border-violet-200',
      beauty: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
      auto: 'bg-slate-100 text-slate-800 border-slate-200',
      office: 'bg-teal-100 text-teal-800 border-teal-200',
      services: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      other: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[category];
  };

  const displayedCategories = showAllCategories ? categories : categories.slice(0, 6);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Titre avec analyse IA */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Catégorie</h3>
        {isAnalyzing && (
          <div className="flex items-center gap-2 text-sm text-purple-600">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4"
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
            Analyse IA...
          </div>
        )}
      </div>

      {/* Catégorie actuelle */}
      <div className="flex items-center gap-3">
        <div className={`px-4 py-2 rounded-xl border-2 ${getCategoryColor(value)}`}>
          <div className="flex items-center gap-2">
            {React.createElement(getCategoryIcon(value), { className: 'w-5 h-5' })}
            <span className="font-semibold">{getCategoryLabel(value)}</span>
          </div>
        </div>
        
        {analysisResult && (
          <div className="flex items-center gap-2">
            {analysisResult.category === value ? (
              <Badge variant="success" className="px-2 py-1">
                <CheckCircle className="w-3 h-3 mr-1" />
                Confirmé par IA
              </Badge>
            ) : (
              <Badge variant="warning" className="px-2 py-1">
                <AlertCircle className="w-3 h-3 mr-1" />
                Différent de l'IA
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Suggestions IA */}
      {analysisResult && showSuggestions && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <Card className="p-4 bg-gradient-to-r from-purple-50/50 to-blue-50/50 border-purple-200/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Suggestions IA</h4>
                <Badge className="bg-purple-100 text-purple-700">
                  {Math.round(analysisResult.confidence * 100)}% confiance
                </Badge>
              </div>

              {/* Catégorie suggérée */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Catégorie recommandée : <strong>{getCategoryLabel(analysisResult.category)}</strong>
                </p>
                
                {analysisResult.category !== value && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCategorySelect(analysisResult.category)}
                    leftIcon={<TrendingUp size={14} />}
                    className="w-full"
                  >
                    Appliquer la suggestion IA
                  </Button>
                )}
              </div>

              {/* Alternatives */}
              {analysisResult.alternatives.length > 0 && (
                <div className="mt-3 pt-3 border-t border-purple-200/50">
                  <p className="text-xs text-gray-600 mb-2">Autres possibilités :</p>
                  <div className="flex flex-wrap gap-1">
                    {analysisResult.alternatives.slice(0, 3).map((alt: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => handleCategorySelect(alt.category)}
                        className="px-2 py-1 text-xs bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
                        title={alt.reason}
                      >
                        {getCategoryLabel(alt.category)} ({Math.round(alt.confidence * 100)}%)
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions d'amélioration */}
              {analysisResult.suggestions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-purple-200/50">
                  <div className="flex items-center gap-1 mb-2">
                    <Lightbulb className="w-3 h-3 text-amber-600" />
                    <p className="text-xs text-gray-600 font-medium">Suggestions :</p>
                  </div>
                  <ul className="space-y-1">
                    {analysisResult.suggestions.map((suggestion: string, index: number) => (
                      <li key={index} className="text-xs text-gray-600 flex items-start gap-1">
                        <span className="w-1 h-1 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Sélecteur de catégories */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Choisir une catégorie</h4>
          {!showAllCategories && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllCategories(true)}
              className="text-purple-600 hover:text-purple-700"
            >
              Voir toutes ({categories.length})
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {displayedCategories.map((category) => {
            const Icon = getCategoryIcon(category);
            const isSelected = category === value;
            
            return (
              <motion.button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                  isSelected 
                    ? `${getCategoryColor(category)} shadow-lg scale-105` 
                    : 'bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex flex-col items-center gap-2">
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-current' : 'text-gray-600'}`} />
                  <span className={`text-sm font-medium ${isSelected ? 'text-current' : 'text-gray-700'}`}>
                    {getCategoryLabel(category)}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {showAllCategories && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllCategories(false)}
            className="w-full text-gray-600 hover:text-gray-800"
          >
            Voir moins
          </Button>
        )}
      </div>

      {/* Mots-clés suggérés */}
      {value && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-2 font-medium">Mots-clés pour améliorer la détection :</p>
          <div className="flex flex-wrap gap-1">
            {generateCategoryKeywords(value).map((keyword, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-white border border-gray-200 rounded-full text-gray-600"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartCategorySelector;
