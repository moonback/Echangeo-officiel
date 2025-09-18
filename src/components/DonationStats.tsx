import React from 'react';
import { motion } from 'framer-motion';
import { Gift, Heart, Users, TrendingUp } from 'lucide-react';
import Card from './ui/Card';

interface DonationStatsProps {
  totalDonations?: number;
  totalValue?: number;
  activeDonors?: number;
  itemsDonated?: number;
  className?: string;
}

const DonationStats: React.FC<DonationStatsProps> = ({
  totalDonations = 0,
  totalValue = 0,
  activeDonors = 0,
  itemsDonated = 0,
  className = ''
}) => {
  const stats = [
    {
      icon: <Gift className="w-6 h-6" />,
      label: "Dons effectués",
      value: totalDonations.toLocaleString(),
      color: "from-green-500 to-green-600"
    },
    {
      icon: <Heart className="w-6 h-6" />,
      label: "Valeur totale",
      value: `${totalValue.toLocaleString()}€`,
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: <Users className="w-6 h-6" />,
      label: "Donateurs actifs",
      value: activeDonors.toLocaleString(),
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: "Objets donnés",
      value: itemsDonated.toLocaleString(),
      color: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="p-4 text-center hover:shadow-lg transition-all duration-300">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} text-white flex items-center justify-center mx-auto mb-3`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default DonationStats;
