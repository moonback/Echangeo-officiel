import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wand2, 
  X, 
  Brain,
  Heart,
  Meh,
  Frown
} from 'lucide-react';
import { useChatAnalysis, useMessageImprovement } from '../hooks/useChatAI';
import type { Message } from '../types';
import Button from './ui/Button';
import Card from './ui/Card';

interface ChatAIAssistantProps {
  messages: Message[];
  onSuggestionSelect?: (suggestion: string) => void; // Optionnel maintenant
  context?: {
    itemTitle?: string;
    itemCategory?: string;
    requestType?: 'loan' | 'trade';
    userRelation?: 'owner' | 'requester';
  };
  currentMessage?: string;
  onMessageImprove?: (improvedMessage: string) => void;
  className?: string;
}

const SentimentIcon: React.FC<{ sentiment: 'positive' | 'neutral' | 'negative' }> = ({ sentiment }) => {
  switch (sentiment) {
    case 'positive':
      return <Heart className="w-4 h-4 text-green-600" />;
    case 'negative':
      return <Frown className="w-4 h-4 text-red-600" />;
    default:
      return <Meh className="w-4 h-4 text-gray-600" />;
  }
};

const ChatAIAssistant: React.FC<ChatAIAssistantProps> = ({
  messages,
  context,
  currentMessage = '',
  onMessageImprove,
  className = '',
}) => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  // Suggestions IA désactivées - garder seulement l'analyse et l'amélioration
  
  const { 
    analysis, 
    isAnalyzing, 
    analyzeConversation
  } = useChatAnalysis();
  
  const { 
    improveMessage, 
    isImproving 
  } = useMessageImprovement();

  // Fonction de génération de suggestions désactivée

  const handleAnalyzeConversation = async () => {
    try {
      await analyzeConversation(messages);
      setShowAnalysis(true);
    } catch (error) {
      console.error('Erreur analyse conversation:', error);
    }
  };

  const handleImproveMessage = async () => {
    if (!currentMessage.trim() || !onMessageImprove) return;
    
    try {
      const improved = await improveMessage({
        message: currentMessage,
        context: context?.itemTitle,
      });
      onMessageImprove(improved);
    } catch (error) {
      console.error('Erreur amélioration message:', error);
    }
  };

  // Fonctions de suggestions désactivées

  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    return null; // Ne pas afficher si pas d'API configurée
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Boutons d'action principaux - Suggestions IA retirées */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAnalyzeConversation}
          disabled={isAnalyzing || messages.length === 0}
          leftIcon={<Brain size={14} />}
          className="border border-blue-200 text-blue-700 hover:bg-blue-50"
        >
          {isAnalyzing ? 'Analyse...' : 'Analyser'}
        </Button>

        {currentMessage.trim() && onMessageImprove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleImproveMessage}
            disabled={isImproving}
            leftIcon={<Wand2 size={14} />}
            className="border border-amber-200 text-amber-700 hover:bg-amber-50"
          >
            {isImproving ? 'Amélioration...' : 'Améliorer'}
          </Button>
        )}
      </div>

      {/* Analyse de sentiment */}
      <AnimatePresence>
        {analysis && showAnalysis && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-blue-200/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">Analyse de conversation</span>
                </div>
                <button
                  onClick={() => setShowAnalysis(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <SentimentIcon sentiment={analysis.sentiment} />
                  <span className="capitalize">{analysis.sentiment}</span>
                </div>
                <div className="text-gray-600">
                  Ton: <span className="capitalize">{analysis.tone}</span>
                </div>
              </div>
              
              {analysis.summary && (
                <p className="text-sm text-gray-700 mt-2 italic">"{analysis.summary}"</p>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section des suggestions IA retirée */}
    </div>
  );
};

export default ChatAIAssistant;
