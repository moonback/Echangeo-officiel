import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, Clock } from 'lucide-react';
import Card from './ui/Card';

interface SuspendedItemMessageProps {
  reason?: string;
  suspendedAt?: string;
  className?: string;
}

const SuspendedItemMessage: React.FC<SuspendedItemMessageProps> = ({ 
  reason, 
  suspendedAt, 
  className = '' 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="border-l-4 border-red-500 bg-red-50 p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Shield className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800 mb-1">
              Objet suspendu par l'administrateur
            </h3>
            <p className="text-sm text-red-700 mb-2">
              Cet objet a été temporairement suspendu et n'est plus disponible pour le moment.
            </p>
            {reason && (
              <div className="mb-2">
                <p className="text-xs font-medium text-red-600 mb-1">Raison :</p>
                <p className="text-xs text-red-600 bg-red-100 rounded px-2 py-1">
                  {reason}
                </p>
              </div>
            )}
            {suspendedAt && (
              <div className="flex items-center text-xs text-red-600">
                <Clock className="w-3 h-3 mr-1" />
                <span>Suspendu le {new Date(suspendedAt).toLocaleDateString('fr-FR')}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default SuspendedItemMessage;
