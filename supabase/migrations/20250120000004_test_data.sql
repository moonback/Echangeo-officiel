-- Migration pour ajouter des données de test pour les quartiers

-- Insérer des quartiers de test
INSERT INTO communities (id, name, description, city, postal_code, center_latitude, center_longitude, is_active, activity_level, created_at) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  'Quartier du Marais',
  'Un quartier historique et dynamique au cœur de Paris, parfait pour les échanges entre voisins.',
  'Paris',
  '75004',
  48.8566,
  2.3522,
  true,
  'active',
  now()
),
(
  '22222222-2222-2222-2222-222222222222',
  'Quartier de Belleville',
  'Un quartier multiculturel et créatif avec une forte communauté locale.',
  'Paris',
  '75019',
  48.8722,
  2.3767,
  true,
  'moderate',
  now()
),
(
  '33333333-3333-3333-3333-333333333333',
  'Quartier de Montmartre',
  'Le quartier des artistes et de la créativité, idéal pour les échanges culturels.',
  'Paris',
  '75018',
  48.8867,
  2.3431,
  true,
  'active',
  now()
),
(
  '44444444-4444-4444-4444-444444444444',
  'Quartier de la Défense',
  'Un quartier moderne et professionnel, parfait pour les échanges entre collègues.',
  'Courbevoie',
  '92400',
  48.8925,
  2.2389,
  true,
  'moderate',
  now()
),
(
  '55555555-5555-5555-5555-555555555555',
  'Quartier de Vincennes',
  'Un quartier familial et verdoyant, idéal pour les familles.',
  'Vincennes',
  '94300',
  48.8447,
  2.4376,
  true,
  'inactive',
  now()
);

-- Insérer des statistiques pour les quartiers
INSERT INTO community_stats (community_id, total_members, total_exchanges, total_events, total_items, last_activity) VALUES
('11111111-1111-1111-1111-111111111111', 25, 12, 3, 8, now()),
('22222222-2222-2222-2222-222222222222', 18, 8, 2, 5, now() - interval '2 days'),
('33333333-3333-3333-3333-333333333333', 32, 15, 4, 12, now() - interval '1 day'),
('44444444-4444-4444-4444-444444444444', 12, 5, 1, 3, now() - interval '5 days'),
('55555555-5555-5555-5555-555555555555', 8, 2, 0, 1, now() - interval '10 days');

-- Insérer quelques membres de test (si des profils existent)
-- Note: Ces insertions ne fonctionneront que si des profils existent dans la table profiles
INSERT INTO community_members (community_id, user_id, role, joined_at, is_active) 
SELECT 
  '11111111-1111-1111-1111-111111111111',
  id,
  'admin',
  now(),
  true
FROM profiles 
LIMIT 1
ON CONFLICT (community_id, user_id) DO NOTHING;

-- Insérer quelques événements de test
INSERT INTO community_events (id, community_id, title, description, event_type, start_date, end_date, location, max_participants, creator_id, is_active) VALUES
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  'Marché aux puces du quartier',
  'Un marché aux puces convivial où les habitants peuvent échanger et vendre leurs objets.',
  'market',
  now() + interval '7 days',
  now() + interval '7 days' + interval '8 hours',
  'Place des Vosges, Paris',
  50,
  (SELECT id FROM profiles LIMIT 1),
  true
),
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '33333333-3333-3333-3333-333333333333',
  'Atelier de réparation',
  'Apprenez à réparer vos objets avec vos voisins experts.',
  'workshop',
  now() + interval '14 days',
  now() + interval '14 days' + interval '3 hours',
  'Centre communautaire de Montmartre',
  20,
  (SELECT id FROM profiles LIMIT 1),
  true
);

-- Insérer quelques discussions de test
INSERT INTO community_discussions (id, community_id, title, content, author_id, category, created_at) VALUES
(
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '11111111-1111-1111-1111-111111111111',
  'Bienvenue dans notre quartier !',
  'Salut tout le monde ! Je suis nouveau dans le quartier et j''aimerais faire connaissance avec mes voisins.',
  (SELECT id FROM profiles LIMIT 1),
  'general',
  now() - interval '3 days'
),
(
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  '33333333-3333-3333-3333-333333333333',
  'Recherche outils de jardinage',
  'Bonjour ! Je cherche à emprunter une tondeuse pour entretenir mon petit jardin. Merci !',
  (SELECT id FROM profiles LIMIT 1),
  'items',
  now() - interval '1 day'
);

-- Commentaires sur les tables
COMMENT ON TABLE communities IS 'Quartiers de la plateforme TrocAll';
COMMENT ON TABLE community_members IS 'Membres des quartiers avec leurs rôles';
COMMENT ON TABLE community_events IS 'Événements organisés dans les quartiers';
COMMENT ON TABLE community_discussions IS 'Discussions entre membres des quartiers';
