-- Insertion d'objets fictifs mais pertinents pour chaque quartier des Yvelines
-- Utilise les UIDs utilisateur fournis et les communautés créées précédemment

-- D'abord, récupérer les IDs des communautés créées
WITH community_ids AS (
  SELECT id, name, city, center_latitude, center_longitude FROM public.communities 
  WHERE country = 'France' 
    AND city IN (
      'Versailles', 'Saint-Germain-en-Laye', 'Mantes-la-Jolie', 'Rambouillet', 'Poissy',
      'Conflans-Sainte-Honorine', 'Houilles', 'Sartrouville', 'Le Chesnay', 'Vélizy-Villacoublay',
      'Trappes', 'Guyancourt', 'Montigny-le-Bretonneux', 'Élancourt', 'Maurepas', 'Plaisir',
      'Houdan', 'Mantes-la-Ville', 'Bonnières-sur-Seine', 'Limay', 'Meulan-en-Yvelines',
      'Les Mureaux', 'Aubergenville', 'Épône', 'Gargenville', 'Jouy-en-Josas', 'Buc',
      'Toussus-le-Noble', 'Châteaufort', 'Magny-les-Hameaux', 'Saint-Rémy-lès-Chevreuse',
      'Chevreuse', 'Dampierre-en-Yvelines', 'Maintenon', 'Chartres'
    )
),
-- UIDs utilisateur disponibles
user_ids AS (
  SELECT unnest(ARRAY[
    '3341d50d-778a-47fb-8668-6cbab95482d4'::uuid,
    'b312d982-528c-4a99-8a31-0bb99ad1ea79'::uuid,
    '9bc3d5e5-5e26-4119-862f-9753476fe895'::uuid
  ]) as user_id
)

-- Insertion des objets
INSERT INTO public.items (
  owner_id,
  title,
  description,
  category,
  condition,
  is_available,
  brand,
  model,
  estimated_value,
  tags,
  offer_type,
  desired_items,
  community_id,
  latitude,
  longitude,
  location_hint,
  created_at
)
SELECT 
  (SELECT user_id FROM user_ids ORDER BY random() LIMIT 1) as owner_id,
  item_data.title,
  item_data.description,
  item_data.category,
  item_data.condition,
  true as is_available,
  item_data.brand,
  item_data.model,
  item_data.estimated_value,
  item_data.tags,
  item_data.offer_type,
  item_data.desired_items,
  c.id as community_id,
  c.center_latitude + (random() - 0.5) * 0.01 as latitude, -- Variation autour du centre
  c.center_longitude + (random() - 0.5) * 0.01 as longitude,
  c.name as location_hint,
  now() - (random() * interval '30 days') as created_at -- Dates aléatoires sur les 30 derniers jours
