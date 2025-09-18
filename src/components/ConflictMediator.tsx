import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  MessageSquare, 
  Shield, 
  CheckCircle,
  X,
  RefreshCw
} from 'lucide-react';
import { analyzeConflict, generateMediationMessage, type ConflictAnalysis } from '../services/mediationAI';
import type { Message, Request } from '../types';
import Button from './ui/Button';
import Card from './ui/Card';
import Badge from './ui/Badge';

interface ConflictMediatorProps {
  messages: Message[];
  request?: Request;
  onMediationSuggestion?: (message: string) => void;
  className?: string;
}

const ConflictLevelIndicator: React.FC<{ level: ConflictAnalysis['conflictLevel'] }> = ({ level }) => {
  const getColor = () => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getLabel = () => {
    switch (level) {
      case 'high':
        return 'Conflit détecté';
      case 'medium':
        return 'Tension modérée';
      default:
        return 'Communication normale';
    }
  };

  return (
    <Badge className={getColor()}>
      {getLabel()}
    </Badge>
  );
};

const ConflictMediator: React.FC<ConflictMediatorProps> = ({
  messages,
  request,
  onMediationSuggestion,
  className = '',
}) => {
  const [analysis, setAnalysis] = useState<ConflictAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [mediationMessage, setMediationMessage] = useState<string>('');
  const [isGeneratingMediation, setIsGeneratingMediation] = useState(false);

  // Analyser automatiquement quand il y a suffisamment de messages
  useEffect(() => {
    if (messages.length >= 4 && !analysis && import.meta.env.VITE_GEMINI_API_KEY) {
      analyzeMessages();
    }
  }, [messages.length]);

  const analyzeMessages = async () => {
    if (!import.meta.env.VITE_GEMINI_API_KEY) return;
    
    setIsAnalyzing(true);
    try {
      const result = await analyzeConflict(messages, request);
      setAnalysis(result);
    } catch (error) {
      console.error('Erreur analyse conflit:', error);
    }
    setIsAnalyzing(false);
  };

  const generateMediation = async () => {
    if (!analysis || !import.meta.env.VITE_GEMINI_API_KEY) return;
    
    setIsGeneratingMediation(true);
    try {
      const message = await generateMediationMessage(
        analysis,
        request?.item?.title ? `Échange de : ${request.item.title}` : undefined
      );
      setMediationMessage(message);
    } catch (error) {
      console.error('Erreur génération médiation:', error);
    }
    setIsGeneratingMediation(false);
  };

  const applyMediation = () => {
    if (mediationMessage && onMediationSuggestion) {
      onMediationSuggestion(mediationMessage);
      setMediationMessage('');
    }
  };

  // Ne pas afficher si pas de conflit détecté ou pas d'API
  if (!import.meta.env.VITE_GEMINI_API_KEY || 
      (analysis && !analysis.hasConflict && analysis.conflictLevel === 'low')) {
    return null;
  }

  return (
    <AnimatePresence>
      {(isAnalyzing || (analysis && analysis.hasConflict)) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={className}
        >
          <Card className="border-amber-200 bg-gradient-to-r from-amber-50/50 to-orange-50/50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-600" />
                  <span className="font-medium text-gray-900">Médiateur IA</span>
                  {analysis && (
                    <ConflictLevelIndicator level={analysis.conflictLevel} />
                  )}
                </div>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showDetails ? <X size={16} /> : <AlertTriangle size={16} />}
                </button>
              </div>

              {isAnalyzing && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyse de la conversation en cours...
                </div>
              )}

              {analysis && analysis.hasConflict && (
                <div className="space-y-3">
                  <p className="text-sm text-amber-800">
                    J'ai détecté une possible tension dans cette conversation. 
                    Puis-je vous aider à améliorer la communication ?
                  </p>

                  <AnimatePresence>
                    {showDetails && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                      >
                        {analysis.issues.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                              Problèmes détectés :
                            </h4>
                            <ul className="space-y-1">
                              {analysis.issues.map((issue, index) => (
                                <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                  <span className="w-1 h-1 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                                  {issue}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {analysis.suggestions.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                              Suggestions de résolution :
                            </h4>
                            <ul className="space-y-1">
                              {analysis.suggestions.map((suggestion, index) => (
                                <li key={index} className="text-sm text-green-700 flex items-start gap-2">
                                  <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                  {suggestion}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Message de médiation généré */}
                  <AnimatePresence>
                    {mediationMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-white/80 border border-amber-200 rounded-lg p-3"
                      >
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Message de médiation suggéré :
                        </h4>
                        <p className="text-sm text-gray-700 italic mb-3">
                          "{mediationMessage}"
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={applyMediation}
                            leftIcon={<MessageSquare size={14} />}
                          >
                            Utiliser ce message
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setMediationMessage('')}
                            className="border border-gray-300"
                          >
                            Ignorer
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!mediationMessage && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={generateMediation}
                        disabled={isGeneratingMediation}
                        leftIcon={<MessageSquare size={14} />}
                        className="border border-amber-300 text-amber-700 hover:bg-amber-50"
                      >
                        {isGeneratingMediation ? 'Génération...' : 'Suggérer une médiation'}
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={analyzeMessages}
                      disabled={isAnalyzing}
                      leftIcon={<RefreshCw size={14} />}
                      className="border border-gray-300 text-gray-700"
                    >
                      Réanalyser
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConflictMediator;
