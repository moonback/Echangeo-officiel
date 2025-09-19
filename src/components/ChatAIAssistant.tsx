import React from 'react';
import { 
  Wand2
} from 'lucide-react';
import { useMessageImprovement } from '../hooks/useChatAI';
import Button from './ui/Button';

interface ChatAIAssistantProps {
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


const ChatAIAssistant: React.FC<ChatAIAssistantProps> = ({
  context,
  currentMessage = '',
  onMessageImprove,
  className = '',
}) => {
  // Suggestions IA et analyse désactivées - garder seulement l'amélioration
  
  const { 
    improveMessage, 
    isImproving 
  } = useMessageImprovement();

  // Fonction de génération de suggestions désactivée

  // Fonction d'analyse désactivée

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
    <div className={`space-y-4 ${className}`}>

      {/* Boutons d'action modernes */}
      <div className="flex flex-col gap-3">
        {currentMessage.trim() && onMessageImprove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleImproveMessage}
            disabled={isImproving}
            className="group relative overflow-hidden bg-gradient-to-r from-amber-50 to-orange-100 border border-amber-200/50 hover:from-amber-100 hover:to-orange-200 hover:border-amber-300/50 transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-amber-500 rounded-lg group-hover:bg-amber-600 transition-colors">
                <Wand2 className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <div className="font-medium text-amber-700 group-hover:text-amber-800">
                  {isImproving ? 'Amélioration...' : 'Améliorer le message'}
                </div>
                <div className="text-xs text-amber-600/70">
                  Style et clarté
                </div>
              </div>
            </div>
          </Button>
        )}
      </div>

      {/* Section d'analyse retirée */}

      {/* Section des suggestions IA retirée */}
    </div>
  );
};

export default ChatAIAssistant;