FROM community_ids c
CROSS JOIN (
  VALUES 
    -- Outils et bricolage
    ('Perceuse visseuse Bosch', 'Perceuse visseuse Bosch 18V en excellent état, avec batterie et chargeur. Parfait pour tous vos travaux de bricolage.', 'tools', 'excellent', 'Bosch', 'GSR 18V-21', 80.00, ARRAY['bricolage', 'perceuse', 'professionnel'], 'loan', ''),
    ('Scie circulaire Makita', 'Scie circulaire Makita 190mm, lame incluse. Très peu utilisée, comme neuve.', 'tools', 'excellent', 'Makita', 'HS7601', 120.00, ARRAY['scie', 'bricolage', 'construction'], 'loan', ''),
    ('Tronçonneuse Stihl', 'Tronçonneuse Stihl MS 180, idéale pour couper du bois de chauffage. Entretien récent.', 'tools', 'good', 'Stihl', 'MS 180', 200.00, ARRAY['tronçonneuse', 'bois', 'jardin'], 'loan', ''),
    ('Marteau et burins', 'Lot de marteaux et burins professionnels. Parfait pour la démolition et la rénovation.', 'tools', 'good', 'Stanley', 'FatMax', 25.00, ARRAY['marteau', 'burin', 'démolition'], 'donation', ''),
    
    -- Électronique
    ('iPhone 12 Pro', 'iPhone 12 Pro 128GB, écran parfait, batterie à 95%. Avec coque et chargeur.', 'electronics', 'excellent', 'Apple', 'iPhone 12 Pro', 600.00, ARRAY['iphone', 'smartphone', 'apple'], 'trade', 'Samsung Galaxy ou équivalent'),
    ('MacBook Air M1', 'MacBook Air M1 256GB, très peu utilisé. Parfait pour le travail et les études.', 'electronics', 'excellent', 'Apple', 'MacBook Air M1', 800.00, ARRAY['macbook', 'laptop', 'apple'], 'loan', ''),
    ('PlayStation 5', 'PS5 avec 2 manettes et 3 jeux. Console en parfait état.', 'electronics', 'excellent', 'Sony', 'PlayStation 5', 500.00, ARRAY['ps5', 'jeux', 'console'], 'loan', ''),
    ('Drone DJI Mini 2', 'Drone DJI Mini 2 avec 2 batteries et sac de transport. Parfait pour débuter.', 'electronics', 'good', 'DJI', 'Mini 2', 400.00, ARRAY['drone', 'photo', 'vidéo'], 'loan', ''),
    
    -- Livres
    ('Collection Harry Potter', 'Collection complète Harry Potter en français, édition illustrée. Très bon état.', 'books', 'excellent', 'Gallimard', 'Harry Potter', 80.00, ARRAY['harry potter', 'fantasy', 'jeunesse'], 'loan', ''),
    ('Larousse Gastronomique', 'Larousse Gastronomique édition 2020. Encyclopédie culinaire complète.', 'books', 'good', 'Larousse', 'Gastronomique', 60.00, ARRAY['cuisine', 'gastronomie', 'recettes'], 'loan', ''),
    ('Atlas des Yvelines', 'Atlas historique et géographique des Yvelines. Très intéressant pour découvrir la région.', 'books', 'excellent', 'Éditions du Patrimoine', 'Atlas Yvelines', 35.00, ARRAY['histoire', 'yvelines', 'géographie'], 'donation', ''),
    ('Romans policiers', 'Lot de 10 romans policiers français. Auteurs variés, très bon état.', 'books', 'good', 'Divers', 'Romans policiers', 20.00, ARRAY['policier', 'romans', 'français'], 'donation', ''),
    
    -- Sport
    ('Vélo électrique', 'Vélo électrique Giant, autonomie 60km. Parfait pour les trajets quotidiens.', 'sports', 'excellent', 'Giant', 'Explore E+', 1200.00, ARRAY['vélo', 'électrique', 'transport'], 'loan', ''),
    ('Raquettes de tennis', 'Raquettes de tennis Babolat, modèle Pure Drive. Très bon état.', 'sports', 'good', 'Babolat', 'Pure Drive', 150.00, ARRAY['tennis', 'raquette', 'sport'], 'loan', ''),
    ('Tapis de yoga', 'Tapis de yoga écologique, épaisseur 6mm. Parfait pour la pratique.', 'sports', 'excellent', 'Liforme', 'Yoga Mat', 80.00, ARRAY['yoga', 'fitness', 'bien-être'], 'loan', ''),
    ('Haltères ajustables', 'Haltères ajustables de 2 à 20kg. Parfait pour l''entraînement à domicile.', 'sports', 'good', 'Decathlon', 'Haltères', 100.00, ARRAY['musculation', 'fitness', 'haltères'], 'loan', ''),
    
    -- Cuisine
    ('Robot pâtissier KitchenAid', 'Robot pâtissier KitchenAid rouge, accessoires inclus. Très peu utilisé.', 'kitchen', 'excellent', 'KitchenAid', 'Artisan', 300.00, ARRAY['robot', 'pâtisserie', 'cuisine'], 'loan', ''),
    ('Cafetière expresso Delonghi', 'Machine à café expresso Delonghi, mouture intégrée. Café de qualité.', 'kitchen', 'good', 'DeLonghi', 'Magnifica S', 250.00, ARRAY['café', 'expresso', 'machine'], 'loan', ''),
    ('Cocotte en fonte Le Creuset', 'Cocotte en fonte Le Creuset 24cm, couleur bleue. Parfait pour mijoter.', 'kitchen', 'excellent', 'Le Creuset', 'Cocotte fonte', 180.00, ARRAY['cocotte', 'fonte', 'cuisson'], 'loan', ''),
    ('Mixeur plongeant Braun', 'Mixeur plongeant Braun, très puissant. Parfait pour les soupes et smoothies.', 'kitchen', 'good', 'Braun', 'Multiquick', 60.00, ARRAY['mixeur', 'smoothie', 'soupe'], 'loan', ''),
    
    -- Jardin
    ('Tondeuse à gazon', 'Tondeuse à gazon électrique Bosch, largeur 37cm. Parfait pour petits jardins.', 'garden', 'good', 'Bosch', 'Rotak 37', 150.00, ARRAY['tondeuse', 'gazon', 'jardin'], 'loan', ''),
    ('Taille-haie électrique', 'Taille-haie électrique Black+Decker, longueur de coupe 50cm.', 'garden', 'good', 'Black+Decker', 'HT22', 80.00, ARRAY['taille-haie', 'jardin', 'élagage'], 'loan', ''),
    ('Arrosoir en zinc', 'Arrosoir en zinc ancien, très décoratif. Parfait pour le jardin ou la déco.', 'garden', 'excellent', 'Vintage', 'Arrosoir zinc', 45.00, ARRAY['arrosoir', 'vintage', 'déco'], 'donation', ''),
    ('Semences potagères', 'Lot de semences potagères bio, variétés anciennes. Parfait pour débuter un potager.', 'garden', 'excellent', 'Bio', 'Semences', 15.00, ARRAY['semences', 'bio', 'potager'], 'donation', ''),
    
    -- Jouets
    ('Lego Architecture', 'Set Lego Architecture Tour Eiffel, complet avec notice. Très bon état.', 'toys', 'excellent', 'Lego', 'Architecture', 60.00, ARRAY['lego', 'architecture', 'construction'], 'loan', ''),
    ('Poupée Barbie vintage', 'Poupée Barbie des années 80, avec vêtements. État correct pour collection.', 'toys', 'fair', 'Mattel', 'Barbie vintage', 30.00, ARRAY['barbie', 'vintage', 'collection'], 'donation', ''),
    ('Jeu de société Catan', 'Jeu de société Les Colons de Catane, extension incluse. Très bon état.', 'toys', 'excellent', 'Asmodée', 'Catan', 40.00, ARRAY['jeu', 'stratégie', 'famille'], 'loan', ''),
    ('Puzzle 1000 pièces', 'Puzzle 1000 pièces paysage de Versailles. Encore dans son emballage.', 'toys', 'excellent', 'Ravensburger', 'Versailles', 20.00, ARRAY['puzzle', 'versailles', 'patience'], 'donation', ''),
    
    -- Mode
    ('Manteau d''hiver', 'Manteau d''hiver femme, taille M, couleur camel. Très bon état, porté 2 fois.', 'fashion', 'excellent', 'Zara', 'Manteau hiver', 80.00, ARRAY['manteau', 'hiver', 'femme'], 'donation', ''),
    ('Sac à main cuir', 'Sac à main en cuir véritable, marque française. Très élégant.', 'fashion', 'good', 'Longchamp', 'Le Pliage', 120.00, ARRAY['sac', 'cuir', 'élégant'], 'loan', ''),
    ('Chaussures de sport', 'Chaussures de sport Nike, taille 42, très peu portées.', 'fashion', 'excellent', 'Nike', 'Air Max', 100.00, ARRAY['chaussures', 'sport', 'nike'], 'loan', ''),
    ('Costume homme', 'Costume homme 3 pièces, taille 52, couleur bleu marine. Très bon état.', 'fashion', 'good', 'Hugo Boss', 'Costume', 200.00, ARRAY['costume', 'homme', 'élégant'], 'loan', ''),
    
    -- Meubles
    ('Table basse design', 'Table basse design en bois massif, style scandinave. Très élégante.', 'furniture', 'excellent', 'IKEA', 'Hemnes', 150.00, ARRAY['table', 'design', 'bois'], 'loan', ''),
    ('Fauteuil vintage', 'Fauteuil vintage années 70, récemment retapissé. Très confortable.', 'furniture', 'good', 'Vintage', 'Fauteuil 70s', 120.00, ARRAY['fauteuil', 'vintage', 'confort'], 'loan', ''),
    ('Étagère bibliothèque', 'Étagère bibliothèque 5 niveaux, blanc. Parfait pour ranger les livres.', 'furniture', 'good', 'IKEA', 'Billy', 80.00, ARRAY['étagère', 'livres', 'rangement'], 'loan', ''),
    ('Lampadaire design', 'Lampadaire design avec abat-jour en papier, très moderne.', 'furniture', 'excellent', 'Design', 'Lampadaire', 60.00, ARRAY['lampe', 'design', 'éclairage'], 'loan', ''),
    
    -- Musique
    ('Guitare acoustique', 'Guitare acoustique Yamaha, modèle débutant. Parfait pour apprendre.', 'music', 'good', 'Yamaha', 'F310', 150.00, ARRAY['guitare', 'acoustique', 'musique'], 'loan', ''),
    ('Piano numérique', 'Piano numérique Casio, 88 touches, casque inclus. Très bon état.', 'music', 'excellent', 'Casio', 'PX-160', 400.00, ARRAY['piano', 'numérique', 'musique'], 'loan', ''),
    ('Enceintes Bluetooth', 'Enceintes Bluetooth JBL, son excellent. Parfait pour la musique.', 'music', 'good', 'JBL', 'Charge 4', 100.00, ARRAY['enceintes', 'bluetooth', 'son'], 'loan', ''),
    ('Vinyle Beatles', 'Collection de vinyles Beatles, albums originaux. Pour collectionneurs.', 'music', 'excellent', 'The Beatles', 'Albums', 200.00, ARRAY['vinyle', 'beatles', 'collection'], 'trade', 'Vinyles Rolling Stones ou équivalent'),
    
    -- Bébé
    ('Poussette 3 en 1', 'Poussette 3 en 1 Chicco, très pratique. Très bon état général.', 'baby', 'good', 'Chicco', 'Poussette 3en1', 200.00, ARRAY['poussette', 'bébé', 'transport'], 'loan', ''),
    ('Siège auto groupe 1', 'Siège auto groupe 1 Maxi-Cosi, homologué. Très sécurisé.', 'baby', 'excellent', 'Maxi-Cosi', 'Pebble', 150.00, ARRAY['siège', 'auto', 'sécurité'], 'loan', ''),
    ('Jouets d''éveil', 'Lot de jouets d''éveil pour bébé 6-18 mois. Très bon état.', 'baby', 'good', 'Fisher-Price', 'Éveil', 50.00, ARRAY['jouets', 'éveil', 'bébé'], 'donation', ''),
    ('Vêtements bébé', 'Lot de vêtements bébé 0-6 mois, marques de qualité. Très bon état.', 'baby', 'excellent', 'Divers', 'Vêtements', 30.00, ARRAY['vêtements', 'bébé', 'qualité'], 'donation', ''),
    
    -- Art
    ('Tableau peinture', 'Tableau peinture à l''huile, paysage de la Seine. Artiste local.', 'art', 'excellent', 'Artiste local', 'Paysage Seine', 150.00, ARRAY['peinture', 'paysage', 'art'], 'loan', ''),
    ('Sculpture céramique', 'Sculpture en céramique, pièce unique. Très décorative.', 'art', 'good', 'Artisan', 'Céramique', 80.00, ARRAY['sculpture', 'céramique', 'déco'], 'loan', ''),
    ('Affiche vintage', 'Affiche vintage années 60, très bonne conservation. Parfait pour déco.', 'art', 'excellent', 'Vintage', 'Affiche 60s', 40.00, ARRAY['affiche', 'vintage', 'déco'], 'donation', ''),
    ('Carnet de croquis', 'Carnet de croquis artiste, pages blanches. Parfait pour dessiner.', 'art', 'excellent', 'Moleskine', 'Carnet', 15.00, ARRAY['carnet', 'dessin', 'artiste'], 'donation', ''),
    
    -- Beauté
    ('Coiffeur professionnel', 'Service de coiffure à domicile, coupe et brushing. Coiffeuse expérimentée.', 'services', 'excellent', 'Service', 'Coiffure', 0.00, ARRAY['coiffure', 'service', 'beauté'], 'loan', ''),
    ('Maquillage professionnel', 'Service de maquillage pour événements, mariages, soirées. Maquilleuse pro.', 'services', 'excellent', 'Service', 'Maquillage', 0.00, ARRAY['maquillage', 'service', 'beauté'], 'loan', ''),
    ('Manucure et pédicure', 'Service de manucure et pédicure à domicile. Esthéticienne diplômée.', 'services', 'excellent', 'Service', 'Manucure', 0.00, ARRAY['manucure', 'pédicure', 'beauté'], 'loan', ''),
    ('Massage relaxant', 'Service de massage relaxant à domicile. Masseur diplômé.', 'services', 'excellent', 'Service', 'Massage', 0.00, ARRAY['massage', 'relaxation', 'bien-être'], 'loan', ''),
    
    -- Auto
    ('Pneus hiver', 'Lot de 4 pneus hiver 205/55 R16, très peu utilisés. Marque Michelin.', 'auto', 'excellent', 'Michelin', 'Alpin A4', 200.00, ARRAY['pneus', 'hiver', 'auto'], 'loan', ''),
    ('Batterie auto', 'Batterie auto 12V 70Ah, récente. Parfait état de fonctionnement.', 'auto', 'excellent', 'Varta', 'Batterie 70Ah', 120.00, ARRAY['batterie', 'auto', 'électricité'], 'loan', ''),
    ('Kit de dépannage', 'Kit de dépannage complet pour voiture. Très pratique en cas de panne.', 'auto', 'good', 'Divers', 'Kit dépannage', 50.00, ARRAY['dépannage', 'auto', 'sécurité'], 'loan', ''),
    ('Nettoyage auto', 'Service de nettoyage automobile intérieur et extérieur. Professionnel.', 'services', 'excellent', 'Service', 'Nettoyage auto', 0.00, ARRAY['nettoyage', 'auto', 'service'], 'loan', ''),
    
    -- Bureau
    ('Chaise de bureau ergonomique', 'Chaise de bureau ergonomique, très confortable. Parfait pour le télétravail.', 'office', 'excellent', 'Herman Miller', 'Aeron', 300.00, ARRAY['chaise', 'bureau', 'ergonomie'], 'loan', ''),
    ('Écran 27 pouces', 'Écran 27 pouces 4K, très bonne qualité d''image. Parfait pour le travail.', 'electronics', 'excellent', 'Dell', 'UltraSharp 27', 250.00, ARRAY['écran', '4k', 'bureau'], 'loan', ''),
    ('Imprimante laser', 'Imprimante laser HP, noir et blanc. Très économique en encre.', 'office', 'good', 'HP', 'LaserJet', 100.00, ARRAY['imprimante', 'laser', 'bureau'], 'loan', ''),
    ('Organiseur de bureau', 'Organiseur de bureau en bois, très pratique. Parfait pour ranger.', 'office', 'excellent', 'Design', 'Organiseur', 40.00, ARRAY['organiseur', 'bureau', 'rangement'], 'loan', ''),
    
    -- Autres
    ('Tente de camping', 'Tente de camping 4 personnes, très étanche. Parfait pour les week-ends.', 'other', 'good', 'Quechua', 'Tente 4P', 120.00, ARRAY['tente', 'camping', 'nature'], 'loan', ''),
    ('Sac de couchage', 'Sac de couchage confort -5°C, très chaud. Parfait pour l''hiver.', 'other', 'excellent', 'The North Face', 'Sac couchage', 80.00, ARRAY['sac', 'couchage', 'camping'], 'loan', ''),
    ('Réveil vintage', 'Réveil vintage années 50, fonctionne parfaitement. Très décoratif.', 'other', 'good', 'Vintage', 'Réveil 50s', 35.00, ARRAY['réveil', 'vintage', 'déco'], 'donation', ''),
    ('Bougies artisanales', 'Lot de bougies artisanales parfumées, faites main. Très parfumées.', 'other', 'excellent', 'Artisan', 'Bougies', 25.00, ARRAY['bougies', 'artisanal', 'parfum'], 'donation', '')
) AS item_data(title, description, category, condition, brand, model, estimated_value, tags, offer_type, desired_items)
WHERE c.name IS NOT NULL;

