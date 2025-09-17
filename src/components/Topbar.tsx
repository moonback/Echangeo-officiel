import React from 'react';
import { Package, Plus, Search, MessageCircle, User, LogOut } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from './ui/Button';
import { useAuthStore } from '../store/authStore';

const Topbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = React.useState('');
  const { signOut, user } = useAuthStore();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    // reset query on route change
    setQuery('');
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2 mr-2">
          <Package className="w-5 h-5 text-brand-600" />
          <span className="font-semibold text-gray-900">TrocAll</span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-4 text-sm text-gray-700">
          <Link to="/items" className="px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">Objets</Link>
          <Link to="/neighbours" className="px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">Voisins</Link>
          <Link to="/help" className="px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">Aide</Link>
          {!user && (
            <Link to="/pro" className="px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">Pro</Link>
          )}
          {!user && (
            <Link to="/login" className="px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">Créer un compte</Link>
          )}
        </nav>

        <div className="hidden md:flex items-center flex-1 max-w-xl">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigate(`/items?search=${encodeURIComponent(query)}`);
              }}
              placeholder="Rechercher un objet…"
              className="w-full pl-9 pr-3 h-10 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden ml-auto p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Ouvrir le menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="ml-auto hidden md:flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={() => navigate('/create')} leftIcon={<Plus size={16} />}>Publier</Button>
          <Link to="/requests" className="p-2 rounded-lg hover:bg-gray-100 text-gray-600" aria-label="Échanges">
            <MessageCircle size={18} />
          </Link>
          <Link to="/me" className="p-2 rounded-lg hover:bg-gray-100 text-gray-600" aria-label="Profil">
            <User size={18} />
          </Link>
          <button
            onClick={async () => {
              try {
                await signOut();
                navigate('/');
              } catch (e) {
                console.error(e);
              }
            }}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            title="Se déconnecter"
            aria-label="Se déconnecter"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-2 gap-3">
            <Link to="/items" className="px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-800" onClick={() => setMobileOpen(false)}>Objets</Link>
            <Link to="/neighbours" className="px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-800" onClick={() => setMobileOpen(false)}>Voisins</Link>
            <Link to="/requests" className="px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-800" onClick={() => setMobileOpen(false)}>Échanges</Link>
            <Link to="/me" className="px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-800" onClick={() => setMobileOpen(false)}>Mon profil</Link>
            <Link to="/help" className="px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-800" onClick={() => setMobileOpen(false)}>Aide</Link>
            {!user && (
              <Link to="/pro" className="px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-800" onClick={() => setMobileOpen(false)}>Pro</Link>
            )}
            {!user && (
              <Link to="/login" className="px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-800" onClick={() => setMobileOpen(false)}>Créer un compte</Link>
            )}
            <button
              onClick={async () => {
                try {
                  await signOut();
                  setMobileOpen(false);
                  navigate('/');
                } catch (e) {
                  console.error(e);
                }
              }}
              className="px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-800 text-left"
            >
              Se déconnecter
            </button>
            <Button variant="primary" size="sm" onClick={() => { setMobileOpen(false); navigate('/create'); }} className="col-span-2">Publier</Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Topbar;


