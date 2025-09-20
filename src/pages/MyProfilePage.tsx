import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Edit3, Save, X, CheckCircle, Mail, Phone, MapPin, Shield, Star, Calendar, Trophy, Award, Users, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTransactions } from '../hooks/useProfiles';
import { useGamificationStats, useUserLevel, useUserBadges } from '../hooks/useGamification';
import { useUserSignupCommunity } from '../hooks/useCommunities';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import Card from '../components/ui/Card';
import EmptyState from '../components/EmptyState';
import ReputationDisplay from '../components/ReputationDisplay';
import UserCommunities from '../components/UserCommunities';
import { supabase } from '../services/supabase';

// Types pour les interfaces
interface TabConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}

interface RatingData {
  score: number;
}

interface UserBadgeData {
  badge_slug: string;
  badge_label: string;
}

const profileSchema = z.object({
  full_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  bio: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  latitude: z.preprocess((v) => (v === '' || v === undefined ? undefined : Number(v)), z.number().min(-90).max(90).optional()),
  longitude: z.preprocess((v) => (v === '' || v === undefined ? undefined : Number(v)), z.number().min(-180).max(180).optional()),
});

type ProfileForm = z.infer<typeof profileSchema>;

const MyProfilePage: React.FC = () => {
  const { profile, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Gamification hooks
  const { data: gamificationStats } = useGamificationStats();
  const { data: userLevel } = useUserLevel();
  const { data: userBadges } = useUserBadges();
  const [avatarUploading, setAvatarUploading] = useState(false);
  const { data: transactions } = useTransactions(profile?.id);
  
  // Quartier d'inscription
  const { data: signupCommunity } = useUserSignupCommunity(profile?.id);
  const [activeTab, setActiveTab] = useState<'profil' | 'gamification' | 'transactions' | 'communities' | 'parametres'>('profil');
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [itemsCount, setItemsCount] = useState<number>(0);
  const [completedBorrows, setCompletedBorrows] = useState<number>(0);
  const [averageItemRating, setAverageItemRating] = useState<number | null>(null);
  const [ratingsCount, setRatingsCount] = useState<number>(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      bio: profile?.bio || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
      latitude: profile?.latitude || undefined,
      longitude: profile?.longitude || undefined,
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    setLoading(true);
    try {
      await updateProfile(data);
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setValue('full_name', profile?.full_name || '');
    setValue('bio', profile?.bio || '');
    setValue('phone', profile?.phone || '');
    setValue('address', profile?.address || '');
    setValue('latitude', profile?.latitude || undefined);
    setValue('longitude', profile?.longitude || undefined);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile?.id) return;

    setAvatarUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await updateProfile({ avatar_url: publicUrl });
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'avatar:', error);
    } finally {
      setAvatarUploading(false);
    }
  };

  React.useEffect(() => {
    if (profile?.id) {
      // Charger les statistiques des objets
      supabase
        .from('items')
        .select('id', { count: 'exact' })
        .eq('owner_id', profile.id)
        .then(({ count }) => setItemsCount(count || 0));

      // Charger les emprunts complétés
      supabase
        .from('requests')
        .select('id', { count: 'exact' })
        .eq('requester_id', profile.id)
        .eq('status', 'completed')
        .then(({ count }) => setCompletedBorrows(count || 0));

      // Charger la note moyenne des objets
      supabase
        .from('item_ratings')
        .select('score')
        .then(({ data }) => {
          if (data && data.length > 0) {
            const total = data.reduce((sum, rating) => sum + (rating as RatingData).score, 0);
            setAverageItemRating(total / data.length);
            setRatingsCount(data.length);
          }
        });
    }
  }, [profile?.id]);

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/40 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/40 relative overflow-hidden">
      {/* Background Ultra-Moderne */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Grille subtile */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px] opacity-30" />
        
        {/* Dégradés radiaux animés */}
        <motion.div 
          className="absolute top-10 left-10 w-[600px] h-[600px] bg-gradient-radial from-brand-200/20 via-brand-300/10 to-transparent rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-gradient-radial from-emerald-200/20 via-teal-300/10 to-transparent rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4],
            x: [0, -40, 0],
            y: [0, 20, 0]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        
        {/* Éléments flottants */}
        <motion.div 
          className="absolute top-20 right-1/4 w-4 h-4 bg-brand-400/40 rounded-full"
          animate={{ 
            y: [0, -20, 0],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/3 left-1/3 w-6 h-6 bg-emerald-400/30 rounded-full"
          animate={{ 
            y: [0, 15, 0],
            x: [0, 10, 0],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Header Ultra-Moderne */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-12"
          >
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Effet de glow animé */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-brand-400/20 via-brand-500/10 to-emerald-400/20 rounded-3xl blur-xl"
                animate={{ 
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Carte principale avec glassmorphism */}
              <Card className="relative p-0 border-0 bg-white/80 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-3xl overflow-hidden">
                <div className="relative bg-gradient-to-br from-brand-50/80 via-white/60 to-purple-50/40 p-6 md:p-8">
                  {/* Background Decorations */}
                  <motion.div 
                    className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-200/20 to-purple-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ 
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.div 
                    className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-200/20 to-brand-200/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"
                    animate={{ 
                      scale: [1.2, 1, 1.2],
                      opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ 
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 2
                    }}
                  />

                  <div className="relative flex items-start md:items-center gap-6 md:gap-8 flex-col md:flex-row">
                    {/* Avatar Ultra-Moderne avec Glow */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                      className="relative group"
                    >
                      {/* Effet de glow multi-couches */}
                      <motion.div 
                        className="absolute -inset-4 rounded-full bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 opacity-20 blur-xl"
                        animate={{ 
                          scale: [1, 1.1, 1],
                          opacity: [0.2, 0.4, 0.2]
                        }}
                        transition={{ 
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      <motion.div 
                        className="absolute -inset-3 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 opacity-30 blur-lg"
                        animate={{ 
                          scale: [1.1, 1, 1.1],
                          opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{ 
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.5
                        }}
                      />
                      <motion.div 
                        className="absolute -inset-2 rounded-full bg-gradient-to-r from-emerald-400 to-brand-500 opacity-40 blur-md"
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.4, 0.6, 0.4]
                        }}
                        transition={{ 
                          duration: 5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 1
                        }}
                      />
                      
                      <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full bg-white border-4 border-white shadow-2xl overflow-hidden group-hover:shadow-3xl transition-shadow duration-300">
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
                            <span className="text-brand-600 text-3xl font-bold">
                              {(profile.full_name || profile.email || '?').slice(0,1).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Bouton changer avatar */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={avatarUploading}
                        className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-all duration-300"
                      >
                        {avatarUploading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        ) : (
                          <Edit3 className="w-4 h-4" />
                        )}
                      </motion.button>
                    </motion.div>

                    <div className="flex-1 min-w-0">
                      <motion.h1 
                        className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 via-brand-600 to-slate-900 bg-clip-text text-transparent leading-tight"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                      >
                        {profile.full_name || profile.email}
                      </motion.h1>
                      
                      {/* Informations du profil */}
                      <div className="flex flex-wrap gap-3 mb-6">
                        {profile.email && (
                          <motion.div 
                            className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-xl px-4 py-2 rounded-2xl border border-slate-200/50 shadow-lg"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            whileHover={{ scale: 1.05 }}
                          >
                            <div className="p-1.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                              <Mail className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-semibold text-slate-700">{profile.email}</span>
                          </motion.div>
                        )}
                        
                        {profile.phone && (
                          <motion.div 
                            className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-xl px-4 py-2 rounded-2xl border border-slate-200/50 shadow-lg"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 }}
                            whileHover={{ scale: 1.05 }}
                          >
                            <div className="p-1.5 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                              <Phone className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-semibold text-slate-700">{profile.phone}</span>
                          </motion.div>
                        )}
                        
                        {profile.address && (
                          <motion.div 
                            className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-xl px-4 py-2 rounded-2xl border border-slate-200/50 shadow-lg"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.0 }}
                            whileHover={{ scale: 1.05 }}
                          >
                            <div className="p-1.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
                              <MapPin className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-semibold text-slate-700">{profile.address}</span>
                          </motion.div>
                        )}
                      </div>

                      {/* Barre de progression du profil */}
                      <motion.div 
                        className="mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.1 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-slate-700">Complétude du profil</span>
                          <span className="text-sm font-bold text-brand-600">75%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: "75%" }}
                            transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
                          />
                        </div>
                      </motion.div>
                    </div>

                    <motion.div 
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.3 }}
                    >
                      {!isEditing ? (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button 
                            onClick={() => setIsEditing(true)}
                            leftIcon={<Edit3 size={18} />}
                            className="shadow-lg hover:shadow-xl font-semibold px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white"
                          >
                            Modifier
                          </Button>
                        </motion.div>
                      ) : (
                        <div className="flex gap-3">
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button 
                              onClick={handleSubmit(onSubmit)}
                              disabled={loading}
                              leftIcon={loading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Save size={18} />}
                              className="shadow-lg hover:shadow-xl font-semibold px-6 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                            >
                              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button 
                              onClick={handleCancel}
                              variant="secondary"
                              leftIcon={<X size={18} />}
                              className="shadow-lg hover:shadow-xl font-semibold px-6 py-3 rounded-2xl"
                            >
                              Annuler
                            </Button>
                          </motion.div>
                        </div>
                      )}
                    </motion.div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>

          {/* Onglets Ultra-Modernes */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="mb-8"
          >
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              {/* Effet de glow */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-brand-400/20 via-brand-500/10 to-emerald-400/20 rounded-3xl blur-xl opacity-0 hover:opacity-100 transition-opacity duration-500"
              />
              
              <div className="relative flex gap-2 p-2 rounded-3xl bg-white/90 backdrop-blur-xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 w-fit">
                {[
                  { id: 'profil', label: 'Profil', icon: User, gradient: 'from-blue-500 to-indigo-600' },
                  { id: 'gamification', label: 'Gamification', icon: Trophy, gradient: 'from-amber-500 to-orange-600' },
                  { id: 'transactions', label: 'Transactions', icon: Calendar, gradient: 'from-emerald-500 to-teal-600' },
                  { id: 'communities', label: 'Quartiers', icon: Users, gradient: 'from-purple-500 to-pink-600' },
                  { id: 'parametres', label: 'Paramètres', icon: Shield, gradient: 'from-slate-500 to-gray-600' },
                ].map((tab: TabConfig, index) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'profil' | 'gamification' | 'transactions' | 'communities' | 'parametres')}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3 + index * 0.1 }}
                    className={`px-5 py-3 text-sm font-semibold rounded-2xl transition-all duration-300 flex items-center gap-3 ${
                      activeTab === tab.id 
                        ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg` 
                        : 'text-slate-700 hover:bg-brand-50/80 hover:text-brand-600'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Tab content: Profil */}
          {activeTab === 'profil' && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.6 }}
            >
              {isEditing ? (
                <Card className="p-8 bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Nom complet</label>
                        <Input
                          {...register('full_name')}
                          error={errors.full_name?.message}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Téléphone</label>
                        <Input
                          {...register('phone')}
                          error={errors.phone?.message}
                          className="w-full"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Adresse</label>
                      <Input
                        {...register('address')}
                        error={errors.address?.message}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Bio</label>
                      <TextArea
                        {...register('bio')}
                        error={errors.bio?.message}
                        className="w-full"
                        rows={4}
                      />
                    </div>
                  </form>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Carte Informations personnelles */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card className="p-6 bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl">
                      <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        Informations personnelles
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm font-semibold text-slate-600">Nom complet</span>
                          <p className="text-slate-900 font-medium">{profile.full_name || 'Non renseigné'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-slate-600">Email</span>
                          <p className="text-slate-900 font-medium">{profile.email}</p>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-slate-600">Téléphone</span>
                          <p className="text-slate-900 font-medium">{profile.phone || 'Non renseigné'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-slate-600">Adresse</span>
                          <p className="text-slate-900 font-medium">{profile.address || 'Non renseignée'}</p>
                        </div>
                        {signupCommunity && (
                          <div>
                            <span className="text-sm font-semibold text-slate-600">Quartier d'inscription</span>
                            <p className="text-slate-900 font-medium">{signupCommunity.name}</p>
                            {signupCommunity.city && (
                              <p className="text-sm text-slate-600">{signupCommunity.city}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>

                  {/* Carte Confiance & Statistiques */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.6 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card className="p-6 bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl">
                      <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        Confiance & Statistiques
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200/50">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                              <Award className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">Objets publiés</p>
                              <p className="text-sm text-slate-600">{itemsCount} objets</p>
                            </div>
                          </div>
                          <span className="text-2xl font-bold text-blue-600">{itemsCount}</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl border border-green-200/50">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                              <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">Emprunts complétés</p>
                              <p className="text-sm text-slate-600">{completedBorrows} emprunts</p>
                            </div>
                          </div>
                          <span className="text-2xl font-bold text-green-600">{completedBorrows}</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl border border-amber-200/50">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg">
                              <Star className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">Note moyenne</p>
                              <p className="text-sm text-slate-600">{ratingsCount} avis</p>
                            </div>
                          </div>
                          <span className="text-2xl font-bold text-amber-600">
                            {averageItemRating ? averageItemRating.toFixed(1) : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}

          {/* Tab content: Gamification */}
          {activeTab === 'gamification' && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              {gamificationStats ? (
                <ReputationDisplay
                  reputation={{
                    overall_score: gamificationStats.overall_score,
                    ratings_count: gamificationStats.ratings_count,
                    avg_communication: gamificationStats.overall_score,
                    avg_punctuality: gamificationStats.overall_score,
                    avg_care: gamificationStats.overall_score,
                  }}
                  badges={userBadges?.map(ub => ({
                    badge_slug: (ub as unknown as UserBadgeData).badge_slug,
                    badge_label: (ub as unknown as UserBadgeData).badge_label,
                  })) || []}
                  level={userLevel ? {
                    level: userLevel.level,
                    points: userLevel.points,
                    title: userLevel.title,
                  } : undefined}
                  stats={{
                    completed_lends: gamificationStats.completed_lends,
                    completed_borrows: gamificationStats.completed_borrows,
                    total_transactions: gamificationStats.total_transactions,
                  }}
                />
              ) : (
                <Card className="p-8 text-center">
                  <EmptyState
                    icon={<Trophy className="w-16 h-16 mx-auto text-brand-500" />}
                    title="Aucune donnée de gamification"
                    description="Vos statistiques de gamification apparaîtront ici une fois que vous aurez commencé à utiliser la plateforme."
                  />
                </Card>
              )}
            </motion.div>
          )}

          {/* Tab content: Transactions */}
          {activeTab === 'transactions' && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              {transactions && transactions.length > 0 ? (
                <Card className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Historique des transactions</h3>
                  <ul className="space-y-4">
                    {transactions.map((transaction) => (
                      <li key={transaction.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-slate-900">{transaction.item?.title}</p>
                          <p className="text-sm text-slate-600">{new Date(transaction.created_at).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ) : (
                <Card className="p-8 text-center">
                  <EmptyState
                    icon={<Calendar className="w-16 h-16 mx-auto text-brand-500" />}
                    title="Aucune transaction"
                    description="Vos transactions apparaîtront ici une fois que vous aurez commencé à emprunter ou prêter des objets."
                  />
                </Card>
              )}
            </motion.div>
          )}

          {/* Tab content: Communities */}
          {activeTab === 'communities' && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <UserCommunities userId={profile.id} />
            </motion.div>
          )}

          {/* Tab content: Paramètres */}
          {activeTab === 'parametres' && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Confidentialité</h3>
                  <p className="text-gray-600 mb-4">Gérez vos paramètres de confidentialité et de visibilité.</p>
                  <Button variant="secondary" size="sm">
                    Gérer la confidentialité
                  </Button>
                </Card>
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Préférences</h3>
                  <p className="text-gray-600 mb-4">Personnalisez votre expérience sur la plateforme.</p>
                  <Button variant="secondary" size="sm">
                    Modifier les préférences
                  </Button>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Input caché pour l'upload d'avatar */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default MyProfilePage;