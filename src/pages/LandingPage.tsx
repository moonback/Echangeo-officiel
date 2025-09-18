import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Search, Users, Shield, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-brand-50/30 to-purple-50/20">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-brand-200/10 to-purple-200/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-tl from-blue-200/10 to-brand-200/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      <header className="relative max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform duration-200">
            <img src="/vite.svg" alt="Échangeo" className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900 group-hover:text-brand-600 transition-colors duration-200">Échangeo</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/pro" className="text-sm font-semibold text-gray-700 hover:text-brand-600 transition-colors duration-200">Pro</Link>
          <Link to="/login"><Button variant="ghost" size="sm">Créer un compte</Button></Link>
          <Link to="/login"><Button size="sm">Se connecter</Button></Link>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-6">
        <motion.section 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, ease: "easeOut" }} 
          className="py-16 md:py-24"
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight"
              >
                Partagez et empruntez des objets{' '}
                <span className="gradient-text">entre voisins</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-xl text-gray-600 leading-relaxed"
              >
                Économisez, désencombrez et créez du lien social. Rejoignez la communauté Échangeo et découvrez une nouvelle façon de consommer.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link to="/login">
                  <Button rightIcon={<ArrowRight className="w-5 h-5" />} size="lg" className="min-w-[160px]">
                    Commencer
                  </Button>
                </Link>
                <Link to="/items">
                  <Button variant="ghost" leftIcon={<Search className="w-5 h-5" />} size="lg" className="min-w-[160px]">
                    Parcourir
                  </Button>
                </Link>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="flex items-center gap-6 text-sm text-gray-600"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-brand-600" />
                  <span className="font-medium">Données sécurisées</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-brand-600" />
                  <span className="font-medium">Communauté locale</span>
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }} 
              className="relative"
            >
              {/* Background Glow */}
              <div className="absolute -inset-8 bg-gradient-to-r from-brand-200/20 via-purple-200/20 to-blue-200/20 blur-3xl rounded-full" />
              
              <Card className="relative p-8 glass-strong">
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + i * 0.1, duration: 0.4 }}
                      className="h-28 rounded-2xl bg-gradient-to-br from-white/80 to-brand-50/80 border border-brand-100/50 shadow-sm hover:shadow-md transition-shadow duration-200"
                    />
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
        <span>© {new Date().getFullYear()} Échangeo</span>
        <Link to="/pro" className="inline-flex items-center gap-1 hover:text-gray-900">
          <Sparkles className="w-4 h-4" /> Offres Pro
        </Link>
      </footer>
    </div>
  );
};

export default LandingPage;


