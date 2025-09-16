import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProfile, useItemsByOwner } from '../hooks/useProfiles';

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: profile, isLoading } = useProfile(id);
  const { data: items } = useItemsByOwner(id);

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {profile?.full_name || profile?.email || 'Profil utilisateur'}
        </h1>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              {isLoading ? (
                <div className="text-gray-500 text-sm">Chargement…</div>
              ) : profile ? (
                <div className="space-y-2">
                  {profile.avatar_url && (
                    <img src={profile.avatar_url} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
                  )}
                  <div className="text-gray-900 font-medium">{profile.full_name || profile.email}</div>
                  {profile.bio && <div className="text-gray-600 text-sm">{profile.bio}</div>}
                  {profile.phone && <div className="text-gray-600 text-sm">📞 {profile.phone}</div>}
                  {profile.address && <div className="text-gray-600 text-sm">📍 {profile.address}</div>}
                </div>
              ) : (
                <div className="text-gray-500 text-sm">Profil introuvable.</div>
              )}
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-4 border-b border-gray-100 font-medium">Objets publiés</div>
              <ul className="divide-y divide-gray-100">
                {items?.map((it) => (
                  <li key={it.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="text-gray-900 font-medium">{it.title}</div>
                      {it.description && (
                        <div className="text-gray-600 text-sm line-clamp-1">{it.description}</div>
                      )}
                    </div>
                    <Link to={`/items/${it.id}`} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white">Voir</Link>
                  </li>
                ))}
                {items?.length === 0 && (
                  <li className="p-6 text-center text-gray-500">Aucun objet pour le moment.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;