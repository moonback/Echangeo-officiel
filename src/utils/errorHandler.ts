/**
 * Gestionnaire d'erreurs centralisé pour l'application Echangeo
 * Fournit des messages d'erreur utilisateur-friendly et un logging sécurisé
 */

export interface AppError {
  code: string;
  message: string;
  userMessage: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, unknown>;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Traite une erreur et retourne un message utilisateur-friendly
   */
  handleError(error: unknown, context?: Record<string, unknown>): string {
    const appError = this.parseError(error, context);
    this.logError(appError);
    return appError.userMessage;
  }

  /**
   * Parse une erreur inconnue en AppError structuré
   */
  private parseError(error: unknown, context?: Record<string, unknown>): AppError {
    // Erreurs Supabase
    if (this.isSupabaseError(error)) {
      return this.handleSupabaseError(error, context);
    }

    // Erreurs réseau
    if (this.isNetworkError(error)) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Erreur de connexion réseau',
        userMessage: 'Problème de connexion. Vérifiez votre internet et réessayez.',
        severity: 'medium',
        context
      };
    }

    // Erreurs de validation Zod
    if (this.isZodError(error)) {
      return {
        code: 'VALIDATION_ERROR',
        message: 'Erreur de validation des données',
        userMessage: 'Les données saisies ne sont pas valides. Vérifiez les champs en rouge.',
        severity: 'low',
        context
      };
    }

    // Erreurs d'authentification
    if (this.isAuthError(error)) {
      return {
        code: 'AUTH_ERROR',
        message: 'Erreur d\'authentification',
        userMessage: 'Session expirée. Veuillez vous reconnecter.',
        severity: 'high',
        context
      };
    }

    // Erreur générique
    return {
      code: 'UNKNOWN_ERROR',
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      userMessage: 'Une erreur inattendue s\'est produite. Veuillez réessayer.',
      severity: 'medium',
      context
    };
  }

  /**
   * Gère les erreurs spécifiques à Supabase
   */
  private handleSupabaseError(error: any, context?: Record<string, unknown>): AppError {
    const code = error.code || 'SUPABASE_ERROR';
    const message = error.message || 'Erreur Supabase';

    // Messages utilisateur spécifiques selon le code d'erreur
    const userMessages: Record<string, string> = {
      '23505': 'Cette information existe déjà dans notre base de données.',
      '23503': 'Impossible de supprimer cet élément car il est utilisé ailleurs.',
      '42501': 'Vous n\'avez pas les permissions nécessaires pour cette action.',
      'PGRST116': 'Aucun résultat trouvé.',
      'PGRST301': 'Session expirée. Veuillez vous reconnecter.',
      'invalid_grant': 'Identifiants incorrects.',
      'email_not_confirmed': 'Veuillez confirmer votre email avant de vous connecter.',
      'weak_password': 'Le mot de passe doit contenir au moins 6 caractères.',
      'user_not_found': 'Aucun compte trouvé avec cet email.',
      'invalid_credentials': 'Email ou mot de passe incorrect.',
    };

    return {
      code,
      message,
      userMessage: userMessages[code] || 'Une erreur s\'est produite. Veuillez réessayer.',
      severity: this.getSeverityFromCode(code),
      context: { ...context, supabaseError: error }
    };
  }

  /**
   * Détermine la sévérité selon le code d'erreur
   */
  private getSeverityFromCode(code: string): AppError['severity'] {
    const criticalCodes = ['42501', 'PGRST301'];
    const highCodes = ['23505', '23503', 'invalid_grant', 'email_not_confirmed'];
    const mediumCodes = ['NETWORK_ERROR', 'PGRST116'];

    if (criticalCodes.includes(code)) return 'critical';
    if (highCodes.includes(code)) return 'high';
    if (mediumCodes.includes(code)) return 'medium';
    return 'low';
  }

  /**
   * Log une erreur de manière sécurisée
   */
  private logError(error: AppError): void {
    // En production, on pourrait envoyer à un service de monitoring
    if (process.env.NODE_ENV === 'development') {
      console.error('App Error:', error);
    }

    // Stockage local pour debugging
    this.errorLog.push({
      ...error,
      timestamp: new Date().toISOString()
    } as AppError & { timestamp: string });

    // Limiter la taille du log
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-50);
    }
  }

  /**
   * Récupère les erreurs récentes pour debugging
   */
  getRecentErrors(limit = 10): AppError[] {
    return this.errorLog.slice(-limit);
  }

  /**
   * Efface le log d'erreurs
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  // Type guards
  private isSupabaseError(error: unknown): error is any {
    return typeof error === 'object' && error !== null && 'code' in error;
  }

  private isNetworkError(error: unknown): boolean {
    return error instanceof Error && (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('timeout')
    );
  }

  private isZodError(error: unknown): boolean {
    return error instanceof Error && error.name === 'ZodError';
  }

  private isAuthError(error: unknown): boolean {
    return error instanceof Error && (
      error.message.includes('auth') ||
      error.message.includes('token') ||
      error.message.includes('session')
    );
  }
}

// Instance singleton
export const errorHandler = ErrorHandler.getInstance();

// Hook React pour utiliser le gestionnaire d'erreurs
export const useErrorHandler = () => {
  return {
    handleError: (error: unknown, context?: Record<string, unknown>) => 
      errorHandler.handleError(error, context),
    getRecentErrors: (limit?: number) => 
      errorHandler.getRecentErrors(limit),
    clearErrorLog: () => 
      errorHandler.clearErrorLog()
  };
};
