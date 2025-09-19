-- Insertion des quartiers des villes des Yvelines
-- Données géographiques des principales communes du département des Yvelines

INSERT INTO public.communities (
  name, 
  description, 
  city, 
  postal_code, 
  country, 
  center_latitude, 
  center_longitude, 
  radius_km, 
  is_active, 
  activity_level
) VALUES 
-- Versailles (78)
('Centre-Ville Versailles', 'Quartier historique du centre-ville de Versailles avec le château et ses jardins', 'Versailles', '78000', 'France', 48.8014, 2.1301, 3, true, 'active'),
('Chantiers Versailles', 'Quartier résidentiel autour de la gare de Versailles-Chantiers', 'Versailles', '78000', 'France', 48.7944, 2.1347, 2, true, 'moderate'),
('Porchefontaine Versailles', 'Quartier résidentiel au sud de Versailles', 'Versailles', '78000', 'France', 48.7897, 2.1208, 2, true, 'moderate'),
('Montreuil Versailles', 'Quartier historique de Montreuil à Versailles', 'Versailles', '78000', 'France', 48.8089, 2.1208, 2, true, 'moderate'),

-- Saint-Germain-en-Laye (78)
('Centre-Ville Saint-Germain', 'Centre historique de Saint-Germain-en-Laye avec le château', 'Saint-Germain-en-Laye', '78100', 'France', 48.8978, 2.0931, 3, true, 'active'),
('Forêt Saint-Germain', 'Quartier résidentiel près de la forêt de Saint-Germain', 'Saint-Germain-en-Laye', '78100', 'France', 48.9044, 2.0864, 2, true, 'moderate'),
('Pecq Saint-Germain', 'Quartier résidentiel près de la Seine', 'Saint-Germain-en-Laye', '78100', 'France', 48.8900, 2.1000, 2, true, 'moderate'),

-- Mantes-la-Jolie (78)
('Centre-Ville Mantes', 'Centre-ville de Mantes-la-Jolie', 'Mantes-la-Jolie', '78200', 'France', 48.9906, 1.7172, 3, true, 'active'),
('Val Fourré Mantes', 'Quartier résidentiel du Val Fourré', 'Mantes-la-Jolie', '78200', 'France', 48.9950, 1.7200, 2, true, 'moderate'),
('Gassicourt Mantes', 'Quartier de Gassicourt à Mantes-la-Jolie', 'Mantes-la-Jolie', '78200', 'France', 48.9850, 1.7100, 2, true, 'moderate'),

-- Rambouillet (78)
('Centre-Ville Rambouillet', 'Centre historique de Rambouillet avec le château', 'Rambouillet', '78120', 'France', 48.6439, 1.8292, 3, true, 'active'),
('Forêt Rambouillet', 'Quartier résidentiel près de la forêt de Rambouillet', 'Rambouillet', '78120', 'France', 48.6500, 1.8400, 2, true, 'moderate'),
('Gare Rambouillet', 'Quartier autour de la gare de Rambouillet', 'Rambouillet', '78120', 'France', 48.6400, 1.8200, 2, true, 'moderate'),

-- Poissy (78)
('Centre-Ville Poissy', 'Centre-ville de Poissy', 'Poissy', '78300', 'France', 48.9289, 2.0444, 3, true, 'active'),
('Beauregard Poissy', 'Quartier résidentiel de Beauregard', 'Poissy', '78300', 'France', 48.9350, 2.0500, 2, true, 'moderate'),
('Gare Poissy', 'Quartier autour de la gare de Poissy', 'Poissy', '78300', 'France', 48.9250, 2.0400, 2, true, 'moderate'),

-- Conflans-Sainte-Honorine (78)
('Centre-Ville Conflans', 'Centre-ville de Conflans-Sainte-Honorine', 'Conflans-Sainte-Honorine', '78700', 'France', 48.9989, 2.0969, 3, true, 'active'),
('Port Conflans', 'Quartier du port fluvial', 'Conflans-Sainte-Honorine', '78700', 'France', 49.0050, 2.1000, 2, true, 'moderate'),
('Gare Conflans', 'Quartier autour de la gare', 'Conflans-Sainte-Honorine', '78700', 'France', 48.9950, 2.0900, 2, true, 'moderate'),

