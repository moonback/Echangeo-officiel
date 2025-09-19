import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, MapPin, Users, Package, Home } from 'lucide-react';

interface MapLegendProps {
  className?: string;
}

const MapLegend: React.FC<MapLegendProps> = ({ className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const legendItems = [
    {
      icon: '🏘️',
      label: 'Quartier',
      description: 'Communauté locale',
      color: '#8B5CF6',
      example: 'Versailles Centre'
    },
    {
      icon: '📦',
      label: 'Objet',
      description: 'Produit à échanger',
      color: '#6B7280',
      example: 'Perceuse Bosch'
    },
    {
      icon: '👤',
      label: 'Utilisateur',
      description: 'Votre position',
      color: '#3B82F6',
      example: 'Votre localisation'
    },
    {
      icon: '✓',
      label: 'Disponible',
      description: 'Objet disponible',
      color: '#10B981',
      example: 'En prêt'
    },
    {
      icon: '✗',
      label: 'Indisponible',
      description: 'Objet non disponible',
      color: '#EF4444',
      example: 'En cours d\'échange'
    }
  ];

  const categoryItems = [
    { icon: '🔧', label: 'Outils', color: '#F59E0B' },
    { icon: '📱', label: 'Électronique', color: '#3B82F6' },
    { icon: '📚', label: 'Livres', color: '#8B5CF6' },
    { icon: '⚽', label: 'Sport', color: '#10B981' },
    { icon: '🍳', label: 'Cuisine', color: '#EF4444' },
    { icon: '🌱', label: 'Jardin', color: '#059669' },
    { icon: '🧸', label: 'Jouets', color: '#EC4899' },
    { icon: '👕', label: 'Mode', color: '#F97316' },
    { icon: '🪑', label: 'Mobilier', color: '#6B7280' },
    { icon: '🎵', label: 'Musique', color: '#7C3AED' },
    { icon: '👶', label: 'Bébé', color: '#F472B6' },
    { icon: '🎨', label: 'Art', color: '#8B5CF6' },
    { icon: '🛠️', label: 'Services', color: '#06B6D4' },
    { icon: '🚗', label: 'Auto', color: '#374151' },
    { icon: '💼', label: 'Bureau', color: '#1F2937' }
  ];

  return (
    <div className={`bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors rounded-xl"
      >
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-brand-600" />
          <span className="font-semibold text-gray-900">Légende</span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </motion.div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Types de marqueurs */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Types de marqueurs
                </h4>
                <div className="space-y-2">
                  {legendItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50/50 transition-colors">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                        style={{ backgroundColor: `${item.color}20`, border: `2px solid ${item.color}` }}
                      >
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{item.label}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                      <div className="text-xs text-gray-400 italic">
                        {item.example}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Catégories d'objets */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Catégories d'objets
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {categoryItems.map((category, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50/50 transition-colors">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                        style={{ backgroundColor: `${category.color}20`, border: `1px solid ${category.color}` }}
                      >
                        {category.icon}
                      </div>
                      <span className="text-xs font-medium text-gray-700">{category.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Informations supplémentaires */}
              <div className="pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Indicateur d'activité</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Distance affichée si &lt; 500m</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Prix affiché si disponible</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MapLegend;