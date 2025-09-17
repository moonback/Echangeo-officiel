import React from 'react';
import Topbar from './Topbar';
import BottomNavigation from './BottomNavigation';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface ShellProps {
  children: React.ReactNode;
}

const Shell: React.FC<ShellProps> = ({ children }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      <main className={`min-h-[calc(100vh-56px)] ${isMobile ? 'pb-16' : ''}`}>
        {children}
      </main>
      {isMobile && <BottomNavigation />}
    </div>
  );
};

export default Shell;


