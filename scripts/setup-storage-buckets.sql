-- Script para configurar los buckets de storage necesarios

-- Crear bucket para imágenes de publicaciones generales
INSERT INTO storage.buckets (id, name, public)
VALUES ('general-posts-images', 'general-posts-images', true)
ON CONFLICT (id) DO NOTHING;

-- Crear bucket para avatares de usuarios
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Crear bucket para imágenes de outfits
INSERT INTO storage.buckets (id, name, public)
VALUES ('outfit-images', 'outfit-images', true)
ON CONFLICT (id) DO NOTHING;

-- Crear bucket para imágenes de productos
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para general-posts-images
CREATE POLICY "Anyone can view general posts images" ON storage.objects
FOR SELECT USING (bucket_id = 'general-posts-images');

CREATE POLICY "Authenticated users can upload general posts images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'general-posts-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own general posts images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'general-posts-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own general posts images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'general-posts-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Políticas para avatars
CREATE POLICY "Anyone can view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Políticas para outfit-images
CREATE POLICY "Anyone can view outfit images" ON storage.objects
FOR SELECT USING (bucket_id = 'outfit-images');

CREATE POLICY "Authenticated users can upload outfit images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'outfit-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own outfit images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'outfit-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own outfit images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'outfit-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Políticas para product-images
CREATE POLICY "Anyone can view product images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own product images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own product images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
