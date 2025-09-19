import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Search, Users, Shield, Sparkles, Heart, Star, 
  Zap, Mail, Phone, MapPin
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import DonationSection from '../components/DonationSection';

const LandingPage: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const testimonials = [
    {
      name: "Marie Dubois",
      location: "Paris 15ème",
      text: "J'ai économisé plus de 500€ cette année en empruntant des outils à mes voisins !",
      rating: 5
    },
    {
      name: "Pierre Martin",
      location: "Lyon 3ème",
      text: "Super plateforme pour créer du lien dans le quartier. Très facile à utiliser.",
      rating: 5
    },
    {
      name: "Sophie Laurent",
      location: "Marseille 6ème",
      text: "Enfin une solution pour désencombrer sans jeter. Mes objets ont une seconde vie !",
      rating: 5
    },
    {
      name: "Thomas Moreau",
      location: "Toulouse 1er",
      text: "J'ai donné mes anciens livres et récupéré des outils. C'est génial pour l'environnement !",
      rating: 5
    }
  ];

  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Communauté Locale",
      description: "Rejoignez votre quartier et découvrez vos voisins",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Économie Circulaire",
      description: "Empruntez, échangez ou donnez vos objets",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Sécurisé & Fiable",
      description: "Profils vérifiés et messagerie intégrée",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Simple & Rapide",
      description: "Trouvez ce dont vous avez besoin en quelques clics",
      color: "from-orange-500 to-orange-600"
    }
  ];

  const stats = [
    { number: "10K+", label: "Utilisateurs actifs" },
    { number: "50K+", label: "Objets partagés" },
    { number: "500+", label: "Quartiers actifs" },
    { number: "95%", label: "Satisfaction" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-brand-50/30 to-purple-50/20">
      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-brand-200/10 to-purple-200/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-tl from-blue-200/10 to-brand-200/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-pink-200/5 to-yellow-200/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>
      
      <header className="relative max-w1-2xl mx-auto px-6 py-8 flex items-center justify-between">
        <Link to="/" className="group">
          <img src="/logo.png" alt="Échangeo Logo" className="w-20 h-20 object-contain" />
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/pro" className="text-sm font-semibold text-gray-700 hover:text-brand-600 transition-colors duration-200">Pro</Link>
          <Link to="/login"><Button variant="ghost" size="sm">Créer un compte</Button></Link>
          <Link to="/login"><Button size="sm">Se connecter</Button></Link>
        </div>
      </header>

      <main className="relative max-w1-2xl mx-auto px-6">
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.6, ease: "easeOut" }} 
          className="py-16 md:py-24"
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100/50 border border-brand-200/50 text-brand-700 text-sm font-medium"
              >
                <Sparkles className="w-4 h-4" />
                Nouvelle génération de partage
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight"
              >
                Partagez, empruntez et{' '}
                <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
                  donnez
                </span>{' '}
                des objets entre voisins
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-xl text-gray-600 leading-relaxed"
              >
                Économisez, désencombrez et créez du lien social. Empruntez, échangez ou donnez vos objets à vos voisins. Rejoignez la communauté Échangeo et découvrez une nouvelle façon de consommer responsable.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link to="/login">
                  <Button rightIcon={<ArrowRight className="w-5 h-5" />} size="lg" className="min-w-[180px] shadow-lg">
                    Commencer gratuitement
                  </Button>
                </Link>
                <Link to="/items">
                  <Button variant="ghost" leftIcon={<Search className="w-5 h-5" />} size="lg" className="min-w-[180px]">
                    Parcourir les objets
                  </Button>
                </Link>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="flex items-center gap-8 text-sm text-gray-600"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-brand-600" />
                  <span className="font-medium">Données sécurisées</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-brand-600" />
                  <span className="font-medium">Communauté locale</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-brand-600" />
                  <span className="font-medium">100% gratuit</span>
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
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-gray-500 ml-4">Échangeo - Plateforme de partage</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { title: "Perceuse", user: "Marie D.", distance: "200m", color: "from-blue-500 to-blue-600", type: "Prêt" },
                      { title: "Livres", user: "Pierre M.", distance: "150m", color: "from-green-500 to-green-600", type: "Don" },
                      { title: "Vélo", user: "Sophie L.", distance: "300m", color: "from-purple-500 to-purple-600", type: "Échange" },
                      { title: "Outils", user: "Jean P.", distance: "100m", color: "from-orange-500 to-orange-600", type: "Prêt" }
                    ].map((item, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 + i * 0.1, duration: 0.4 }}
                        className="p-4 rounded-2xl bg-gradient-to-br from-white/80 to-brand-50/80 border border-brand-100/50 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${item.color} mb-3`}></div>
                        <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                        <p className="text-xs text-gray-600">{item.user}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-brand-600 font-medium">{item.distance}</p>
                          <span className={`text-xs px-2 py-1 rounded-full text-white font-medium ${
                            item.type === 'Don' ? 'bg-green-500' : 
                            item.type === 'Échange' ? 'bg-purple-500' : 'bg-blue-500'
                          }`}>
                            {item.type}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="py-16"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }} 
          className="py-20"
        >
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Pourquoi choisir Échangeo ?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-xl text-gray-600 max-w-2xl mx-auto"
            >
              Une plateforme complète pour révolutionner votre façon de consommer et de partager
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="group"
              >
                <Card className="p-6 glass hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Testimonials Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4 }} 
          className="py-20 bg-gradient-to-r from-brand-50/50 to-purple-50/50 rounded-3xl"
        >
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Ce que disent nos utilisateurs
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-xl text-gray-600"
            >
              Plus de 10 000 utilisateurs nous font confiance
            </motion.p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <Card className="p-8 glass-strong">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-lg text-gray-700 mb-6 italic">
                    "{testimonials[currentTestimonial].text}"
                  </blockquote>
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-brand-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {testimonials[currentTestimonial].name[0]}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">{testimonials[currentTestimonial].name}</div>
                      <div className="text-sm text-gray-600">{testimonials[currentTestimonial].location}</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    index === currentTestimonial ? 'bg-brand-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.section>

        {/* Donation Section */}
        <DonationSection />

        {/* CTA Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.5 }} 
          className="py-20"
        >
          <div className="text-center">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            >
              Prêt à rejoindre la communauté ?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
            >
              Commencez dès aujourd'hui et découvrez une nouvelle façon de consommer responsable. Empruntez, échangez ou donnez vos objets !
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/login">
                <Button rightIcon={<ArrowRight className="w-5 h-5" />} size="lg" className="min-w-[200px] shadow-lg">
                  Créer mon compte
                </Button>
              </Link>
              <Link to="/items">
                <Button variant="ghost" leftIcon={<Search className="w-5 h-5" />} size="lg" className="min-w-[200px]">
                  Explorer la plateforme
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="relative bg-gray-900 text-white">
        <div className="max-w1-2xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Logo & Description */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.png" alt="Échangeo Logo" className="w-12 h-12 object-contain" />
                <span className="text-2xl font-bold">Échangeo</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                La plateforme de partage qui révolutionne la consommation locale. 
                Empruntez, échangez ou donnez vos objets à vos voisins. Rejoignez une communauté engagée pour une économie plus circulaire et responsable.
              </p>
              <div className="flex gap-4">
                <button className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Liens rapides</h3>
              <ul className="space-y-3">
                <li><Link to="/items" className="text-gray-400 hover:text-white transition-colors">Objets</Link></li>
                <li><Link to="/communities" className="text-gray-400 hover:text-white transition-colors">Quartiers</Link></li>
                <li><Link to="/neighbours" className="text-gray-400 hover:text-white transition-colors">Voisins</Link></li>
                <li><Link to="/messages" className="text-gray-400 hover:text-white transition-colors">Messages</Link></li>
                <li><Link to="/help" className="text-gray-400 hover:text-white transition-colors">Aide</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Entreprise</h3>
              <ul className="space-y-3">
                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">À propos</Link></li>
                <li><Link to="/pro" className="text-gray-400 hover:text-white transition-colors">Offres Pro</Link></li>
                <li><Link to="/careers" className="text-gray-400 hover:text-white transition-colors">Carrières</Link></li>
                <li><Link to="/press" className="text-gray-400 hover:text-white transition-colors">Presse</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Échangeo. Tous droits réservés.
            </div>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                Confidentialité
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                Conditions
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-white transition-colors text-sm">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;


