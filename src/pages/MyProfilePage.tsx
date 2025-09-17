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

const profileSchema = z.object({
  full_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  bio: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const MyProfilePage: React.FC = () => {
  const { profile, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data: transactions } = useTransactions(profile?.id);
  const [activeTab, setActiveTab] = useState<'profil' | 'transactions' | 'parametres'>('profil');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      bio: profile?.bio || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
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
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-100/50 rounded-full blur-3xl" />
          <div className="p-6 md:p-8 flex items-start md:items-center justify-between gap-6 flex-col md:flex-row">
            <div className="flex items-center">
              <div className="w-20 h-20 rounded-2xl bg-brand-100 flex items-center justify-center mr-4 border border-brand-200">
                <User className="w-10 h-10 text-brand-700" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{profile?.full_name || 'Nom non renseigné'}</h1>
                <div className="mt-1 flex items-center gap-3 text-sm text-gray-600">
                  <span className="inline-flex items-center gap-1"><Mail className="w-4 h-4" /> {profile?.email || '—'}</span>
                  {profile?.phone && <span className="inline-flex items-center gap-1"><Phone className="w-4 h-4" /> {profile.phone}</span>}
                  {profile?.address && <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" /> {profile.address}</span>}
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
          <Card className="p-6">
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
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button type="submit" disabled={loading} className="disabled:opacity-50" leftIcon={<Save size={16} />}>{loading ? 'Enregistrement...' : 'Enregistrer'}</Button>
                  <Button type="button" variant="ghost" className="border border-gray-300" onClick={handleCancel} leftIcon={<X size={16} />}>Annuler</Button>
                </div>
              </form>
            )}
          </Card>
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