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
  brand?: string;
  model?: string;
  estimated_value?: number;
  tags?: string[];
  available_from?: string; // ISO date
  available_to?: string;   // ISO date
  location_hint?: string;
  latitude?: number;
  longitude?: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  owner?: Profile;
  images?: ItemImage[];
  average_rating?: number;
  ratings_count?: number;
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
  | 'other';

export type ItemCondition = 'excellent' | 'good' | 'fair' | 'poor';

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'completed';