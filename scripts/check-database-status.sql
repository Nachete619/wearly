-- Script para verificar el estado actual de la base de datos
-- Ejecutar este script primero para ver qué necesitas actualizar

-- 1. Verificar si existe el campo tipo_usuario en profiles
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public' 
  AND column_name = 'tipo_usuario';

-- 2. Verificar si existe la tabla company_profiles
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_name = 'company_profiles'
) AS company_profiles_exists;

-- 3. Verificar estructura de company_profiles (si existe)
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'company_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar políticas RLS en company_profiles
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'company_profiles' 
  AND schemaname = 'public';

-- 5. Verificar si existe el trigger para updated_at
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name
FROM pg_trigger 
WHERE tgname = 'update_company_profiles_updated_at';

-- 6. Verificar si existe el trigger para nuevos usuarios
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- 7. Verificar índices
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND (tablename = 'company_profiles' OR indexname LIKE '%tipo_usuario%');

-- 8. Verificar función handle_new_user
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE proname = 'handle_new_user';
