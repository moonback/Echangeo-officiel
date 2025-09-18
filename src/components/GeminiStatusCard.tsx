import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Zap,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import Badge from './ui/Badge';

interface GeminiStatusCardProps {
  className?: string;
}

interface GeminiStatus {
  isOnline: boolean;
  lastCheck: Date;
  responseTime?: number;
  error?: string;
}

const GeminiStatusCard: React.FC<GeminiStatusCardProps> = ({ className = '' }) => {
  const [status, setStatus] = useState<GeminiStatus>({
    isOnline: false,
    lastCheck: new Date(),
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkGeminiStatus = async () => {
    setIsChecking(true);
    const startTime = Date.now();
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey) {
        setStatus({
          isOnline: false,
          lastCheck: new Date(),
          error: 'Clé API Gemini manquante'
        });
        return;
      }

      // Test simple avec un petit prompt
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: 'Test'
                }
              ]
            }
          ],
          generationConfig: {
            maxOutputTokens: 10,
          },
        }),
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        setStatus({
          isOnline: true,
          lastCheck: new Date(),
          responseTime,
        });
      } else {
        const errorText = await response.text();
        setStatus({
          isOnline: false,
          lastCheck: new Date(),
          responseTime,
          error: `Erreur ${response.status}: ${errorText.slice(0, 100)}`
        });
      }
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      setStatus({
        isOnline: false,
        lastCheck: new Date(),
        responseTime,
        error: error.message || 'Erreur de connexion'
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Vérification initiale
    checkGeminiStatus();
    
    // Vérification périodique toutes les 5 minutes
    const interval = setInterval(checkGeminiStatus, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (status.isOnline) return 'text-emerald-600 bg-emerald-100';
    if (status.error?.includes('429')) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  const getStatusIcon = () => {
    if (status.isOnline) return CheckCircle;
    if (status.error?.includes('429')) return Clock;
    return AlertTriangle;
  };

  const getStatusText = () => {
    if (status.isOnline) return 'Opérationnel';
    if (status.error?.includes('429')) return 'Limite atteinte';
    return 'Hors ligne';
  };

  const StatusIcon = getStatusIcon();

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Statut API Gemini</h3>
            <p className="text-sm text-gray-600">Service d'analyse IA</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={`px-2.5 py-1 ${getStatusColor()}`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {getStatusText()}
          </Badge>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={checkGeminiStatus}
            disabled={isChecking}
            leftIcon={<RefreshCw size={14} className={isChecking ? 'animate-spin' : ''} />}
            className="text-gray-600 hover:text-gray-800"
          >
            {isChecking ? 'Vérification...' : 'Vérifier'}
          </Button>
        </div>
      </div>

      {/* Détails du statut */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Dernière vérification :</span>
          <span className="text-gray-900">
            {status.lastCheck.toLocaleTimeString('fr-FR')}
          </span>
        </div>
        
        {status.responseTime && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Temps de réponse :</span>
            <span className="text-gray-900">
              {status.responseTime}ms
            </span>
          </div>
        )}
        
        {status.error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 mb-1">
                  Problème détecté
                </p>
                <p className="text-sm text-red-700">
                  {status.error}
                </p>
                
                {/* Solutions spécifiques */}
                {status.error.includes('429') && (
                  <div className="mt-2 p-2 bg-white/50 rounded border border-red-200">
                    <p className="text-xs text-red-800 font-medium mb-1">
                      💡 Solutions :
                    </p>
                    <ul className="text-xs text-red-700 space-y-0.5">
                      <li>• Attendez quelques instants</li>
                      <li>• Vérifiez votre quota Google AI</li>
                      <li>• Contactez le support Google AI</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Lien vers la console */}
        <div className="pt-2 border-t border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open('https://makersuite.google.com/app/apikey', '_blank')}
            leftIcon={<ExternalLink size={14} />}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            Ouvrir Google AI Studio
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default GeminiStatusCard;
