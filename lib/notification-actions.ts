import { getBrowserSupabase } from './supabase'

export interface Notification {
  id: string
  user_id: string
  type: 'follow' | 'like' | 'comment' | 'save'
  title: string
  message?: string
  read: boolean
  created_at: string
  // Datos adicionales para mostrar en la UI
  actor?: {
    id: string
    username: string
    full_name: string
    avatar_url?: string
  }
  target?: {
    id: string
    title?: string
    image_url?: string
  }
}

// Crear notificación
export async function createNotification(
  userId: string,
  type: 'follow' | 'like' | 'comment' | 'save',
  title: string,
  message?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Creating notification:', { userId, type, title, message })
    
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message
      })
      .select()

    console.log('Notification insert result:', { data, error })

    if (error) throw error

    console.log('Notification created successfully:', data)
    return { success: true }
  } catch (error) {
    console.error('Error creating notification:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Obtener notificaciones del usuario
export async function getUserNotifications(userId: string): Promise<{ success: boolean; error?: string; notifications?: Notification[] }> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    // Enriquecer notificaciones con datos adicionales
    const enrichedNotifications = await Promise.all(
      (notifications || []).map(async (notification) => {
        let actor = null
        let target = null

        // Obtener datos del actor y target según el tipo
        if (notification.type === 'follow') {
          // Para follows, necesitamos obtener quién te siguió
          const { data: followData } = await supabase
            .from('follows')
            .select(`
              follower_id,
              profiles!follows_follower_id_fkey (
                id,
                username,
                full_name,
                avatar_url
              )
            `)
            .eq('following_id', userId)
            .eq('created_at', notification.created_at)
            .single()

          if (followData?.profiles) {
            actor = {
              id: followData.profiles.id,
              username: followData.profiles.username,
              full_name: followData.profiles.full_name,
              avatar_url: followData.profiles.avatar_url
            }
          }
        } else if (notification.type === 'like' || notification.type === 'comment' || notification.type === 'save') {
          // Para likes, comments y saves, necesitamos obtener el outfit y quien hizo la acción
          // Esto requeriría consultas adicionales específicas según el tipo
          // Por ahora, usamos los datos básicos de la notificación
        }

        return {
          ...notification,
          actor,
          target
        }
      })
    )

    return { success: true, notifications: enrichedNotifications }
  } catch (error) {
    console.error('Error getting notifications:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Marcar notificación como leída
export async function markNotificationAsRead(notificationId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Marcar todas las notificaciones como leídas
export async function markAllNotificationsAsRead(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Obtener contador de notificaciones no leídas
export async function getUnreadNotificationsCount(userId: string): Promise<{ success: boolean; error?: string; count?: number }> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) throw error

    return { success: true, count: count || 0 }
  } catch (error) {
    console.error('Error getting unread notifications count:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}
