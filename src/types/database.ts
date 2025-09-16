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
    };
  };
}