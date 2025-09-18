import React from 'react';

interface MapLegendProps {
  className?: string;
  showItems?: boolean;
  showCommunities?: boolean;
  showUsers?: boolean;
  showEvents?: boolean;
}

const MapLegend: React.FC<MapLegendProps> = ({
  className = '',
  showItems = true,
  showCommunities = true,
  showUsers = true,
  showEvents = false,
}) => {
  const legendItems = [];

  if (showItems) {
    legendItems.push(
      { color: '#EF4444', label: 'Outils', type: 'item' },
      { color: '#3B82F6', label: 'Électronique', type: 'item' },
      { color: '#8B5CF6', label: 'Livres', type: 'item' },
      { color: '#10B981', label: 'Sport', type: 'item' },
      { color: '#F59E0B', label: 'Cuisine', type: 'item' },
      { color: '#22C55E', label: 'Jardin', type: 'item' },
      { color: '#EC4899', label: 'Jouets', type: 'item' },
      { color: '#A855F7', label: 'Mode', type: 'item' },
      { color: '#6B7280', label: 'Meubles', type: 'item' },
      { color: '#F97316', label: 'Musique', type: 'item' },
      { color: '#FBBF24', label: 'Bébé', type: 'item' },
      { color: '#6366F1', label: 'Services', type: 'item' },
    );
  }

  if (showCommunities) {
    legendItems.push({ color: '#8B5CF6', label: 'Communautés', type: 'community' });
  }

  if (showUsers) {
    legendItems.push({ color: '#10B981', label: 'Utilisateurs', type: 'user' });
  }

  if (showEvents) {
    legendItems.push({ color: '#F59E0B', label: 'Événements', type: 'event' });
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 p-4 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-800 mb-3">Légende de la carte</h3>
      <div className="space-y-2">
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full border border-white shadow-sm"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapLegend;
