-- Create outfit_likes table
CREATE TABLE IF NOT EXISTS outfit_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  outfit_id UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(outfit_id, user_id)
);

-- Create outfit_saves table
CREATE TABLE IF NOT EXISTS outfit_saves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  outfit_id UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(outfit_id, user_id)
);

-- Create outfit_comments table
CREATE TABLE IF NOT EXISTS outfit_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  outfit_id UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE outfit_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for outfit_likes
CREATE POLICY "Users can view all likes" ON outfit_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert their own likes" ON outfit_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own likes" ON outfit_likes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for outfit_saves
CREATE POLICY "Users can view their own saves" ON outfit_saves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own saves" ON outfit_saves FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own saves" ON outfit_saves FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for outfit_comments
CREATE POLICY "Users can view all comments" ON outfit_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert their own comments" ON outfit_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON outfit_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON outfit_comments FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_outfit_likes_outfit_id ON outfit_likes(outfit_id);
CREATE INDEX IF NOT EXISTS idx_outfit_likes_user_id ON outfit_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_outfit_saves_outfit_id ON outfit_saves(outfit_id);
CREATE INDEX IF NOT EXISTS idx_outfit_saves_user_id ON outfit_saves(user_id);
CREATE INDEX IF NOT EXISTS idx_outfit_comments_outfit_id ON outfit_comments(outfit_id);
CREATE INDEX IF NOT EXISTS idx_outfit_comments_user_id ON outfit_comments(user_id);
