import React from 'react';
import { Package, Plus, Search, MessageCircle, User, LogOut } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from './ui/Button';
import { useAuthStore } from '../store/authStore';

const Topbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = React.useState('');
  const { signOut } = useAuthStore();

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

        <div className="ml-auto flex items-center gap-2">
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
    </header>
  );
};

export default Topbar;


