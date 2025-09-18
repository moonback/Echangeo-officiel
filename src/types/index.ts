export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  owner_id: string;
  title: string;
  description?: string;
  category: ItemCategory;
  condition: ItemCondition;
  offer_type: OfferType;
  desired_items?: string;
  brand?: string;
  model?: string;
  estimated_value?: number;
  tags?: string[];
  available_from?: string; // ISO date
  available_to?: string;   // ISO date
  location_hint?: string;
  latitude?: number;
  longitude?: number;
  community_id?: string; // ID de la communauté/quartier
  is_available: boolean;
  created_at: string;
  updated_at: string;
  owner?: Profile;
  images?: ItemImage[];
  average_rating?: number;
  ratings_count?: number;
  [key: string]: unknown; // Signature d'index pour la compatibilité avec MapboxMarker
}

export interface ItemRating {
  id: string;
  item_id: string;
  rater_id: string;
  score: number; // 1..5
  comment?: string;
  created_at: string;
}

export interface ItemImage {
  id: string;
  item_id: string;
  url: string;
  is_primary: boolean;
  created_at: string;
}

export interface Request {
  id: string;
  requester_id: string;
  item_id: string;
  message?: string;
  status: RequestStatus;
  requested_from?: string;
  requested_to?: string;
  created_at: string;
  updated_at: string;
  requester?: Profile;
  item?: Item;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  request_id?: string;
  created_at: string;
  sender?: Profile;
  receiver?: Profile;
}

export type ItemCategory = 
  | 'tools' 
  | 'electronics' 
  | 'books' 
  | 'sports' 
  | 'kitchen' 
  | 'garden' 
  | 'toys' 
  | 'fashion'
  | 'furniture'
  | 'music'
  | 'baby'
  | 'art'
  | 'beauty'
  | 'auto'
  | 'office'
  | 'services'
  | 'other';

export type ItemCondition = 'excellent' | 'good' | 'fair' | 'poor';

export type OfferType = 'loan' | 'trade' | 'donation';

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'completed';

// Reputation: user-to-user ratings
export interface UserRating {
  id: string;
  request_id: string;
  rater_id: string;
  rated_user_id: string;
  communication_score: number; // 1..5
  punctuality_score: number;   // 1..5
  care_score: number;          // 1..5
  comment?: string;
  created_at: string;
}

export interface ProfileReputationStats {
  profile_id: string;
  ratings_count: number;
  avg_communication: number; // numeric
  avg_punctuality: number;   // numeric
  avg_care: number;          // numeric
  overall_score: number;     // numeric
}

export interface ProfileBadgeRow {
  profile_id: string;
  badge_slug: string;
  badge_label: string;
}

// ===== COMMUNITIES TYPES =====

export interface Community {
  id: string;
  name: string;
  description?: string;
  city: string;
  postal_code?: string;
  country: string;
  center_latitude?: number;
  center_longitude?: number;
  radius_km: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Relations
  stats?: CommunityStats;
  members?: CommunityMember[];
  events?: CommunityEvent[];
  discussions?: CommunityDiscussion[];
}

export interface CommunityMember {
  id: string;
  community_id: string;
  user_id: string;
  role: CommunityRole;
  joined_at: string;
  is_active: boolean;
  // Relations
  user?: Profile;
  community?: Community;
}

export interface CommunityEvent {
  id: string;
  community_id: string;
  title: string;
  description?: string;
  event_type: EventType;
  location?: string;
  latitude?: number;
  longitude?: number;
  start_date: string;
  end_date?: string;
  max_participants?: number;
  created_by?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  community?: Community;
  creator?: Profile;
  participants?: EventParticipant[];
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  status: ParticipantStatus;
  registered_at: string;
  // Relations
  user?: Profile;
  event?: CommunityEvent;
}

export interface CommunityDiscussion {
  id: string;
  community_id: string;
  title: string;
  content?: string;
  author_id?: string;
  category: DiscussionCategory;
  is_pinned: boolean;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  community?: Community;
  author?: Profile;
  replies?: DiscussionReply[];
}

export interface DiscussionReply {
  id: string;
  discussion_id: string;
  author_id?: string;
  content: string;
  parent_reply_id?: string;
  created_at: string;
  updated_at: string;
  // Relations
  discussion?: CommunityDiscussion;
  author?: Profile;
  parent_reply?: DiscussionReply;
  replies?: DiscussionReply[];
}

export interface CommunityStats {
  id: string;
  community_id: string;
  total_members: number;
  active_members: number;
  total_items: number;
  total_exchanges: number;
  total_events: number;
  last_activity?: string;
  calculated_at: string;
}

// Enums
export type CommunityRole = 'member' | 'moderator' | 'admin';
export type EventType = 'meetup' | 'swap' | 'workshop' | 'social' | 'other';
export type ParticipantStatus = 'registered' | 'confirmed' | 'cancelled';
export type DiscussionCategory = 'general' | 'items' | 'events' | 'help' | 'announcements';

// Types utilitaires
export interface NearbyCommunity {
  community_id: string;
  community_name: string;
  distance_km: number;
  member_count: number;
}

export interface CommunityOverview extends Community {
  activity_level: 'active' | 'moderate' | 'inactive';
  [key: string]: unknown; // Signature d'index pour la compatibilité avec MapboxMarker
}

// Types pour la suggestion de quartiers avec IA
export interface NeighborhoodSuggestion {
  name: string;
  description: string;
  postalCode?: string;
  city: string;
  department: string;
  region: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  confidence: number;
  alternatives?: NeighborhoodSuggestion[];
}