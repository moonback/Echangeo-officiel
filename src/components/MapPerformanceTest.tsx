import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap, Users, Map, BarChart3, RefreshCw } from 'lucide-react';
import MapboxMapOptimized, { MapboxMarker } from './MapboxMapOptimized';
import { useOptimizedMap } from '../hooks/useOptimizedMap';

interface MapPerformanceTestProps {
  className?: string;
}

// Générateur de données de test optimisé
const generateTestMarkers = (count: number, center: { lat: number; lng: number }): MapboxMarker[] => {
  const markers: MapboxMarker[] = [];
  const categories = ['tools', 'electronics', 'books', 'sports', 'kitchen', 'garden'];
  const conditions = ['excellent', 'good', 'fair'];
  const offerTypes = ['loan', 'trade', 'donation'];

  for (let i = 0; i < count; i++) {
    const lat = center.lat + (Math.random() - 0.5) * 0.1; // ±5km environ
    const lng = center.lng + (Math.random() - 0.5) * 0.1;
    
    markers.push({
      id: `test-marker-${i}`,
      latitude: lat,
      longitude: lng,
      title: `Objet de test ${i + 1}`,
      category: categories[Math.floor(Math.random() * categories.length)],
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      offerType: offerTypes[Math.floor(Math.random() * offerTypes.length)],
      type: 'item',
      owner: `Utilisateur ${i + 1}`,
      price: Math.random() > 0.7 ? Math.floor(Math.random() * 100) + 10 : undefined,
      distance: Math.random() * 5,
      description: `Description de l'objet de test ${i + 1}`,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  return markers;
};

const MapPerformanceTest: React.FC<MapPerformanceTestProps> = ({ className = '' }) => {
  const [markerCount, setMarkerCount] = useState(100);
  const [enableClustering, setEnableClustering] = useState(true);
  const [zoom, setZoom] = useState(12);
  const [performanceMode, setPerformanceMode] = useState<'normal' | 'high' | 'extreme'>('normal');
  const [showStats, setShowStats] = useState(true);

  const center = { lat: 48.8566, lng: 2.3522 }; // Paris

  // Génération des marqueurs de test
  const testMarkers = useMemo(() => {
    const baseCount = performanceMode === 'normal' ? markerCount : 
                     performanceMode === 'high' ? markerCount * 2 : 
                     markerCount * 5;
    return generateTestMarkers(baseCount, center);
  }, [markerCount, performanceMode]);

  // Utilisation du hook optimisé
  const {
    processedMarkers,
    isLoading,
    stats,
    getClusterDetails,
    clearCache,
    forceRecalculation
  } = useOptimizedMap({
    markers: testMarkers,
    center,
    zoom,
    enableClustering,
    clusterRadius: 0.05,
    maxMarkersBeforeClustering: 50,
    debounceMs: 150
  });

  // Métriques de performance
  const performanceMetrics = useMemo(() => {
    const renderTime = performance.now();
    return {
      totalMarkers: testMarkers.length,
      visibleMarkers: processedMarkers.length,
      clusterCount: stats.clusterCount,
      reductionPercentage: stats.reductionPercentage,
      cacheSize: stats.cacheSize,
      renderTime: Math.round(renderTime),
      memoryUsage: (performance as any).memory ? 
        Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024) : 
        'N/A'
    };
  }, [testMarkers.length, processedMarkers.length, stats]);

  const handleMarkerClick = useCallback((markerId: string) => {
    if (markerId.startsWith('cluster-')) {
      const clusterData = getClusterDetails(markerId);
      if (clusterData) {
        console.log('Cluster clicked:', clusterData);
        // Ici on pourrait zoomer sur le cluster ou afficher une liste
      }
    } else {
      console.log('Marker clicked:', markerId);
    }
  }, [getClusterDetails]);

  const resetTest = useCallback(() => {
    clearCache();
    forceRecalculation();
  }, [clearCache, forceRecalculation]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête avec contrôles */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Test de Performance Carte</h2>
              <p className="text-sm text-gray-600">
                Testez les optimisations de rendu et de clustering
              </p>
            </div>
          </div>
          <button
            onClick={resetTest}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 
                     rounded-lg transition-colors text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
        </div>

        {/* Contrôles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de marqueurs
            </label>
            <select
              value={markerCount}
              onChange={(e) => setMarkerCount(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={50}>50 marqueurs</option>
              <option value={100}>100 marqueurs</option>
              <option value={250}>250 marqueurs</option>
              <option value={500}>500 marqueurs</option>
              <option value={1000}>1000 marqueurs</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mode de performance
            </label>
            <select
              value={performanceMode}
              onChange={(e) => setPerformanceMode(e.target.value as 'normal' | 'high' | 'extreme')}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="normal">Normal</option>
              <option value="high">Performance élevée (x2)</option>
              <option value="extreme">Extrême (x5)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Niveau de zoom
            </label>
            <input
              type="range"
              min={8}
              max={16}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-500 mt-1">Zoom: {zoom}</div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={enableClustering}
                onChange={(e) => setEnableClustering(e.target.checked)}
                className="rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Clustering</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showStats}
                onChange={(e) => setShowStats(e.target.checked)}
                className="rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Statistiques</span>
            </label>
          </div>
        </div>
      </div>

      {/* Statistiques de performance */}
      {showStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
        >
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Map className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-gray-600">Total</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {performanceMetrics.totalMarkers.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">marqueurs</div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-gray-600">Visibles</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {performanceMetrics.visibleMarkers.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">affichés</div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium text-gray-600">Clusters</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {performanceMetrics.clusterCount}
            </div>
            <div className="text-xs text-gray-500">groupes</div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-medium text-gray-600">Réduction</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {performanceMetrics.reductionPercentage}%
            </div>
            <div className="text-xs text-gray-500">optimisé</div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-red-600" />
              <span className="text-xs font-medium text-gray-600">Cache</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {performanceMetrics.cacheSize}
            </div>
            <div className="text-xs text-gray-500">entrées</div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-medium text-gray-600">Mémoire</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {performanceMetrics.memoryUsage}
            </div>
            <div className="text-xs text-gray-500">MB</div>
          </div>
        </motion.div>
      )}

      {/* Indicateur de chargement */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-sm font-medium text-blue-800">
              Traitement des marqueurs en cours...
            </span>
          </div>
        </motion.div>
      )}

      {/* Carte optimisée */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="h-96 relative">
          <MapboxMapOptimized
            center={center}
            zoom={zoom}
            height="100%"
            markers={processedMarkers}
            onMarkerClick={handleMarkerClick}
            autoFit={false}
            showUserLocation={true}
            userLocation={center}
            enableClustering={enableClustering}
            maxMarkersBeforeClustering={50}
          />
          
          {/* Overlay d'informations */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="text-xs font-medium text-gray-600 mb-1">Performance</div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                performanceMetrics.reductionPercentage > 50 ? 'bg-green-500' :
                performanceMetrics.reductionPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-xs text-gray-800">
                {performanceMetrics.reductionPercentage > 50 ? 'Excellente' :
                 performanceMetrics.reductionPercentage > 25 ? 'Bonne' : 'Normale'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Conseils d'optimisation */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="font-semibold text-gray-900 mb-3">💡 Optimisations appliquées</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong>Clustering intelligent :</strong> Regroupement automatique des marqueurs proches selon le niveau de zoom
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong>Cache de distance :</strong> Mémorisation des calculs de distance avec stratégie LRU
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong>Debouncing :</strong> Limitation des recalculs lors des interactions rapides
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <strong>Rendu optimisé :</strong> Évitement des re-renders inutiles avec mémorisation
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPerformanceTest;
