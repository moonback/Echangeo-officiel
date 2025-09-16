-- TrocAll Database Schema
-- ⚠️ WARNING: RLS is disabled for MVP purposes. Enable it in production!

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  bio text,
  phone text,
  address text,
  latitude double precision,
  longitude double precision,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Items table
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('tools', 'electronics', 'books', 'sports', 'kitchen', 'garden', 'toys', 'other')),
  condition text NOT NULL CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Item images table
CREATE TABLE IF NOT EXISTS item_images (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id uuid REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Requests table
CREATE TABLE IF NOT EXISTS requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  item_id uuid REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  requested_from timestamptz,
  requested_to timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  request_id uuid REFERENCES requests(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_items_owner_id ON items(owner_id);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_items_is_available ON items(is_available);
CREATE INDEX IF NOT EXISTS idx_item_images_item_id ON item_images(item_id);
CREATE INDEX IF NOT EXISTS idx_requests_requester_id ON requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_requests_item_id ON requests(item_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);

-- ⚠️ WARNING: RLS is intentionally DISABLED for MVP
-- In production, enable RLS and create appropriate policies:

-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE item_images ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Example policies (uncomment and adapt for production):
-- CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
-- CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
-- CREATE POLICY "Anyone can read available items" ON items FOR SELECT USING (is_available = true);
-- CREATE POLICY "Users can create own items" ON items FOR INSERT WITH CHECK (auth.uid() = owner_id);