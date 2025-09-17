import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Search, Users, Shield, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-brand-50">
      <header className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/vite.svg" alt="TrocAll" className="w-7 h-7" />
          <span className="font-semibold text-gray-900">TrocAll</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/pro" className="text-sm font-medium text-gray-700 hover:text-gray-900">Pro</Link>
          <Link to="/login"><Button variant="ghost" size="sm">Créer un compte</Button></Link>
          <Link to="/login"><Button size="sm">Se connecter</Button></Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4">
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="py-10 md:py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
                Partagez et empruntez des objets entre voisins
              </h1>
              <p className="mt-4 text-gray-600 text-lg">
                Économisez, désencombrez et créez du lien. Rejoignez la communauté TrocAll.
              </p>
              <div className="mt-6 flex gap-3">
                <Link to="/login"><Button rightIcon={<ArrowRight className="w-4 h-4" />}>Commencer</Button></Link>
                <Link to="/items"><Button variant="ghost" leftIcon={<Search className="w-4 h-4" />}>Parcourir</Button></Link>
              </div>
              <div className="mt-6 flex items-center gap-3 text-sm text-gray-600">
                <Shield className="w-4 h-4" /> Données sécurisées • <Users className="w-4 h-4" /> Communauté locale
              </div>
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="relative">
              <div className="absolute -inset-6 bg-brand-100/40 blur-3xl rounded-full" />
              <Card className="relative p-6 glass">
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-24 rounded-xl bg-gradient-to-br from-white/60 to-brand-50/60 border border-brand-100" />
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="py-6">
          <div className="grid md:grid-cols-3 gap-4">
            {[{ title: 'Local et responsable', desc: 'Privilégiez le partage de proximité', icon: <Users className="w-5 h-5" /> }, { title: 'Simple et rapide', desc: 'Trouvez en quelques clics', icon: <Search className="w-5 h-5" /> }, { title: 'Sûr et fiable', desc: 'Profils et messagerie intégrés', icon: <Shield className="w-5 h-5" /> }].map(card => (
              <Card key={card.title} className="p-5 glass">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center">
                    {card.icon}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{card.title}</p>
                    <p className="text-sm text-gray-600">{card.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.section>
      </main>

      <footer className="max-w-7xl mx-auto px-4 py-10 text-sm text-gray-600 flex items-center justify-between">
        <span>© {new Date().getFullYear()} TrocAll</span>
        <Link to="/pro" className="inline-flex items-center gap-1 hover:text-gray-900">
          <Sparkles className="w-4 h-4" /> Offres Pro
        </Link>
      </footer>
    </div>
  );
};

export default LandingPage;


