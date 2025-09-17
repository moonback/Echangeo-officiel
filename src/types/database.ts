export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
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
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          avatar_url?: string;
          bio?: string;
          phone?: string;
          address?: string;
          latitude?: number;
          longitude?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string;
          bio?: string;
          phone?: string;
          address?: string;
          latitude?: number;
          longitude?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      items: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description?: string;
          category: string;
          condition: string;
          offer_type: string;
          desired_items?: string;
          brand?: string;
          model?: string;
          estimated_value?: number;
          tags?: string[];
          available_from?: string;
          available_to?: string;
          location_hint?: string;
          latitude?: number;
          longitude?: number;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          description?: string;
          category: string;
          condition: string;
          offer_type?: string;
          desired_items?: string;
          brand?: string;
          model?: string;
          estimated_value?: number;
          tags?: string[];
          available_from?: string;
          available_to?: string;
          location_hint?: string;
          latitude?: number;
          longitude?: number;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          description?: string;
          category?: string;
          condition?: string;
          offer_type?: string;
          desired_items?: string;
          brand?: string;
          model?: string;
          estimated_value?: number;
          tags?: string[];
          available_from?: string;
          available_to?: string;
          location_hint?: string;
          latitude?: number;
          longitude?: number;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      item_images: {
        Row: {
          id: string;
          item_id: string;
          url: string;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          url: string;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          item_id?: string;
          url?: string;
          is_primary?: boolean;
          created_at?: string;
        };
      };
      requests: {
        Row: {
          id: string;
          requester_id: string;
          item_id: string;
          message?: string;
          status: string;
          requested_from?: string;
          requested_to?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requester_id: string;
          item_id: string;
          message?: string;
          status?: string;
          requested_from?: string;
          requested_to?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          requester_id?: string;
          item_id?: string;
          message?: string;
          status?: string;
          requested_from?: string;
          requested_to?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          request_id?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          request_id?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          receiver_id?: string;
          content?: string;
          request_id?: string;
          created_at?: string;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          item_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          item_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          item_id?: string;
          created_at?: string;
        };
      };
      communities: {
        Row: {
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
          activity_level?: string;
          created_by?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          city: string;
          postal_code?: string;
          country?: string;
          center_latitude?: number;
          center_longitude?: number;
          radius_km?: number;
          is_active?: boolean;
          activity_level?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          city?: string;
          postal_code?: string;
          country?: string;
          center_latitude?: number;
          center_longitude?: number;
          radius_km?: number;
          is_active?: boolean;
          activity_level?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      community_members: {
        Row: {
          id: string;
          community_id: string;
          user_id: string;
          role: string;
          joined_at: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          community_id: string;
          user_id: string;
          role?: string;
          joined_at?: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          community_id?: string;
          user_id?: string;
          role?: string;
          joined_at?: string;
          is_active?: boolean;
        };
      };
      community_events: {
        Row: {
          id: string;
          community_id: string;
          title: string;
          description?: string;
          event_type: string;
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
        };
        Insert: {
          id?: string;
          community_id: string;
          title: string;
          description?: string;
          event_type?: string;
          location?: string;
          latitude?: number;
          longitude?: number;
          start_date: string;
          end_date?: string;
          max_participants?: number;
          created_by?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          community_id?: string;
          title?: string;
          description?: string;
          event_type?: string;
          location?: string;
          latitude?: number;
          longitude?: number;
          start_date?: string;
          end_date?: string;
          max_participants?: number;
          created_by?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      event_participants: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          status: string;
          registered_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          status?: string;
          registered_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id?: string;
          status?: string;
          registered_at?: string;
        };
      };
      community_discussions: {
        Row: {
          id: string;
          community_id: string;
          title: string;
          content?: string;
          author_id?: string;
          category: string;
          is_pinned: boolean;
          is_locked: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          community_id: string;
          title: string;
          content?: string;
          author_id?: string;
          category?: string;
          is_pinned?: boolean;
          is_locked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          community_id?: string;
          title?: string;
          content?: string;
          author_id?: string;
          category?: string;
          is_pinned?: boolean;
          is_locked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      discussion_replies: {
        Row: {
          id: string;
          discussion_id: string;
          author_id?: string;
          content: string;
          parent_reply_id?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          discussion_id: string;
          author_id?: string;
          content: string;
          parent_reply_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          discussion_id?: string;
          author_id?: string;
          content?: string;
          parent_reply_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      community_stats: {
        Row: {
          id: string;
          community_id: string;
          total_members: number;
          active_members: number;
          total_items: number;
          total_exchanges: number;
          total_events: number;
          last_activity?: string;
          calculated_at: string;
        };
        Insert: {
          id?: string;
          community_id: string;
          total_members?: number;
          active_members?: number;
          total_items?: number;
          total_exchanges?: number;
          total_events?: number;
          last_activity?: string;
          calculated_at?: string;
        };
        Update: {
          id?: string;
          community_id?: string;
          total_members?: number;
          active_members?: number;
          total_items?: number;
          total_exchanges?: number;
          total_events?: number;
          last_activity?: string;
          calculated_at?: string;
        };
      };
    };
  };
}