-- Houilles (78)
('Centre-Ville Houilles', 'Centre-ville de Houilles', 'Houilles', '78800', 'France', 48.9239, 2.1925, 3, true, 'active'),
('Gare Houilles', 'Quartier autour de la gare de Houilles', 'Houilles', '78800', 'France', 48.9200, 2.1900, 2, true, 'moderate'),
('Résidentiel Houilles', 'Quartier résidentiel de Houilles', 'Houilles', '78800', 'France', 48.9300, 2.2000, 2, true, 'moderate'),

-- Sartrouville (78)
('Centre-Ville Sartrouville', 'Centre-ville de Sartrouville', 'Sartrouville', '78500', 'France', 48.9439, 2.1639, 3, true, 'active'),
('Gare Sartrouville', 'Quartier autour de la gare de Sartrouville', 'Sartrouville', '78500', 'France', 48.9400, 2.1600, 2, true, 'moderate'),
('Résidentiel Sartrouville', 'Quartier résidentiel de Sartrouville', 'Sartrouville', '78500', 'France', 48.9500, 2.1700, 2, true, 'moderate'),

-- Le Chesnay (78)
('Centre-Ville Chesnay', 'Centre-ville du Chesnay', 'Le Chesnay', '78150', 'France', 48.8208, 2.1231, 3, true, 'active'),
('Résidentiel Chesnay', 'Quartier résidentiel du Chesnay', 'Le Chesnay', '78150', 'France', 48.8250, 2.1300, 2, true, 'moderate'),
('Rocquencourt Chesnay', 'Quartier de Rocquencourt', 'Le Chesnay', '78150', 'France', 48.8150, 2.1150, 2, true, 'moderate'),

-- Vélizy-Villacoublay (78)
('Centre-Ville Vélizy', 'Centre-ville de Vélizy-Villacoublay', 'Vélizy-Villacoublay', '78140', 'France', 48.7839, 2.1931, 3, true, 'active'),
('Villacoublay Vélizy', 'Quartier de Villacoublay', 'Vélizy-Villacoublay', '78140', 'France', 48.7800, 2.1900, 2, true, 'moderate'),
('Résidentiel Vélizy', 'Quartier résidentiel de Vélizy', 'Vélizy-Villacoublay', '78140', 'France', 48.7900, 2.2000, 2, true, 'moderate'),

-- Trappes (78)
('Centre-Ville Trappes', 'Centre-ville de Trappes', 'Trappes', '78190', 'France', 48.7756, 2.0019, 3, true, 'active'),
('Merisiers Trappes', 'Quartier des Merisiers', 'Trappes', '78190', 'France', 48.7800, 2.0100, 2, true, 'moderate'),
('Gare Trappes', 'Quartier autour de la gare de Trappes', 'Trappes', '78190', 'France', 48.7700, 1.9950, 2, true, 'moderate'),

-- Guyancourt (78)
('Centre-Ville Guyancourt', 'Centre-ville de Guyancourt', 'Guyancourt', '78280', 'France', 48.7739, 2.0731, 3, true, 'active'),
('Villages Guyancourt', 'Quartier des Villages', 'Guyancourt', '78280', 'France', 48.7800, 2.0800, 2, true, 'moderate'),
('Bouvier Guyancourt', 'Quartier de Bouvier', 'Guyancourt', '78280', 'France', 48.7700, 2.0700, 2, true, 'moderate'),

-- Montigny-le-Bretonneux (78)
('Centre-Ville Montigny', 'Centre-ville de Montigny-le-Bretonneux', 'Montigny-le-Bretonneux', '78180', 'France', 48.7656, 2.0344, 3, true, 'active'),
('Résidentiel Montigny', 'Quartier résidentiel de Montigny', 'Montigny-le-Bretonneux', '78180', 'France', 48.7700, 2.0400, 2, true, 'moderate'),
('Gare Montigny', 'Quartier autour de la gare', 'Montigny-le-Bretonneux', '78180', 'France', 48.7600, 2.0300, 2, true, 'moderate'),

-- Élancourt (78)
('Centre-Ville Élancourt', 'Centre-ville d''Élancourt', 'Élancourt', '78990', 'France', 48.7789, 1.9631, 3, true, 'active'),
('Résidentiel Élancourt', 'Quartier résidentiel d''Élancourt', 'Élancourt', '78990', 'France', 48.7850, 1.9700, 2, true, 'moderate'),
('Gare Élancourt', 'Quartier autour de la gare', 'Élancourt', '78990', 'France', 48.7750, 1.9600, 2, true, 'moderate'),

