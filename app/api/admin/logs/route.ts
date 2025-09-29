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

    // Verificar que es admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('tipo_usuario')
      .eq('id', user.id)
      .single()

    if (profile?.tipo_usuario !== 'admin') {
      return NextResponse.json({ error: 'No tienes permisos de administrador' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const type = searchParams.get('type') || 'all'

    let query = supabase
      .from('coins_log')
      .select(`
        id,
        amount,
        reason,
        created_at,
        user_id,
        profiles (
          username,
          full_name
        ),
        rewards (
          name
        )
      `)

    // Filtrar por tipo si se especifica
    if (type !== 'all') {
      query = query.eq('reason', type)
    }

    const { data: logs, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching logs:', error)
      return NextResponse.json({ error: 'Error al obtener logs' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      logs: logs || [],
      pagination: {
        limit,
        offset,
        hasMore: (logs || []).length === limit
      }
    })

  } catch (error) {
    console.error('Error in admin/logs GET:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
