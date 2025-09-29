import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener recompensas activas
    const { data: rewards, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('is_active', true)
      .order('cost_coins', { ascending: true })

    if (error) {
      console.error('Error fetching rewards:', error)
      return NextResponse.json({ error: 'Error al obtener recompensas' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      rewards: rewards || []
    })

  } catch (error) {
    console.error('Error in rewards GET:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar si es admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('tipo_usuario')
      .eq('id', user.id)
      .single()

    if (profile?.tipo_usuario !== 'admin') {
      return NextResponse.json({ error: 'No tienes permisos de administrador' }, { status: 403 })
    }

    const { name, description, cost_coins } = await request.json()

    if (!name || !cost_coins) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 })
    }

    // Crear nueva recompensa
    const { data: reward, error } = await supabase
      .from('rewards')
      .insert({
        name,
        description,
        cost_coins
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating reward:', error)
      return NextResponse.json({ error: 'Error al crear recompensa' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      reward
    })

  } catch (error) {
    console.error('Error in rewards POST:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
