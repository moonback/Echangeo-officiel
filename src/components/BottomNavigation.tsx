import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Plus, MessageCircle, User } from 'lucide-react';
import { motion } from 'framer-motion';

const BottomNavigation: React.FC = () => {
  const navItems = [
    { to: '/', icon: Home, label: 'Accueil' },
    { to: '/items', icon: Search, label: 'Objets' },
    { to: '/create', icon: Plus, label: 'Ajouter' },
    { to: '/requests', icon: MessageCircle, label: 'Demandes' },
    { to: '/me', icon: User, label: 'Profil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="grid grid-cols-5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-1 relative ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={24} />
                <span className="text-xs mt-1 font-medium">{label}</span>
                {isActive && (
                  <motion.div
                    layoutId="bottomNavActiveIndicator"
                    className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;