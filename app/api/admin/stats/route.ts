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

    // Obtener estadísticas en paralelo
    const [
      usersResult,
      outfitsResult,
      productsResult,
      rewardsResult,
      recentUsersResult,
      recentOutfitsResult
    ] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('outfits').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('rewards').select('id', { count: 'exact', head: true }),
      supabase
        .from('profiles')
        .select('id, username, full_name, created_at, tipo_usuario')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('outfits')
        .select('id, titulo, created_at, user_id, profiles(username)')
        .order('created_at', { ascending: false })
        .limit(5)
    ])

    const stats = {
      totalUsers: usersResult.count || 0,
      totalOutfits: outfitsResult.count || 0,
      totalProducts: productsResult.count || 0,
      totalRewards: rewardsResult.count || 0,
      recentUsers: recentUsersResult.data || [],
      recentOutfits: recentOutfitsResult.data || [],
      systemHealth: {
        databaseStatus: 'healthy' as const,
        storageStatus: 'healthy' as const,
        apiStatus: 'healthy' as const
      }
    }

    return NextResponse.json({ success: true, stats })

  } catch (error) {
    console.error('Error in admin/stats:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
