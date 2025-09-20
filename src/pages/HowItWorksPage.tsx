import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Search, Users, Shield, Sparkles, Heart, Star, 
  Zap, Mail, Phone, MapPin, CheckCircle, Clock, Gift, 
  MessageCircle, UserCheck, Award, TrendingUp, Globe,
  Smartphone, CreditCard, Lock, Eye, Filter, Calendar,
  Share2, Download, Upload, Bell, Settings, HelpCircle
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const HowItWorksPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('getting-started');

  const tabs = [
    { id: 'getting-started', label: 'Démarrage', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'features', label: 'Fonctionnalités', icon: <Zap className="w-4 h-4" /> },
    { id: 'safety', label: 'Sécurité', icon: <Shield className="w-4 h-4" /> },
    { id: 'tips', label: 'Conseils', icon: <Award className="w-4 h-4" /> },
    { id: 'faq', label: 'FAQ', icon: <HelpCircle className="w-4 h-4" /> }
  ];

  const steps = [
    {
      number: 1,
      title: "Créer votre compte",
      description: "Inscrivez-vous en quelques secondes avec votre email ou compte Google",
      icon: <UserCheck className="w-6 h-6" />,
      details: [
        "Vérification automatique de votre email",
        "Profil personnalisable avec photo",
        "Sélection de votre quartier",
        "Paramètres de confidentialité"
      ]
    },
    {
      number: 2,
      title: "Rejoindre votre quartier",
      description: "Découvrez et rejoignez la communauté de votre quartier",
      icon: <MapPin className="w-6 h-6" />,
      details: [
        "Géolocalisation automatique",
        "Communautés à proximité",
        "Statistiques du quartier",
        "Événements locaux"
      ]
    },
    {
      number: 3,
      title: "Publier un objet",
      description: "Ajoutez vos objets à partager avec vos voisins",
      icon: <Upload className="w-6 h-6" />,
      details: [
        "Photos haute qualité",
        "Description détaillée",
        "Catégorisation automatique",
        "Conditions d'emprunt"
      ]
    },
    {
      number: 4,
      title: "Rechercher et découvrir",
      description: "Trouvez ce dont vous avez besoin dans votre quartier",
      icon: <Search className="w-6 h-6" />,
      details: [
        "Recherche intelligente",
        "Filtres avancés",
        "Géolocalisation précise",
        "Suggestions personnalisées"
      ]
    },
    {
      number: 5,
      title: "Contacter et échanger",
      description: "Communiquez directement avec les autres membres",
      icon: <MessageCircle className="w-6 h-6" />,
      details: [
        "Messagerie intégrée",
        "Notifications en temps réel",
        "Planification des échanges",
        "Suivi des conversations"
      ]
    },
    {
      number: 6,
      title: "Partager et évaluer",
      description: "Évaluez vos expériences et construisez votre réputation",
      icon: <Star className="w-6 h-6" />,
      details: [
        "Système de notation",
        "Commentaires détaillés",
        "Badges de confiance",
        "Historique des échanges"
      ]
    }
  ];

  const features = [
    {
      category: "Recherche et Découverte",
      icon: <Search className="w-6 h-6" />,
      color: "from-blue-500 to-blue-600",
      items: [
        {
          title: "Recherche intelligente",
          description: "Trouvez exactement ce que vous cherchez grâce à notre algorithme de recherche avancé",
          details: [
            "Recherche par mots-clés",
            "Suggestions automatiques",
            "Recherche vocale",
            "Historique des recherches"
          ]
        },
        {
          title: "Filtres avancés",
          description: "Affinez vos résultats avec des filtres précis",
          details: [
            "Distance (100m à 10km)",
            "Catégorie d'objet",
            "Type d'échange (prêt, don, échange)",
            "Disponibilité",
            "Note du propriétaire"
          ]
        },
        {
          title: "Géolocalisation",
          description: "Découvrez les objets les plus proches de chez vous",
          details: [
            "Position GPS précise",
            "Calcul automatique des distances",
            "Carte interactive",
            "Itinéraires optimisés"
          ]
        }
      ]
    },
    {
      category: "Communication",
      icon: <MessageCircle className="w-6 h-6" />,
      color: "from-green-500 to-green-600",
      items: [
        {
          title: "Messagerie intégrée",
          description: "Communiquez directement avec les autres membres",
          details: [
            "Messages en temps réel",
            "Notifications push",
            "Photos et fichiers",
            "Emojis et réactions"
          ]
        },
        {
          title: "Planification",
          description: "Organisez facilement vos échanges",
          details: [
            "Calendrier intégré",
            "Rappels automatiques",
            "Gestion des disponibilités",
            "Synchronisation multi-appareils"
          ]
        }
      ]
    },
    {
      category: "Sécurité et Confiance",
      icon: <Shield className="w-6 h-6" />,
      color: "from-purple-500 to-purple-600",
      items: [
        {
          title: "Profils vérifiés",
          description: "Tous les membres sont vérifiés pour votre sécurité",
          details: [
            "Vérification email obligatoire",
            "Vérification téléphone optionnelle",
            "Badges de confiance",
            "Historique des échanges"
          ]
        },
        {
          title: "Système de notation",
          description: "Évaluez et consultez les avis des autres membres",
          details: [
            "Notes de 1 à 5 étoiles",
            "Commentaires détaillés",
            "Réponse aux avis",
            "Signalement d'abus"
          ]
        }
      ]
    },
    {
      category: "Gamification",
      icon: <Award className="w-6 h-6" />,
      color: "from-orange-500 to-orange-600",
      items: [
        {
          title: "Système de points",
          description: "Gagnez des points en participant activement",
          details: [
            "Points pour chaque échange",
            "Bonus pour les nouveaux membres",
            "Récompenses mensuelles",
            "Classements locaux"
          ]
        },
        {
          title: "Badges et récompenses",
          description: "Débloquez des badges en accomplissant des actions",
          details: [
            "Badge \"Premier échange\"",
            "Badge \"Super voisin\"",
            "Badge \"Écologique\"",
            "Badge \"Ambassadeur\""
          ]
        }
      ]
    }
  ];

  const safetyFeatures = [
    {
      title: "Protection des données personnelles",
      icon: <Lock className="w-6 h-6" />,
      description: "Vos informations sont protégées par un chiffrement de niveau bancaire",
      details: [
        "Chiffrement SSL/TLS",
        "Conformité RGPD",
        "Données stockées en France",
        "Aucune revente de données"
      ]
    },
    {
      title: "Modération automatique",
      icon: <Eye className="w-6 h-6" />,
      description: "Notre IA modère automatiquement le contenu pour votre sécurité",
      details: [
        "Détection de contenu inapproprié",
        "Filtrage des spams",
        "Vérification des photos",
        "Signalement automatique"
      ]
    },
    {
      title: "Support client 24/7",
      icon: <Phone className="w-6 h-6" />,
      description: "Notre équipe est disponible pour vous aider à tout moment",
      details: [
        "Chat en direct",
        "Email de support",
        "Base de connaissances",
        "Tutoriels vidéo"
      ]
    }
  ];

  const tips = [
    {
      category: "Pour les débutants",
      icon: <Sparkles className="w-5 h-5" />,
      items: [
        "Commencez par des petits objets pour tester la plateforme",
        "Prenez des photos de qualité sous un bon éclairage",
        "Rédigez des descriptions claires et honnêtes",
        "Répondez rapidement aux messages pour créer la confiance"
      ]
    },
    {
      category: "Pour optimiser vos échanges",
      icon: <TrendingUp className="w-5 h-5" />,
      items: [
        "Utilisez des mots-clés pertinents dans vos descriptions",
        "Mettez à jour régulièrement vos disponibilités",
        "Proposez plusieurs options d'échange (prêt, don, échange)",
        "Organisez vos objets par catégories"
      ]
    },
    {
      category: "Pour la sécurité",
      icon: <Shield className="w-5 h-5" />,
      items: [
        "Rencontrez-vous dans des lieux publics pour les premiers échanges",
        "Vérifiez les profils et avis avant de vous engager",
        "Prenez des photos de l'état des objets avant l'échange",
        "Signalez tout comportement suspect"
      ]
    }
  ];

  const faq = [
    {
      question: "Comment fonctionne la géolocalisation ?",
      answer: "La géolocalisation nous permet de vous montrer les objets et communautés les plus proches de chez vous. Vous pouvez activer ou désactiver cette fonctionnalité à tout moment dans vos paramètres de confidentialité."
    },
    {
      question: "Puis-je utiliser la plateforme sans créer de compte ?",
      answer: "Non, un compte est nécessaire pour utiliser toutes les fonctionnalités de la plateforme. Cela garantit la sécurité et la traçabilité des échanges."
    },
    {
      question: "Comment sont calculées les distances ?",
      answer: "Les distances sont calculées en ligne droite entre votre position et celle de l'objet. Pour les trajets réels, nous vous recommandons d'utiliser votre application de navigation habituelle."
    },
    {
      question: "Que se passe-t-il si un objet est endommagé ?",
      answer: "En cas de dommage, contactez immédiatement le propriétaire et notre support client. Nous avons des procédures en place pour gérer ce type de situation."
    },
    {
      question: "Puis-je supprimer mon compte ?",
      answer: "Oui, vous pouvez supprimer votre compte à tout moment depuis les paramètres. Toutes vos données personnelles seront supprimées dans les 30 jours."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-brand-50/30 to-brand-50/20">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-brand-200/10 to-brand-300/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-tl from-brand-300/10 to-brand-200/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header identique à LandingPage */}
      <header className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          <Link to="/" className="group">
            <img src="/logo.png" alt="Échangeo Logo" className="w-20 h-20 object-contain" />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/how-it-works" className="text-sm font-semibold text-brand-600">Comment ça marche</Link>
            <Link to="/login"><Button variant="ghost" size="sm">Créer un compte</Button></Link>
            <Link to="/login"><Button size="sm">Se connecter</Button></Link>
          </div>
        </div>
        
        {/* Mobile Layout */}
        <div className="md:hidden flex flex-col items-center">
          <Link to="/" className="group">
            <img src="/logo.png" alt="Échangeo Logo" className="w-16 h-16 object-contain" />
          </Link>
          <div className="flex flex-col items-center gap-3 mt-4">
            <Link to="/how-it-works" className="text-sm font-semibold text-brand-600">Comment ça marche</Link>
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Créer un compte</Button>
              </Link>
              <Link to="/login">
                <Button size="sm">Se connecter</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Titre principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Comment ça marche ?
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Découvrez tout ce que vous devez savoir pour utiliser Échangeo efficacement et en toute sécurité
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="p-2">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-brand-600 hover:bg-brand-50'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Content */}
        <div className="space-y-8">
          {/* Getting Started */}
          {activeTab === 'getting-started' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Les étapes pour commencer</h2>
                <p className="text-gray-600">Suivez ces 6 étapes simples pour devenir un expert d'Échangeo</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6 h-full hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {step.number}
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-r from-brand-100 to-brand-200 rounded-xl flex items-center justify-center text-brand-600">
                          {step.icon}
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600 mb-4">{step.description}</p>
                      
                      <ul className="space-y-2">
                        {step.details.map((detail, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Features */}
          {activeTab === 'features' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Fonctionnalités détaillées</h2>
                <p className="text-gray-600">Explorez toutes les fonctionnalités qui rendent Échangeo unique</p>
              </div>

              <div className="space-y-8">
                {features.map((category, categoryIndex) => (
                  <motion.div
                    key={category.category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: categoryIndex * 0.1 }}
                  >
                    <Card className="p-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center text-white shadow-md`}>
                          {category.icon}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{category.category}</h3>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        {category.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="space-y-3">
                            <h4 className="text-lg font-semibold text-gray-900">{item.title}</h4>
                            <p className="text-gray-600">{item.description}</p>
                            <ul className="space-y-2">
                              {item.details.map((detail, detailIndex) => (
                                <li key={detailIndex} className="flex items-center gap-2 text-sm text-gray-600">
                                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                  {detail}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Safety */}
          {activeTab === 'safety' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Sécurité et protection</h2>
                <p className="text-gray-600">Votre sécurité est notre priorité absolue</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {safetyFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6 h-full text-center hover:shadow-xl transition-all duration-300">
                      <div className="w-16 h-16 bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-md">
                        {feature.icon}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
                      <p className="text-gray-600 mb-4">{feature.description}</p>
                      <ul className="space-y-2 text-left">
                        {feature.details.map((detail, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Tips */}
          {activeTab === 'tips' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Conseils et bonnes pratiques</h2>
                <p className="text-gray-600">Maximisez votre expérience avec ces conseils d'experts</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {tips.map((tip, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6 h-full hover:shadow-xl transition-all duration-300">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl flex items-center justify-center text-white shadow-md">
                          {tip.icon}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{tip.category}</h3>
                      </div>
                      <ul className="space-y-3">
                        {tip.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* FAQ */}
          {activeTab === 'faq' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions fréquentes</h2>
                <p className="text-gray-600">Trouvez les réponses aux questions les plus courantes</p>
              </div>

              <div className="space-y-4">
                {faq.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6 hover:shadow-lg transition-all duration-300">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">{item.question}</h3>
                      <p className="text-gray-600">{item.answer}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16"
        >
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Prêt à commencer ?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Maintenant que vous savez comment ça marche, rejoignez la communauté Échangeo et découvrez une nouvelle façon de consommer responsable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="md" className="shadow-md hover:shadow-lg">
                Créer mon compte
              </Button>
              <Button variant="ghost" size="md" className="hover:bg-brand-50 hover:text-brand-700">
                Explorer la plateforme
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default HowItWorksPage;
