-- Script pour ajouter des événements de test dans les communautés
-- Assurez-vous que les communautés existent avant d'exécuter ce script

-- 1. Vérifier les communautés existantes
SELECT 
  'Communautés existantes' as info,
  COUNT(*) as nombre,
  STRING_AGG(name, ', ') as noms
FROM communities 
WHERE is_active = true;

-- 2. Ajouter des événements de test pour chaque communauté
INSERT INTO community_events (
  id,
  community_id,
  title,
  description,
  event_type,
  location,
  latitude,
  longitude,
  start_date,
  end_date,
  max_participants,
  created_by,
  is_active,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  c.id,
  CASE 
    WHEN c.name = 'Belleville' THEN 'Troc Party du quartier'
    WHEN c.name = 'Canal Saint-Martin' THEN 'Rencontre autour du canal'
    WHEN c.name = 'Montmartre' THEN 'Atelier de peinture'
    WHEN c.name = 'Marais' THEN 'Événement social du Marais'
    ELSE 'Événement communautaire'
  END,
  CASE 
    WHEN c.name = 'Belleville' THEN 'Venez échanger vos objets inutiles contre des trésors ! Une grande fête du troc organisée par et pour les habitants du quartier.'
    WHEN c.name = 'Canal Saint-Martin' THEN 'Rencontre conviviale pour découvrir vos voisins et partager des moments agréables au bord du canal.'
    WHEN c.name = 'Montmartre' THEN 'Atelier de peinture en plein air pour tous les niveaux. Matériel fourni, bonne humeur garantie !'
    WHEN c.name = 'Marais' THEN 'Événement social pour créer du lien dans le quartier historique du Marais.'
    ELSE 'Un événement convivial pour rencontrer vos voisins et partager de bons moments.'
  END,
  CASE 
    WHEN c.name = 'Belleville' THEN 'swap'
    WHEN c.name = 'Canal Saint-Martin' THEN 'meetup'
    WHEN c.name = 'Montmartre' THEN 'workshop'
    WHEN c.name = 'Marais' THEN 'social'
    ELSE 'meetup'
  END,
  CASE 
    WHEN c.name = 'Belleville' THEN 'Place de Belleville'
    WHEN c.name = 'Canal Saint-Martin' THEN 'Quai de Jemmapes'
    WHEN c.name = 'Montmartre' THEN 'Place du Tertre'
    WHEN c.name = 'Marais' THEN 'Place des Vosges'
    ELSE 'Lieu à définir'
  END,
  CASE 
    WHEN c.name = 'Belleville' THEN 48.8722
    WHEN c.name = 'Canal Saint-Martin' THEN 48.8708
    WHEN c.name = 'Montmartre' THEN 48.8867
    WHEN c.name = 'Marais' THEN 48.8566
    ELSE c.center_latitude
  END,
  CASE 
    WHEN c.name = 'Belleville' THEN 2.3767
    WHEN c.name = 'Canal Saint-Martin' THEN 2.3686
    WHEN c.name = 'Montmartre' THEN 2.3431
    WHEN c.name = 'Marais' THEN 2.3522
    ELSE c.center_longitude
  END,
  CASE 
    WHEN c.name = 'Belleville' THEN NOW() + INTERVAL '7 days'
    WHEN c.name = 'Canal Saint-Martin' THEN NOW() + INTERVAL '3 days'
    WHEN c.name = 'Montmartre' THEN NOW() + INTERVAL '10 days'
    WHEN c.name = 'Marais' THEN NOW() + INTERVAL '5 days'
    ELSE NOW() + INTERVAL '7 days'
  END,
  CASE 
    WHEN c.name = 'Belleville' THEN NOW() + INTERVAL '7 days 4 hours'
    WHEN c.name = 'Canal Saint-Martin' THEN NOW() + INTERVAL '3 days 2 hours'
    WHEN c.name = 'Montmartre' THEN NOW() + INTERVAL '10 days 3 hours'
    WHEN c.name = 'Marais' THEN NOW() + INTERVAL '5 days 2 hours'
    ELSE NOW() + INTERVAL '7 days 3 hours'
  END,
  CASE 
    WHEN c.name = 'Belleville' THEN 50
    WHEN c.name = 'Canal Saint-Martin' THEN 30
    WHEN c.name = 'Montmartre' THEN 15
    WHEN c.name = 'Marais' THEN 40
    ELSE 25
  END,
  (SELECT id FROM profiles LIMIT 1), -- Premier utilisateur disponible
  true,
  NOW(),
  NOW()
FROM communities c
WHERE c.is_active = true
AND NOT EXISTS (
  SELECT 1 FROM community_events ce 
  WHERE ce.community_id = c.id 
  AND ce.is_active = true
);

-- 3. Ajouter quelques événements supplémentaires pour plus de variété
INSERT INTO community_events (
  id,
  community_id,
  title,
  description,
  event_type,
  location,
  latitude,
  longitude,
  start_date,
  end_date,
  max_participants,
  created_by,
  is_active,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  c.id,
  CASE 
    WHEN c.name = 'Belleville' THEN 'Atelier de réparation vélo'
    WHEN c.name = 'Canal Saint-Martin' THEN 'Pique-nique au canal'
    WHEN c.name = 'Montmartre' THEN 'Visite guidée du quartier'
    WHEN c.name = 'Marais' THEN 'Marché aux puces communautaire'
    ELSE 'Événement spécial'
  END,
  CASE 
    WHEN c.name = 'Belleville' THEN 'Apprenez à réparer votre vélo avec vos voisins. Outils et conseils partagés.'
    WHEN c.name = 'Canal Saint-Martin' THEN 'Pique-nique convivial au bord du canal. Chacun apporte quelque chose à partager.'
    WHEN c.name = 'Montmartre' THEN 'Découvrez les secrets et l\'histoire du quartier de Montmartre avec un guide local.'
    WHEN c.name = 'Marais' THEN 'Marché aux puces organisé par les habitants du Marais. Venez vendre ou acheter des objets vintage.'
    ELSE 'Un événement spécial pour la communauté.'
  END,
  CASE 
    WHEN c.name = 'Belleville' THEN 'workshop'
    WHEN c.name = 'Canal Saint-Martin' THEN 'social'
    WHEN c.name = 'Montmartre' THEN 'meetup'
    WHEN c.name = 'Marais' THEN 'swap'
    ELSE 'meetup'
  END,
  CASE 
    WHEN c.name = 'Belleville' THEN 'Espace vert de Belleville'
    WHEN c.name = 'Canal Saint-Martin' THEN 'Square Frédéric Lemaître'
    WHEN c.name = 'Montmartre' THEN 'Basilique du Sacré-Cœur'
    WHEN c.name = 'Marais' THEN 'Place des Vosges'
    ELSE 'Lieu à définir'
  END,
  CASE 
    WHEN c.name = 'Belleville' THEN 48.8722
    WHEN c.name = 'Canal Saint-Martin' THEN 48.8708
    WHEN c.name = 'Montmartre' THEN 48.8867
    WHEN c.name = 'Marais' THEN 48.8566
    ELSE c.center_latitude
  END,
  CASE 
    WHEN c.name = 'Belleville' THEN 2.3767
    WHEN c.name = 'Canal Saint-Martin' THEN 2.3686
    WHEN c.name = 'Montmartre' THEN 2.3431
    WHEN c.name = 'Marais' THEN 2.3522
    ELSE c.center_longitude
  END,
  CASE 
    WHEN c.name = 'Belleville' THEN NOW() + INTERVAL '14 days'
    WHEN c.name = 'Canal Saint-Martin' THEN NOW() + INTERVAL '8 days'
    WHEN c.name = 'Montmartre' THEN NOW() + INTERVAL '12 days'
    WHEN c.name = 'Marais' THEN NOW() + INTERVAL '15 days'
    ELSE NOW() + INTERVAL '10 days'
  END,
  CASE 
    WHEN c.name = 'Belleville' THEN NOW() + INTERVAL '14 days 3 hours'
    WHEN c.name = 'Canal Saint-Martin' THEN NOW() + INTERVAL '8 days 2 hours'
    WHEN c.name = 'Montmartre' THEN NOW() + INTERVAL '12 days 2 hours'
    WHEN c.name = 'Marais' THEN NOW() + INTERVAL '15 days 4 hours'
    ELSE NOW() + INTERVAL '10 days 2 hours'
  END,
  CASE 
    WHEN c.name = 'Belleville' THEN 20
    WHEN c.name = 'Canal Saint-Martin' THEN 25
    WHEN c.name = 'Montmartre' THEN 30
    WHEN c.name = 'Marais' THEN 35
    ELSE 20
  END,
  (SELECT id FROM profiles LIMIT 1), -- Premier utilisateur disponible
  true,
  NOW(),
  NOW()
FROM communities c
WHERE c.is_active = true
AND c.name IN ('Belleville', 'Canal Saint-Martin', 'Montmartre', 'Marais');

-- 4. Ajouter quelques événements passés pour les tests
INSERT INTO community_events (
  id,
  community_id,
  title,
  description,
  event_type,
  location,
  latitude,
  longitude,
  start_date,
  end_date,
  max_participants,
  created_by,
  is_active,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  c.id,
  'Événement passé - ' || CASE 
    WHEN c.name = 'Belleville' THEN 'Troc Party de la semaine dernière'
    WHEN c.name = 'Canal Saint-Martin' THEN 'Rencontre du mois dernier'
    WHEN c.name = 'Montmartre' THEN 'Atelier peinture passé'
    WHEN c.name = 'Marais' THEN 'Événement social passé'
    ELSE 'Événement communautaire passé'
  END,
  'Cet événement a eu lieu récemment et a été un succès !',
  'meetup',
  CASE 
    WHEN c.name = 'Belleville' THEN 'Place de Belleville'
    WHEN c.name = 'Canal Saint-Martin' THEN 'Quai de Jemmapes'
    WHEN c.name = 'Montmartre' THEN 'Place du Tertre'
    WHEN c.name = 'Marais' THEN 'Place des Vosges'
    ELSE 'Lieu à définir'
  END,
  c.center_latitude,
  c.center_longitude,
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '7 days 3 hours',
  30,
  (SELECT id FROM profiles LIMIT 1),
  true,
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '7 days'
FROM communities c
WHERE c.is_active = true
LIMIT 2;

-- 5. Vérifier les événements créés
SELECT 
  'Événements créés' as info,
  COUNT(*) as nombre_total,
  COUNT(CASE WHEN start_date > NOW() THEN 1 END) as a_venir,
  COUNT(CASE WHEN start_date <= NOW() THEN 1 END) as passes,
  COUNT(CASE WHEN event_type = 'meetup' THEN 1 END) as rencontres,
  COUNT(CASE WHEN event_type = 'swap' THEN 1 END) as trocs,
  COUNT(CASE WHEN event_type = 'workshop' THEN 1 END) as ateliers,
  COUNT(CASE WHEN event_type = 'social' THEN 1 END) as sociaux
FROM community_events 
WHERE is_active = true;

-- 6. Afficher la liste des événements créés
SELECT 
  ce.title,
  c.name as communaute,
  ce.event_type,
  ce.location,
  ce.start_date,
  ce.max_participants,
  ce.is_active
FROM community_events ce
JOIN communities c ON ce.community_id = c.id
WHERE ce.is_active = true
ORDER BY ce.start_date ASC;
