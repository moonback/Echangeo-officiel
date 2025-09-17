import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProfile, useItemsByOwner, useBorrowHistory, useLendHistory } from '../hooks/useProfiles';
import { Star } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: profile, isLoading } = useProfile(id);
  const { data: items } = useItemsByOwner(id);
  const { data: borrows } = useBorrowHistory(id);
  const { data: lends } = useLendHistory(id);

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
                  <div className="pt-2 text-sm text-gray-700">
                    <div>Objets publiés: {(profile as unknown as { items_count?: number }).items_count ?? 0}</div>
                    <div>Emprunts effectués: {(profile as unknown as { completed_borrows?: number }).completed_borrows ?? 0}</div>
                  </div>
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

            <div className="bg-white rounded-xl border border-gray-200 mt-4">
              <div className="p-4 border-b border-gray-100 font-medium">Historique d’emprunts</div>
              <ul className="divide-y divide-gray-100">
                {borrows?.map((r) => (
                  <li key={r.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-gray-900 font-medium">{r.item?.title}</div>
                        <div className="text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString('fr-FR')}</div>
                      </div>
                      <span className="px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700">{r.status}</span>
                    </div>
                    {r.status === 'completed' && (
                      <div className="mt-2 text-sm text-gray-600 flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        Laissez un avis depuis la fiche de l’objet.
                      </div>
                    )}
                  </li>
                ))}
                {(!borrows || borrows.length === 0) && (
                  <li className="p-6 text-center text-gray-500">Aucun emprunt pour le moment.</li>
                )}
              </ul>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 mt-4">
              <div className="p-4 border-b border-gray-100 font-medium">Historique de prêts</div>
              <ul className="divide-y divide-gray-100">
                {lends?.map((r) => (
                  <li key={r.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-gray-900 font-medium">{r.item?.title}</div>
                        <div className="text-xs text-gray-500">À: {r.requester?.full_name || 'Anonyme'} • {new Date(r.created_at).toLocaleDateString('fr-FR')}</div>
                      </div>
                      <span className="px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700">{r.status}</span>
                    </div>
                  </li>
                ))}
                {(!lends || lends.length === 0) && (
                  <li className="p-6 text-center text-gray-500">Aucun prêt pour le moment.</li>
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