-- Vérification des objets insérés
SELECT 
  COUNT(*) as total_items,
  COUNT(DISTINCT community_id) as communities_with_items,
  COUNT(CASE WHEN offer_type = 'loan' THEN 1 END) as loan_items,
  COUNT(CASE WHEN offer_type = 'trade' THEN 1 END) as trade_items,
  COUNT(CASE WHEN offer_type = 'donation' THEN 1 END) as donation_items,
  COUNT(CASE WHEN category = 'tools' THEN 1 END) as tools_items,
  COUNT(CASE WHEN category = 'electronics' THEN 1 END) as electronics_items,
  COUNT(CASE WHEN category = 'books' THEN 1 END) as books_items,
  COUNT(CASE WHEN category = 'sports' THEN 1 END) as sports_items,
  COUNT(CASE WHEN category = 'kitchen' THEN 1 END) as kitchen_items,
  COUNT(CASE WHEN category = 'garden' THEN 1 END) as garden_items,
  COUNT(CASE WHEN category = 'toys' THEN 1 END) as toys_items,
  COUNT(CASE WHEN category = 'fashion' THEN 1 END) as fashion_items,
  COUNT(CASE WHEN category = 'furniture' THEN 1 END) as furniture_items,
  COUNT(CASE WHEN category = 'music' THEN 1 END) as music_items,
  COUNT(CASE WHEN category = 'baby' THEN 1 END) as baby_items,
  COUNT(CASE WHEN category = 'art' THEN 1 END) as art_items,
  COUNT(CASE WHEN category = 'services' THEN 1 END) as services_items,
  COUNT(CASE WHEN category = 'auto' THEN 1 END) as auto_items,
  COUNT(CASE WHEN category = 'office' THEN 1 END) as office_items,
  COUNT(CASE WHEN category = 'other' THEN 1 END) as other_items
FROM public.items 
WHERE community_id IN (
  SELECT id FROM public.communities 
  WHERE country = 'France' 
    AND city IN (
      'Versailles', 'Saint-Germain-en-Laye', 'Mantes-la-Jolie', 'Rambouillet', 'Poissy',
      'Conflans-Sainte-Honorine', 'Houilles', 'Sartrouville', 'Le Chesnay', 'Vélizy-Villacoublay',
      'Trappes', 'Guyancourt', 'Montigny-le-Bretonneux', 'Élancourt', 'Maurepas', 'Plaisir',
      'Houdan', 'Mantes-la-Ville', 'Bonnières-sur-Seine', 'Limay', 'Meulan-en-Yvelines',
      'Les Mureaux', 'Aubergenville', 'Épône', 'Gargenville', 'Jouy-en-Josas', 'Buc',
      'Toussus-le-Noble', 'Châteaufort', 'Magny-les-Hameaux', 'Saint-Rémy-lès-Chevreuse',
      'Chevreuse', 'Dampierre-en-Yvelines', 'Maintenon', 'Chartres'
    )
);
