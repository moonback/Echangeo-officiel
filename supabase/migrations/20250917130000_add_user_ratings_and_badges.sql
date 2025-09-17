-- User-to-user ratings tied to a request (mutual evaluations)
create table if not exists public.user_ratings (
  id uuid primary key default uuid_generate_v4(),
  request_id uuid not null references public.requests(id) on delete cascade,
  rater_id uuid not null references public.profiles(id) on delete cascade,
  rated_user_id uuid not null references public.profiles(id) on delete cascade,
  communication_score int2 not null check (communication_score between 1 and 5),
  punctuality_score int2 not null check (punctuality_score between 1 and 5),
  care_score int2 not null check (care_score between 1 and 5), -- care/condition of item returned or provided
  comment text,
  created_at timestamptz not null default now()
);

create unique index if not exists user_ratings_unique_per_request_rater on public.user_ratings(request_id, rater_id);
create index if not exists user_ratings_rated_idx on public.user_ratings(rated_user_id);
create index if not exists user_ratings_rater_idx on public.user_ratings(rater_id);

-- Aggregated reputation stats per profile
create or replace view public.profile_reputation_stats as
select
  rated_user_id as profile_id,
  count(*)::int as ratings_count,
  avg(communication_score)::numeric(10,4) as avg_communication,
  avg(punctuality_score)::numeric(10,4) as avg_punctuality,
  avg(care_score)::numeric(10,4) as avg_care,
  avg((communication_score + punctuality_score + care_score) / 3.0)::numeric(10,4) as overall_score
from public.user_ratings
group by rated_user_id;

-- Simple badge derivation using views
-- We infer lend/borrow counts from completed requests
create or replace view public.profile_activity_counts as
select
  p.id as profile_id,
  coalesce(sum(case when r.status = 'completed' and i.owner_id = p.id then 1 else 0 end), 0)::int as completed_lends,
  coalesce(sum(case when r.status = 'completed' and r.requester_id = p.id then 1 else 0 end), 0)::int as completed_borrows
from public.profiles p
left join public.requests r on r.requester_id = p.id or exists (
  select 1 from public.items i2 where i2.id = r.item_id and i2.owner_id = p.id
)
left join public.items i on i.id = r.item_id
group by p.id;

-- Derive badges as rows (profile_id, badge_slug, badge_label)
create or replace view public.profile_badges as
with stats as (
  select c.profile_id,
         c.completed_lends,
         c.completed_borrows,
         coalesce(s.overall_score, 0) as overall_score,
         coalesce(s.ratings_count, 0) as ratings_count
  from public.profile_activity_counts c
  left join public.profile_reputation_stats s on s.profile_id = c.profile_id
)
select profile_id,
       'super_lender'::text as badge_slug,
       'Super Prêteur'::text as badge_label
from stats where completed_lends >= 10 and overall_score >= 4.5
union all
select profile_id,
       'reliable_neighbor'::text as badge_slug,
       'Voisin Fiable'::text as badge_label
from stats where ratings_count >= 5 and overall_score >= 4.2
union all
select profile_id,
       'active_borrower'::text as badge_slug,
       'Emprunteur Actif'::text as badge_label
from stats where completed_borrows >= 10
;


