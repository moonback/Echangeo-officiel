import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import NearbyItemsMap from '../components/NearbyItemsMap';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const MapPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b border-gray-200"
      >
        <div className="max-w1-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour
                </Button>
              </Link>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-100 rounded-lg">
                  <MapPin className="w-6 h-6 text-brand-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Carte interactive
                  </h1>
                  <p className="text-sm text-gray-600">
                    Découvrez les objets disponibles près de chez vous
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/items">
                <Button variant="primary">
                  Voir la liste
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contenu principal */}
      <div className="max-w1-2xl mx-auto p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Instructions */}
          <Card className="p-6 glass">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Comment utiliser la carte
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• <strong>Cliquez sur les marqueurs</strong> pour voir les détails d'un objet</p>
                  <p>• <strong>Utilisez les contrôles</strong> pour filtrer et actualiser les données</p>
                  <p>• <strong>Agrandissez la carte</strong> pour une vue plus détaillée</p>
                  <p>• <strong>Activez votre géolocalisation</strong> pour voir votre position</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Carte principale */}
          <NearbyItemsMap
            height={600}
            zoom={11}
            autoFit={true}
            showStats={true}
            showControls={true}
            className="shadow-lg"
          />

          {/* Informations supplémentaires */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 glass">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Objets vérifiés
                  </h3>
                  <p className="text-sm text-gray-600">
                    Tous les objets affichés sont disponibles et vérifiés par notre équipe. 
                    Vous pouvez échanger en toute confiance avec les membres de la communauté.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 glass">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Géolocalisation
                  </h3>
                  <p className="text-sm text-gray-600">
                    Activez votre géolocalisation pour voir votre position sur la carte 
                    et découvrir les objets les plus proches de chez vous.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MapPage;
