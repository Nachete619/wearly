-- Script para agregar la columna is_active a la tabla profiles si no existe
-- Este script es seguro de ejecutar múltiples veces

-- Verificar si la columna is_active existe
DO $$
BEGIN
    -- Agregar la columna is_active si no existe
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

-- Verificar la estructura actualizada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Mostrar algunos usuarios de ejemplo
SELECT 
  id,
  username,
  full_name,
  tipo_usuario,
  is_active,
  created_at
FROM public.profiles
LIMIT 5;
