import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Plus, Search, MessageCircle, User, LogOut, Menu, X, Users, HelpCircle, Star, Settings, Sparkles, Trophy, CheckCircle } from 'lucide-react';
import { Link, useNavigate, useLocation, NavLink } from 'react-router-dom';
import Button from './ui/Button';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../services/supabase';
import NotificationSystem from './NotificationSystem';
import { useNotifications } from '../hooks/useNotifications';
import { useAdminAuth } from '../hooks/useAdmin';

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

const FavoritesButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const { user } = useAuthStore();
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchCount = useCallback(async () => {
    if (!user) { setCount(0); return; }
    setLoading(true);
    try {
      const { count: c, error } = await supabase
        .from('favorites')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);
      if (error) throw error;
      setCount(typeof c === 'number' ? c : 0);
    } catch {
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchCount(); }, [fetchCount]);

  // Optionnel: abonnement Realtime si activé
  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel('favorites-count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'favorites', filter: `user_id=eq.${user.id}` }, () => {
        fetchCount();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchCount]);

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-white/70 hover:bg-white/90 text-gray-800 border border-gray-200/70 transition-colors backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
    >
      <Star size={18} className="text-amber-600" />
      <span className="text-sm font-medium">Favoris</span>
      <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full border border-amber-200/60 bg-amber-50 text-amber-700">
        {loading || count === null ? '…' : count}
      </span>
    </button>
  );
};

const Topbar: React.FC = () => {
  const navigate = useNavigate();
  const { signOut, user, profile } = useAuthStore();
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  
  // Notifications
  const { notifications, markAsRead, dismiss } = useNotifications();
  
  // Admin auth
  const { isAdmin } = useAdminAuth();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
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
    { to: '/ai-features', label: 'IA' },
    { to: '/communities', label: 'Quartiers' },
    { to: '/help', label: 'Aide' },
    ...(user ? [] : [
      { to: '/pro', label: 'Pro' },
      { to: '/login', label: 'Créer un compte' }
    ])
  ], [user]);

  const mobileNavigationLinks = useMemo(() => [
    ...navigationLinks.slice(0, 5), // Objets, Voisins, Gamification, IA, Aide
    { to: '/messages', label: 'Messages' },
    { to: '/requests', label: 'Échanges' },
    { to: '/me', label: 'Mon profil' },
    ...navigationLinks.slice(5) // Pro et Créer un compte si pas connecté
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
              to="/messages" 
              className="p-2.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500" 
              aria-label="Voir les messages"
              title="Messages"
            >
              <MessageCircle size={18} />
            </Link>
            
            <Link 
              to="/requests" 
              className="p-2.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500" 
              aria-label="Voir les échanges"
              title="Échanges"
            >
              <CheckCircle size={18} />
            </Link>
            
            <Link 
              to="/gamification" 
              className="p-2.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500" 
              aria-label="Voir les quartiers"
              title="Quartiers"
            >
              <Trophy size={18} />
            </Link>
            
            {/* Admin Panel Link - Only visible for admins */}
            {isAdmin && (
              <Link 
                to="/admin" 
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 text-red-700 border border-red-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                title="Panneau d'administration"
                aria-label="Accéder au panneau d'administration"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-sm font-medium">Admin</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 font-bold">
                  ADMIN
                </span>
              </Link>
            )}
            
            {/* Système de notifications */}
            <NotificationSystem
              notifications={notifications}
              onMarkAsRead={markAsRead}
              onDismiss={dismiss}
            />
            
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
              className="absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white/90 backdrop-blur-xl shadow-2xl border-r border-gray-200 rounded-r-3xl flex flex-col overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Menu de navigation"
            >
              {/* Header profil */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-brand-700" />
                <div className="relative flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold">
                      {(profile?.full_name || user?.email || 'U')?.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="text-white">
                      <div className="text-sm font-semibold leading-none">{profile?.full_name || 'Mon compte'}</div>
                      <div className="text-xs opacity-90">{profile?.email || user?.email || ''}</div>
                      <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[11px] text-white/90">
                        <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        {isOnline ? 'Connecté' : 'Hors ligne'}
                      </div>
                    </div>
                  </div>
                  <button
                    className="p-2 rounded-lg hover:bg-white/10 text-white/90 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                    onClick={closeMobile}
                    aria-label="Fermer le menu"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Navigation mobile */}
              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {mobileNavigationLinks.map(({ to, label }) => {
                  const Icon = (
                    to === '/items' ? Search :
                    to === '/neighbours' ? Users :
                    to === '/communities' ? Users :
                    to === '/gamification' ? Trophy :
                    to === '/ai-features' ? Sparkles :
                    to === '/help' ? HelpCircle :
                    to === '/requests' ? MessageCircle :
                    to === '/me' ? User :
                    to === '/pro' ? Package :
                    User
                  );
                  return (
                    <NavLink
                      key={to}
                      to={to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-3 rounded-xl relative transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                          isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-800 hover:bg-gray-50'
                        }`
                      }
                      onClick={closeMobile}
                    >
                      {({ isActive }) => (
                        <>
                          <Icon size={18} className={isActive ? 'text-brand-700' : 'text-gray-500'} />
                          <span className="text-sm font-medium">{label}</span>
                          {isActive && (
                            <motion.div
                              layoutId="mobileNavActiveIndicator"
                              className="absolute left-1 top-1 bottom-1 w-1 bg-brand-600 rounded-full"
                              initial={false}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </nav>

              {/* Raccourcis */}
              <div className="px-3 pt-1 pb-2">
                <div className="text-[12px] text-gray-500 mb-1.5 px-1">Raccourcis</div>
                <div className="space-y-2">
                  <button
                    onClick={() => { closeMobile(); navigate('/items'); }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-white/70 hover:bg-white/90 text-gray-800 border border-gray-200/70 transition-colors backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <Package size={18} className="text-brand-600" />
                    <span className="text-sm font-medium">Mes objets</span>
                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full border border-emerald-200/60 bg-emerald-50 text-emerald-700">Nouveau</span>
                  </button>
                  <FavoritesButton onClick={() => { closeMobile(); navigate('/items?favorites=1'); }} />
                  
                  {/* Admin Panel Link - Only visible for admins */}
                  {isAdmin && (
                    <button
                      onClick={() => { closeMobile(); navigate('/admin'); }}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 text-gray-800 border border-red-200/70 transition-all duration-200 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <svg className="w-[18px] h-[18px] text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span className="text-sm font-medium">Administration</span>
                      <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full border border-red-200/60 bg-red-100 text-red-700 font-medium">
                        ADMIN
                      </span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => { closeMobile(); navigate('/settings'); }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-white/70 hover:bg-white/90 text-gray-800 border border-gray-200/70 transition-colors backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <Settings size={18} className="text-gray-600" />
                    <span className="text-sm font-medium">Paramètres</span>
                    <span className="ml-auto inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border border-emerald-200/60 bg-emerald-50 text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Actif
                    </span>
                  </button>
                </div>
              </div>

              {/* Actions du menu mobile */}
              <div className="p-4 border-t border-gray-100 space-y-3 bg-gray-50/60" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
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
                  className="w-full px-4 py-3 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-white text-gray-800 text-left border border-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Se déconnecter
                </button>

                <div className="text-[11px] text-gray-400 text-center pt-1">TrocAll • Interface mobile</div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Topbar;
