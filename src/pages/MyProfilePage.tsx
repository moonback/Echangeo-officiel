import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Edit3, Save, X, CheckCircle, Clock, XCircle, ArrowRight, Mail, Phone, MapPin, Shield, Star, Calendar } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTransactions } from '../hooks/useProfiles';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import Card from '../components/ui/Card';
import EmptyState from '../components/EmptyState';
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
  const [avatarUploading, setAvatarUploading] = useState(false);
  const { data: transactions } = useTransactions(profile?.id);
  const [activeTab, setActiveTab] = useState<'profil' | 'transactions' | 'parametres'>('profil');
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

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

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header modern */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="relative overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-white to-brand-50">
          {/* Banner */}
          <div className="h-28 md:h-32 bg-gradient-to-r from-brand-100 via-brand-50 to-white" />
          {/* Halo decorations */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-100/50 rounded-full blur-3xl" />
          <div className="p-6 md:p-8 -mt-12 flex items-start md:items-center justify-between gap-6 flex-col md:flex-row">
            <div className="flex items-center">
              {/* Circular avatar with halo */}
              <div className="relative w-24 h-24 rounded-full bg-white flex items-center justify-center mr-4 border-2 border-white shadow-soft overflow-hidden">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-brand-400/30 to-brand-600/30 blur-md" />
                <div className="relative w-22 h-22 rounded-full overflow-hidden">
                {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-brand-100 flex items-center justify-center">
                      <User className="w-10 h-10 text-brand-700" />
                    </div>
                )}
                </div>
                <button
                  type="button"
                  onClick={handleAvatarSelect}
                  className="absolute -bottom-2 right-0 translate-y-1/2 text-xs px-2 py-1 rounded-full bg-white/95 border border-gray-200 hover:bg-white shadow"
                  disabled={avatarUploading}
                  aria-label="Changer la photo"
                >
                  {avatarUploading ? '...' : 'Changer'}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>{profile?.full_name || 'Nom non renseigné'}</h1>
                <div className="mt-1 flex items-center gap-3 text-sm text-gray-600">
                  <span className="inline-flex items-center gap-1"><Mail className="w-4 h-4" /> {profile?.email || '—'}</span>
                  {profile?.phone && <span className="inline-flex items-center gap-1"><Phone className="w-4 h-4" /> {profile.phone}</span>}
                  {profile?.address && <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" /> {profile.address}</span>}
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
              </div>
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
            {[{ icon: <Star className="w-4 h-4" />, label: 'Note moyenne', value: (profile as any)?.average_rating ? `${(profile as any).average_rating.toFixed(1)}/5` : '—' }, { icon: <Calendar className="w-4 h-4" />, label: 'Membre depuis', value: (profile as any)?.created_at ? new Date((profile as any).created_at).toLocaleDateString('fr-FR') : '—' }, { icon: <Shield className="w-4 h-4" />, label: 'Confiance', value: 'Vérifié' }].map((s) => (
              <div key={s.label} className="p-4 rounded-xl border border-gray-200 bg-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center">{s.icon}</div>
                <div>
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className="text-sm font-semibold text-gray-900">{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="mb-4">
        <div className="flex gap-2 p-1 rounded-xl bg-white border border-gray-200 w-fit">
          {[
            { id: 'profil', label: 'Profil' },
            { id: 'transactions', label: 'Transactions' },
            { id: 'parametres', label: 'Paramètres' },
          ].map((tab: any) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${activeTab === tab.id ? 'bg-brand-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

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
                  <p className="text-lg font-semibold text-gray-900">{(profile as any)?.items_count ?? 0}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/70 border border-gray-100">
                  <p className="text-xs text-gray-500">Emprunts</p>
                  <p className="text-lg font-semibold text-gray-900">{(profile as any)?.completed_borrows ?? 0}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/70 border border-gray-100">
                  <p className="text-xs text-gray-500">Note</p>
                  <p className="text-lg font-semibold text-gray-900">{(profile as any)?.average_rating ? `${(profile as any).average_rating.toFixed(1)}` : '—'}</p>
                </div>
              </div>
            </Card>
          </div>
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