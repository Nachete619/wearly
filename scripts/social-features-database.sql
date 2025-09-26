-- Script para implementar funcionalidades sociales en Wearly
-- Incluye: sistema de seguimiento, likes, publicaciones generales, etc.

-- 1. Tabla para publicaciones generales (diferente a outfits)
CREATE TABLE IF NOT EXISTS public.general_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tipo_publicacion TEXT NOT NULL CHECK (tipo_publicacion IN ('noticia', 'anuncio', 'foto', 'evento', 'general')),
  titulo TEXT NOT NULL,
  contenido TEXT,
  imagen_url TEXT,
  fecha_evento TIMESTAMP WITH TIME ZONE,
  ubicacion TEXT,
  es_publico BOOLEAN DEFAULT true,
  likes_count INTEGER DEFAULT 0,
  comentarios_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla para likes en publicaciones generales
CREATE TABLE IF NOT EXISTS public.general_posts_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.general_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(post_id, user_id)
);

-- 3. Tabla para comentarios en publicaciones generales
CREATE TABLE IF NOT EXISTS public.general_posts_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.general_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  contenido TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.general_posts_comments(id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabla para likes en comentarios de publicaciones generales
CREATE TABLE IF NOT EXISTS public.general_comments_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES public.general_posts_comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(comment_id, user_id)
);

-- 5. Agregar campo para distinguir outfits de productos en la tabla outfits
ALTER TABLE public.outfits 
ADD COLUMN IF NOT EXISTS tipo_contenido TEXT DEFAULT 'outfit' CHECK (tipo_contenido IN ('outfit', 'producto_showcase'));

-- 6. Tabla para likes en outfits (si no existe)
CREATE TABLE IF NOT EXISTS public.outfit_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  outfit_id UUID REFERENCES public.outfits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(outfit_id, user_id)
);

-- 7. Tabla para comentarios en outfits (si no existe)
CREATE TABLE IF NOT EXISTS public.outfit_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  outfit_id UUID REFERENCES public.outfits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  contenido TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.outfit_comments(id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Tabla para likes en comentarios de outfits
CREATE TABLE IF NOT EXISTS public.outfit_comment_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES public.outfit_comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(comment_id, user_id)
);

-- 9. Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_general_posts_user_id ON public.general_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_general_posts_tipo ON public.general_posts(tipo_publicacion);
CREATE INDEX IF NOT EXISTS idx_general_posts_created_at ON public.general_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_general_posts_likes_post_user ON public.general_posts_likes(post_id, user_id);
CREATE INDEX IF NOT EXISTS idx_general_posts_comments_post_id ON public.general_posts_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_outfit_likes_outfit_user ON public.outfit_likes(outfit_id, user_id);
CREATE INDEX IF NOT EXISTS idx_outfit_comments_outfit_id ON public.outfit_comments(outfit_id);

-- 10. Habilitar RLS en todas las nuevas tablas
ALTER TABLE public.general_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.general_posts_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.general_posts_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.general_comments_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfit_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfit_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfit_comment_likes ENABLE ROW LEVEL SECURITY;

-- 11. Políticas RLS para general_posts
CREATE POLICY "Anyone can view public general posts" ON public.general_posts
  FOR SELECT USING (es_publico = true);

CREATE POLICY "Users can view their own general posts" ON public.general_posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create general posts" ON public.general_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own general posts" ON public.general_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own general posts" ON public.general_posts
  FOR DELETE USING (auth.uid() = user_id);

-- 12. Políticas RLS para general_posts_likes
CREATE POLICY "Anyone can view general post likes" ON public.general_posts_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like/unlike general posts" ON public.general_posts_likes
  FOR ALL USING (auth.uid() = user_id);

-- 13. Políticas RLS para general_posts_comments
CREATE POLICY "Anyone can view general post comments" ON public.general_posts_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create general post comments" ON public.general_posts_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own general post comments" ON public.general_posts_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own general post comments" ON public.general_posts_comments
  FOR DELETE USING (auth.uid() = user_id);

-- 14. Políticas RLS para general_comments_likes
CREATE POLICY "Anyone can view general comment likes" ON public.general_comments_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like/unlike general comments" ON public.general_comments_likes
  FOR ALL USING (auth.uid() = user_id);

-- 15. Políticas RLS para outfit_likes
CREATE POLICY "Anyone can view outfit likes" ON public.outfit_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like/unlike outfits" ON public.outfit_likes
  FOR ALL USING (auth.uid() = user_id);

-- 16. Políticas RLS para outfit_comments
CREATE POLICY "Anyone can view outfit comments" ON public.outfit_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create outfit comments" ON public.outfit_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own outfit comments" ON public.outfit_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own outfit comments" ON public.outfit_comments
  FOR DELETE USING (auth.uid() = user_id);

-- 17. Políticas RLS para outfit_comment_likes
CREATE POLICY "Anyone can view outfit comment likes" ON public.outfit_comment_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like/unlike outfit comments" ON public.outfit_comment_likes
  FOR ALL USING (auth.uid() = user_id);

-- 18. Función para actualizar contadores de likes en general_posts
CREATE OR REPLACE FUNCTION update_general_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.general_posts 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.general_posts 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 19. Función para actualizar contadores de comentarios en general_posts
CREATE OR REPLACE FUNCTION update_general_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.general_posts 
    SET comentarios_count = comentarios_count + 1 
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.general_posts 
    SET comentarios_count = comentarios_count - 1 
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 20. Función para actualizar contadores de likes en outfits
CREATE OR REPLACE FUNCTION update_outfit_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.outfits 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.outfit_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.outfits 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.outfit_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 21. Triggers para actualizar contadores automáticamente
CREATE TRIGGER update_general_post_likes_count_trigger
  AFTER INSERT OR DELETE ON public.general_posts_likes
  FOR EACH ROW EXECUTE FUNCTION update_general_post_likes_count();

CREATE TRIGGER update_general_post_comments_count_trigger
  AFTER INSERT OR DELETE ON public.general_posts_comments
  FOR EACH ROW EXECUTE FUNCTION update_general_post_comments_count();

CREATE TRIGGER update_outfit_likes_count_trigger
  AFTER INSERT OR DELETE ON public.outfit_likes
  FOR EACH ROW EXECUTE FUNCTION update_outfit_likes_count();

-- 22. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 23. Triggers para updated_at
CREATE TRIGGER update_general_posts_updated_at
  BEFORE UPDATE ON public.general_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_general_posts_comments_updated_at
  BEFORE UPDATE ON public.general_posts_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outfit_comments_updated_at
  BEFORE UPDATE ON public.outfit_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
