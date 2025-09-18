import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ErrorHandler } from '../utils/errorHandler';

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    errorHandler = ErrorHandler.getInstance();
    errorHandler.clearErrorLog();
  });

  describe('handleError', () => {
    it('should handle Supabase errors correctly', () => {
      const supabaseError = {
        code: '23505',
        message: 'duplicate key value violates unique constraint'
      };

      const result = errorHandler.handleError(supabaseError);
      
      expect(result).toBe('Cette information existe déjà dans notre base de données.');
    });

    it('should handle network errors', () => {
      const networkError = new Error('fetch failed');
      
      const result = errorHandler.handleError(networkError);
      
      expect(result).toBe('Problème de connexion. Vérifiez votre internet et réessayez.');
    });

    it('should handle unknown errors', () => {
      const unknownError = new Error('Something went wrong');
      
      const result = errorHandler.handleError(unknownError);
      
      expect(result).toBe('Une erreur inattendue s\'est produite. Veuillez réessayer.');
    });

    it('should log errors correctly', () => {
      const error = new Error('Test error');
      
      errorHandler.handleError(error, { action: 'test' });
      
      const recentErrors = errorHandler.getRecentErrors();
      expect(recentErrors).toHaveLength(1);
      expect(recentErrors[0].message).toBe('Test error');
      expect(recentErrors[0].context?.action).toBe('test');
    });
  });

  describe('getSeverityFromCode', () => {
    it('should return correct severity for critical codes', () => {
      const criticalError = { code: '42501', message: 'Permission denied' };
      
      const result = errorHandler.handleError(criticalError);
      
      const recentErrors = errorHandler.getRecentErrors();
      expect(recentErrors[0].severity).toBe('critical');
    });

    it('should return correct severity for high codes', () => {
      const highError = { code: '23505', message: 'Duplicate key' };
      
      const result = errorHandler.handleError(highError);
      
      const recentErrors = errorHandler.getRecentErrors();
      expect(recentErrors[0].severity).toBe('high');
    });
  });

  describe('error log management', () => {
    it('should limit error log size', () => {
      // Add more than 100 errors
      for (let i = 0; i < 150; i++) {
        errorHandler.handleError(new Error(`Error ${i}`));
      }
      
      const recentErrors = errorHandler.getRecentErrors();
      expect(recentErrors.length).toBeLessThanOrEqual(100);
    });

    it('should clear error log', () => {
      errorHandler.handleError(new Error('Test error'));
      expect(errorHandler.getRecentErrors()).toHaveLength(1);
      
      errorHandler.clearErrorLog();
      expect(errorHandler.getRecentErrors()).toHaveLength(0);
    });
  });
});
