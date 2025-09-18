import { useCallback } from 'react';
import { useErrorHandler } from '../utils/errorHandler';

interface ToastOptions {
  duration?: number;
  position?: 'top' | 'bottom';
  type?: 'error' | 'warning' | 'info' | 'success';
}

interface Toast {
  id: string;
  message: string;
  type: ToastOptions['type'];
  duration: number;
  timestamp: number;
}

/**
 * Hook pour afficher des toasts d'erreur avec gestion centralisée
 */
export const useErrorToast = () => {
  const { handleError } = useErrorHandler();

  const showError = useCallback((
    error: unknown, 
    context?: Record<string, unknown>,
    options: ToastOptions = {}
  ) => {
    const userMessage = handleError(error, context);
    
    // Créer le toast
    const toast: Toast = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message: userMessage,
      type: options.type || 'error',
      duration: options.duration || 5000,
      timestamp: Date.now()
    };

    // Dispatch l'événement pour le composant ToastContainer
    window.dispatchEvent(new CustomEvent('show-toast', { 
      detail: toast 
    }));

    return toast.id;
  }, [handleError]);

  const showSuccess = useCallback((
    message: string,
    options: Omit<ToastOptions, 'type'> = {}
  ) => {
    const toast: Toast = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message,
      type: 'success',
      duration: options.duration || 3000,
      timestamp: Date.now()
    };

    window.dispatchEvent(new CustomEvent('show-toast', { 
      detail: toast 
    }));

    return toast.id;
  }, []);

  const showWarning = useCallback((
    message: string,
    options: Omit<ToastOptions, 'type'> = {}
  ) => {
    const toast: Toast = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message,
      type: 'warning',
      duration: options.duration || 4000,
      timestamp: Date.now()
    };

    window.dispatchEvent(new CustomEvent('show-toast', { 
      detail: toast 
    }));

    return toast.id;
  }, []);

  const showInfo = useCallback((
    message: string,
    options: Omit<ToastOptions, 'type'> = {}
  ) => {
    const toast: Toast = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message,
      type: 'info',
      duration: options.duration || 4000,
      timestamp: Date.now()
    };

    window.dispatchEvent(new CustomEvent('show-toast', { 
      detail: toast 
    }));

    return toast.id;
  }, []);

  return {
    showError,
    showSuccess,
    showWarning,
    showInfo
  };
};
