-- Script para hacer admin a un usuario específico
-- Usar el ID del usuario en lugar del email

-- Primero, verificar el usuario actual por ID
SELECT id, username, tipo_usuario 
FROM public.profiles 
WHERE id = 'b0a58567-86f9-4679-9b4a-f7e738a89b5f';

-- Hacer admin al usuario por ID
UPDATE public.profiles 
SET tipo_usuario = 'admin' 
WHERE id = 'b0a58567-86f9-4679-9b4a-f7e738a89b5f';

-- Verificar el cambio
SELECT id, username, tipo_usuario 
FROM public.profiles 
WHERE id = 'b0a58567-86f9-4679-9b4a-f7e738a89b5f';
