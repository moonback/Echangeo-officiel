import React, { Suspense } from 'react';
import { motion } from 'framer-motion';

interface LazyRouteProps {
  children: React.ReactNode;
}

const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
    />
  </div>
);

const LazyRoute: React.FC<LazyRouteProps> = ({ children }) => (
  <Suspense fallback={<LoadingSpinner />}>
    {children}
  </Suspense>
);

export default LazyRoute;
