import React from 'react';
import NearbyItemsMap from '../components/NearbyItemsMap';

const NearbyItemsMapTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-brand-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Test du composant NearbyItemsMap amélioré
          </h1>
          <p className="text-lg text-gray-600">
            Découvrez les nouvelles fonctionnalités et le design modernisé
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Version pleine hauteur */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Version pleine hauteur
            </h2>
            <div className="h-96">
              <NearbyItemsMap
                className="h-full w-full"
                title="Quartiers actifs"
                showStats={true}
                showControls={true}
                showSidebar={true}
                showCommunities={true}
                height={400}
              />
            </div>
          </div>

          {/* Version compacte */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Version compacte
            </h2>
            <div className="h-96">
              <NearbyItemsMap
                className="h-full w-full"
                title="Objets à proximité"
                showStats={true}
                showControls={true}
                showSidebar={true}
                showCommunities={false}
                height={300}
              />
            </div>
          </div>
        </div>

        {/* Version pleine largeur */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Version pleine largeur
          </h2>
          <div className="h-96">
            <NearbyItemsMap
              className="h-full w-full"
              title="Carte interactive complète"
              showStats={true}
              showControls={true}
              showSidebar={true}
              showCommunities={true}
              height={400}
            />
          </div>
        </div>

        {/* Informations sur les améliorations */}
        <div className="mt-12 bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200/50">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            🎨 Améliorations apportées
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-brand-700">
                Design & Interface
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-brand-500 rounded-full"></span>
                  Sidebar des filtres avec animations fluides
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-brand-500 rounded-full"></span>
                  Header avec gradient et icônes modernes
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-brand-500 rounded-full"></span>
                  Statistiques avec cartes visuelles
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-brand-500 rounded-full"></span>
                  Légende interactive et masquable
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-brand-500 rounded-full"></span>
                  Indicateur de position utilisateur amélioré
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-blue-700">
                Fonctionnalités
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Boutons de vue (carte, grille, liste)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Filtres avec émojis et design moderne
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Sliders personnalisés avec gradients
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Animations Framer Motion fluides
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  États de chargement améliorés
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-brand-50 to-blue-50 rounded-2xl border border-brand-200/50">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              ✨ Effets visuels ajoutés
            </h3>
            <p className="text-gray-600">
              Glass morphism, gradients, ombres portées, animations de hover, 
              indicateurs animés, et transitions fluides pour une expérience 
              utilisateur moderne et engageante.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NearbyItemsMapTest;
