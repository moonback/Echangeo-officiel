import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Plus, Search, MessageCircle, User, LogOut, Menu, X } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from './ui/Button';
import { useAuthStore } from '../store/authStore';

// Hook personnalisé pour gérer la recherche
const useSearch = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = useCallback((searchQuery: string) => {
    if (searchQuery.trim()) {
      navigate(`/items?search=${encodeURIComponent(searchQuery)}`);
    }
  }, [navigate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  }, [query, handleSearch]);

  // Reset query on route change
  useEffect(() => {
    setQuery('');
  }, [location.pathname]);

  return { query, setQuery, handleKeyDown, handleSearch };
};

// Hook pour gérer l'état mobile
const useMobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);
  const open = useCallback(() => setIsOpen(true), []);

  // Fermer le menu sur Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Empêcher le scroll du body
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, close]);

  return { isOpen, toggle, close, open };
};

const Topbar: React.FC = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuthStore();
  const { query, setQuery, handleKeyDown } = useSearch();
  const { isOpen: mobileOpen, toggle: toggleMobile, close: closeMobile } = useMobileMenu();

  // Mémoriser les actions pour éviter les re-renders
  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      closeMobile();
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Ici vous pourriez ajouter un toast d'erreur
    }
  }, [signOut, closeMobile, navigate]);

  const handleCreateItem = useCallback(() => {
    closeMobile();
    navigate('/create');
  }, [closeMobile, navigate]);

  // Navigation links mémorisés
  const navigationLinks = useMemo(() => [
    { to: '/items', label: 'Objets' },
    { to: '/neighbours', label: 'Voisins' },
    { to: '/help', label: 'Aide' },
    ...(user ? [] : [
      { to: '/pro', label: 'Pro' },
      { to: '/login', label: 'Créer un compte' }
    ])
  ], [user]);

  const mobileNavigationLinks = useMemo(() => [
    ...navigationLinks.slice(0, 3), // Objets, Voisins, Aide
    { to: '/requests', label: 'Échanges' },
    { to: '/me', label: 'Mon profil' },
    ...navigationLinks.slice(3) // Pro et Créer un compte si pas connecté
  ], [navigationLinks]);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 mr-4 group"
            aria-label="Retour à l'accueil"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform duration-200">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900 group-hover:text-brand-600 transition-colors duration-200">TrocAll</span>
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center gap-1 text-sm text-gray-700">
            {navigationLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Barre de recherche desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Rechercher un objet…"
                className="w-full pl-9 pr-4 h-10 rounded-xl border border-gray-300 
                         focus:ring-2 focus:ring-brand-500 focus:border-transparent 
                         transition-colors bg-white/80 backdrop-blur-sm
                         placeholder:text-gray-500"
                aria-label="Rechercher un objet"
              />
            </div>
          </div>

          {/* Actions desktop */}
          <div className="hidden md:flex items-center gap-1 ml-auto">
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => navigate('/create')} 
              leftIcon={<Plus size={16} />}
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              Publier
            </Button>
            
            <Link 
              to="/requests" 
              className="p-2.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500" 
              aria-label="Voir les échanges"
            >
              <MessageCircle size={18} />
            </Link>
            
            <Link 
              to="/me" 
              className="p-2.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500" 
              aria-label="Mon profil"
            >
              <User size={18} />
            </Link>
            
            <button
              onClick={handleSignOut}
              className="p-2.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
              title="Se déconnecter"
              aria-label="Se déconnecter"
            >
              <LogOut size={18} />
            </button>
          </div>

          {/* Bouton menu mobile */}
          <button
            className="md:hidden ml-auto p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
            onClick={toggleMobile}
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Barre de recherche mobile */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Rechercher un objet…"
              className="w-full pl-9 pr-4 h-10 rounded-xl border border-gray-300 
                       focus:ring-2 focus:ring-brand-500 focus:border-transparent 
                       transition-colors bg-white/80 backdrop-blur-sm
                       placeholder:text-gray-500"
              aria-label="Rechercher un objet"
            />
          </div>
        </div>
      </header>

      {/* Menu mobile avec AnimatePresence pour une meilleure gestion des animations */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            {/* Backdrop avec animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={closeMobile}
              aria-label="Fermer le menu"
            />
            
            {/* Panel avec animation améliorée */}
            <motion.aside
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl border-r border-gray-200 flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-label="Menu de navigation"
            >
              {/* Header du menu mobile */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-brand-600" />
                  <span className="font-semibold text-gray-900">TrocAll</span>
                </div>
                <button
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
                  onClick={closeMobile}
                  aria-label="Fermer le menu"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation mobile */}
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {mobileNavigationLinks.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className="block px-3 py-3 rounded-lg hover:bg-gray-100 text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
                    onClick={closeMobile}
                  >
                    {label}
                  </Link>
                ))}
              </nav>

              {/* Actions du menu mobile */}
              <div className="p-4 border-t border-gray-100 space-y-3 bg-gray-50/50">
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={handleCreateItem}
                  className="w-full shadow-sm"
                  leftIcon={<Plus size={16} />}
                >
                  Publier un objet
                </Button>
                
                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-3 rounded-lg bg-white hover:bg-gray-50 text-gray-800 text-left border border-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Se déconnecter
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Topbar;