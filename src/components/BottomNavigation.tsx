import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Users, MessageCircle, User, CheckCircle, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const BottomNavigation: React.FC = () => {
  const navItems = [
    { to: '/', icon: Home, label: 'Accueil' },
    { to: '/items', icon: Search, label: 'Rechercher' },
    { to: '/communities', icon: Users, label: 'Quartiers' },
    { to: '/map', icon: MapPin, label: 'Carte' },
    { to: '/messages', icon: MessageCircle, label: 'Messages' },
    { to: '/requests', icon: CheckCircle, label: 'Annonces' },
    { to: '/me', icon: User, label: 'Profil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-xl z-50 safe-area-inset-bottom">
      <div className="grid grid-cols-7 h-16">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            aria-label={label}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2 px-1 relative touch-manipulation ${
                isActive ? 'text-brand-600' : 'text-gray-500'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <motion.span 
                  className={`inline-flex items-center justify-center ${
                    isActive ? 'text-brand-600' : 'text-gray-500'
                  }`}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.1 }}
                >
                  <Icon size={22} />
                </motion.span>
                <span className="text-[10px] mt-1 font-medium leading-tight">{label}</span>
                {isActive && (
                  <motion.div
                    layoutId="bottomNavActiveIndicator"
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-brand-600 rounded-full"
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
