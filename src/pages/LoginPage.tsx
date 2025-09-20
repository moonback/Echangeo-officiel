import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, MapPin, Users } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCommunities } from '../hooks/useCommunities';
import { supabase } from '../services/supabase';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

const signupSchema = loginSchema.extend({
  fullName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  confirmPassword: z.string(),
  selectedCommunityId: z.string().min(1, 'Veuillez sélectionner un quartier'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type LoginForm = z.infer<typeof loginSchema>;
type SignupForm = z.infer<typeof signupSchema>;

const LoginPage: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const { signIn, signUp } = useAuthStore();
  
  // Hook pour récupérer les communautés disponibles
  const { data: communities, isLoading: communitiesLoading } = useCommunities();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginForm | SignupForm>({
    resolver: zodResolver(isSignup ? signupSchema : loginSchema),
  });

  const onSubmit = async (data: LoginForm | SignupForm) => {
    setLoading(true);
    try {
      if (isSignup) {
        const signupData = data as SignupForm;
        
        // Créer le compte utilisateur
        await signUp(signupData.email, signupData.password, signupData.fullName);
        
        // Attendre que l'utilisateur soit créé et récupérer son ID
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user && signupData.selectedCommunityId) {
          // Ajouter l'utilisateur à la communauté sélectionnée
          const { error: joinError } = await supabase
            .from('community_members')
            .insert({
              community_id: signupData.selectedCommunityId,
              user_id: user.id,
              role: 'member',
              is_active: true,
              joined_at: new Date().toISOString()
            });
          
          if (joinError) {
            console.error('Erreur lors de l\'ajout à la communauté:', joinError);
          }
        }
        
        setInfoMessage("Compte créé et quartier sélectionné ! Vérifiez votre e-mail et cliquez sur le lien d'activation pour activer votre compte.");
        setIsSignup(false);
      } else {
        const loginData = data as LoginForm;
        await signIn(loginData.email, loginData.password);
      }
    } catch (error) {
      setError('email', { 
        message: error instanceof Error ? error.message : 'Une erreur est survenue' 
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50/30 via-white to-purple-50/20 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-brand-200/10 to-purple-200/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-tl from-blue-200/10 to-brand-200/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-200/10 to-brand-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 200 }}
            className="relative inline-flex items-center justify-center w-20 h-20 mb-6"
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-400 to-brand-600 opacity-20 blur-lg animate-pulse" />
            <div className="relative w-30 h-30 bg-white rounded-2xl shadow-lg shadow-brand-500/25 flex items-center justify-center p-2">
              <img 
                src="/logo.png" 
                alt="Échangeo Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </motion.div>
          
          
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-gray-600 leading-relaxed"
          >
            {isSignup 
              ? 'Créez votre compte et choisissez votre quartier pour commencer à échanger' 
              : 'Reconnectez-vous à votre espace communautaire'}
          </motion.p>
        </div>

        <motion.form 
          onSubmit={handleSubmit(onSubmit)} 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {infoMessage && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl bg-emerald-50/80 backdrop-blur-sm border border-emerald-200/50 text-emerald-800 px-4 py-3 text-sm"
            >
              {infoMessage}
            </motion.div>
          )}
          
          {isSignup && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.4 }}
            >
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                Nom complet
              </label>
              <input
                {...register('fullName' as keyof (LoginForm | SignupForm))}
                type="text"
                id="fullName"
                className="w-full px-4 py-3 border border-gray-300/60 rounded-2xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 focus:-translate-y-0.5 focus:shadow-lg transition-all duration-200"
                placeholder="Votre nom complet"
              />
              {(errors as Record<string, { message?: string }>).fullName && (
                <p className="text-red-500 text-xs mt-2">{(errors as Record<string, { message?: string }>).fullName.message}</p>
              )}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
          >
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              id="email"
              className="w-full px-4 py-3 border border-gray-300/60 rounded-2xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 focus:-translate-y-0.5 focus:shadow-lg transition-all duration-200"
              placeholder="votre@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-2">{errors.email.message}</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9, duration: 0.4 }}
          >
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="w-full px-4 py-3 pr-12 border border-gray-300/60 rounded-2xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 focus:-translate-y-0.5 focus:shadow-lg transition-all duration-200"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-brand-600 transition-colors duration-200"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-2">{errors.password.message}</p>
            )}
          </motion.div>

          {isSignup && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0, duration: 0.4 }}
            >
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <input
                {...register('confirmPassword' as keyof (LoginForm | SignupForm))}
                type="password"
                id="confirmPassword"
                className="w-full px-4 py-3 border border-gray-300/60 rounded-2xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 focus:-translate-y-0.5 focus:shadow-lg transition-all duration-200"
                placeholder="••••••••"
              />
              {(errors as Record<string, { message?: string }>).confirmPassword && (
                <p className="text-red-500 text-xs mt-2">{(errors as Record<string, { message?: string }>).confirmPassword.message}</p>
              )}
            </motion.div>
          )}

          {isSignup && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1, duration: 0.4 }}
            >
              <label htmlFor="selectedCommunityId" className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Choisir votre quartier
              </label>
              {communitiesLoading ? (
                <div className="w-full px-4 py-3 border border-gray-300/60 rounded-2xl bg-white/60 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mr-2" />
                  <span className="text-gray-600">Chargement des quartiers...</span>
                </div>
              ) : (
                <select
                  {...register('selectedCommunityId' as keyof (LoginForm | SignupForm))}
                  id="selectedCommunityId"
                  className="w-full px-4 py-3 border border-gray-300/60 rounded-2xl bg-white/60 backdrop-blur-sm focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 focus:-translate-y-0.5 focus:shadow-lg transition-all duration-200"
                >
                  <option value="">Sélectionnez votre quartier</option>
                  {communities?.map((community) => (
                    <option key={community.id} value={community.id}>
                      {community.name} • {community.city}
                    </option>
                  ))}
                </select>
              )}
              {(errors as Record<string, { message?: string }>).selectedCommunityId && (
                <p className="text-red-500 text-xs mt-2">{(errors as Record<string, { message?: string }>).selectedCommunityId.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                <Users className="w-3 h-3 inline mr-1" />
                Vous pourrez rejoindre d'autres quartiers plus tard depuis votre profil
              </p>
            </motion.div>
          )}

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg shadow-brand-500/25 hover:from-brand-700 hover:to-brand-800 hover:shadow-xl hover:shadow-brand-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Chargement...
              </>
            ) : (
              isSignup ? 'Créer un compte' : 'Se connecter'
            )}
          </motion.button>
        </motion.form>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.5 }}
          className="mt-8 text-center"
        >
          <button
            type="button"
            onClick={() => setIsSignup(!isSignup)}
            className="text-brand-600 hover:text-brand-700 font-semibold transition-colors duration-200 relative group"
          >
            <span className="relative z-10">
              {isSignup 
                ? 'Déjà un compte ? Se connecter' 
                : 'Pas encore de compte ? S\'inscrire'}
            </span>
            <div className="absolute inset-0 bg-brand-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10 scale-110" />
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
