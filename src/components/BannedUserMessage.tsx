import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Mail, Calendar, Shield } from 'lucide-react';

interface BannedUserMessageProps {
  banReason?: string;
  banExpiresAt?: string;
  bannedBy?: string;
}

export default function BannedUserMessage({ 
  banReason, 
  banExpiresAt, 
  bannedBy 
}: BannedUserMessageProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isPermanent = !banExpiresAt;
  const isExpired = banExpiresAt && new Date(banExpiresAt) < new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50/30 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-red-200 overflow-hidden"
      >
        {/* Header avec icône */}
        <div className="bg-red-500 px-6 py-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Compte suspendu
          </h1>
          <p className="text-red-100">
            Votre accès à TrocAll a été temporairement restreint
          </p>
        </div>

        {/* Contenu principal */}
        <div className="p-6 space-y-6">
          {/* Message principal */}
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-700 leading-relaxed">
              {isExpired 
                ? "Votre suspension a expiré. Veuillez contacter le support pour réactiver votre compte."
                : isPermanent
                ? "Votre compte a été suspendu de manière permanente."
                : "Votre compte est temporairement suspendu."
              }
            </p>
          </div>

          {/* Détails du bannissement */}
          {banReason && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Raison de la suspension</h3>
              <p className="text-gray-700 text-sm">{banReason}</p>
            </div>
          )}

          {/* Informations supplémentaires */}
          <div className="space-y-3">
            {banExpiresAt && !isExpired && (
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>
                  Suspension jusqu'au {formatDate(banExpiresAt)}
                </span>
              </div>
            )}
            
            {bannedBy && (
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Shield className="w-4 h-4 text-gray-400" />
                <span>
                  Suspension effectuée par {bannedBy}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = 'mailto:support@trocal.com'}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Mail className="w-4 h-4" />
              <span>Contacter le support</span>
            </button>
            
            <button
              onClick={() => {
                // Déconnexion forcée
                window.location.href = '/login';
              }}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Retour à la connexion
            </button>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 pt-4 border-t">
            <p>
              Si vous pensez qu'il s'agit d'une erreur, contactez notre équipe de support.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
