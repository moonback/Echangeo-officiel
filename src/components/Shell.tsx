import React, { useState } from 'react';
import Topbar from './Topbar';
import BottomNavigation from './BottomNavigation';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { Plus, MessageCircle, Trophy, Settings, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

interface ShellProps {
  children: React.ReactNode;
}

const Shell: React.FC<ShellProps> = ({ children }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();
  const location = useLocation();
  const [showFABMenu, setShowFABMenu] = useState(false);
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Topbar />
      <main className={`flex-1 ${isMobile ? 'pb-16' : ''}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="max-w-12xl mx-auto px-4 py-6"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      {/* Floating Action Button avec menu */}
      {isMobile && (
        <>
          {/* Menu FAB */}
          <AnimatePresence>
            {showFABMenu && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                onClick={() => setShowFABMenu(false)}
              />
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {showFABMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed right-4 bottom-20 z-50 flex flex-col gap-3 mb-20"
              >
                {/* Option Publier un objet */}
                <motion.button
                  onClick={() => {
                    navigate('/create');
                    setShowFABMenu(false);
                  }}
                  className="inline-flex items-center gap-3 px-4 py-3 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-gray-200/50 text-gray-700 hover:bg-white transition-all hover:scale-105 active:scale-95"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                    <Plus size={16} className="text-white" />
                  </div>
                  <span className="text-sm font-medium">Publier un objet</span>
                </motion.button>

                {/* Option Paramètres */}
                <motion.button
                  onClick={() => {
                    navigate('/settings');
                    setShowFABMenu(false);
                  }}
                  className="inline-flex items-center gap-3 px-4 py-3 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-gray-200/50 text-gray-700 hover:bg-white transition-all hover:scale-105 active:scale-95"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Settings size={16} className="text-gray-600" />
                  </div>
                  <span className="text-sm font-medium">Paramètres</span>
                </motion.button>

                {/* Option Chat */}
                <motion.button
                  onClick={() => {
                    navigate('/messages');
                    setShowFABMenu(false);
                  }}
                  className="inline-flex items-center gap-3 px-4 py-3 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-gray-200/50 text-gray-700 hover:bg-white transition-all hover:scale-105 active:scale-95"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <MessageCircle size={16} className="text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">Chat</span>
                </motion.button>

                {/* Option Gamification */}
                <motion.button
                  onClick={() => {
                    navigate('/gamification');
                    setShowFABMenu(false);
                  }}
                  className="inline-flex items-center gap-3 px-4 py-3 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-gray-200/50 text-gray-700 hover:bg-white transition-all hover:scale-105 active:scale-95"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                    <Trophy size={16} className="text-white" />
        </div>
                  <span className="text-sm font-medium">Gamification</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bouton FAB principal */}
          <motion.button
            onClick={() => setShowFABMenu(!showFABMenu)}
            className="fixed right-4 bottom-20 z-50 inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95"
            aria-label="Menu d'actions"
            animate={{ rotate: showFABMenu ? 45 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {showFABMenu ? <X size={22} /> : <Plus size={22} />}
          </motion.button>
        </>
      )}
      {isMobile && <BottomNavigation />}
    </div>
  );
};

export default Shell;


