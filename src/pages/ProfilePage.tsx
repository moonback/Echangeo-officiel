import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProfile, useBorrowHistory, useLendHistory } from '../hooks/useProfiles';
import { supabase } from '../services/supabase';
import { categories } from '../utils/categories';
import { Star, MapPin, MessageCircle, Link as LinkIcon } from 'lucide-react';
import Card from '../components/ui/Card';
import EmptyState from '../components/EmptyState';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { fetchProfileReputation, fetchProfileBadges } from '../hooks/useRatings';
import { useGamificationStats, useUserLevel } from '../hooks/useGamification';
import ReputationDisplay from '../components/ReputationDisplay';

type OwnedItem = { id: string; title: string; description?: string; created_at: string; is_available: boolean; category: string; latitude?: number; longitude?: number };
type ReviewRow = { id: string; item_id: string; item_title: string; rater_name: string; score: number; comment?: string; created_at: string };

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: profile, isLoading } = useProfile(id);
  const [userLoc, setUserLoc] = React.useState<{ lat: number; lng: number } | null>(null);
  // Client-managed items with server pagination & filters
  const [items, setItems] = React.useState<OwnedItem[]>([]);
  const [itemsPage, setItemsPage] = React.useState(0);
  const itemsPageSize = 6;
  const [itemsHasMore, setItemsHasMore] = React.useState(true);
  const [filterCategory, setFilterCategory] = React.useState<string>('');
  const [filterOnlyAvailable, setFilterOnlyAvailable] = React.useState<boolean>(false);
  const { data: borrows } = useBorrowHistory(id);
  const { data: lends } = useLendHistory(id);

  
  const [ratingStats, setRatingStats] = React.useState<{ average?: number; count?: number }>({});
  const [itemStatsMap, setItemStatsMap] = React.useState<Record<string, { average?: number; count?: number }>>({});
  const [sortMode, setSortMode] = React.useState<'recent' | 'popular'>('recent');
  const [reviews, setReviews] = React.useState<ReviewRow[]>([]);
  const [reviewsPage, setReviewsPage] = React.useState(0);
  const reviewsPageSize = 10;
  const [reviewsHasMore, setReviewsHasMore] = React.useState(true);
  const [copied, setCopied] = React.useState(false);
  const [reputation, setReputation] = React.useState<{ overall?: number; comm?: number; punct?: number; care?: number; count?: number }>({});
  const [badges, setBadges] = React.useState<{ slug: string; label: string }[]>([]);
  
  // Gamification hooks
  const { data: gamificationStats } = useGamificationStats(id);
  const { data: userLevel } = useUserLevel(id);

  React.useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  }, []);

  React.useEffect(() => {
    const loadReputation = async () => {
      if (!id) return;
      const stats = await fetchProfileReputation(id);
      if (stats) {
        setReputation({
          overall: Number(stats.overall_score ?? 0),
          comm: Number(stats.avg_communication ?? 0),
          punct: Number(stats.avg_punctuality ?? 0),
          care: Number(stats.avg_care ?? 0),
          count: Number(stats.ratings_count ?? 0),
        });
      } else {
        setReputation({});
      }
      const badgeRows = await fetchProfileBadges(id);
      setBadges((badgeRows ?? []).map(b => ({ slug: b.badge_slug, label: b.badge_label })));
    };
    loadReputation();
  }, [id]);

  const distanceKm = React.useMemo(() => {
    const lat = profile?.latitude as number | undefined;
    const lng = profile?.longitude as number | undefined;
    if (!userLoc || typeof lat !== 'number' || typeof lng !== 'number') return null;
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat - userLoc.lat);
    const dLon = toRad(lng - userLoc.lng);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(userLoc.lat)) * Math.cos(toRad(lat)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, [userLoc, profile]);

  React.useEffect(() => {
    const loadRatingStats = async () => {
      if (!id) return;
      // Aggregate from item_ratings joined to items owned by this user
      const { data, error } = await supabase
        .from('item_ratings')
        .select('score, item:items!inner(id,owner_id)')
        .eq('item.owner_id', id);
      if (error || !data) {
        setRatingStats({});
        return;
      }
      let totalReviews = 0;
      let totalScore = 0;
      for (const row of data as { score: number }[]) {
        const score = Number(row.score ?? 0);
        totalReviews += 1;
        totalScore += score;
      }
      const average = totalReviews > 0 ? totalScore / totalReviews : undefined;
      setRatingStats({ average, count: totalReviews });
    };
    loadRatingStats();
  }, [id]);

  // Load items with pagination & filters
  React.useEffect(() => {
    const loadItems = async () => {
      if (!id) return;
      const from = itemsPage * itemsPageSize;
      const to = from + itemsPageSize - 1;
      let query = supabase
        .from('items')
        .select('id,title,description,created_at,is_available,category,latitude,longitude', { count: 'exact' })
        .eq('owner_id', id)
        .order('created_at', { ascending: false })
        .range(from, to);
      if (filterCategory) query = query.eq('category', filterCategory);
      if (filterOnlyAvailable) query = query.eq('is_available', true);
      const { data, error, count } = await query;
      if (error) return;
      setItems((prev) => itemsPage === 0 ? (data as OwnedItem[]) : [...prev, ...(data as OwnedItem[])]);
      const loaded = (data?.length ?? 0);
      setItemsHasMore(typeof count === 'number' ? from + loaded < count : loaded === itemsPageSize);
    };
    loadItems();
  }, [id, itemsPage, filterCategory, filterOnlyAvailable]);

  // Per-item stats for sorting
  React.useEffect(() => {
    const loadItemStatsForSort = async () => {
      if (!items || items.length === 0) return;
      const ids = items.map((it) => it.id);
      const { data, error } = await supabase
        .from('item_ratings')
        .select('item_id, score')
        .in('item_id', ids);
      if (error || !data) return;
      const totals: Record<string, { sum: number; count: number }> = {};
      for (const row of data as { item_id: string; score: number }[]) {
        const itemId = row.item_id as string;
        const score = Number(row.score ?? 0);
        if (!totals[itemId]) totals[itemId] = { sum: 0, count: 0 };
        totals[itemId].sum += score;
        totals[itemId].count += 1;
      }
      const map: Record<string, { average?: number; count?: number }> = {};
      for (const [itemId, t] of Object.entries(totals)) {
        map[itemId] = { average: t.count > 0 ? t.sum / t.count : undefined, count: t.count };
      }
      setItemStatsMap(map);
    };
    loadItemStatsForSort();
  }, [items]);

  // Latest detailed reviews across this user's items with pagination
  React.useEffect(() => {
    const loadReviews = async () => {
      if (!id) return;
      const from = reviewsPage * reviewsPageSize;
      const to = from + reviewsPageSize - 1;
      const { data, error, count } = await supabase
        .from('item_ratings')
        .select('id, item_id, score, comment, created_at, rater:profiles(full_name, email), item:items!inner(id, title, owner_id)', { count: 'exact' })
        .eq('item.owner_id', id)
        .order('created_at', { ascending: false })
        .range(from, to);
      if (error || !data) return;
      const rows: ReviewRow[] = (data as { id: string; item_id: string; score: number; comment: string; created_at: string; rater: { full_name: string; email: string }; item: { id: string; title: string; owner_id: string } }[]).map((r) => ({
        id: r.id as string,
        item_id: r.item?.id as string,
        item_title: r.item?.title as string,
        rater_name: (r.rater?.full_name as string) || (r.rater?.email as string) || 'Anonyme',
        score: Number(r.score),
        comment: r.comment as string | undefined,
        created_at: r.created_at as string,
      }));
      setReviews((prev) => reviewsPage === 0 ? rows : [...prev, ...rows]);
      const loaded = rows.length;
      setReviewsHasMore(typeof count === 'number' ? from + loaded < count : loaded === reviewsPageSize);
    };
    loadReviews();
  }, [id, reviewsPage]);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 gradient-text">
            {profile?.full_name || profile?.email || 'Profil utilisateur'}
          </h1>
          <p className="text-gray-600 text-lg">Découvrez le profil et les objets de ce membre de la communauté</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-3">
            <Card className="p-0 overflow-hidden glass-strong">
              <div className="relative bg-gradient-to-br from-brand-50/80 via-white/60 to-purple-50/40 p-6 md:p-8">
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-200/20 to-purple-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-200/20 to-brand-200/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                
                {isLoading ? (
                  <div className="text-gray-500 text-sm">Chargement…</div>
                ) : profile ? (
                  <div className="relative flex items-start md:items-center gap-6 md:gap-8 flex-col md:flex-row">
                    {/* Enhanced Avatar */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="relative"
                    >
                      {/* Glow Effect */}
                      <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-brand-400/30 via-purple-400/30 to-brand-600/30 blur-lg animate-pulse" />
                      <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-brand-500/40 to-purple-500/40 blur-md animate-pulse" style={{ animationDelay: '0.5s' }} />
                      
                      <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full bg-white border-4 border-white shadow-2xl overflow-hidden">
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
                            <span className="text-brand-600 text-2xl font-bold">
                              {(profile.full_name || profile.email || '?').slice(0,1).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl md:text-2xl font-semibold text-gray-900 truncate">{profile.full_name || profile.email}</h2>
                      {(profile.address || distanceKm != null) && (
                        <div className="mt-1 text-sm text-gray-600 flex items-center flex-wrap gap-2">
                          {profile.address && <span className="inline-flex items-center"><MapPin className="w-4 h-4 mr-1" /> {profile.address}</span>}
                          {distanceKm != null && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px]">
                              {distanceKm.toFixed(1)} km
                            </span>
                          )}
                        </div>
                      )}
                      {profile.bio && (
                        <p className="mt-2 text-gray-700 text-sm md:text-base max-w-prose">{profile.bio}</p>
                      )}
                      {/* <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <Badge variant="info" className="px-3 py-1"><Package className="w-3 h-3 mr-1" /> {(profile as any)?.items_count ?? 0} objets</Badge>
                        <Badge variant="success" className="px-3 py-1">{(profile as any)?.completed_borrows ?? 0} emprunts</Badge>
                        {ratingStats.count ? (
                          <Badge variant="warning" className="px-3 py-1"><Star className="w-3 h-3 mr-1 text-yellow-600" /> {ratingStats.average?.toFixed(1)} ({ratingStats.count})</Badge>
                        ) : null}
                      </div> */}
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
                        } catch {
                          // Do nothing
                        }
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
            {/* Section Gamification et Réputation */}
            {(gamificationStats || reputation.count || badges.length > 0 || ratingStats.count) && (
              <div className="mb-4">
                {gamificationStats ? (
                  <ReputationDisplay
                    reputation={{
                      overall_score: gamificationStats.overall_score,
                      ratings_count: gamificationStats.ratings_count,
                      avg_communication: gamificationStats.overall_score,
                      avg_punctuality: gamificationStats.overall_score,
                      avg_care: gamificationStats.overall_score,
                    }}
                    badges={badges.map(b => ({
                      badge_slug: b.slug,
                      badge_label: b.label,
                    }))}
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
                  <Card className="mb-4">
                    <div className="p-4 border-b border-gray-100 font-medium">Confiance & Réputation</div>
                    <div className="p-4 flex items-center gap-3 flex-wrap">
                      {typeof reputation.overall === 'number' && reputation.count ? (
                        <span className="px-3 py-1 rounded-full bg-yellow-50 text-yellow-800 border border-yellow-200 text-sm inline-flex items-center">
                          <Star className="w-4 h-4 mr-1 text-yellow-600" /> Score global {reputation.overall.toFixed(1)} ({reputation.count})
                        </span>
                      ) : (
                        <span className="text-sm text-gray-600">Aucune évaluation utilisateur pour le moment</span>
                      )}
                      {ratingStats.count ? (
                        <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-sm inline-flex items-center">
                          <Star className="w-4 h-4 mr-1 text-amber-600" /> Avis sur objets {ratingStats.average?.toFixed(1)} ({ratingStats.count})
                        </span>
                      ) : null}
                      {badges.map((b) => (
                        <Badge key={b.slug} variant="success" className="px-3 py-1">{b.label}</Badge>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}
            <Card>
              <div className="p-4 border-b border-gray-100 font-medium flex items-center justify-between">
                <span>Objets publiés</span>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Catégorie:</span>
                  <select value={filterCategory} onChange={(e) => { setItemsPage(0); setItems([]); setFilterCategory(e.target.value); }} className="px-2 py-1 border border-gray-300 rounded-lg text-sm">
                    <option value="">Toutes</option>
                    {categories.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  <label className="flex items-center gap-1 ml-2">
                    <input type="checkbox" checked={filterOnlyAvailable} onChange={(e) => { setItemsPage(0); setItems([]); setFilterOnlyAvailable(e.target.checked); }} />
                    <span>Disponibles</span>
                  </label>
                  <span className="text-gray-600 ml-4">Trier:</span>
                  <select value={sortMode} onChange={(e) => setSortMode(e.target.value as 'recent' | 'popular')} className="px-2 py-1 border border-gray-300 rounded-lg text-sm">
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
                    .map((it) => {
                      let dist: number | null = null;
                      if (userLoc && typeof it.latitude === 'number' && typeof it.longitude === 'number') {
                        const toRad = (v: number) => (v * Math.PI) / 180;
                        const R = 6371;
                        const dLat = toRad(it.latitude - userLoc.lat);
                        const dLon = toRad(it.longitude - userLoc.lng);
                        const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(userLoc.lat)) * Math.cos(toRad(it.latitude)) * Math.sin(dLon / 2) ** 2;
                        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                        dist = R * c;
                      }
                      return (
                        <Card key={it.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 pr-3">
                              <div className="flex items-center gap-2">
                                <div className="text-gray-900 font-medium truncate">{it.title}</div>
                                {dist != null && (
                                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px]">{dist.toFixed(1)} km</span>
                                )}
                              </div>
                              {it.description && (
                                <div className="text-gray-600 text-sm line-clamp-2">{it.description}</div>
                              )}
                            </div>
                            <Link to={`/items/${it.id}`} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm">Voir</Link>
                          </div>
                        </Card>
                      );
                    })}
                  {itemsHasMore && (
                    <div className="col-span-full flex justify-center pt-2">
                      <Button variant="ghost" className="border border-gray-300" onClick={() => setItemsPage((n) => n + 1)}>Voir plus</Button>
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
                <>
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
                {reviewsHasMore && (
                  <div className="p-4 flex justify-center">
                    <Button variant="ghost" className="border border-gray-300" onClick={() => setReviewsPage((n) => n + 1)}>Voir plus</Button>
                  </div>
                )}
                </>
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