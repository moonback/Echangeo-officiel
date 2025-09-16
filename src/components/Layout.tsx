import React from 'react';
import { useLocation } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import Sidebar from './Sidebar';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {!isMobile && <Sidebar />}
      
      <main className={`flex-1 ${!isMobile ? 'ml-64' : ''} ${isMobile ? 'pb-16' : ''}`}>
        <div className="min-h-screen">
          {children}
        </div>
      </main>

      {isMobile && <BottomNavigation />}
    </div>
  );
};

export default Layout;