-- Script parcial para usuarios que ya tienen el campo tipo_usuario
-- Ejecutar solo las partes que falten en tu base de datos

-- 1. Verificar si ya existe la tabla company_profiles
-- Si ya existe, puedes omitir esta sección
CREATE TABLE IF NOT EXISTS public.company_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  nombre_empresa TEXT NOT NULL,
  descripcion TEXT,
  direccion TEXT,
  telefono TEXT,
  horarios TEXT,
  sitio_web TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Crear índices para mejorar el rendimiento (si no existen)
CREATE INDEX IF NOT EXISTS idx_company_profiles_profile_id ON public.company_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_profiles_tipo_usuario ON public.profiles(tipo_usuario);

-- 3. Habilitar RLS (Row Level Security) en company_profiles
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas de RLS para company_profiles (si no existen)
-- Verificar primero si las políticas ya existen antes de ejecutar

-- Política para SELECT
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'company_profiles' 
        AND policyname = 'Users can view their own company profile'
    ) THEN
        CREATE POLICY "Users can view their own company profile" ON public.company_profiles
          FOR SELECT USING (auth.uid() = profile_id);
    END IF;
END $$;

-- Política para INSERT
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'company_profiles' 
        AND policyname = 'Users can insert their own company profile'
    ) THEN
        CREATE POLICY "Users can insert their own company profile" ON public.company_profiles
          FOR INSERT WITH CHECK (auth.uid() = profile_id);
    END IF;
END $$;

-- Política para UPDATE
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'company_profiles' 
        AND policyname = 'Users can update their own company profile'
    ) THEN
        CREATE POLICY "Users can update their own company profile" ON public.company_profiles
          FOR UPDATE USING (auth.uid() = profile_id);
    END IF;
END $$;

-- Política para DELETE
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'company_profiles' 
        AND policyname = 'Users can delete their own company profile'
    ) THEN
        CREATE POLICY "Users can delete their own company profile" ON public.company_profiles
          FOR DELETE USING (auth.uid() = profile_id);
    END IF;
END $$;

-- 5. Crear función para actualizar updated_at automáticamente (si no existe)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Crear trigger para actualizar updated_at en company_profiles (si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_company_profiles_updated_at'
    ) THEN
        CREATE TRIGGER update_company_profiles_updated_at
          BEFORE UPDATE ON public.company_profiles
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- 7. Verificar que la función handle_new_user incluya tipo_usuario
-- Solo actualizar si la función no incluye el campo tipo_usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, username, instagram_url, pinterest_url, tipo_usuario)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    null,
    null,
    'comun'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Verificar que el trigger esté creado (si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_auth_user_created'
    ) THEN
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;
