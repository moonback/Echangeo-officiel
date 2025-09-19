import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';

// Composant de chargement optimisé
const LoadingSpinner: React.FC = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex items-center justify-center min-h-screen bg-gray-50"
  >
    <div className="text-center">
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          rotate: { duration: 2, repeat: Infinity, ease: "linear" },
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
        className="inline-block mb-6"
      >
        <div className="w-16 h-16 border-4 border-brand-200 border-t-brand-500 rounded-full shadow-lg" />
      </motion.div>
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-lg font-semibold text-gray-800 mb-2"
      >
        Chargement...
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-gray-600"
      >
        Préparation de la page
      </motion.p>
    </div>
  </motion.div>
);

// Interface pour les composants lazy
interface LazyRouteProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Composant wrapper pour le lazy loading des routes
 * Améliore les performances en chargeant les composants à la demande
 */
export const LazyRoute: React.FC<LazyRouteProps> = ({ 
  fallback = <LoadingSpinner />, 
  children 
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

// Fonction utilitaire pour créer des composants lazy avec preload
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  preloadDelay: number = 2000
) => {
  const LazyComponent = lazy(importFunc);
  
  // Preload après un délai pour améliorer l'UX
  setTimeout(() => {
    importFunc().catch(() => {
      // Ignorer les erreurs de preload
    });
  }, preloadDelay);
  
  return LazyComponent;
};

// Composants lazy optimisés pour les pages principales
export const LazyMapPage = createLazyComponent(() => import('../pages/MapPage'));
export const LazyItemDetailPage = createLazyComponent(() => import('../pages/ItemDetailPage'));
export const LazyCommunityPage = createLazyComponent(() => import('../pages/CommunityPage'));
export const LazyProfilePage = createLazyComponent(() => import('../pages/ProfilePage'));

export default LazyRoute;
