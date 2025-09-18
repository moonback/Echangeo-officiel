import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  AlertTriangle, 
  RefreshCw, 
  Eye, 
  TrendingUp,
  Tag,
  Zap,
  X
} from 'lucide-react';
import type { AIAnalysisResult } from '../services/aiService';
import { getCategoryLabel } from '../utils/categories';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Card from './ui/Card';

interface AIAnalysisCardProps {
  analysis: AIAnalysisResult | null;
  isAnalyzing: boolean;
  error: string | null;
  suggestions: string[];
  onRetry?: () => void;
  onApply?: (analysis: AIAnalysisResult) => void;
  onDismiss?: () => void;
  className?: string;
}

const ConfidenceIndicator: React.FC<{ confidence: number }> = ({ confidence }) => {
  const getColor = (conf: number) => {
    if (conf >= 0.8) return 'text-emerald-600 bg-emerald-100';
    if (conf >= 0.6) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  const getLabel = (conf: number) => {
    if (conf >= 0.8) return 'Très fiable';
    if (conf >= 0.6) return 'Fiable';
    return 'À vérifier';
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getColor(confidence)}`}>
      <div className="w-2 h-2 rounded-full bg-current opacity-60" />
      <span>{getLabel(confidence)} ({Math.round(confidence * 100)}%)</span>
    </div>
  );
};

const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({
  analysis,
  isAnalyzing,
  error,
  suggestions,
  onRetry,
  onApply,
  onDismiss,
  className = '',
}) => {
  if (!isAnalyzing && !analysis && !error) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={className}
      >
        <Card className="relative overflow-hidden glass-strong">
          {/* Header avec gradient */}
          <div className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-brand-500/10 p-4 border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    Analyse IA
                    {analysis && <ConfidenceIndicator confidence={analysis.confidence} />}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isAnalyzing ? 'Analyse en cours...' : 'Reconnaissance automatique d\'objet'}
                  </p>
                </div>
              </div>
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="Fermer l'analyse"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="p-4">
            {/* État de chargement */}
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center py-8"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"
                  />
                  <p className="text-sm text-gray-600 mb-1">Analyse de l'image en cours...</p>
                  <p className="text-xs text-gray-500">Cela peut prendre quelques secondes</p>
                </div>
              </motion.div>
            )}

            {/* Erreur */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl p-4 ${
                  error.includes('429') || error.includes('Limite de taux')
                    ? 'bg-amber-50 border border-amber-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                    error.includes('429') || error.includes('Limite de taux')
                      ? 'text-amber-600'
                      : 'text-red-600'
                  }`} />
                  <div className="flex-1">
                    <p className={`text-sm font-medium mb-1 ${
                      error.includes('429') || error.includes('Limite de taux')
                        ? 'text-amber-800'
                        : 'text-red-800'
                    }`}>
                      {error.includes('429') || error.includes('Limite de taux')
                        ? 'Limite de taux dépassée'
                        : 'Erreur d\'analyse'
                      }
                    </p>
                    <p className={`text-sm ${
                      error.includes('429') || error.includes('Limite de taux')
                        ? 'text-amber-700'
                        : 'text-red-700'
                    }`}>
                      {error}
                    </p>
                    
                    {/* Message spécifique pour les erreurs 429 */}
                    {(error.includes('429') || error.includes('Limite de taux')) && (
                      <div className="mt-3 p-3 bg-white/50 rounded-lg border border-amber-200">
                        <p className="text-xs text-amber-800 font-medium mb-2">
                          💡 Solutions recommandées :
                        </p>
                        <ul className="text-xs text-amber-700 space-y-1">
                          <li>• Attendez quelques instants avant de réessayer</li>
                          <li>• Vérifiez votre niveau de service sur mistral.ai</li>
                          <li>• Considérez passer à un niveau supérieur si nécessaire</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                {onRetry && (
                  <div className="mt-3 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onRetry}
                      leftIcon={<RefreshCw size={16} />}
                      className={`${
                        error.includes('429') || error.includes('Limite de taux')
                          ? 'text-amber-700 hover:bg-amber-100'
                          : 'text-red-700 hover:bg-red-100'
                      }`}
                    >
                      Réessayer
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Résultats de l'analyse */}
            {analysis && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Informations principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Titre suggéré
                      </label>
                      <p className="font-semibold text-gray-900 mt-1">{analysis.title}</p>
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Catégorie détectée
                      </label>
                      <div className="mt-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="info" className="px-3 py-1">
                            {getCategoryLabel(analysis.category)}
                          </Badge>
                          {analysis.categoryConfidence && (
                            <span className="text-xs text-gray-500">
                              ({Math.round(analysis.categoryConfidence * 100)}% confiance)
                            </span>
                          )}
                        </div>
                        
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        État estimé
                      </label>
                      <div className="mt-1">
                        <Badge 
                          variant={
                            analysis.condition === 'excellent' ? 'success' :
                            analysis.condition === 'good' ? 'info' :
                            analysis.condition === 'fair' ? 'warning' : 'danger'
                          }
                          className="px-3 py-1 capitalize"
                        >
                          {analysis.condition === 'excellent' ? 'Excellent' :
                           analysis.condition === 'good' ? 'Bon' :
                           analysis.condition === 'fair' ? 'Correct' : 'Usé'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {analysis.brand && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Marque détectée
                        </label>
                        <p className="font-medium text-gray-900 mt-1">{analysis.brand}</p>
                      </div>
                    )}

                    {analysis.model && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Modèle détecté
                        </label>
                        <p className="font-medium text-gray-900 mt-1">{analysis.model}</p>
                      </div>
                    )}

                    {analysis.estimated_value && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Valeur estimée
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          <TrendingUp className="w-4 h-4 text-emerald-600" />
                          <p className="font-semibold text-gray-900">
                            {analysis.estimated_value.toLocaleString('fr-FR', { 
                              style: 'currency', 
                              currency: 'EUR' 
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {analysis.description && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Description générée
                    </label>
                    <p className="text-sm text-gray-700 mt-1 leading-relaxed bg-gray-50 rounded-lg p-3">
                      {analysis.description}
                    </p>
                  </div>
                )}

                {/* Tags */}
                {analysis.tags.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Mots-clés suggérés
                    </label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {analysis.tags.map((tag, index) => (
                        <motion.span
                          key={tag}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="px-2.5 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-medium border border-brand-200"
                        >
                          {tag}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions d'amélioration */}
                {(suggestions.length > 0 || analysis.categorySuggestions?.length) && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-4 h-4 text-amber-600" />
                      <h4 className="text-sm font-medium text-amber-800">
                        Suggestions d'amélioration
                      </h4>
                    </div>
                    <ul className="space-y-1">
                      {suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-amber-700 flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                          {suggestion}
                        </li>
                      ))}
                      {analysis.categorySuggestions?.map((suggestion, index) => (
                        <li key={`cat-${index}`} className="text-sm text-amber-700 flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                          <span className="font-medium">Catégorie :</span> {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  {onApply && (
                    <Button
                      onClick={() => onApply(analysis)}
                      leftIcon={<Zap size={16} />}
                      className="flex-1"
                    >
                      Appliquer les suggestions
                    </Button>
                  )}
                  {onRetry && (
                    <Button
                      variant="ghost"
                      onClick={onRetry}
                      leftIcon={<RefreshCw size={16} />}
                      className="border border-gray-300"
                    >
                      Réanalyser
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIAnalysisCard;
