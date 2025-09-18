import React from 'react';
import { motion } from 'framer-motion';
import { Gift, Heart, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from './ui/Card';
import Button from './ui/Button';
import OfferTypeBadge from './ui/OfferTypeBadge';

const DonationSection: React.FC = () => {
  const donationFeatures = [
    {
      icon: <Gift className="w-6 h-6" />,
      title: "Donnez gratuitement",
      description: "Offrez vos objets inutilisés à vos voisins sans contrepartie",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Impact environnemental",
      description: "Réduisez les déchets en donnant une seconde vie à vos objets",
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Solidarité locale",
      description: "Aidez vos voisins et renforcez les liens communautaires",
      color: "from-blue-500 to-blue-600"
    }
  ];

  const donationExamples = [
    {
      title: "Livres d'enfants",
      user: "Marie D.",
      distance: "150m",
      type: "donation" as const,
      description: "Collection complète de livres pour enfants 3-8 ans"
    },
    {
      title: "Vêtements bébé",
      user: "Sophie L.",
      distance: "200m", 
      type: "donation" as const,
      description: "Vêtements 0-12 mois en excellent état"
    },
    {
      title: "Outils de jardin",
      user: "Pierre M.",
      distance: "300m",
      type: "donation" as const,
      description: "Râteau, bêche et sécateur pour jardinage"
    }
  ];

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 0.3 }} 
      className="py-20 bg-gradient-to-r from-green-50/50 to-blue-50/50 rounded-3xl"
    >
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100/50 border border-green-200/50 text-green-700 text-sm font-medium mb-6"
        >
          <Gift className="w-4 h-4" />
          Nouvelle fonctionnalité bientôt disponible
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
        >
          Donnez une seconde vie à vos objets
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-xl text-gray-600 max-w-2xl mx-auto"
        >
          Bientôt, vous pourrez donner gratuitement vos objets à vos voisins. 
          Une nouvelle façon de désencombrer tout en aidant votre communauté.
        </motion.p>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {donationFeatures.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + index * 0.1 }}
            className="group"
          >
            <Card className="p-6 glass hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Examples */}
      <div className="mb-16">
        <motion.h3 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-2xl font-bold text-gray-900 mb-8 text-center"
        >
          Exemples de dons à venir
        </motion.h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          {donationExamples.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 + index * 0.1 }}
            >
              <Card className="p-6 glass-strong hover:shadow-lg transition-all duration-200 hover:scale-105">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-green-600"></div>
                  <OfferTypeBadge offerType={item.type} size="sm" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{item.user}</span>
                  <span className="text-green-600 font-medium">{item.distance}</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="text-center"
      >
        <p className="text-gray-600 mb-6">
          Restez informé de l'arrivée de cette fonctionnalité
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/login">
            <Button rightIcon={<ArrowRight className="w-5 h-5" />} size="lg" className="min-w-[200px] shadow-lg">
              Créer mon compte
            </Button>
          </Link>
          <Link to="/items">
            <Button variant="ghost" size="lg" className="min-w-[200px]">
              Explorer les objets
            </Button>
          </Link>
        </div>
      </motion.div>
    </motion.section>
  );
};

export default DonationSection;
