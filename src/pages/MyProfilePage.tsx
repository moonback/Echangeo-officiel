import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Edit3, Save, X, CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react';
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit3 size={16} />
              <span>Modifier</span>
            </button>
          )}
        </div>

        <Card className="p-6">
          {/* Avatar */}
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <User className="w-10 h-10 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {profile?.full_name || 'Nom non renseigné'}
              </h2>
              <p className="text-gray-600">{profile?.email}</p>
            </div>
          </div>

          {!isEditing ? (
            /* View Mode */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Nom complet
                </label>
                <p className="text-gray-900">{profile?.full_name || 'Non renseigné'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Bio
                </label>
                <p className="text-gray-900">{profile?.bio || 'Aucune bio renseignée'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Téléphone
                </label>
                <p className="text-gray-900">{profile?.phone || 'Non renseigné'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Adresse
                </label>
                <p className="text-gray-900">{profile?.address || 'Non renseignée'}</p>
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Input {...register('full_name')} id="full_name" label="Nom complet *" />
                {errors.full_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>
                )}
              </div>

              <div>
                <TextArea {...register('bio')} id="bio" rows={3} label="Bio" placeholder="Parlez-vous en quelques mots..." />
              </div>

              <div>
                <Input {...register('phone')} type="tel" id="phone" label="Téléphone" placeholder="06 12 34 56 78" />
              </div>

              <div>
                <Input {...register('address')} id="address" label="Adresse" placeholder="123 rue de la Paix, 75001 Paris" />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1 disabled:opacity-50" leftIcon={<Save size={16} />}>{loading ? 'Enregistrement...' : 'Enregistrer'}</Button>
                <Button type="button" variant="ghost" className="border border-gray-300" onClick={handleCancel} leftIcon={<X size={16} />}>Annuler</Button>
              </div>
            </form>
          )}
        </Card>
      </motion.div>

      {/* Historique des transactions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Historique de mes transactions</h2>
        </div>
        <ul className="divide-y divide-gray-100">
          {transactions?.map((t: any) => (
            <li key={t.id} className="py-3 flex items-start justify-between">
              <div>
                <div className="text-gray-900 font-medium">
                  {t.role === 'borrower' ? 'Emprunt' : 'Prêt'} — {t.item?.title}
                </div>
                <div className="text-xs text-gray-500">
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
            <li className="py-6">
              <EmptyState title="Aucune transaction" description="Vous n'avez pas encore d'historique." />
            </li>
          )}
        </ul>
        </Card>
      </motion.div>
    </div>
  );
};

export default MyProfilePage;