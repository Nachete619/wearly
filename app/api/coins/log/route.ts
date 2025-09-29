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

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Obtener historial de monedas del usuario
    const { data: coinsLog, error } = await supabase
      .from('coins_log')
      .select(`
        id,
        amount,
        reason,
        created_at,
        rewards (
          id,
          name,
          description
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching coins log:', error)
      return NextResponse.json({ error: 'Error al obtener historial' }, { status: 500 })
    }

    // Obtener balance actual
    const { data: profile } = await supabase
      .from('profiles')
      .select('coins')
      .eq('id', user.id)
      .single()

    return NextResponse.json({ 
      success: true, 
      log: coinsLog || [],
      currentBalance: profile?.coins || 0,
      pagination: {
        limit,
        offset,
        hasMore: (coinsLog || []).length === limit
      }
    })

  } catch (error) {
    console.error('Error in coins/log GET:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
