import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProfile, useBorrowHistory, useLendHistory } from '../hooks/useProfiles';
import { supabase } from '../services/supabase';
import { categories } from '../utils/categories';
import { Star, MapPin, MessageCircle, Link as LinkIcon, Building2 } from 'lucide-react';
import Card from '../components/ui/Card';
import EmptyState from '../components/EmptyState';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { fetchProfileReputation, fetchProfileBadges } from '../hooks/useRatings';
import { useGamificationStats, useUserLevel } from '../hooks/useGamification';
import ReputationDisplay from '../components/ReputationDisplay';
import { useCommunity } from '../hooks/useCommunities';

type OwnedItem = { id: string; title: string; description?: string; created_at: string; is_available: boolean; category: string; latitude?: number; longitude?: number; community_id?: string };
type ReviewRow = { id: string; item_id: string; item_title: string; rater_name: string; score: number; comment?: string; created_at: string };

// Composant pour afficher un objet dans le profil avec le quartier
const ProfileItemCard: React.FC<{ item: OwnedItem }> = ({ item }) => {
  const { data: community } = useCommunity(item.community_id || '');

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="min-w-0 pr-3 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-gray-900 font-medium truncate">{item.title}</div>
          </div>
          {item.description && (
            <div className="text-gray-600 text-sm line-clamp-2 mb-2">{item.description}</div>
          )}
          {/* Quartier */}
          {community && (
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <Building2 className="w-3 h-3" />
              <span className="font-medium">
                {community.name}
                {community.city && ` • ${community.city}`}
              </span>
            </div>
          )}
        </div>
        <Link to={`/items/${item.id}`} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm ml-2">Voir</Link>
      </div>
    </Card>
  );
};

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: profile, isLoading } = useProfile(id);
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

  // Suppression de l'effet de géolocalisation non utilisé

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/40 relative overflow-hidden">
      {/* Background Ultra-Moderne */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Grille subtile */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px] opacity-30" />
        
        {/* Dégradés radiaux animés */}
        <motion.div 
          className="absolute top-10 left-10 w-[600px] h-[600px] bg-gradient-radial from-brand-200/20 via-brand-300/10 to-transparent rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-gradient-radial from-emerald-200/20 via-teal-300/10 to-transparent rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4],
            x: [0, -40, 0],
            y: [0, 20, 0]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        
        {/* Éléments flottants */}
        <motion.div 
          className="absolute top-20 right-1/4 w-4 h-4 bg-brand-400/40 rounded-full"
          animate={{ 
            y: [0, -20, 0],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/3 left-1/3 w-6 h-6 bg-emerald-400/30 rounded-full"
          animate={{ 
            y: [0, 15, 0],
            x: [0, 10, 0],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      <div className="relative max-w-12xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Header Ultra-Moderne */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-12"
          >
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-slate-900 via-brand-600 to-slate-900 bg-clip-text text-transparent leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {profile?.full_name || profile?.email || 'Profil utilisateur'}
            </motion.h1>
            <motion.p 
              className="text-slate-600 text-xl leading-relaxed max-w-3xl font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Découvrez le profil et les objets de ce membre de la communauté
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-3">
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
              >
                {/* Effet de glow animé */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-brand-400/20 via-brand-500/10 to-emerald-400/20 rounded-3xl blur-xl"
                  animate={{ 
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Carte principale avec glassmorphism */}
                <Card className="relative p-0 border-0 bg-white/80 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-3xl overflow-hidden">
                  <div className="relative bg-gradient-to-br from-brand-50/80 via-white/60 to-purple-50/40 p-6 md:p-8">
                    {/* Background Decorations */}
                    <motion.div 
                      className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-200/20 to-purple-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.4, 0.2]
                      }}
                      transition={{ 
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <motion.div 
                      className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-200/20 to-brand-200/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"
                      animate={{ 
                        scale: [1.2, 1, 1.2],
                        opacity: [0.3, 0.5, 0.3]
                      }}
                      transition={{ 
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                      }}
                    />
                
                {isLoading ? (
                  <div className="text-gray-500 text-sm">Chargement…</div>
                ) : profile ? (
                  <div className="relative flex items-start md:items-center gap-6 md:gap-8 flex-col md:flex-row">
                    {/* Avatar Ultra-Moderne avec Glow */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                      className="relative group"
                    >
                      {/* Effet de glow multi-couches */}
                      <motion.div 
                        className="absolute -inset-4 rounded-full bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 opacity-20 blur-xl"
                        animate={{ 
                          scale: [1, 1.1, 1],
                          opacity: [0.2, 0.4, 0.2]
                        }}
                        transition={{ 
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      <motion.div 
                        className="absolute -inset-3 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 opacity-30 blur-lg"
                        animate={{ 
                          scale: [1.1, 1, 1.1],
                          opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{ 
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.5
                        }}
                      />
                      <motion.div 
                        className="absolute -inset-2 rounded-full bg-gradient-to-r from-emerald-400 to-brand-500 opacity-40 blur-md"
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.4, 0.6, 0.4]
                        }}
                        transition={{ 
                          duration: 5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 1
                        }}
                      />
                      
                      <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full bg-white border-4 border-white shadow-2xl overflow-hidden group-hover:shadow-3xl transition-shadow duration-300">
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
                            <span className="text-brand-600 text-3xl font-bold">
                              {(profile.full_name || profile.email || '?').slice(0,1).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <motion.h2 
                        className="text-2xl md:text-3xl font-bold text-slate-900 truncate mb-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                      >
                        {profile.full_name || profile.email}
                      </motion.h2>
                      {profile.address && (
                        <motion.div 
                          className="mt-2 mb-4"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 }}
                        >
                          <span className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-xl px-4 py-2 rounded-2xl border border-slate-200/50 shadow-lg">
                            <div className="p-1.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
                              <MapPin className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-semibold text-slate-700">{profile.address}</span>
                          </span>
                        </motion.div>
                      )}
                      {profile.bio && (
                        <motion.p 
                          className="mt-3 text-slate-700 text-base md:text-lg max-w-prose leading-relaxed"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.9 }}
                        >
                          {profile.bio}
                        </motion.p>
                      )}
                    </div>
                    <motion.div 
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.0 }}
                    >
                      {id && (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Link to={`/chat/${id}`}>
                            <Button 
                              variant="secondary" 
                              size="md" 
                              leftIcon={<MessageCircle size={18} />}
                              className="shadow-lg hover:shadow-xl font-semibold px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 text-blue-700 border border-blue-200/50"
                            >
                              Discuter
                            </Button>
                          </Link>
                        </motion.div>
                      )}
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          variant="ghost" 
                          size="md" 
                          className="border border-slate-200/50 backdrop-blur-sm font-semibold px-6 py-3 rounded-2xl hover:bg-brand-50 hover:text-brand-700" 
                          leftIcon={<LinkIcon size={18} />} 
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(window.location.href);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 1500);
                            } catch {
                              // Do nothing
                            }
                          }}
                        >
                          {copied ? 'Copié' : 'Copier le lien'}
                        </Button>
                      </motion.div>
                    </motion.div>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">Profil introuvable.</div>
                )}
                  </div>
                </Card>
              </motion.div>
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
                      return <ProfileItemCard key={it.id} item={it} />;
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
    </div>
  );
};

export default ProfilePage;
