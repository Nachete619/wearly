-- Script para actualizar el sistema de perfiles con soporte para empresas
-- Ejecutar este script en Supabase SQL Editor

-- 1. Agregar campo tipo_usuario a la tabla profiles si no existe
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS tipo_usuario TEXT DEFAULT 'comun' CHECK (tipo_usuario IN ('comun', 'empresa'));

-- 2. Crear tabla company_profiles si no existe
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

-- 3. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_company_profiles_profile_id ON public.company_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_profiles_tipo_usuario ON public.profiles(tipo_usuario);

-- 4. Habilitar RLS (Row Level Security) en company_profiles
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas de RLS para company_profiles
-- Los usuarios solo pueden ver y editar su propio perfil de empresa
CREATE POLICY "Users can view their own company profile" ON public.company_profiles
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own company profile" ON public.company_profiles
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own company profile" ON public.company_profiles
  FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own company profile" ON public.company_profiles
  FOR DELETE USING (auth.uid() = profile_id);

-- 6. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Crear trigger para actualizar updated_at en company_profiles
DROP TRIGGER IF EXISTS update_company_profiles_updated_at ON public.company_profiles;
CREATE TRIGGER update_company_profiles_updated_at
  BEFORE UPDATE ON public.company_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. Actualizar función handle_new_user para incluir tipo_usuario
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

-- 9. Verificar que el trigger esté creado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
