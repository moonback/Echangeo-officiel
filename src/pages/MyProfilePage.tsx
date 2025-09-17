import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Edit3, Save, X, CheckCircle, Clock, XCircle, ArrowRight, Mail, Phone, MapPin, Shield, Star, Calendar, Trophy, Award, Users } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTransactions } from '../hooks/useProfiles';
import { useGamificationStats, useUserLevel, useUserBadges } from '../hooks/useGamification';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import Card from '../components/ui/Card';
import EmptyState from '../components/EmptyState';
import ReputationDisplay from '../components/ReputationDisplay';
import UserCommunities from '../components/UserCommunities';
import { supabase } from '../services/supabase';

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
  const [activeTab, setActiveTab] = useState<'profil' | 'gamification' | 'transactions' | 'communities' | 'parametres'>('profil');
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [itemsCount, setItemsCount] = useState<number>(0);
  const [completedBorrows, setCompletedBorrows] = useState<number>(0);
  const [averageItemRating, setAverageItemRating] = useState<number | null>(null);
  const [ratingsCount, setRatingsCount] = useState<number>(0);
  const [overallReputation, setOverallReputation] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      bio: profile?.bio || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
      latitude: (profile as any)?.latitude as any,
      longitude: (profile as any)?.longitude as any,
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    setLoading(true);
    try {
      await updateProfile(data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
    setLoading(false);
  };

  const handleAvatarSelect = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const sanitizeFileName = (name: string) => {
    return name
      .normalize('NFKD')
      .replace(/[^\w.\-\s]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();
  };

  const uploadAvatar = async (file: File) => {
    if (!profile?.id) return;
    const MAX_SIZE = 5 * 1024 * 1024;
    if (!file.type.startsWith('image/')) throw new Error('Format de fichier invalide');
    if (file.size > MAX_SIZE) throw new Error('Image trop volumineuse (5 Mo max)');

    const sanitized = sanitizeFileName(file.name);
    const key = `${profile.id}/${Date.now()}-${sanitized}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(key, file);
    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(key);
    const publicUrl = data.publicUrl;

    await updateProfile({ avatar_url: publicUrl });
  };

  const onAvatarChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      await uploadAvatar(file);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Échec de l\'upload');
    }
    setAvatarUploading(false);
    // reset the input so selecting the same file again triggers change
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCancel = () => {
    reset({
      full_name: profile?.full_name || '',
      bio: profile?.bio || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
    });
    setIsEditing(false);
  };

  React.useEffect(() => {
    const loadStats = async () => {
      if (!profile?.id) return;
      // Items count
      {
        const { count } = await supabase
          .from('items')
          .select('id', { count: 'exact', head: true })
          .eq('owner_id', profile.id);
        setItemsCount(count ?? 0);
      }
      // Completed borrows via view
      {
        const { data } = await supabase
          .from('profile_activity_counts')
          .select('completed_borrows')
          .eq('profile_id', profile.id)
          .maybeSingle();
        setCompletedBorrows(((data as any)?.completed_borrows as number) ?? 0);
      }
      // Average item rating across this user's items (from item_ratings join)
      {
        const { data } = await supabase
          .from('item_ratings')
          .select('score, item:items!inner(owner_id)')
          .eq('item.owner_id', profile.id);
        if (data && data.length > 0) {
          let total = 0;
          for (const r of data as { score: number }[]) total += Number(r.score ?? 0);
          setAverageItemRating(total / data.length);
          setRatingsCount(data.length);
        } else {
          setAverageItemRating(null);
          setRatingsCount(0);
        }
      }
      // Overall user reputation from mutual ratings
      {
        const { data } = await supabase
          .from('profile_reputation_stats')
          .select('overall_score')
          .eq('profile_id', profile.id)
          .maybeSingle();
        const overall = (data as any)?.overall_score;
        setOverallReputation(typeof overall === 'number' ? overall : (overall != null ? Number(overall) : null));
      }
    };
    loadStats();
  }, [profile?.id]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header modern */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-8"
      >
        <Card className="relative overflow-hidden p-0 glass-strong">
          {/* Animated Banner */}
          <div className="h-32 md:h-40 bg-gradient-to-br from-brand-400/20 via-purple-400/20 to-blue-400/20 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-600/10 via-transparent to-purple-600/10" />
            <div className="absolute top-4 right-4 w-24 h-24 bg-brand-200/30 rounded-full blur-2xl animate-pulse" />
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-purple-200/30 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          
          {/* Profile Content */}
          <div className="p-6 md:p-8 -mt-16 flex items-start md:items-center justify-between gap-6 flex-col md:flex-row">
            <div className="flex items-center">
              {/* Enhanced Avatar with Glow */}
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="relative w-28 h-28 rounded-full mr-6 group"
              >
                {/* Animated Glow Ring */}
                <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-brand-400 via-purple-400 to-brand-600 opacity-20 blur-lg animate-pulse" />
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-brand-500 to-purple-500 opacity-30 blur-md animate-pulse" style={{ animationDelay: '0.5s' }} />
                
                {/* Avatar Container */}
                <div className="relative w-28 h-28 rounded-full bg-white border-4 border-white shadow-2xl overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
                      <User className="w-12 h-12 text-brand-600" />
                    </div>
                  )}
                </div>
                
                {/* Enhanced Change Button */}
                <button
                  type="button"
                  onClick={handleAvatarSelect}
                  className="absolute -bottom-1 right-1 w-8 h-8 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center"
                  disabled={avatarUploading}
                  aria-label="Changer la photo"
                >
                  {avatarUploading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Edit3 className="w-4 h-4" />
                  )}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 gradient-text">
                  {profile?.full_name || 'Nom non renseigné'}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3 flex-wrap">
                  <span className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200/50">
                    <Mail className="w-4 h-4 text-brand-600" /> 
                    {profile?.email || '—'}
                  </span>
                  {profile?.phone && (
                    <span className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200/50">
                      <Phone className="w-4 h-4 text-brand-600" /> 
                      {profile.phone}
                    </span>
                  )}
                  {profile?.address && (
                    <span className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200/50">
                      <MapPin className="w-4 h-4 text-brand-600" /> 
                      {profile.address}
                    </span>
                  )}
                </div>
                {/* Profile completeness (placeholder simple calc) */}
                <div className="mt-3">
                  {(() => {
                    const fields = [profile?.full_name, profile?.bio, profile?.phone, profile?.address];
                    const ratio = Math.round((fields.filter(Boolean).length / fields.length) * 100);
                    const pct = isNaN(ratio) ? 0 : ratio;
                    return (
                      <div className="w-full max-w-xs">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Profil complété</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-brand-400 to-brand-600" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            </div>
            <div className="flex items-center gap-2 self-end md:self-auto">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} leftIcon={<Edit3 size={16} />}>Modifier</Button>
              ) : (
                <Button variant="ghost" className="border border-gray-300" onClick={handleCancel} leftIcon={<X size={16} />}>Annuler</Button>
              )}
            </div>
          </div>
          <div className="px-6 pb-6 md:px-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[{ icon: <Star className="w-4 h-4" />, label: 'Note moyenne', value: averageItemRating != null ? `${averageItemRating.toFixed(1)}/5 (${ratingsCount})` : '—' }, { icon: <Calendar className="w-4 h-4" />, label: 'Membre depuis', value: (profile as any)?.created_at ? new Date((profile as any).created_at).toLocaleDateString('fr-FR') : '—' }, { icon: <Shield className="w-4 h-4" />, label: 'Réputation', value: overallReputation != null ? `${overallReputation.toFixed(1)}/5` : '—' }].map((s) => (
              <div key={s.label} className="p-4 rounded-xl border border-gray-200 bg-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center">{s.icon}</div>
                <div>
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className="text-sm font-semibold text-gray-900">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Enhanced Tabs */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="mb-6"
      >
        <div className="flex gap-1 p-1.5 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg w-fit">
          {[
            { id: 'profil', label: 'Profil', icon: User },
            { id: 'gamification', label: 'Gamification', icon: Trophy },
            { id: 'transactions', label: 'Transactions', icon: Calendar },
            { id: 'communities', label: 'Quartiers', icon: Users },
            { id: 'parametres', label: 'Paramètres', icon: Shield },
          ].map((tab: any) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2 ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-lg shadow-brand-500/25' 
                  : 'text-gray-700 hover:bg-gray-50/80 hover:text-brand-600'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Tab content: Profil */}
      {activeTab === 'profil' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Carte Infos personnelles */}
            <Card className="p-6 lg:col-span-2 glass">
              {!isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Nom complet</label>
                    <p className="text-gray-900">{profile?.full_name || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Téléphone</label>
                    <p className="text-gray-900">{profile?.phone || 'Non renseigné'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Bio</label>
                    <p className="text-gray-900">{profile?.bio || 'Aucune bio renseignée'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Adresse</label>
                    <p className="text-gray-900">{profile?.address || 'Non renseignée'}</p>
                  </div>
                </div>
              ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Input {...register('full_name')} id="full_name" label="Nom complet *" />
                      {errors.full_name && (
                        <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>
                      )}
                    </div>
                    <div>
                      <Input {...register('phone')} type="tel" id="phone" label="Téléphone" placeholder="06 12 34 56 78" />
                    </div>
                    <div className="md:col-span-2">
                      <TextArea {...register('bio')} id="bio" rows={3} label="Bio" placeholder="Parlez-vous en quelques mots..." />
                    </div>
                  <div className="md:col-span-2">
                    <Input {...register('address')} id="address" label="Adresse" placeholder="123 rue de la Paix, 75001 Paris" />
                  </div>
                  <div>
                    <Input {...register('latitude')} id="latitude" label="Latitude" type="number" step="any" />
                  </div>
                  <div>
                    <Input {...register('longitude')} id="longitude" label="Longitude" type="number" step="any" />
                  </div>
                  </div>
                <div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="border border-gray-300"
                    onClick={() => {
                      if (!navigator.geolocation) return;
                      navigator.geolocation.getCurrentPosition((pos) => {
                        const lat = pos.coords.latitude;
                        const lng = pos.coords.longitude;
                        setValue('latitude', lat as any, { shouldValidate: true, shouldDirty: true });
                        setValue('longitude', lng as any, { shouldValidate: true, shouldDirty: true });

                        fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, {
                          headers: { 'Accept-Language': 'fr' },
                        })
                          .then((r) => r.json())
                          .then((json) => {
                            const display = json?.display_name as string | undefined;
                            if (display) {
                              setValue('address', display, { shouldValidate: true, shouldDirty: true });
                            }
                          })
                          .catch(() => {});
                      });
                    }}
                  >
                    Utiliser ma position
                  </Button>
                </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button type="submit" disabled={loading} className="disabled:opacity-50" leftIcon={<Save size={16} />}>{loading ? 'Enregistrement...' : 'Enregistrer'}</Button>
                    <Button type="button" variant="ghost" className="border border-gray-300" onClick={handleCancel} leftIcon={<X size={16} />}>Annuler</Button>
                  </div>
                </form>
              )}
            </Card>

            {/* Carte Confiance & Statistiques */}
            <Card className="p-6 glass">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Confiance & Statistiques</h3>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 pop-in">
                  <CheckCircle className="w-3 h-3" /> Vérifié
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-white/70 border border-gray-100">
                  <p className="text-xs text-gray-500">Objets</p>
                  <p className="text-lg font-semibold text-gray-900">{itemsCount}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/70 border border-gray-100">
                  <p className="text-xs text-gray-500">Emprunts</p>
                  <p className="text-lg font-semibold text-gray-900">{completedBorrows}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/70 border border-gray-100">
                  <p className="text-xs text-gray-500">Note</p>
                  <p className="text-lg font-semibold text-gray-900">{averageItemRating != null ? averageItemRating.toFixed(1) : '—'}</p>
                </div>
              </div>
            </Card>
          </div>
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
                badge_slug: ub.badge?.slug || '',
                badge_label: ub.badge?.name || '',
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
              <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Gamification</h3>
              <p className="text-gray-600 mb-4">Commencez à utiliser la plateforme pour débloquer vos premiers badges et points !</p>
              <Button onClick={() => setActiveTab('profil')}>
                Compléter mon profil
              </Button>
            </Card>
          )}
        </motion.div>
      )}

      {/* Tab content: Transactions */}
      {activeTab === 'transactions' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-0 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Historique des transactions</h2>
            </div>
            <ul className="divide-y divide-gray-100">
              {transactions?.map((t: any) => (
                <li key={t.id} className="p-4 flex items-start justify-between hover:bg-gray-50">
                  <div>
                    <div className="text-gray-900 font-medium">
                      {t.role === 'borrower' ? 'Emprunt' : 'Prêt'} — {t.item?.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Le {new Date(t.created_at).toLocaleDateString('fr-FR')} • Statut: {t.status}
                    </div>
                  </div>
                  <div className="flex items-center text-xs">
                    {t.status === 'completed' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded bg-green-100 text-green-700"><CheckCircle className="w-4 h-4 mr-1" /> Terminé</span>
                    ) : t.status === 'pending' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded bg-yellow-100 text-yellow-700"><Clock className="w-4 h-4 mr-1" /> En attente</span>
                    ) : t.status === 'rejected' ? (
                      <span className="inline-flex items-center px-2 py-1 rounded bg-red-100 text-red-700"><XCircle className="w-4 h-4 mr-1" /> Refusé</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-700"><ArrowRight className="w-4 h-4 mr-1" /> {t.status}</span>
                    )}
                  </div>
                </li>
              ))}
              {(!transactions || transactions.length === 0) && (
                <li className="py-10">
                  <EmptyState title="Aucune transaction" description="Vous n'avez pas encore d'historique." />
                </li>
              )}
            </ul>
          </Card>
        </motion.div>
      )}

      {/* Tab content: Quartiers */}
      {activeTab === 'communities' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <UserCommunities userId={profile?.id || ''} />
        </motion.div>
      )}

      {/* Tab content: Paramètres */}
      {activeTab === 'parametres' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confidentialité</h3>
              <p className="text-sm text-gray-600">Gérez la visibilité de vos informations et votre sécurité.</p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-700"><Shield className="w-4 h-4 text-brand-700" /> Compte vérifié</div>
                  <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">Actif</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-700"><Mail className="w-4 h-4 text-brand-700" /> Notifications email</div>
                  <span className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">Bientôt</span>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Préférences</h3>
              <p className="text-sm text-gray-600">Personnalisez votre expérience.</p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-700"><Star className="w-4 h-4 text-brand-700" /> Suggestions d’objets</div>
                  <span className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">Bientôt</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-700"><Calendar className="w-4 h-4 text-brand-700" /> Disponibilités</div>
                  <span className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">Bientôt</span>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MyProfilePage;
