import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProfile, useItemsByOwner, useBorrowHistory, useLendHistory } from '../hooks/useProfiles';
import { supabase } from '../services/supabase';
import { Star, MapPin, Package, MessageCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import EmptyState from '../components/EmptyState';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: profile, isLoading } = useProfile(id);
  const { data: items } = useItemsByOwner(id);
  const { data: borrows } = useBorrowHistory(id);
  const { data: lends } = useLendHistory(id);

  const [itemsLimit, setItemsLimit] = React.useState(6);
  const [ratingStats, setRatingStats] = React.useState<{ average?: number; count?: number }>({});

  React.useEffect(() => {
    const loadRatingStats = async () => {
      if (!id) return;
      // Aggregate ratings across items owned by this profile via view and join; fail-soft if not available
      const { data, error } = await supabase
        .from('item_rating_stats')
        .select('average_rating, ratings_count, items!inner(owner_id)')
        .eq('items.owner_id', id);
      if (error || !data) {
        setRatingStats({});
        return;
      }
      let totalReviews = 0;
      let weightedSum = 0;
      for (const row of data as any[]) {
        const count = Number(row.ratings_count ?? 0);
        const avg = Number(row.average_rating ?? 0);
        totalReviews += count;
        weightedSum += avg * count;
      }
      const average = totalReviews > 0 ? weightedSum / totalReviews : undefined;
      setRatingStats({ average, count: totalReviews });
    };
    loadRatingStats();
  }, [id]);

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
          <div className="md:col-span-3">
            <Card className="p-0 overflow-hidden">
              <div className="bg-gradient-to-br from-brand-50 to-white p-6 md:p-8">
                {isLoading ? (
                  <div className="text-gray-500 text-sm">Chargement…</div>
                ) : profile ? (
                  <div className="flex items-start md:items-center gap-4 md:gap-6 flex-col md:flex-row">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-400 text-xl">{(profile.full_name || profile.email || '?').slice(0,1).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl md:text-2xl font-semibold text-gray-900 truncate">{profile.full_name || profile.email}</h2>
                      {profile.address && (
                        <div className="mt-1 text-sm text-gray-600 flex items-center"><MapPin className="w-4 h-4 mr-1" /> {profile.address}</div>
                      )}
                      {profile.bio && (
                        <p className="mt-2 text-gray-700 text-sm md:text-base max-w-prose">{profile.bio}</p>
                      )}
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <Badge variant="info" className="px-3 py-1"><Package className="w-3 h-3 mr-1" /> {(profile as any).items_count ?? 0} objets</Badge>
                        <Badge variant="success" className="px-3 py-1">{(profile as any).completed_borrows ?? 0} emprunts</Badge>
                        {ratingStats.count ? (
                          <Badge variant="warning" className="px-3 py-1"><Star className="w-3 h-3 mr-1 text-yellow-600" /> {ratingStats.average?.toFixed(1)} ({ratingStats.count})</Badge>
                        ) : null}
                      </div>
                    </div>
                    {id && (
                      <Link to={`/chat/${id}`}>
                        <Button variant="secondary" size="sm" leftIcon={<MessageCircle size={16} />}>Discuter</Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">Profil introuvable.</div>
                )}
              </div>
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card>
              <div className="p-4 border-b border-gray-100 font-medium">Objets publiés</div>
              {items && items.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
                  {items.slice(0, itemsLimit).map((it) => (
                    <Card key={it.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 pr-3">
                          <div className="text-gray-900 font-medium truncate">{it.title}</div>
                          {it.description && (
                            <div className="text-gray-600 text-sm line-clamp-2">{it.description}</div>
                          )}
                        </div>
                        <Link to={`/items/${it.id}`} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm">Voir</Link>
                      </div>
                    </Card>
                  ))}
                  {items && items.length > itemsLimit && (
                    <div className="col-span-full flex justify-center pt-2">
                      <Button variant="ghost" className="border border-gray-300" onClick={() => setItemsLimit((n) => n + 6)}>Voir plus</Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6"><EmptyState title="Aucun objet" description="Cet utilisateur n'a pas encore publié d'objet." /></div>
              )}
            </Card>

            <Card className="mt-4">
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
                  <li className="p-6">
                    <EmptyState title="Aucun emprunt" description="Aucun emprunt enregistré pour l'instant." />
                  </li>
                )}
              </ul>
            </Card>

            <Card className="mt-4">
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
                  <li className="p-6">
                    <EmptyState title="Aucun prêt" description="Aucun prêt enregistré pour l'instant." />
                  </li>
                )}
              </ul>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;