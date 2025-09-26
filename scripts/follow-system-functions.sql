-- Funciones para el sistema de seguimiento

-- Función para incrementar contador de seguidores
CREATE OR REPLACE FUNCTION increment_followers_count(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles 
  SET followers_count = followers_count + 1 
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para decrementar contador de seguidores
CREATE OR REPLACE FUNCTION decrement_followers_count(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles 
  SET followers_count = GREATEST(followers_count - 1, 0) 
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para incrementar contador de siguiendo
CREATE OR REPLACE FUNCTION increment_following_count(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles 
  SET following_count = following_count + 1 
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para decrementar contador de siguiendo
CREATE OR REPLACE FUNCTION decrement_following_count(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles 
  SET following_count = GREATEST(following_count - 1, 0) 
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para actualizar contadores automáticamente al insertar
CREATE OR REPLACE FUNCTION update_follow_counters_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Incrementar seguidores del usuario seguido
  UPDATE public.profiles 
  SET followers_count = followers_count + 1 
  WHERE id = NEW.following_id;
  
  -- Incrementar siguiendo del usuario que sigue
  UPDATE public.profiles 
  SET following_count = following_count + 1 
  WHERE id = NEW.follower_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para actualizar contadores automáticamente al eliminar
CREATE OR REPLACE FUNCTION update_follow_counters_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Decrementar seguidores del usuario seguido
  UPDATE public.profiles 
  SET followers_count = GREATEST(followers_count - 1, 0) 
  WHERE id = OLD.following_id;
  
  -- Decrementar siguiendo del usuario que sigue
  UPDATE public.profiles 
  SET following_count = GREATEST(following_count - 1, 0) 
  WHERE id = OLD.follower_id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear triggers si no existen
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_follow_counters_on_insert_trigger') THEN
    CREATE TRIGGER update_follow_counters_on_insert_trigger
    AFTER INSERT ON public.follows
    FOR EACH ROW
    EXECUTE FUNCTION update_follow_counters_on_insert();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_follow_counters_on_delete_trigger') THEN
    CREATE TRIGGER update_follow_counters_on_delete_trigger
    AFTER DELETE ON public.follows
    FOR EACH ROW
    EXECUTE FUNCTION update_follow_counters_on_delete();
  END IF;
END $$;

-- Función para sincronizar contadores existentes
CREATE OR REPLACE FUNCTION sync_follow_counters()
RETURNS void AS $$
BEGIN
  -- Actualizar contadores de seguidores
  UPDATE public.profiles 
  SET followers_count = (
    SELECT COUNT(*) 
    FROM public.follows 
    WHERE following_id = profiles.id
  );
  
  -- Actualizar contadores de siguiendo
  UPDATE public.profiles 
  SET following_count = (
    SELECT COUNT(*) 
    FROM public.follows 
    WHERE follower_id = profiles.id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ejecutar sincronización inicial
SELECT sync_follow_counters();