-- Maurepas (78)
('Centre-Ville Maurepas', 'Centre-ville de Maurepas', 'Maurepas', '78310', 'France', 48.7639, 1.9131, 3, true, 'active'),
('Résidentiel Maurepas', 'Quartier résidentiel de Maurepas', 'Maurepas', '78310', 'France', 48.7700, 1.9200, 2, true, 'moderate'),
('Gare Maurepas', 'Quartier autour de la gare', 'Maurepas', '78310', 'France', 48.7600, 1.9100, 2, true, 'moderate'),

-- Plaisir (78)
('Centre-Ville Plaisir', 'Centre-ville de Plaisir', 'Plaisir', '78370', 'France', 48.8239, 1.9531, 3, true, 'active'),
('Résidentiel Plaisir', 'Quartier résidentiel de Plaisir', 'Plaisir', '78370', 'France', 48.8300, 1.9600, 2, true, 'moderate'),
('Gare Plaisir', 'Quartier autour de la gare', 'Plaisir', '78370', 'France', 48.8200, 1.9500, 2, true, 'moderate'),

-- Houdan (78)
('Centre-Ville Houdan', 'Centre-ville de Houdan', 'Houdan', '78550', 'France', 48.7906, 1.6000, 3, true, 'active'),
('Résidentiel Houdan', 'Quartier résidentiel de Houdan', 'Houdan', '78550', 'France', 48.7950, 1.6050, 2, true, 'moderate'),
('Gare Houdan', 'Quartier autour de la gare', 'Houdan', '78550', 'France', 48.7850, 1.5950, 2, true, 'moderate'),

-- Mantes-la-Ville (78)
('Centre-Ville Mantes-Ville', 'Centre-ville de Mantes-la-Ville', 'Mantes-la-Ville', '78711', 'France', 48.9739, 1.7169, 3, true, 'active'),
('Résidentiel Mantes-Ville', 'Quartier résidentiel de Mantes-la-Ville', 'Mantes-la-Ville', '78711', 'France', 48.9800, 1.7200, 2, true, 'moderate'),
('Gare Mantes-Ville', 'Quartier autour de la gare', 'Mantes-la-Ville', '78711', 'France', 48.9700, 1.7150, 2, true, 'moderate'),

-- Bonnières-sur-Seine (78)
('Centre-Ville Bonnières', 'Centre-ville de Bonnières-sur-Seine', 'Bonnières-sur-Seine', '78270', 'France', 49.0356, 1.5781, 3, true, 'active'),
('Résidentiel Bonnières', 'Quartier résidentiel de Bonnières', 'Bonnières-sur-Seine', '78270', 'France', 49.0400, 1.5800, 2, true, 'moderate'),
('Gare Bonnières', 'Quartier autour de la gare', 'Bonnières-sur-Seine', '78270', 'France', 49.0300, 1.5750, 2, true, 'moderate'),

-- Limay (78)
('Centre-Ville Limay', 'Centre-ville de Limay', 'Limay', '78520', 'France', 48.9956, 1.7381, 3, true, 'active'),
('Résidentiel Limay', 'Quartier résidentiel de Limay', 'Limay', '78520', 'France', 49.0000, 1.7400, 2, true, 'moderate'),
('Gare Limay', 'Quartier autour de la gare', 'Limay', '78520', 'France', 48.9900, 1.7350, 2, true, 'moderate'),

-- Meulan-en-Yvelines (78)
('Centre-Ville Meulan', 'Centre-ville de Meulan-en-Yvelines', 'Meulan-en-Yvelines', '78250', 'France', 49.0069, 1.9069, 3, true, 'active'),
('Résidentiel Meulan', 'Quartier résidentiel de Meulan', 'Meulan-en-Yvelines', '78250', 'France', 49.0100, 1.9100, 2, true, 'moderate'),
('Gare Meulan', 'Quartier autour de la gare', 'Meulan-en-Yvelines', '78250', 'France', 49.0050, 1.9050, 2, true, 'moderate'),

-- Les Mureaux (78)
('Centre-Ville Mureaux', 'Centre-ville des Mureaux', 'Les Mureaux', '78130', 'France', 48.9919, 1.9119, 3, true, 'active'),
('Résidentiel Mureaux', 'Quartier résidentiel des Mureaux', 'Les Mureaux', '78130', 'France', 48.9950, 1.9150, 2, true, 'moderate'),
('Gare Mureaux', 'Quartier autour de la gare', 'Les Mureaux', '78130', 'France', 48.9900, 1.9100, 2, true, 'moderate'),

