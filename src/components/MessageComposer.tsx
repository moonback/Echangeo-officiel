import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Wand2, Sparkles, X } from 'lucide-react';
import { useMessageImprovement } from '../hooks/useChatAI';
import Button from './ui/Button';

interface MessageComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
  context?: string;
  className?: string;
}

const MessageComposer: React.FC<MessageComposerProps> = ({
  value,
  onChange,
  onSend,
  placeholder = "Écrire un message…",
  disabled = false,
  context,
  className = '',
}) => {
  const [showImproved, setShowImproved] = useState(false);
  const [improvedMessage, setImprovedMessage] = useState('');
  const { improveMessage, isImproving } = useMessageImprovement();

  const handleImprove = async () => {
    if (!value.trim()) return;
    
    try {
      const improved = await improveMessage({ message: value, context });
      setImprovedMessage(improved);
      setShowImproved(true);
    } catch (error) {
      console.error('Erreur amélioration message:', error);
    }
  };

  const applyImprovedMessage = () => {
    onChange(improvedMessage);
    setShowImproved(false);
    setImprovedMessage('');
  };

  const rejectImprovedMessage = () => {
    setShowImproved(false);
    setImprovedMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Suggestion d'amélioration */}
      <AnimatePresence>
        {showImproved && improvedMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Message amélioré par l'IA
                </h4>
                <div className="bg-white/80 rounded-lg p-3 border border-purple-200/50">
                  <p className="text-sm text-gray-700">{improvedMessage}</p>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={applyImprovedMessage}
                    leftIcon={<Send size={14} />}
                  >
                    Utiliser cette version
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={rejectImprovedMessage}
                    className="border border-gray-300"
                  >
                    Garder l'original
                  </Button>
                </div>
              </div>
              <button
                onClick={rejectImprovedMessage}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compositeur de message */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
            rows={1}
            style={{
              minHeight: '48px',
              maxHeight: '120px',
              height: 'auto',
              resize: 'none',
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
            }}
          />
          
          {/* Bouton d'amélioration IA */}
          {import.meta.env.VITE_MISTRAL_API_KEY && value.trim() && (
            <button
              type="button"
              onClick={handleImprove}
              disabled={isImproving}
              className="absolute right-2 top-2 p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors disabled:opacity-50"
              title="Améliorer avec l'IA"
            >
              <Wand2 size={16} className={isImproving ? 'animate-spin' : ''} />
            </button>
          )}
        </div>
        
        <Button
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className="h-12 px-4 disabled:opacity-50"
          leftIcon={<Send size={16} />}
        >
          Envoyer
        </Button>
      </div>
    </div>
  );
};

export default MessageComposer;
