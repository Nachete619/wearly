-- Script completo para configurar el panel de administración
-- Ejecutar este script paso a paso

-- PASO 1: Verificar estructura de la tabla profiles
SELECT 'PASO 1: Estructura de la tabla profiles' as paso;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- PASO 2: Agregar columna is_active si no existe
SELECT 'PASO 2: Agregando columna is_active' as paso;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'is_active'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN is_active BOOLEAN DEFAULT true;
        
        RAISE NOTICE 'Columna is_active agregada a la tabla profiles';
    ELSE
        RAISE NOTICE 'La columna is_active ya existe en la tabla profiles';
    END IF;
END $$;

-- PASO 3: Crear función is_admin
SELECT 'PASO 3: Creando función is_admin' as paso;
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND tipo_usuario = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 4: Configurar políticas RLS
SELECT 'PASO 4: Configurando políticas RLS' as paso;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Crear nuevas políticas
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (is_admin());

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- PASO 5: Verificar configuración
SELECT 'PASO 5: Verificando configuración' as paso;

-- Verificar usuario actual
SELECT 
  auth.uid() as current_user_id,
  p.username,
  p.full_name,
  p.tipo_usuario,
  p.is_active,
  p.created_at
FROM public.profiles p
WHERE p.id = auth.uid();

-- Verificar si es admin
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND tipo_usuario = 'admin'
    ) THEN 'SÍ es administrador'
    ELSE 'NO es administrador'
  END as admin_status;

-- Verificar políticas
SELECT 
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Estadísticas de usuarios
SELECT 
  tipo_usuario,
  COUNT(*) as count,
  COUNT(CASE WHEN is_active = true THEN 1 END) as activos,
  COUNT(CASE WHEN is_active = false THEN 1 END) as inactivos
FROM public.profiles
GROUP BY tipo_usuario
ORDER BY count DESC;

SELECT 'Configuración completada exitosamente' as resultado;
