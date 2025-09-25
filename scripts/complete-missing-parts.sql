-- Script para completar solo las partes que faltan en tu base de datos
-- Tu base de datos ya tiene: tipo_usuario, company_profiles, etc.
-- Solo necesitas las políticas RLS y triggers

-- 1. Habilitar RLS en company_profiles (si no está habilitado)
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

-- 2. Crear políticas RLS para company_profiles
-- Verificar si las políticas ya existen antes de crearlas

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

-- 3. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Crear trigger para actualizar updated_at en company_profiles
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

-- 5. Actualizar función handle_new_user para incluir tipo_usuario
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

-- 6. Verificar que el trigger esté creado para nuevos usuarios
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
