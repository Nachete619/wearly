import { getBrowserSupabase } from './supabase'
import { createNotification } from './notification-actions'

// Interfaces para el sistema de seguimiento
export interface FollowData {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

// Seguir a un usuario
export async function followUser(followingId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    if (user.id === followingId) {
      throw new Error('No puedes seguirte a ti mismo')
    }

    // Verificar si ya existe la relación
    const { data: existingFollow } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', followingId)
      .single()

    if (existingFollow) {
      throw new Error('Ya sigues a este usuario')
    }

    // Crear la relación de seguimiento
    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        following_id: followingId
      })

    if (error) throw error

    // Actualizar contadores en profiles
    await supabase.rpc('increment_followers_count', { user_id: followingId })
    await supabase.rpc('increment_following_count', { user_id: user.id })

    // Crear notificación para el usuario seguido
    console.log('Creating follow notification for user:', followingId, 'from:', user.id)
    const { data: followerProfile } = await supabase
      .from('profiles')
      .select('username, full_name')
      .eq('id', user.id)
      .single()

    const followerName = followerProfile?.full_name || followerProfile?.username || 'Alguien'

    const notificationResult = await createNotification(
      followingId,
      'follow',
      'comenzó a seguirte',
      `${followerName} comenzó a seguirte`
    )
    console.log('Follow notification result:', notificationResult)

    return { success: true }
  } catch (error) {
    console.error('Error following user:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Dejar de seguir a un usuario
export async function unfollowUser(followingId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    // Eliminar la relación de seguimiento
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', followingId)

    if (error) throw error

    // Actualizar contadores en profiles
    await supabase.rpc('decrement_followers_count', { user_id: followingId })
    await supabase.rpc('decrement_following_count', { user_id: user.id })

    return { success: true }
  } catch (error) {
    console.error('Error unfollowing user:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Verificar si el usuario actual sigue a otro usuario
export async function isFollowingUser(followingId: string): Promise<boolean> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) return false

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', followingId)
      .single()

    return !!data
  } catch (error) {
    console.error('Error checking follow status:', error)
    return false
  }
}

// Obtener seguidores de un usuario
export async function getUserFollowers(userId: string, limit: number = 20, offset: number = 0): Promise<{ success: boolean; error?: string; followers?: any[] }> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    const { data, error } = await supabase
      .from('follows')
      .select(`
        id,
        created_at,
        follower:profiles!follows_follower_id_fkey(
          id,
          username,
          full_name,
          avatar_url,
          tipo_usuario
        )
      `)
      .eq('following_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return { success: true, followers: data || [] }
  } catch (error) {
    console.error('Error getting followers:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Obtener usuarios que sigue un usuario
export async function getUserFollowing(userId: string, limit: number = 20, offset: number = 0): Promise<{ success: boolean; error?: string; following?: any[] }> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    const { data, error } = await supabase
      .from('follows')
      .select(`
        id,
        created_at,
        following:profiles!follows_following_id_fkey(
          id,
          username,
          full_name,
          avatar_url,
          tipo_usuario
        )
      `)
      .eq('follower_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return { success: true, following: data || [] }
  } catch (error) {
    console.error('Error getting following:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}
