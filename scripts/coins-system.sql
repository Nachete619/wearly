-- Sistema de Monedas Canjeables
-- Agregar campo coins a la tabla profiles existente

-- Agregar columna coins a profiles si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'coins') THEN
        ALTER TABLE public.profiles ADD COLUMN coins INTEGER DEFAULT 0 NOT NULL;
    END IF;
END $$;

-- Actualizar la restricción de tipo_usuario para incluir 'admin'
DO $$ 
BEGIN
    -- Primero, eliminar la restricción existente si existe
    IF EXISTS (SELECT 1 FROM information_schema.check_constraints 
               WHERE constraint_name = 'profiles_tipo_usuario_check') THEN
        ALTER TABLE public.profiles DROP CONSTRAINT profiles_tipo_usuario_check;
    END IF;
    
    -- Ahora, verificar y corregir valores inválidos en tipo_usuario
    -- Si hay valores que no son 'usuario', 'empresa' o 'admin', los convertimos a 'usuario'
    UPDATE public.profiles 
    SET tipo_usuario = 'usuario' 
    WHERE tipo_usuario NOT IN ('usuario', 'empresa', 'admin');
    
    -- Agregar la nueva restricción que incluye 'admin'
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_tipo_usuario_check 
    CHECK (tipo_usuario IN ('usuario', 'empresa', 'admin'));
END $$;

-- Crear tabla de recompensas
CREATE TABLE IF NOT EXISTS public.rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    cost_coins INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla de log de monedas
CREATE TABLE IF NOT EXISTS public.coins_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- Positivo para ganar, negativo para gastar
    reason TEXT NOT NULL, -- 'registration', 'daily_login', 'reward_redeemed', 'admin_adjustment'
    reward_id UUID REFERENCES public.rewards(id) ON DELETE SET NULL, -- NULL si no es por recompensa
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coins_log ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para rewards
DROP POLICY IF EXISTS "Anyone can view active rewards" ON public.rewards;
CREATE POLICY "Anyone can view active rewards" ON public.rewards
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage rewards" ON public.rewards;
CREATE POLICY "Admins can manage rewards" ON public.rewards
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND tipo_usuario = 'admin'
        )
    );

-- Políticas RLS para coins_log
DROP POLICY IF EXISTS "Users can view their own coins log" ON public.coins_log;
CREATE POLICY "Users can view their own coins log" ON public.coins_log
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert coins log" ON public.coins_log;
CREATE POLICY "System can insert coins log" ON public.coins_log
    FOR INSERT WITH CHECK (true);

-- Función para agregar monedas a un usuario
CREATE OR REPLACE FUNCTION public.add_coins(
    user_id_param UUID,
    amount_param INTEGER,
    reason_param TEXT,
    reward_id_param UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    -- Insertar en el log
    INSERT INTO public.coins_log (user_id, amount, reason, reward_id)
    VALUES (user_id_param, amount_param, reason_param, reward_id_param);
    
    -- Actualizar el balance del usuario
    UPDATE public.profiles 
    SET coins = coins + amount_param
    WHERE id = user_id_param;
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si el usuario ya recibió monedas por login diario hoy
CREATE OR REPLACE FUNCTION public.can_receive_daily_coins(user_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1 FROM public.coins_log 
        WHERE user_id = user_id_param 
        AND reason = 'daily_login' 
        AND DATE(created_at) = CURRENT_DATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para dar monedas de registro (se ejecutará automáticamente)
CREATE OR REPLACE FUNCTION public.give_registration_coins()
RETURNS TRIGGER AS $$
BEGIN
    -- Dar 50 monedas al nuevo usuario
    PERFORM public.add_coins(NEW.id, 50, 'registration');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para dar monedas automáticamente al registrarse
DROP TRIGGER IF EXISTS trigger_give_registration_coins ON public.profiles;
CREATE TRIGGER trigger_give_registration_coins
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.give_registration_coins();

-- Insertar algunas recompensas de ejemplo
INSERT INTO public.rewards (name, description, cost_coins) VALUES
('Descuento 10%', 'Descuento del 10% en tu próxima compra', 100),
('Descuento 20%', 'Descuento del 20% en tu próxima compra', 200),
('Envío Gratis', 'Envío gratuito en tu próxima compra', 50),
('Producto Premium', 'Acceso a productos premium por 1 mes', 500),
('Badge Especial', 'Badge especial en tu perfil por 30 días', 300)
ON CONFLICT DO NOTHING;

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_coins_log_user_id ON public.coins_log(user_id);
CREATE INDEX IF NOT EXISTS idx_coins_log_created_at ON public.coins_log(created_at);
CREATE INDEX IF NOT EXISTS idx_coins_log_reason ON public.coins_log(reason);
CREATE INDEX IF NOT EXISTS idx_rewards_active ON public.rewards(is_active);
