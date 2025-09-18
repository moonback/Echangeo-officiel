import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, MessageCircle, User, LogOut, Menu, X, Users, 
  HelpCircle, Star, Settings, Sparkles, Trophy, CheckCircle, ChevronDown, Shield
} from 'lucide-react';
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

  const handleSearch = useCallback((searchQuery: string, callback?: () => void) => {
    if (searchQuery.trim()) {
      navigate(`/items?search=${encodeURIComponent(searchQuery)}`);
      if (callback) callback();
    }
  }, [navigate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>, callback?: () => void) => {
    if (e.key === 'Enter') {
      handleSearch(query, callback);
    }
  }, [query, handleSearch]);
  
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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return { isOpen, toggle, close };
};

// Hook pour compter les favoris
const useFavoritesCount = () => {
    const { user } = useAuthStore();
    const [count, setCount] = useState<number | null>(null);

    const fetchCount = useCallback(async () => {
        if (!user) { setCount(0); return; }
        try {
            const { count: c, error } = await supabase
                .from('favorites')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', user.id);
            if (error) throw error;
            setCount(c);
        } catch {
            setCount(0);
        }
    }, [user]);

    useEffect(() => { fetchCount(); }, [fetchCount]);

    useEffect(() => {
        if (!user) return;
        const channel = supabase.channel(`favorites-count-${user.id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'favorites', filter: `user_id=eq.${user.id}` }, fetchCount)
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [user, fetchCount]);

    return count;
};

interface UserMenuItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  badge?: number | null;
  special?: boolean;
}

interface MobileNavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  special?: boolean;
}

const Topbar: React.FC = () => {
  const navigate = useNavigate();
  const { signOut, user, profile } = useAuthStore();
  
  const { notifications, markAsRead, dismiss } = useNotifications();
  const { isAdmin } = useAdminAuth();
  const { query, setQuery, handleKeyDown } = useSearch();
  const { isOpen: mobileOpen, toggle: toggleMobile, close: closeMobile } = useMobileMenu();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const favoritesCount = useFavoritesCount();

  const handleSignOut = useCallback(async () => {
    await signOut();
    closeMobile();
    navigate('/');
  }, [signOut, closeMobile, navigate]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const mainNavLinks = useMemo(() => [
    { to: '/items', label: 'Objets' },
    { to: '/communities', label: 'Quartiers' },
    { to: '/neighbours', label: 'Voisins' },
  ], []);

  const UserMenu = () => (
    <div className="relative" ref={userMenuRef}>
      <button onClick={() => setIsUserMenuOpen(p => !p)} className="flex items-center gap-2 rounded-full p-1 pr-3 hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center text-white font-bold">
          {(profile?.full_name || user?.email || 'U')?.slice(0, 1).toUpperCase()}
        </div>
        <span className="text-sm font-medium text-gray-700 hidden lg:block">{profile?.full_name || 'Mon Compte'}</span>
        <ChevronDown size={16} className={`text-gray-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isUserMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden z-50"
          >
            <div className="p-2">
              <div className="flex items-center gap-3 p-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center text-white font-bold text-lg">
                  {(profile?.full_name || user?.email || 'U')?.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{profile?.full_name}</div>
                  <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                </div>
              </div>
              <div className="h-px bg-gray-100 my-1" />
              <UserMenuItem to="/me" icon={User} label="Mon Profil" />
              <UserMenuItem to="/items?favorites=1" icon={Star} label="Favoris" badge={favoritesCount} />
              <UserMenuItem to="/gamification" icon={Trophy} label="Récompenses" />
              <UserMenuItem to="/ai-features" icon={Sparkles} label="Fonctionnalités IA" />
              {isAdmin && <UserMenuItem to="/admin" icon={Shield} label="Panel Admin" special />}
              <div className="h-px bg-gray-100 my-1" />
              <UserMenuItem to="/settings" icon={Settings} label="Paramètres" />
              <UserMenuItem to="/help" icon={HelpCircle} label="Aide & Support" />
              <div className="h-px bg-gray-100 my-1" />
              <button onClick={handleSignOut} className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors">
                <LogOut size={16} />
                <span>Se déconnecter</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const UserMenuItem = ({ to, icon: Icon, label, badge, special = false }: UserMenuItemProps) => (
    <Link to={to} onClick={() => setIsUserMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${special ? 'text-red-700 bg-red-50/50 hover:bg-red-100/70' : 'text-gray-700 hover:bg-gray-50'}`}>
      <Icon size={16} className={special ? 'text-red-700' : 'text-gray-500'} />
      <span className="font-medium">{label}</span>
      {badge !== null && badge !== undefined && (
        <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200/50">{badge}</span>
      )}
    </Link>
  );

  const MobileMenu = () => (
    <AnimatePresence>
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeMobile} />
          <motion.aside
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute left-0 top-0 h-full w-full max-w-xs bg-white flex flex-col"
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <Link to="/" onClick={closeMobile} className="group">
                <img 
                  src="/logo.png" 
                  alt="Échangeo Logo" 
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    // Fallback si l'image n'existe pas
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="w-12 h-12 bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center hidden">
                  <span className="text-white font-bold text-base">T</span>
                </div>
              </Link>
              <button onClick={closeMobile} className="p-2 rounded-lg hover:bg-gray-100"><X size={20} /></button>
            </div>
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                <MobileNavItem to="/items" icon={Search} label="Objets" />
                <MobileNavItem to="/communities" icon={Users} label="Quartiers" />
                <MobileNavItem to="/neighbours" icon={Users} label="Voisins" />
                <MobileNavItem to="/messages" icon={MessageCircle} label="Messages" />
                <MobileNavItem to="/requests" icon={CheckCircle} label="Échanges" />
                <MobileNavItem to="/me" icon={User} label="Mon Profil" />
                <MobileNavItem to="/gamification" icon={Trophy} label="Récompenses" />
                <MobileNavItem to="/ai-features" icon={Sparkles} label="Fonctionnalités IA" />
                <div className="h-px bg-gray-200 my-2" />
                {isAdmin && <MobileNavItem to="/admin" icon={Shield} label="Panel Admin" special />}
                <MobileNavItem to="/settings" icon={Settings} label="Paramètres" />
                <MobileNavItem to="/help" icon={HelpCircle} label="Aide" />
            </nav>
            <div className="p-4 border-t border-gray-200 space-y-2">
                <Button variant="primary" onClick={() => { closeMobile(); navigate('/create'); }} leftIcon={<Plus size={16}/>} className="w-full">Publier un objet</Button>
                <Button variant="secondary" onClick={handleSignOut} leftIcon={<LogOut size={16}/>} className="w-full">Se déconnecter</Button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );

  const MobileNavItem = ({ to, icon: Icon, label, special=false }: MobileNavItemProps) => (
    <NavLink 
      to={to} 
      onClick={closeMobile} 
      className={({ isActive }) => 
        `flex items-center gap-4 p-3 rounded-lg text-sm font-medium transition-colors ${
          isActive 
            ? 'bg-brand-50 text-brand-700' 
            : (special ? 'text-red-700 hover:bg-red-50' : 'hover:bg-gray-100 text-gray-800')
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={20} className={isActive ? 'text-brand-700' : (special ? 'text-red-700' : 'text-gray-500')} />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );

  const SearchBar = () => (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="bg-white border-b border-gray-200 overflow-hidden"
        >
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                          type="search"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, () => setIsSearchOpen(false))}
                          placeholder="Rechercher un objet..."
                          className="w-full pl-10 pr-4 h-10 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 bg-white"
                          autoFocus
                      />
                  </div>
                  <button onClick={() => setIsSearchOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                    <X size={20} />
                  </button>
              </div>
            </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-12xl mx-auto px-4 h-16">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between h-full gap-4">
            <div className="flex items-center gap-6">
              <Link to="/" className="group">
                <img 
                  src="/logo.png" 
                  alt="Échangeo Logo" 
                  className="w-20 h-20 object-contain group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    // Fallback si l'image n'existe pas
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center group-hover:scale-105 transition-transform hidden">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
              </Link>
              <nav className="flex items-center gap-1 text-sm text-gray-700">
                {mainNavLinks.map(({ to, label }) => (
                  <NavLink key={to} to={to} className={({isActive}) => `px-3 py-2 rounded-lg transition-colors ${isActive ? 'font-semibold text-brand-600 bg-brand-50' : 'hover:bg-gray-100'}`}>
                    {label}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="flex-1 flex justify-end">
                <button onClick={() => setIsSearchOpen(true)} className="p-2.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                    <Search size={18} />
                </button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="primary" size="sm" onClick={() => navigate('/create')} leftIcon={<Plus size={16} />}>Publier</Button>
              <Link to="/messages" title="Messages" className="p-2.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"><MessageCircle size={18} /></Link>
              <NotificationSystem notifications={notifications} onMarkAsRead={markAsRead} onDismiss={dismiss} />
              {user ? (
                <UserMenu />
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => navigate('/login')}>Connexion</Button>
                  <Button variant="primary" size="sm" onClick={() => navigate('/register')}>S'inscrire</Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between h-full">
              <Link to="/" className="group">
                <img 
                  src="/logo.png" 
                  alt="Échangeo Logo" 
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    // Fallback si l'image n'existe pas
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="w-12 h-12 bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center hidden">
                  <span className="text-white font-bold text-base">T</span>
                </div>
              </Link>
              <div className="flex items-center gap-1">
                  <button onClick={() => setIsSearchOpen(true)} className="p-2.5 rounded-lg hover:bg-gray-100 text-gray-600"><Search size={20} /></button>
                  <button onClick={toggleMobile} className="p-2.5 rounded-lg hover:bg-gray-100 text-gray-600"><Menu size={20} /></button>
              </div>
          </div>
        </div>
        
        {/* Search Bar - maintenant intégré dans le header pour toutes les tailles d'écran */}
        <SearchBar />
      </header>

      <MobileMenu />
    </>
  );
};

export default Topbar;
