-- Migration pour les communautés de quartier
-- Extension du système existant pour créer des communautés organisées

-- Table des quartiers/communautés
CREATE TABLE IF NOT EXISTS communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    city TEXT NOT NULL,
    postal_code TEXT,
    country TEXT DEFAULT 'France',
    center_latitude DOUBLE PRECISION,
    center_longitude DOUBLE PRECISION,
    radius_km INTEGER DEFAULT 5, -- Rayon de la communauté en km
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table de liaison utilisateurs-communautés
CREATE TABLE IF NOT EXISTS community_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
    joined_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(community_id, user_id)
);

-- Table des événements communautaires
CREATE TABLE IF NOT EXISTS community_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT DEFAULT 'meetup' CHECK (event_type IN ('meetup', 'swap', 'workshop', 'social', 'other')),
    location TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    max_participants INTEGER,
    created_by UUID REFERENCES profiles(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des participants aux événements
CREATE TABLE IF NOT EXISTS event_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES community_events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'cancelled')),
    registered_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(event_id, user_id)
);

-- Table des discussions communautaires
CREATE TABLE IF NOT EXISTS community_discussions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    author_id UUID REFERENCES profiles(id),
    category TEXT DEFAULT 'general' CHECK (category IN ('general', 'items', 'events', 'help', 'announcements')),
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des réponses aux discussions
CREATE TABLE IF NOT EXISTS discussion_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discussion_id UUID REFERENCES community_discussions(id) ON DELETE CASCADE,
    author_id UUID REFERENCES profiles(id),
    content TEXT NOT NULL,
    parent_reply_id UUID REFERENCES discussion_replies(id), -- Pour les réponses imbriquées
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des statistiques communautaires
CREATE TABLE IF NOT EXISTS community_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    total_members INTEGER DEFAULT 0,
    active_members INTEGER DEFAULT 0,
    total_items INTEGER DEFAULT 0,
    total_exchanges INTEGER DEFAULT 0,
    total_events INTEGER DEFAULT 0,
    last_activity TIMESTAMPTZ,
    calculated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour les performances géographiques
CREATE INDEX IF NOT EXISTS idx_communities_location ON communities (center_latitude, center_longitude) 
WHERE center_latitude IS NOT NULL AND center_longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_community_members_user ON community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_members_community ON community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_community_events_community ON community_events(community_id);
CREATE INDEX IF NOT EXISTS idx_community_events_dates ON community_events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_discussions_community ON community_discussions(community_id);
CREATE INDEX IF NOT EXISTS idx_discussions_category ON community_discussions(category);