-- Aubergenville (78)
('Centre-Ville Aubergenville', 'Centre-ville d''Aubergenville', 'Aubergenville', '78410', 'France', 48.9589, 1.8569, 3, true, 'active'),
('Résidentiel Aubergenville', 'Quartier résidentiel d''Aubergenville', 'Aubergenville', '78410', 'France', 48.9650, 1.8600, 2, true, 'moderate'),
('Gare Aubergenville', 'Quartier autour de la gare', 'Aubergenville', '78410', 'France', 48.9550, 1.8550, 2, true, 'moderate'),

-- Épône (78)
('Centre-Ville Épône', 'Centre-ville d''Épône', 'Épône', '78680', 'France', 48.9556, 1.8169, 3, true, 'active'),
('Résidentiel Épône', 'Quartier résidentiel d''Épône', 'Épône', '78680', 'France', 48.9600, 1.8200, 2, true, 'moderate'),
('Gare Épône', 'Quartier autour de la gare', 'Épône', '78680', 'France', 48.9500, 1.8150, 2, true, 'moderate'),

-- Gargenville (78)
('Centre-Ville Gargenville', 'Centre-ville de Gargenville', 'Gargenville', '78440', 'France', 48.9889, 1.8119, 3, true, 'active'),
('Résidentiel Gargenville', 'Quartier résidentiel de Gargenville', 'Gargenville', '78440', 'France', 48.9950, 1.8150, 2, true, 'moderate'),
('Gare Gargenville', 'Quartier autour de la gare', 'Gargenville', '78440', 'France', 48.9850, 1.8100, 2, true, 'moderate'),

-- Jouy-en-Josas (78)
('Centre-Ville Jouy', 'Centre-ville de Jouy-en-Josas', 'Jouy-en-Josas', '78350', 'France', 48.7689, 2.1681, 3, true, 'active'),
('Résidentiel Jouy', 'Quartier résidentiel de Jouy-en-Josas', 'Jouy-en-Josas', '78350', 'France', 48.7750, 2.1700, 2, true, 'moderate'),
('Gare Jouy', 'Quartier autour de la gare', 'Jouy-en-Josas', '78350', 'France', 48.7650, 2.1650, 2, true, 'moderate'),

-- Buc (78)
('Centre-Ville Buc', 'Centre-ville de Buc', 'Buc', '78530', 'France', 48.7739, 2.1269, 3, true, 'active'),
('Résidentiel Buc', 'Quartier résidentiel de Buc', 'Buc', '78530', 'France', 48.7800, 2.1300, 2, true, 'moderate'),
('Gare Buc', 'Quartier autour de la gare', 'Buc', '78530', 'France', 48.7700, 2.1250, 2, true, 'moderate'),

-- Toussus-le-Noble (78)
('Centre-Ville Toussus', 'Centre-ville de Toussus-le-Noble', 'Toussus-le-Noble', '78117', 'France', 48.7489, 2.1131, 3, true, 'active'),
('Résidentiel Toussus', 'Quartier résidentiel de Toussus-le-Noble', 'Toussus-le-Noble', '78117', 'France', 48.7550, 2.1150, 2, true, 'moderate'),
('Aéroport Toussus', 'Quartier près de l''aéroport', 'Toussus-le-Noble', '78117', 'France', 48.7450, 2.1100, 2, true, 'moderate'),

-- Châteaufort (78)
('Centre-Ville Châteaufort', 'Centre-ville de Châteaufort', 'Châteaufort', '78117', 'France', 48.7389, 2.0931, 3, true, 'active'),
('Résidentiel Châteaufort', 'Quartier résidentiel de Châteaufort', 'Châteaufort', '78117', 'France', 48.7450, 2.0950, 2, true, 'moderate'),
('Gare Châteaufort', 'Quartier autour de la gare', 'Châteaufort', '78117', 'France', 48.7350, 2.0900, 2, true, 'moderate'),

-- Magny-les-Hameaux (78)
('Centre-Ville Magny', 'Centre-ville de Magny-les-Hameaux', 'Magny-les-Hameaux', '78114', 'France', 48.7339, 2.0731, 3, true, 'active'),
('Résidentiel Magny', 'Quartier résidentiel de Magny-les-Hameaux', 'Magny-les-Hameaux', '78114', 'France', 48.7400, 2.0750, 2, true, 'moderate'),
('Gare Magny', 'Quartier autour de la gare', 'Magny-les-Hameaux', '78114', 'France', 48.7300, 2.0700, 2, true, 'moderate'),

