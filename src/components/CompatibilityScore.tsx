import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  MapPin, 
  Shield, 
  MessageCircle, 
  Heart,
  TrendingUp,
  Info,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { calculateCompatibility, type CompatibilityScore } from '../services/compatibilityAI';
import type { Profile, Item, Request } from '../types';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Card from './ui/Card';

interface CompatibilityScoreProps {
  requesterProfile: Profile;
  ownerProfile: Profile;
  item: Item;
  requestHistory?: Request[];
  className?: string;
}

const ScoreBar: React.FC<{ score: number; label: string; icon: React.ReactNode }> = ({ 
  score, 
  label, 
  icon 
}) => {
  const getColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-gray-700">{label}</span>
        </div>
        <span className="font-semibold text-gray-900">{score}/100</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-2 rounded-full ${getColor(score)}`}
        />
      </div>
    </div>
  );
};

const CompatibilityScoreComponent: React.FC<CompatibilityScoreProps> = ({
  requesterProfile,
  ownerProfile,
  item,
  requestHistory,
  className = '',
}) => {
  const [compatibility, setCompatibility] = useState<CompatibilityScore | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (import.meta.env.VITE_GEMINI_API_KEY) {
      loadCompatibility();
    }
  }, [requesterProfile.id, ownerProfile.id, item.id]);

  const loadCompatibility = async () => {
    setIsLoading(true);
    try {
      const score = await calculateCompatibility(
        requesterProfile,
        ownerProfile,
        item,
        requestHistory
      );
      setCompatibility(score);
    } catch (error) {
      console.error('Erreur calcul compatibilité:', error);
    }
    setIsLoading(false);
  };

  const getOverallColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100 border-green-200';
    if (score >= 60) return 'text-amber-600 bg-amber-100 border-amber-200';
    return 'text-red-600 bg-red-100 border-red-200';
  };

  const getRecommendationIcon = (score: number) => {
    if (score >= 80) return '✅';
    if (score >= 60) return '⚠️';
    return '❌';
  };

  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    return null;
  }

  return (
    <div className={className}>
      <AnimatePresence>
        {(isLoading || compatibility) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="overflow-hidden glass-strong">
              <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 p-4 border-b border-gray-200/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        Score de Compatibilité IA
                        {compatibility && (
                          <Badge className={getOverallColor(compatibility.overall)}>
                            {compatibility.overall}/100
                          </Badge>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Analyse de compatibilité pour cet échange
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              <div className="p-4">
                {isLoading && (
                  <div className="flex items-center justify-center py-6">
                    <div className="text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"
                      />
                      <p className="text-sm text-gray-600">Calcul de compatibilité...</p>
                    </div>
                  </div>
                )}

                {compatibility && (
                  <div className="space-y-4">
                    {/* Score global */}
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-bold ${getOverallColor(compatibility.overall)}`}
                      >
                        <span>{getRecommendationIcon(compatibility.overall)}</span>
                        <span>{compatibility.overall}/100</span>
                      </motion.div>
                    </div>

                    {/* Recommandations principales */}
                    {compatibility.recommendations.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-3">
                        <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
                          <Sparkles className="w-4 h-4 text-purple-600" />
                          Recommandations IA
                        </h4>
                        <ul className="space-y-1">
                          {compatibility.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                              <span className="w-1 h-1 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Détails des facteurs */}
                    <AnimatePresence>
                      {showDetails && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ScoreBar
                              score={compatibility.factors.proximity}
                              label="Proximité"
                              icon={<MapPin className="w-4 h-4 text-blue-600" />}
                            />
                            <ScoreBar
                              score={compatibility.factors.reliability}
                              label="Fiabilité"
                              icon={<Shield className="w-4 h-4 text-green-600" />}
                            />
                            <ScoreBar
                              score={compatibility.factors.communication}
                              label="Communication"
                              icon={<MessageCircle className="w-4 h-4 text-purple-600" />}
                            />
                            <ScoreBar
                              score={compatibility.factors.interests}
                              label="Affinités"
                              icon={<Heart className="w-4 h-4 text-pink-600" />}
                            />
                          </div>

                          {/* Raisonnement détaillé */}
                          {compatibility.reasoning.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
                                <Info className="w-4 h-4 text-blue-600" />
                                Analyse détaillée
                              </h4>
                              <ul className="space-y-1">
                                {compatibility.reasoning.map((reason, index) => (
                                  <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                                    <span className="w-1 h-1 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                                    {reason}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Action */}
                    <div className="flex justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={loadCompatibility}
                        disabled={isLoading}
                        leftIcon={<TrendingUp size={14} />}
                        className="border border-gray-300"
                      >
                        Recalculer
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompatibilityScoreComponent;
