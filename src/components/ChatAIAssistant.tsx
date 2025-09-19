import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Wand2, 
  X, 
  Send,
  Brain,
  Heart,
  Meh,
  Frown,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useChatSuggestions, useChatAnalysis, useMessageImprovement } from '../hooks/useChatAI';
import type { Message } from '../types';
import type { ChatAISuggestion } from '../services/chatAI';
import Button from './ui/Button';
import Card from './ui/Card';
import Badge from './ui/Badge';

interface ChatAIAssistantProps {
  messages: Message[];
  onSuggestionSelect: (suggestion: string) => void;
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
  onSuggestionSelect,
  context,
  currentMessage = '',
  onMessageImprove,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  const { 
    suggestions, 
    isLoading: suggestionsLoading, 
    generateSuggestions, 
    clearSuggestions 
  } = useChatSuggestions();
  
  const { 
    analysis, 
    isAnalyzing, 
    analyzeConversation
  } = useChatAnalysis();
  
  const { 
    improveMessage, 
    isImproving 
  } = useMessageImprovement();

  const handleGenerateSuggestions = async () => {
    try {
      await generateSuggestions({ messages, context });
      setIsExpanded(true);
    } catch (error) {
      console.error('Erreur génération suggestions:', error);
    }
  };

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

  const getSuggestionIcon = (type: ChatAISuggestion['type']) => {
    switch (type) {
      case 'question':
        return '❓';
      case 'polite':
        return '🤝';
      case 'practical':
        return '⚡';
      default:
        return '💬';
    }
  };

  const getSuggestionColor = (type: ChatAISuggestion['type']) => {
    switch (type) {
      case 'question':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'polite':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'practical':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    return null; // Ne pas afficher si pas d'API configurée
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Boutons d'action principaux */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGenerateSuggestions}
          disabled={suggestionsLoading || messages.length === 0}
          leftIcon={<Sparkles size={14} />}
          className="border border-purple-200 text-purple-700 hover:bg-purple-50"
        >
          {suggestionsLoading ? 'Génération...' : 'Suggestions IA'}
        </Button>

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

      {/* Suggestions de réponse */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-900">Suggestions de réponse</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button
                    onClick={clearSuggestions}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    {suggestions.map((suggestion, index) => (
                      <motion.button
                        key={suggestion.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => onSuggestionSelect(suggestion.text)}
                        className={`w-full text-left p-3 rounded-xl border transition-all hover:scale-[1.02] hover:shadow-md ${getSuggestionColor(suggestion.type)}`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-lg">{getSuggestionIcon(suggestion.type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{suggestion.text}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge 
                                size="sm" 
                                className="text-xs opacity-75"
                              >
                                {suggestion.type}
                              </Badge>
                              <span className="text-xs opacity-60">
                                {Math.round(suggestion.confidence * 100)}% confiance
                              </span>
                            </div>
                          </div>
                          <Send className="w-4 h-4 opacity-40" />
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {!isExpanded && suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {suggestions.slice(0, 2).map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => onSuggestionSelect(suggestion.text)}
                      className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-200 hover:bg-purple-100 transition-colors"
                    >
                      {getSuggestionIcon(suggestion.type)} {suggestion.text}
                    </button>
                  ))}
                  {suggestions.length > 2 && (
                    <button
                      onClick={() => setIsExpanded(true)}
                      className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-full text-xs font-medium border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      +{suggestions.length - 2} autres
                    </button>
                  )}
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatAIAssistant;
