import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Edit3, Save, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

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
    <div className="p-4 max-w-2xl mx-auto">
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

        <div className="bg-white rounded-xl p-6 border border-gray-200">
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
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet *
                </label>
                <input
                  {...register('full_name')}
                  type="text"
                  id="full_name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.full_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  {...register('bio')}
                  id="bio"
                  rows={3}
                  placeholder="Parlez-vous en quelques mots..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  id="phone"
                  placeholder="06 12 34 56 78"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <input
                  {...register('address')}
                  type="text"
                  id="address"
                  placeholder="123 rue de la Paix, 75001 Paris"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save size={16} />
                  <span>{loading ? 'Enregistrement...' : 'Enregistrer'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X size={16} />
                  <span>Annuler</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default MyProfilePage;