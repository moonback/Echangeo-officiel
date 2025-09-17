import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { 
  generateChatSuggestions, 
  analyzeChatSentiment, 
  improveMessage,
  generateRequestMessage,
  type ChatAISuggestion, 
  type ChatAnalysis 
} from '../services/chatAI';
import type { Message } from '../types';

/**
 * Hook pour les suggestions de chat IA
 */
export const useChatSuggestions = () => {
  const [suggestions, setSuggestions] = useState<ChatAISuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateSuggestions = useMutation({
    mutationFn: async (params: {
      messages: Message[];
      context?: {
        itemTitle?: string;
        itemCategory?: string;
        requestType?: 'loan' | 'trade';
        userRelation?: 'owner' | 'requester';
      };
    }) => {
      setIsLoading(true);
      try {
        const suggestions = await generateChatSuggestions(params.messages, params.context);
        setSuggestions(suggestions);
        return suggestions;
      } finally {
        setIsLoading(false);
      }
    },
  });

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  return {
    suggestions,
    isLoading: isLoading || generateSuggestions.isPending,
    generateSuggestions: generateSuggestions.mutateAsync,
    clearSuggestions,
  };
};

/**
 * Hook pour l'analyse de sentiment des conversations
 */
export const useChatAnalysis = () => {
  const [analysis, setAnalysis] = useState<ChatAnalysis | null>(null);
  
  const analyzeConversation = useMutation({
    mutationFn: async (messages: Message[]) => {
      const result = await analyzeChatSentiment(messages);
      setAnalysis(result);
      return result;
    },
  });

  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
  }, []);

  return {
    analysis,
    isAnalyzing: analyzeConversation.isPending,
    analyzeConversation: analyzeConversation.mutateAsync,
    clearAnalysis,
  };
};

/**
 * Hook pour l'amélioration de messages
 */
export const useMessageImprovement = () => {
  const improveText = useMutation({
    mutationFn: async (params: { message: string; context?: string }) => {
      return await improveMessage(params.message, params.context);
    },
  });

  return {
    improveMessage: improveText.mutateAsync,
    isImproving: improveText.isPending,
  };
};

/**
 * Hook pour la génération de messages de demande
 */
export const useRequestMessageGenerator = () => {
  const generateMessage = useMutation({
    mutationFn: async (params: {
      itemTitle: string;
      itemCategory: string;
      requestType: 'loan' | 'trade';
      userMessage?: string;
    }) => {
      return await generateRequestMessage(
        params.itemTitle,
        params.itemCategory,
        params.requestType,
        params.userMessage
      );
    },
  });

  return {
    generateMessage: generateMessage.mutateAsync,
    isGenerating: generateMessage.isPending,
  };
};
