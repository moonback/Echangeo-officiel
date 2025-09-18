import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Camera, 
  MessageSquare, 
  Users, 
  Shield,
  TrendingUp,
  Zap,
  Brain,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import GeminiStatusCard from '../components/GeminiStatusCard';

const AIFeaturesPage: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const hasAI = !!import.meta.env.VITE_GEMINI_API_KEY;

  const features = [
    {
      id: 'object-recognition',
      title: 'Reconnaissance d\'Objets',
      description: 'Analysez vos photos pour pré-remplir automatiquement les informations',
      icon: Camera,
      color: 'from-purple-500 to-blue-600',
      benefits: [
        'Titre et description automatiques',
        'Catégorisation intelligente',
        'Estimation de valeur',
        'Détection de l\'état',
        'Tags pertinents générés'
      ],
      demoUrl: '/create',
    },
    {
      id: 'chat-assistant',
      title: 'Assistant Conversationnel',
      description: 'Suggestions de réponses intelligentes dans vos conversations',
      icon: MessageSquare,
      color: 'from-green-500 to-teal-600',
      benefits: [
        'Suggestions contextuelles',
        'Amélioration des messages',
        'Analyse de sentiment',
        'Réponses rapides',
        'Communication optimisée'
      ],
      demoUrl: '/neighbours',
    },
    {
      id: 'conflict-mediation',
      title: 'Médiateur de Conflit',
      description: 'Détection et résolution automatique des tensions',
      icon: Shield,
      color: 'from-amber-500 to-orange-600',
      benefits: [
        'Détection de conflit automatique',
        'Messages de médiation',
        'Suggestions de résolution',
        'Prévention d\'escalade',
        'Communication bienveillante'
      ],
      demoUrl: '/requests',
    },
    {
      id: 'compatibility-score',
      title: 'Score de Compatibilité',
      description: 'Analyse de compatibilité entre utilisateurs pour les échanges',
      icon: Users,
      color: 'from-pink-500 to-purple-600',
      benefits: [
        'Score de compatibilité 0-100',
        'Analyse multi-facteurs',
        'Recommandations personnalisées',
        'Prédiction de réussite',
        'Optimisation des échanges'
      ],
      demoUrl: '/items',
    },
  ];

  return (
    <div className="p-4 max-w1-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 gradient-text">
            Fonctionnalités IA
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Découvrez comment l'intelligence artificielle révolutionne votre expérience Échangeo
        </p>
        
        {/* Statut de l'IA */}
        <div className="mt-4">
          {hasAI ? (
            <Badge variant="success" className="px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              IA Gemini Activée
            </Badge>
          ) : (
            <Badge variant="warning" className="px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              Configuration IA Requise
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Configuration requise */}
      {!hasAI && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Configuration IA Requise
                </h3>
                <p className="text-gray-700 mb-4">
                  Pour utiliser les fonctionnalités IA, ajoutez votre clé API Gemini dans le fichier .env.local :
                </p>
                <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm mb-4">
                  VITE_GEMINI_API_KEY=your_gemini_api_key
                </div>
                <div className="flex gap-3">
                  <Button
                    as="a"
                    href="https://makersuite.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    leftIcon={<ArrowRight size={16} />}
                  >
                    Obtenir une clé API
                  </Button>
                  <Button
                    variant="ghost"
                    as="a"
                    href="/help"
                    className="border border-gray-300"
                  >
                    Guide d'installation
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Statut de l'API Gemini */}
      {hasAI && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <GeminiStatusCard />
        </motion.div>
      )}

      {/* Grille des fonctionnalités */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-0 overflow-hidden hover-lift">
              {/* Header avec gradient */}
              <div className={`bg-gradient-to-r ${feature.color} p-6 text-white`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                    <p className="text-white/90 text-sm">{feature.description}</p>
                  </div>
                </div>
              </div>

              {/* Contenu */}
              <div className="p-6">
                <ul className="space-y-2 mb-6">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>

                <div className="flex gap-3">
                  <Link to={feature.demoUrl} className="flex-1">
                    <Button 
                      className="w-full" 
                      disabled={!hasAI}
                      leftIcon={<ArrowRight size={16} />}
                    >
                      {hasAI ? 'Essayer' : 'Configurer IA'}
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => setActiveDemo(activeDemo === feature.id ? null : feature.id)}
                    className="border border-gray-300"
                  >
                    {activeDemo === feature.id ? 'Masquer' : 'Détails'}
                  </Button>
                </div>

                {/* Détails étendus */}
                <motion.div
                  initial={false}
                  animate={{ 
                    height: activeDemo === feature.id ? 'auto' : 0,
                    opacity: activeDemo === feature.id ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  {activeDemo === feature.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2">Comment ça marche :</h4>
                      {feature.id === 'object-recognition' && (
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>1. Uploadez une photo de votre objet</p>
                          <p>2. L'IA Gemini analyse l'image</p>
                          <p>3. Informations pré-remplies automatiquement</p>
                          <p>4. Validez ou modifiez selon vos besoins</p>
                        </div>
                      )}
                      {feature.id === 'chat-assistant' && (
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>1. Ouvrez une conversation</p>
                          <p>2. L'IA analyse le contexte</p>
                          <p>3. Suggestions de réponses générées</p>
                          <p>4. Sélectionnez ou améliorez vos messages</p>
                        </div>
                      )}
                      {feature.id === 'conflict-mediation' && (
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>1. L'IA surveille les conversations</p>
                          <p>2. Détection automatique de tensions</p>
                          <p>3. Messages de médiation suggérés</p>
                          <p>4. Résolution guidée des conflits</p>
                        </div>
                      )}
                      {feature.id === 'compatibility-score' && (
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>1. Analyse des profils utilisateurs</p>
                          <p>2. Calcul multi-facteurs</p>
                          <p>3. Score de 0 à 100 affiché</p>
                          <p>4. Recommandations personnalisées</p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Stats IA */}
      {hasAI && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="p-6 bg-gradient-to-r from-gray-50 to-blue-50/50">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-900">
                  IA Powered by Gemini
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">4</div>
                  <div className="text-sm text-gray-600">Fonctionnalités IA</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">95%</div>
                  <div className="text-sm text-gray-600">Précision moyenne</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">2s</div>
                  <div className="text-sm text-gray-600">Temps de réponse</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">24/7</div>
                  <div className="text-sm text-gray-600">Disponibilité</div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Call to action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 text-center"
      >
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Prêt à découvrir l'avenir des échanges ?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/create">
              <Button 
                leftIcon={<Sparkles size={16} />}
                disabled={!hasAI}
                className="min-w-[200px]"
              >
                Tester l'IA maintenant
              </Button>
            </Link>
            <Link to="/help">
              <Button 
                variant="ghost"
                leftIcon={<Brain size={16} />}
                className="border border-gray-300 min-w-[200px]"
              >
                En savoir plus
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AIFeaturesPage;
