import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProfile, useItemsByOwner, useBorrowHistory, useLendHistory } from '../hooks/useProfiles';
import { supabase } from '../services/supabase';
import { Star, MapPin, Package, MessageCircle, Link as LinkIcon } from 'lucide-react';
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
  const [itemStatsMap, setItemStatsMap] = React.useState<Record<string, { average?: number; count?: number }>>({});
  const [sortMode, setSortMode] = React.useState<'recent' | 'popular'>('recent');
  const [reviews, setReviews] = React.useState<Array<{ id: string; item_id: string; item_title: string; rater_name: string; score: number; comment?: string; created_at: string }>>([]);
  const [copied, setCopied] = React.useState(false);

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

  // Per-item stats for sorting
  React.useEffect(() => {
    const loadItemStatsForSort = async () => {
      if (!items || items.length === 0) return;
      const ids = items.map((it) => it.id);
      const { data, error } = await supabase
        .from('item_rating_stats')
        .select('item_id, average_rating, ratings_count')
        .in('item_id', ids);
      if (error || !data) return;
      const map: Record<string, { average?: number; count?: number }> = {};
      for (const row of data as any[]) {
        map[row.item_id] = { average: row.average_rating ?? undefined, count: row.ratings_count ?? 0 };
      }
      setItemStatsMap(map);
    };
    loadItemStatsForSort();
  }, [items]);

  // Latest detailed reviews across this user's items
  React.useEffect(() => {
    const loadReviews = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from('item_ratings')
        .select('id, item_id, score, comment, created_at, rater:profiles(full_name, email), item:items!inner(id, title, owner_id)')
        .eq('items.owner_id', id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error || !data) return;
      const rows = (data as any[]).map((r) => ({
        id: r.id as string,
        item_id: r.item?.id as string,
        item_title: r.item?.title as string,
        rater_name: (r.rater?.full_name as string) || (r.rater?.email as string) || 'Anonyme',
        score: Number(r.score),
        comment: r.comment as string | undefined,
        created_at: r.created_at as string,
      }));
      setReviews(rows);
    };
    loadReviews();
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
                    <div className="flex items-center gap-2">
                      {id && (
                        <Link to={`/chat/${id}`}>
                          <Button variant="secondary" size="sm" leftIcon={<MessageCircle size={16} />}>Discuter</Button>
                        </Link>
                      )}
                      <Button variant="ghost" size="sm" className="border border-gray-300" leftIcon={<LinkIcon size={16} />} onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(window.location.href);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1500);
                        } catch {}
                      }}>{copied ? 'Copié' : 'Copier le lien'}</Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">Profil introuvable.</div>
                )}
              </div>
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card>
              <div className="p-4 border-b border-gray-100 font-medium flex items-center justify-between">
                <span>Objets publiés</span>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Trier:</span>
                  <select value={sortMode} onChange={(e) => setSortMode(e.target.value as any)} className="px-2 py-1 border border-gray-300 rounded-lg text-sm">
                    <option value="recent">Plus récents</option>
                    <option value="popular">Plus populaires</option>
                  </select>
                </div>
              </div>
              {items && items.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
                  {items
                    .slice()
                    .sort((a, b) => {
                      if (sortMode === 'recent') {
                        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                      }
                      const ra = itemStatsMap[a.id]?.count ?? 0;
                      const rb = itemStatsMap[b.id]?.count ?? 0;
                      if (rb !== ra) return rb - ra;
                      const aa = itemStatsMap[a.id]?.average ?? 0;
                      const ab = itemStatsMap[b.id]?.average ?? 0;
                      return ab - aa;
                    })
                    .slice(0, itemsLimit)
                    .map((it) => (
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
              <div className="p-4 border-b border-gray-100 font-medium flex items-center justify-between">
                <span>Derniers avis</span>
                {ratingStats.count ? (
                  <span className="text-sm text-gray-600">{ratingStats.count} avis au total</span>
                ) : null}
              </div>
              {reviews && reviews.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {reviews.map((rev) => (
                    <li key={rev.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900 font-medium">{rev.rater_name}</span>
                            <span className="text-xs text-gray-500">{new Date(rev.created_at).toLocaleDateString('fr-FR')}</span>
                          </div>
                          <div className="flex items-center text-yellow-600 text-sm mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < rev.score ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          {rev.comment && (
                            <p className="text-gray-700 text-sm mt-2 whitespace-pre-line">{rev.comment}</p>
                          )}
                          <div className="mt-2 text-xs text-gray-600">Sur: <Link to={`/items/${rev.item_id}`} className="text-blue-600 hover:text-blue-700">{rev.item_title}</Link></div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6"><EmptyState title="Aucun avis" description="Aucun avis publié pour l'instant." /></div>
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