-- Create outfit_images table for multiple images per outfit
CREATE TABLE IF NOT EXISTS public.outfit_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  outfit_id UUID REFERENCES public.outfits(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on outfit_images table
ALTER TABLE public.outfit_images ENABLE ROW LEVEL SECURITY;

-- Create policies for outfit_images
CREATE POLICY "Outfit images are viewable by everyone" ON public.outfit_images
  FOR SELECT USING (true);

CREATE POLICY "Users can manage images for their outfits" ON public.outfit_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.outfits 
      WHERE outfits.id = outfit_images.outfit_id 
      AND outfits.user_id = auth.uid()
    )
  );

-- Remove image_url from outfits table since we'll use outfit_images
ALTER TABLE public.outfits DROP COLUMN IF EXISTS image_url;

-- Create storage bucket for outfit images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'outfit-images',
  'outfit-images',
  true,
  10485760, -- 10MB limit per image
  ARRAY['image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the outfit-images bucket
CREATE POLICY "Users can upload outfit images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'outfit-images' 
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Outfit images are publicly viewable" ON storage.objects
  FOR SELECT USING (bucket_id = 'outfit-images');

CREATE POLICY "Users can update their outfit images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'outfit-images' 
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can delete their outfit images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'outfit-images' 
    AND auth.uid() IS NOT NULL
  );
