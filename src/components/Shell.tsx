import React from 'react';
import Topbar from './Topbar';
import BottomNavigation from './BottomNavigation';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface ShellProps {
  children: React.ReactNode;
}

const Shell: React.FC<ShellProps> = ({ children }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      <main className={`min-h-[calc(100vh-56px)] ${isMobile ? 'pb-16' : ''}`}>
        {children}
      </main>
      {/* Floating primary action */}
      {isMobile && location.pathname !== '/create' && (
        <button
          onClick={() => navigate('/create')}
          className="fixed right-4 bottom-20 z-50 inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-soft hover:opacity-95 focus-visible:ring-2 focus-visible:ring-brand-500"
          aria-label="Publier un objet"
        >
          <Plus size={22} />
        </button>
      )}
      {isMobile && <BottomNavigation />}
    </div>
  );
};

export default Shell;


