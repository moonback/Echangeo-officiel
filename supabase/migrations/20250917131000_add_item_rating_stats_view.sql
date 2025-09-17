-- Aggregate item rating stats used by UI
create or replace view public.item_rating_stats as
select
  i.id as item_id,
  avg(ir.score)::numeric as average_rating,
  count(ir.id) as ratings_count
from public.items i
left join public.item_ratings ir on ir.item_id = i.id
group by i.id;


