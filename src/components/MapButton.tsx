import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Globe, Maximize2 } from 'lucide-react';
import MapboxFullscreenMap from './MapboxFullscreenMap';
import Button from './ui/Button';

interface MapButtonProps {
  variant?: 'default' | 'compact' | 'floating';
  className?: string;
  onItemClick?: (item: any) => void;
  onCommunityClick?: (community: any) => void;
  initialCenter?: [number, number];
  initialZoom?: number;
}

const MapButton: React.FC<MapButtonProps> = ({
  variant = 'default',
  className = '',
  onItemClick,
  onCommunityClick,
  initialCenter,
  initialZoom = 12
}) => {
  const [showFullscreenMap, setShowFullscreenMap] = useState(false);

  const handleOpenMap = () => {
    setShowFullscreenMap(true);
  };

  const handleCloseMap = () => {
    setShowFullscreenMap(false);
  };

  if (variant === 'compact') {
    return (
      <>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOpenMap}
          className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 ${className}`}
        >
          <MapPin size={16} />
          <span className="text-sm font-medium">Voir sur la carte</span>
        </motion.button>

        {showFullscreenMap && (
          <MapboxFullscreenMap
            onClose={handleCloseMap}
            onItemClick={onItemClick}
            onCommunityClick={onCommunityClick}
            initialCenter={initialCenter}
            initialZoom={initialZoom}
          />
        )}
      </>
    );
  }

  if (variant === 'floating') {
    return (
      <>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleOpenMap}
          className={`fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center ${className}`}
        >
          <MapPin size={24} />
        </motion.button>

        {showFullscreenMap && (
          <MapboxFullscreenMap
            onClose={handleCloseMap}
            onItemClick={onItemClick}
            onCommunityClick={onCommunityClick}
            initialCenter={initialCenter}
            initialZoom={initialZoom}
          />
        )}
      </>
    );
  }

  return (
    <>
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ y: 0 }}
        className={`relative ${className}`}
      >
        <Button
          onClick={handleOpenMap}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Globe size={20} />
            </div>
            <div className="text-left">
              <div className="font-semibold">Carte Interactive</div>
              <div className="text-sm opacity-90">Explorez les objets et quartiers</div>
            </div>
          </div>
          <Maximize2 size={20} className="ml-auto" />
        </Button>

        {/* Indicateur de pulsation */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
      </motion.div>

      {showFullscreenMap && (
        <MapboxFullscreenMap
          onClose={handleCloseMap}
          onItemClick={onItemClick}
          onCommunityClick={onCommunityClick}
          initialCenter={initialCenter}
          initialZoom={initialZoom}
        />
      )}
    </>
  );
};

export default MapButton;
