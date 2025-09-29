-- Script para verificar los permisos de administrador
-- Ejecutar este script para verificar que el usuario actual es admin

-- Primero, verificar la estructura de la tabla profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar el usuario actual (solo campos que existen)
SELECT 
  auth.uid() as current_user_id,
  p.username,
  p.full_name,
  p.tipo_usuario,
  p.created_at
FROM public.profiles p
WHERE p.id = auth.uid();

-- Verificar si el usuario es admin
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND tipo_usuario = 'admin'
    ) THEN 'SÍ es administrador'
    ELSE 'NO es administrador'
  END as admin_status;

-- Verificar políticas RLS para profiles
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Contar total de usuarios
SELECT COUNT(*) as total_users FROM public.profiles;

-- Contar usuarios por tipo
SELECT 
  tipo_usuario,
  COUNT(*) as count
FROM public.profiles
GROUP BY tipo_usuario
ORDER BY count DESC;
