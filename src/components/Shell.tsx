import React from 'react';
import Topbar from './Topbar';
import BottomNavigation from './BottomNavigation';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { Plus, MessageCircle, Trophy } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

interface ShellProps {
  children: React.ReactNode;
}

const Shell: React.FC<ShellProps> = ({ children }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();
  const location = useLocation();
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
            className="max-w-7xl mx-auto px-4 py-6"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      {/* Floating primary action */}
      {isMobile && location.pathname !== '/create' && (
        <button
          onClick={() => navigate('/create')}
          className="fixed right-4 bottom-20 z-50 inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-soft hover:opacity-95 focus-visible:ring-2 focus-visible:ring-brand-500 pop-in"
          aria-label="Publier un objet"
        >
          <Plus size={22} />
        </button>
      )}
      {/* Quick actions: gamification, chat and settings */}
      {isMobile && (
        <div className="fixed right-4 bottom-[9.5rem] z-50 flex flex-col gap-2">
          <button
            onClick={() => navigate('/gamification')}
            className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-soft hover:opacity-95 transition-transform hover:scale-105 active:scale-95"
            aria-label="Ouvrir la gamification"
            title="Gamification"
          >
            <Trophy size={20} />
          </button>
          <button
            onClick={() => navigate('/neighbours')}
            className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/90 backdrop-blur border border-gray-200 shadow-soft text-gray-700 hover:bg-white transition-transform hover:scale-105 active:scale-95"
            aria-label="Ouvrir le chat"
            title="Chat"
          >
            <MessageCircle size={20} />
          </button>
          
        </div>
      )}
      {isMobile && <BottomNavigation />}
    </div>
  );
};

export default Shell;


