import React from 'react';
import { motion } from 'framer-motion';
import { Gift, Users, TrendingUp, Clock } from 'lucide-react';
import Card from '../ui/Card';
import { useDonationStats } from '../../hooks/useDonationStats';

const DonationPreview: React.FC = () => {
  const { totalDonations, totalValue, activeDonors, itemsDonated, loading } = useDonationStats();

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="p-6 border-l-4 border-l-green-500">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white flex items-center justify-center">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Fonctionnalité Dons</h3>
            <p className="text-sm text-gray-600">Bientôt disponible</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{totalDonations.toLocaleString()}</div>
            <div className="text-xs text-gray-600">Dons prévus</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{activeDonors.toLocaleString()}</div>
            <div className="text-xs text-gray-600">Donateurs potentiels</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Clock className="w-4 h-4" />
          <span>Développement en cours</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Valeur estimée des dons</span>
            <span className="font-medium text-green-600">{totalValue.toLocaleString()}€</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Objets à donner</span>
            <span className="font-medium text-blue-600">{itemsDonated.toLocaleString()}</span>
          </div>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-yellow-800">
            <TrendingUp className="w-4 h-4" />
            <span>Cette fonctionnalité sera disponible dans la prochaine mise à jour</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default DonationPreview;
