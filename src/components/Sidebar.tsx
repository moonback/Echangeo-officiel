import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Plus, 
  MessageCircle, 
  User, 
  Users, 
  Settings, 
  HelpCircle,
  Package
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { LogOut } from 'lucide-react';

const Sidebar: React.FC = () => {
  const { profile, signOut } = useAuthStore();

  const navItems = [
    { to: '/', icon: Home, label: 'Accueil' },
    { to: '/items', icon: Search, label: 'Rechercher' },
    { to: '/create', icon: Plus, label: 'Proposer un objet' },
    { to: '/requests', icon: MessageCircle, label: 'Mes échanges' },
    { to: '/neighbours', icon: Users, label: 'Voisins' },
    { to: '/me', icon: User, label: 'Profil' },
    { to: '/settings', icon: Settings, label: 'Paramètres' },
    { to: '/help', icon: HelpCircle, label: 'Aide' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 z-40">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center px-6 py-4 border-b border-gray-200">
          <Package className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-xl font-bold text-gray-900">TrocAll</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} className="mr-3" />
                  {label}
                  {isActive && (
                    <motion.div
                      layoutId="sidebarActiveIndicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {profile?.full_name || 'Utilisateur'}
              </p>
              <p className="text-xs text-gray-500">{profile?.email}</p>
            </div>
            <button
              onClick={async () => {
                try {
                  await signOut();
                  window.location.href = '/';
                } catch (e) {
                  console.error(e);
                }
              }}
              className="ml-auto inline-flex items-center px-2 py-2 text-sm text-gray-600 hover:text-red-500 hover:bg-gray-50 rounded-lg"
              title="Se déconnecter"
            >
              <LogOut className="w-4 h-4 " />
              
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;