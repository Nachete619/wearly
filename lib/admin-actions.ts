import { getBrowserSupabase } from './supabase'

export interface AdminStats {
  totalUsers: number
  totalOutfits: number
  totalProducts: number
  totalRewards: number
  recentUsers: any[]
  recentOutfits: any[]
  systemHealth: {
    databaseStatus: 'healthy' | 'warning' | 'error'
    storageStatus: 'healthy' | 'warning' | 'error'
    apiStatus: 'healthy' | 'warning' | 'error'
  }
}

export interface UserManagement {
  id: string
  username: string
  full_name: string
  email: string
  tipo_usuario: 'usuario' | 'empresa' | 'admin'
  created_at: string
  last_login?: string
  is_active: boolean
  outfits_count: number
  followers_count: number
}

// Verificar si el usuario actual es admin
export async function isAdmin(): Promise<{ success: boolean; isAdmin: boolean; error?: string }> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: true, isAdmin: false }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('tipo_usuario')
      .eq('id', user.id)
      .single()

    if (error) throw error

    return { success: true, isAdmin: profile?.tipo_usuario === 'admin' }
  } catch (error) {
    console.error('Error checking admin status:', error)
    return { success: false, isAdmin: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Obtener estadísticas del sistema para admin
export async function getAdminStats(): Promise<{ success: boolean; error?: string; stats?: AdminStats }> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    // Verificar que es admin
    const adminCheck = await isAdmin()
    if (!adminCheck.isAdmin) {
      throw new Error('No tienes permisos de administrador')
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

    const stats: AdminStats = {
      totalUsers: usersResult.count || 0,
      totalOutfits: outfitsResult.count || 0,
      totalProducts: productsResult.count || 0,
      totalRewards: rewardsResult.count || 0,
      recentUsers: recentUsersResult.data || [],
      recentOutfits: recentOutfitsResult.data || [],
      systemHealth: {
        databaseStatus: 'healthy',
        storageStatus: 'healthy',
        apiStatus: 'healthy'
      }
    }

    return { success: true, stats }
  } catch (error) {
    console.error('Error getting admin stats:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Obtener lista de usuarios para gestión
export async function getUsersForManagement(
  limit: number = 20,
  offset: number = 0,
  search?: string
): Promise<{ success: boolean; error?: string; users?: UserManagement[]; total?: number }> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    // Verificar que es admin
    const adminCheck = await isAdmin()
    if (!adminCheck.isAdmin) {
      throw new Error('No tienes permisos de administrador')
    }

    let query = supabase
      .from('profiles')
      .select(`
        id,
        username,
        full_name,
        email,
        tipo_usuario,
        created_at,
        is_active,
        outfits_count,
        followers_count
      `)

    if (search) {
      query = query.or(`username.ilike.%${search}%,full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data: users, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return { success: true, users: users || [], total: count || 0 }
  } catch (error) {
    console.error('Error getting users for management:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Activar/desactivar usuario
export async function toggleUserStatus(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    // Verificar que es admin
    const adminCheck = await isAdmin()
    if (!adminCheck.isAdmin) {
      throw new Error('No tienes permisos de administrador')
    }

    // Obtener estado actual
    const { data: user, error: fetchError } = await supabase
      .from('profiles')
      .select('is_active')
      .eq('id', userId)
      .single()

    if (fetchError) throw fetchError

    // Cambiar estado
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !user.is_active })
      .eq('id', userId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error toggling user status:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Obtener logs del sistema
export async function getSystemLogs(
  limit: number = 50,
  offset: number = 0
): Promise<{ success: boolean; error?: string; logs?: any[] }> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    // Verificar que es admin
    const adminCheck = await isAdmin()
    if (!adminCheck.isAdmin) {
      throw new Error('No tienes permisos de administrador')
    }

    // Obtener logs de monedas como ejemplo de logs del sistema
    const { data: logs, error } = await supabase
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
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return { success: true, logs: logs || [] }
  } catch (error) {
    console.error('Error getting system logs:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Gestionar recompensas (crear, editar, eliminar)
export async function createReward(
  name: string,
  description: string,
  cost_coins: number
): Promise<{ success: boolean; error?: string; reward?: any }> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    // Verificar que es admin
    const adminCheck = await isAdmin()
    if (!adminCheck.isAdmin) {
      throw new Error('No tienes permisos de administrador')
    }

    const { data: reward, error } = await supabase
      .from('rewards')
      .insert({
        name,
        description,
        cost_coins
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, reward }
  } catch (error) {
    console.error('Error creating reward:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

export async function updateReward(
  rewardId: string,
  updates: { name?: string; description?: string; cost_coins?: number; is_active?: boolean }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    // Verificar que es admin
    const adminCheck = await isAdmin()
    if (!adminCheck.isAdmin) {
      throw new Error('No tienes permisos de administrador')
    }

    const { error } = await supabase
      .from('rewards')
      .update(updates)
      .eq('id', rewardId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error updating reward:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

export async function deleteReward(rewardId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    // Verificar que es admin
    const adminCheck = await isAdmin()
    if (!adminCheck.isAdmin) {
      throw new Error('No tienes permisos de administrador')
    }

    const { error } = await supabase
      .from('rewards')
      .delete()
      .eq('id', rewardId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error deleting reward:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}
