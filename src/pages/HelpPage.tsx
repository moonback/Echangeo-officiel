import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Package, Users, MessageCircle, Shield } from 'lucide-react';

const HelpPage: React.FC = () => {
  const faqs = [
    {
      icon: Package,
      question: "Comment ajouter un objet ?",
      answer: "Cliquez sur le bouton 'Ajouter un objet' depuis la page d'accueil, remplissez les informations et ajoutez des photos."
    },
    {
      icon: MessageCircle,
      question: "Comment demander à emprunter un objet ?",
      answer: "Consultez la fiche de l'objet et cliquez sur 'Demander à emprunter'. Ajoutez un message pour expliquer votre besoin."
    },
    {
      icon: Users,
      question: "Comment fonctionne le système de voisinage ?",
      answer: "TrocAll connecte les utilisateurs proches géographiquement pour faciliter les échanges locaux."
    },
    {
      icon: Shield,
      question: "Mes données sont-elles sécurisées ?",
      answer: "Oui, nous utilisons Supabase pour sécuriser vos données. Cependant, cette version MVP n'active pas encore tous les paramètres de sécurité."
    },
  ];

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Centre d'aide
        </h1>
        <p className="text-gray-600">
          Trouvez des réponses à vos questions sur TrocAll
        </p>
      </motion.div>

      {/* About Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8"
      >
        <div className="flex items-center mb-4">
          <Package className="w-8 h-8 text-blue-600 mr-3" />
          <h2 className="text-xl font-semibold text-blue-900">
            Qu'est-ce que TrocAll ?
          </h2>
        </div>
        <p className="text-blue-800 leading-relaxed">
          TrocAll est une plateforme qui permet aux voisins de se prêter ou d'échanger des objets facilement. 
          Notre mission est d'encourager la solidarité entre voisins, de réduire la consommation inutile et 
          de favoriser le partage plutôt que l'achat.
        </p>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Questions fréquentes
        </h2>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <faq.icon className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Contact Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 bg-white rounded-xl p-6 border border-gray-200 text-center"
      >
        <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Besoin d'aide supplémentaire ?
        </h3>
        <p className="text-gray-600 mb-4">
          Notre équipe de support sera bientôt disponible pour vous aider.
        </p>
        <div className="text-sm text-gray-500">
          Version MVP - Support à venir
        </div>
      </motion.div>
    </div>
  );
};

export default HelpPage;