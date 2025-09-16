import React from 'react';
import { motion } from 'framer-motion';

const NeighboursPage: React.FC = () => {
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Mes voisins
        </h1>
        <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
          <p className="text-gray-600">
            La liste des voisins sera implémentée prochainement.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default NeighboursPage;