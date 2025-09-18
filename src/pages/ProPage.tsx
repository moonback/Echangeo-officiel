import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Layers, Zap, Shield } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Link } from 'react-router-dom';

const FeatureRow: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="flex items-start gap-3">
    <CheckCircle className="w-5 h-5 text-brand-700 mt-0.5" />
    <div>
      <p className="font-medium text-gray-900">{title}</p>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
);

const ProPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">← Retour</Link>
        </div>

        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Échangeo Pro</h1>
            <p className="mt-3 text-gray-600">Des outils avancés pour associations, recycleries et pros du réemploi.</p>
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-4">
            {[{ Icon: Layers, title: 'Catalogue avancé', desc: 'Import CSV, variantes, tags illimités' }, { Icon: Zap, title: 'Visibilité locale', desc: 'Mise en avant auprès des voisins' }, { Icon: Shield, title: 'Confiance renforcée', desc: 'Badge vérifié et priorisation' }].map(({ Icon, title, desc }) => (
              <Card key={title} className="p-5 glass">
                <Icon className="w-6 h-6 text-brand-700" />
                <p className="mt-2 font-medium text-gray-900">{title}</p>
                <p className="text-sm text-gray-600">{desc}</p>
              </Card>
            ))}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} className="mt-10">
          <Card className="p-6 md:p-8 glass">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FeatureRow title="Statistiques détaillées" description="Suivez réservations, retours et taux de satisfaction." />
                <FeatureRow title="Gestion d’équipe" description="Ajoutez des membres avec des rôles dédiés." />
                <FeatureRow title="Support prioritaire" description="Accès à un canal de support dédié." />
              </div>
              <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative">
                <div className="absolute -inset-4 bg-brand-100/40 blur-2xl rounded-3xl" />
                <div className="relative rounded-2xl border border-brand-100 bg-gradient-to-br from-white to-brand-50 p-6">
                  <div className="h-40 rounded-xl bg-white/80 border border-brand-100" />
                </div>
              </motion.div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-2xl font-bold text-gray-900">19€ <span className="text-sm text-gray-600 font-normal">/mois</span></p>
                <p className="text-sm text-gray-600">Sans engagement, annulation à tout moment.</p>
              </div>
              <Button rightIcon={<ArrowRight className="w-4 h-4" />}>Demander un accès</Button>
            </div>
          </Card>
        </motion.section>
      </div>
    </div>
  );
};

export default ProPage;


