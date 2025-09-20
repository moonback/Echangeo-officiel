import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Filter, 
  Search, 
  Settings, 
  Users,
  Gift,
  Star,
  ArrowLeft,
  Eye,
  EyeOff,
  TrendingUp,
  Globe,
  X
} from 'lucide-react';
import MapboxMap from '../components/MapboxMap';
import { useItems } from '../hooks/useItems';
import { useCommunities } from '../hooks/useCommunities';
import { useGeolocation } from '../hooks/useGeolocation';
import type { Item, Community } from '../types';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const MapPage: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showItems, setShowItems] = useState(true);
  const [showCommunities, setShowCommunities] = useState(true);
  const [mapView, setMapView] = useState<'explore' | 'items' | 'communities'>('explore');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [radiusFilter, setRadiusFilter] = useState<number>(10); // km
  const [offerTypeFilter, setOfferTypeFilter] = useState<string>('');

  const { userLocation } = useGeolocation();
  const { data: items, isLoading: itemsLoading } = useItems();
  const { data: communities, isLoading: communitiesLoading } = useCommunities();

  // Gestion des clics sur les items
  const handleItemClick = useCallback((item: Item) => {
    setSelectedItem(item);
    setSelectedCommunity(null);
  }, []);

  // Gestion des clics sur les communautés
  const handleCommunityClick = useCallback((community: Community) => {
    setSelectedCommunity(community);
    setSelectedItem(null);
  }, []);

  // Fermer les détails
  const handleCloseDetails = useCallback(() => {
    setSelectedItem(null);
    setSelectedCommunity(null);
  }, []);

  // Catégories disponibles
  const categories = [
    'tools', 'electronics', 'books', 'sports', 'kitchen', 
    'garden', 'toys', 'fashion', 'furniture', 'music', 
    'baby', 'art', 'beauty', 'auto', 'office', 'services', 'other'
  ];

  // Types d'offres
  const offerTypes = [
    { key: '', label: 'Tous', icon: '🔄' },
    { key: 'loan', label: 'Prêt', icon: '🤝' },
    { key: 'trade', label: 'Échange', icon: '🔄' },
    { key: 'donation', label: 'Don', icon: '🎁' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header avec design glass */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Titre et navigation */}
            <div className="flex items-center gap-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.history.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Retour
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Carte interactive</h1>
                <p className="text-sm text-gray-600">Explorez les objets et quartiers près de vous</p>
              </div>
            </div>

            {/* Contrôles principaux */}
            <div className="flex items-center gap-3">
              {/* Sélecteur de vue */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                {[
                  { key: 'explore', label: 'Explorer', icon: Globe },
                  { key: 'items', label: 'Objets', icon: Gift },
                  { key: 'communities', label: 'Quartiers', icon: Users }
                ].map((view) => (
                  <button
                    key={view.key}
                    onClick={() => setMapView(view.key as any)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                      mapView === view.key
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <view.icon size={16} />
                    {view.label}
                  </button>
                ))}
              </div>

              {/* Bouton filtres */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter size={16} />
                Filtres
              </Button>

              {/* Bouton paramètres */}
              <Button
                variant="secondary"
                size="sm"
                className="flex items-center gap-2"
              >
                <Settings size={16} />
                Paramètres
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Panneau latéral */}
          <div className="lg:col-span-1 space-y-4">
            {/* Barre de recherche */}
            <Card className="bg-white/80 backdrop-blur-xl border border-white/20 p-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 backdrop-blur-sm"
                />
              </div>
            </Card>

            {/* Filtres rapides */}
            <Card className="bg-white/80 backdrop-blur-xl border border-white/20 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Filter size={16} />
                Filtres rapides
              </h3>
              
              <div className="space-y-3">
                {/* Catégorie */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90"
                  >
                    <option value="">Toutes les catégories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type d'offre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type d'offre</label>
                  <div className="space-y-2">
                    {offerTypes.map((type) => (
                      <button
                        key={type.key}
                        onClick={() => setOfferTypeFilter(type.key)}
                        className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                          offerTypeFilter === type.key
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <span>{type.icon}</span>
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rayon de recherche */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rayon: {radiusFilter} km
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={radiusFilter}
                    onChange={(e) => setRadiusFilter(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </Card>

            {/* Statistiques */}
            <Card className="bg-white/80 backdrop-blur-xl border border-white/20 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp size={16} />
                Statistiques
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Objets visibles</span>
                  <span className="text-sm font-semibold text-blue-600">{items?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Quartiers</span>
                  <span className="text-sm font-semibold text-green-600">{communities?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Disponibles</span>
                  <span className="text-sm font-semibold text-emerald-600">
                    {items?.filter(item => item.is_available).length || 0}
                  </span>
                </div>
              </div>
            </Card>

            {/* Contrôles de visibilité */}
            <Card className="bg-white/80 backdrop-blur-xl border border-white/20 p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Eye size={16} />
                Visibilité
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Afficher les objets</span>
                  <button
                    onClick={() => setShowItems(!showItems)}
                    className={`p-2 rounded-lg transition-colors ${
                      showItems ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {showItems ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Afficher les quartiers</span>
                  <button
                    onClick={() => setShowCommunities(!showCommunities)}
                    className={`p-2 rounded-lg transition-colors ${
                      showCommunities ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {showCommunities ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
              </div>
            </Card>
          </div>

          {/* Zone de la carte */}
          <div className="lg:col-span-3">
            <div className="relative">
              <MapboxMap
                className="h-[600px] lg:h-[700px]"
                onItemClick={handleItemClick}
                onCommunityClick={handleCommunityClick}
                showItems={showItems}
                showCommunities={showCommunities}
                initialCenter={userLocation ? [userLocation.lng, userLocation.lat] : undefined}
                initialZoom={13}
              />

              {/* Overlay de chargement */}
              {(itemsLoading || communitiesLoading) && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Chargement des données...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Détails de l'item sélectionné */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-96 z-30"
          >
            <Card className="bg-white/95 backdrop-blur-xl border border-white/20 p-4 shadow-2xl">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-lg">{selectedItem.title}</h3>
                <button
                  onClick={handleCloseDetails}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={14} />
                  <span>{selectedItem.location_hint || 'Position non spécifiée'}</span>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {selectedItem.category}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    {selectedItem.offer_type}
                  </span>
                </div>

                {selectedItem.description && (
                  <p className="text-sm text-gray-600 line-clamp-3">{selectedItem.description}</p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users size={14} />
                    <span>{selectedItem.owner?.full_name || 'Anonyme'}</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      window.location.href = `/items/${selectedItem.id}`;
                    }}
                  >
                    Voir détails
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Détails de la communauté sélectionnée */}
      <AnimatePresence>
        {selectedCommunity && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-96 z-30"
          >
            <Card className="bg-white/95 backdrop-blur-xl border border-white/20 p-4 shadow-2xl">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-lg">{selectedCommunity.name}</h3>
                <button
                  onClick={handleCloseDetails}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={14} />
                  <span>{selectedCommunity.city}</span>
                </div>
                
                {selectedCommunity.description && (
                  <p className="text-sm text-gray-600 line-clamp-3">{selectedCommunity.description}</p>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users size={14} />
                  <span>{(selectedCommunity as any).member_count || 0} membres</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <Star size={14} className="text-yellow-500" />
                    <span className="text-sm text-gray-600">Communauté active</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      window.location.href = `/communities/${selectedCommunity.id}`;
                    }}
                  >
                    Voir communauté
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MapPage;
