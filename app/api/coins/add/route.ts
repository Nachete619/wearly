import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { amount, reason } = await request.json()

    if (!amount || !reason) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 })
    }

    // Verificar si es login diario y si ya recibió monedas hoy
    if (reason === 'daily_login') {
      const { data: canReceive } = await supabase
        .rpc('can_receive_daily_coins', { user_id_param: user.id })
      
      if (!canReceive) {
        return NextResponse.json({ error: 'Ya recibiste las monedas de login diario hoy' }, { status: 400 })
      }
    }

    // Agregar monedas usando la función de la base de datos
    const { data: success, error } = await supabase
      .rpc('add_coins', {
        user_id_param: user.id,
        amount_param: amount,
        reason_param: reason
      })

    if (error || !success) {
      console.error('Error adding coins:', error)
      return NextResponse.json({ error: 'Error al agregar monedas' }, { status: 500 })
    }

    // Obtener el nuevo balance
    const { data: profile } = await supabase
      .from('profiles')
      .select('coins')
      .eq('id', user.id)
      .single()

    return NextResponse.json({ 
      success: true, 
      newBalance: profile?.coins || 0,
      message: `Se agregaron ${amount} monedas`
    })

  } catch (error) {
    console.error('Error in coins/add:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
