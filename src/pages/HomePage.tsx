import React from 'react';
import { motion } from 'framer-motion';
import NearbyItemsMap from '../components/NearbyItemsMap';

const HomePage: React.FC = () => {
  return (
    <div className="fixed top-16 left-0 right-0 bottom-0 w-full bg-gray-50 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full h-full"
      >
        <NearbyItemsMap
          title="TrocAll - Quartiers et objets"
          height={800}
          zoom={11}
          autoFit={true}
          showStats={true}
          showControls={true}
          showCommunities={true}
          maxItems={100}
          className="w-full h-full"
        />
            </motion.div>
    </div>
  );
};

export default HomePage;