-- Fonction pour calculer les statistiques communautaires
CREATE OR REPLACE FUNCTION update_community_stats(p_community_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO community_stats (
        community_id,
        total_members,
        active_members,
        total_items,
        total_exchanges,
        total_events,
        last_activity,
        calculated_at
    )
    SELECT 
        p_community_id,
        COUNT(DISTINCT cm.user_id) as total_members,
        COUNT(DISTINCT CASE WHEN cm.is_active = true THEN cm.user_id END) as active_members,
        COUNT(DISTINCT i.id) as total_items,
        COUNT(DISTINCT r.id) as total_exchanges,
        COUNT(DISTINCT ce.id) as total_events,
        GREATEST(
            MAX(cm.joined_at),
            MAX(i.created_at),
            MAX(r.created_at),
            MAX(ce.created_at)
        ) as last_activity,
        now() as calculated_at
    FROM communities c
    LEFT JOIN community_members cm ON cm.community_id = c.id
    LEFT JOIN profiles p ON p.id = cm.user_id
    LEFT JOIN items i ON i.owner_id = p.id
    LEFT JOIN requests r ON (r.requester_id = p.id OR EXISTS (
        SELECT 1 FROM items i2 WHERE i2.id = r.item_id AND i2.owner_id = p.id
    ))
    LEFT JOIN community_events ce ON ce.community_id = c.id
    WHERE c.id = p_community_id
    GROUP BY c.id
    ON CONFLICT (community_id) DO UPDATE SET
        total_members = EXCLUDED.total_members,
        active_members = EXCLUDED.active_members,
        total_items = EXCLUDED.total_items,
        total_exchanges = EXCLUDED.total_exchanges,
        total_events = EXCLUDED.total_events,
        last_activity = EXCLUDED.last_activity,
        calculated_at = EXCLUDED.calculated_at;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour calculer la distance entre deux points géographiques (formule de Haversine)
CREATE OR REPLACE FUNCTION calculate_distance_km(
    lat1 DOUBLE PRECISION,
    lon1 DOUBLE PRECISION,
    lat2 DOUBLE PRECISION,
    lon2 DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION AS $$
DECLARE
    R DOUBLE PRECISION := 6371; -- Rayon de la Terre en km
    dLat DOUBLE PRECISION;
    dLon DOUBLE PRECISION;
    a DOUBLE PRECISION;
    c DOUBLE PRECISION;
BEGIN
    dLat := radians(lat2 - lat1);
    dLon := radians(lon2 - lon1);
    
    a := sin(dLat/2) * sin(dLat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dLon/2) * sin(dLon/2);
    c := 2 * atan2(sqrt(a), sqrt(1-a));
    
    RETURN R * c;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour trouver les communautés proches d'un utilisateur
CREATE OR REPLACE FUNCTION find_nearby_communities(
    p_latitude DOUBLE PRECISION,
    p_longitude DOUBLE PRECISION,
    p_radius_km INTEGER DEFAULT 10
)
RETURNS TABLE (
    community_id UUID,
    community_name TEXT,
    distance_km DOUBLE PRECISION,
    member_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        calculate_distance_km(p_latitude, p_longitude, c.center_latitude, c.center_longitude) as distance_km,
        COALESCE(cs.total_members, 0) as member_count
    FROM communities c
    LEFT JOIN community_stats cs ON cs.community_id = c.id
    WHERE c.is_active = true
    AND c.center_latitude IS NOT NULL 
    AND c.center_longitude IS NOT NULL
    AND calculate_distance_km(p_latitude, p_longitude, c.center_latitude, c.center_longitude) <= p_radius_km
    ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour les statistiques automatiquement
CREATE OR REPLACE FUNCTION trigger_update_community_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM update_community_stats(NEW.community_id);
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM update_community_stats(OLD.community_id);
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers pour les mises à jour automatiques
CREATE TRIGGER update_stats_on_member_change
    AFTER INSERT OR UPDATE OR DELETE ON community_members
    FOR EACH ROW EXECUTE FUNCTION trigger_update_community_stats();

CREATE TRIGGER update_stats_on_event_change
    AFTER INSERT OR UPDATE OR DELETE ON community_events
    FOR EACH ROW EXECUTE FUNCTION trigger_update_community_stats();

-- Vues utiles
CREATE VIEW community_overview AS
SELECT 
    c.*,
    cs.total_members,
    cs.active_members,
    cs.total_items,
    cs.total_exchanges,
    cs.total_events,
    cs.last_activity,
    CASE 
        WHEN cs.last_activity > now() - interval '7 days' THEN 'active'
        WHEN cs.last_activity > now() - interval '30 days' THEN 'moderate'
        ELSE 'inactive'
    END as activity_level
FROM communities c
LEFT JOIN community_stats cs ON cs.community_id = c.id
WHERE c.is_active = true;

-- Données de test pour quelques communautés parisiennes
INSERT INTO communities (name, description, city, postal_code, center_latitude, center_longitude, radius_km) VALUES
('Belleville', 'Communauté du quartier Belleville - Partage et solidarité', 'Paris', '75019', 48.8722, 2.3767, 2),
('Montmartre', 'Communauté Montmartre - Artistes et créateurs', 'Paris', '75018', 48.8867, 2.3431, 2),
('Canal Saint-Martin', 'Communauté Canal Saint-Martin - Écologie et partage', 'Paris', '75010', 48.8708, 2.3681, 2),
('Marais', 'Communauté du Marais - Culture et échanges', 'Paris', '75004', 48.8566, 2.3522, 2);

-- Commentaires
COMMENT ON TABLE communities IS 'Communautés de quartier organisées géographiquement';
COMMENT ON TABLE community_members IS 'Membres des communautés avec leurs rôles';
COMMENT ON TABLE community_events IS 'Événements organisés par les communautés';
COMMENT ON TABLE community_discussions IS 'Discussions et forums communautaires';
COMMENT ON FUNCTION find_nearby_communities IS 'Trouve les communautés proches d''une position géographique';