-- Saint-Rémy-lès-Chevreuse (78)
('Centre-Ville Saint-Rémy', 'Centre-ville de Saint-Rémy-lès-Chevreuse', 'Saint-Rémy-lès-Chevreuse', '78470', 'France', 48.7089, 2.0731, 3, true, 'active'),
('Résidentiel Saint-Rémy', 'Quartier résidentiel de Saint-Rémy-lès-Chevreuse', 'Saint-Rémy-lès-Chevreuse', '78470', 'France', 48.7150, 2.0750, 2, true, 'moderate'),
('Gare Saint-Rémy', 'Quartier autour de la gare', 'Saint-Rémy-lès-Chevreuse', '78470', 'France', 48.7050, 2.0700, 2, true, 'moderate'),

-- Chevreuse (78)
('Centre-Ville Chevreuse', 'Centre-ville de Chevreuse', 'Chevreuse', '78460', 'France', 48.7069, 2.0419, 3, true, 'active'),
('Résidentiel Chevreuse', 'Quartier résidentiel de Chevreuse', 'Chevreuse', '78460', 'France', 48.7100, 2.0450, 2, true, 'moderate'),
('Gare Chevreuse', 'Quartier autour de la gare', 'Chevreuse', '78460', 'France', 48.7050, 2.0400, 2, true, 'moderate'),

-- Dampierre-en-Yvelines (78)
('Centre-Ville Dampierre', 'Centre-ville de Dampierre-en-Yvelines', 'Dampierre-en-Yvelines', '78720', 'France', 48.7006, 1.9831, 3, true, 'active'),
('Résidentiel Dampierre', 'Quartier résidentiel de Dampierre-en-Yvelines', 'Dampierre-en-Yvelines', '78720', 'France', 48.7050, 1.9850, 2, true, 'moderate'),
('Château Dampierre', 'Quartier près du château', 'Dampierre-en-Yvelines', '78720', 'France', 48.6950, 1.9800, 2, true, 'moderate'),

-- Maintenon (78)
('Centre-Ville Maintenon', 'Centre-ville de Maintenon', 'Maintenon', '28130', 'France', 48.5869, 1.5831, 3, true, 'active'),
('Résidentiel Maintenon', 'Quartier résidentiel de Maintenon', 'Maintenon', '28130', 'France', 48.5900, 1.5850, 2, true, 'moderate'),
('Château Maintenon', 'Quartier près du château', 'Maintenon', '28130', 'France', 48.5850, 1.5800, 2, true, 'moderate'),

-- Chartres (28) - Ville limitrophe
('Centre-Ville Chartres', 'Centre-ville de Chartres', 'Chartres', '28000', 'France', 48.4439, 1.4881, 3, true, 'active'),
('Résidentiel Chartres', 'Quartier résidentiel de Chartres', 'Chartres', '28000', 'France', 48.4500, 1.4900, 2, true, 'moderate'),
('Gare Chartres', 'Quartier autour de la gare', 'Chartres', '28000', 'France', 48.4400, 1.4850, 2, true, 'moderate');

-- Vérification du nombre d'entrées insérées
SELECT 
  COUNT(*) as total_communities,
  COUNT(DISTINCT city) as total_cities,
  COUNT(CASE WHEN activity_level = 'active' THEN 1 END) as active_communities,
  COUNT(CASE WHEN activity_level = 'moderate' THEN 1 END) as moderate_communities
FROM public.communities 
WHERE country = 'France' 
  AND city IN (
    'Versailles', 'Saint-Germain-en-Laye', 'Mantes-la-Jolie', 'Rambouillet', 'Poissy',
    'Conflans-Sainte-Honorine', 'Houilles', 'Sartrouville', 'Le Chesnay', 'Vélizy-Villacoublay',
    'Trappes', 'Guyancourt', 'Montigny-le-Bretonneux', 'Élancourt', 'Maurepas', 'Plaisir',
    'Houdan', 'Mantes-la-Ville', 'Bonnières-sur-Seine', 'Limay', 'Meulan-en-Yvelines',
    'Les Mureaux', 'Aubergenville', 'Épône', 'Gargenville', 'Jouy-en-Josas', 'Buc',
    'Toussus-le-Noble', 'Châteaufort', 'Magny-les-Hameaux', 'Saint-Rémy-lès-Chevreuse',
    'Chevreuse', 'Dampierre-en-Yvelines', 'Maintenon', 'Chartres'
  );
