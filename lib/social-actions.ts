import { getBrowserSupabase } from './supabase'
import { createNotification } from './notification-actions'

// Interfaces para las nuevas funcionalidades sociales
export interface GeneralPost {
  id: string
  user_id: string
  tipo_publicacion: 'noticia' | 'anuncio' | 'foto' | 'evento' | 'general'
  titulo: string
  contenido?: string
  imagen_url?: string
  fecha_evento?: string
  ubicacion?: string
  es_publico: boolean
  likes_count: number
  comentarios_count: number
  created_at: string
  updated_at: string
  // Datos del usuario que creó el post
  user?: {
    id: string
    username: string
    full_name: string
    avatar_url?: string
    tipo_usuario: 'comun' | 'empresa'
  }
}

export interface PostComment {
  id: string
  post_id: string
  user_id: string
  contenido: string
  parent_comment_id?: string
  likes_count: number
  created_at: string
  updated_at: string
  user?: {
    id: string
    username: string
    full_name: string
    avatar_url?: string
  }
  replies?: PostComment[]
}

export interface PostLike {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

// Funciones para publicaciones generales

// Crear una nueva publicación general
export async function createGeneralPost(postData: {
  tipo_publicacion: GeneralPost['tipo_publicacion']
  titulo: string
  contenido?: string
  imagen_url?: string
  fecha_evento?: string
  ubicacion?: string
  es_publico?: boolean
}): Promise<{ success: boolean; error?: string; post?: GeneralPost }> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    const { data: post, error } = await supabase
      .from('general_posts')
      .insert({
        user_id: user.id,
        ...postData,
        es_publico: postData.es_publico ?? true
      })
      .select(`
        *,
        user:profiles!general_posts_user_id_fkey(
          id,
          username,
          full_name,
          avatar_url,
          tipo_usuario
        )
      `)
      .single()

    if (error) throw error

    return { success: true, post }
  } catch (error) {
    console.error('Error creating general post:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Obtener publicaciones generales con paginación
export async function getGeneralPosts(options: {
  limit?: number
  offset?: number
  tipo_publicacion?: GeneralPost['tipo_publicacion']
  userId?: string
} = {}): Promise<{ success: boolean; error?: string; posts?: GeneralPost[]; hasMore?: boolean }> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    const { limit = 10, offset = 0, tipo_publicacion, userId } = options

    let query = supabase
      .from('general_posts')
      .select(`
        *,
        user:profiles!general_posts_user_id_fkey(
          id,
          username,
          full_name,
          avatar_url,
          tipo_usuario
        )
      `)
      .eq('es_publico', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (tipo_publicacion) {
      query = query.eq('tipo_publicacion', tipo_publicacion)
    }

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: posts, error } = await query

    if (error) throw error

    // Verificar si hay más publicaciones
    const { count } = await supabase
      .from('general_posts')
      .select('*', { count: 'exact', head: true })
      .eq('es_publico', true)

    return {
      success: true,
      posts: posts || [],
      hasMore: (count || 0) > offset + limit
    }
  } catch (error) {
    console.error('Error getting general posts:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Dar like a una publicación general
export async function likeGeneralPost(postId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    // Verificar si ya existe el like
    const { data: existingLike } = await supabase
      .from('general_posts_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single()

    if (existingLike) {
      // Quitar like
      const { error } = await supabase
        .from('general_posts_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)

      if (error) throw error
    } else {
      // Agregar like
      const { error } = await supabase
        .from('general_posts_likes')
        .insert({
          post_id: postId,
          user_id: user.id
        })

      if (error) throw error
    }

    return { success: true }
  } catch (error) {
    console.error('Error liking general post:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Verificar si el usuario actual le dio like a una publicación
export async function isGeneralPostLiked(postId: string): Promise<boolean> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) return false

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data } = await supabase
      .from('general_posts_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single()

    return !!data
  } catch (error) {
    console.error('Error checking if post is liked:', error)
    return false
  }
}

// Comentar en una publicación general
export async function commentOnGeneralPost(postId: string, contenido: string, parentCommentId?: string): Promise<{ success: boolean; error?: string; comment?: PostComment }> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    const { data: comment, error } = await supabase
      .from('general_posts_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        contenido,
        parent_comment_id: parentCommentId
      })
      .select(`
        *,
        user:profiles!general_posts_comments_user_id_fkey(
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (error) throw error

    return { success: true, comment }
  } catch (error) {
    console.error('Error commenting on general post:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Obtener comentarios de una publicación general
export async function getGeneralPostComments(postId: string): Promise<{ success: boolean; error?: string; comments?: PostComment[] }> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    const { data: comments, error } = await supabase
      .from('general_posts_comments')
      .select(`
        *,
        user:profiles!general_posts_comments_user_id_fkey(
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .is('parent_comment_id', null) // Solo comentarios principales
      .order('created_at', { ascending: true })

    if (error) throw error

    // Obtener respuestas para cada comentario
    const commentsWithReplies = await Promise.all(
      (comments || []).map(async (comment: any) => {
        const { data: replies } = await supabase
          .from('general_posts_comments')
          .select(`
            *,
            user:profiles!general_posts_comments_user_id_fkey(
              id,
              username,
              full_name,
              avatar_url
            )
          `)
          .eq('parent_comment_id', comment.id)
          .order('created_at', { ascending: true })

        return {
          ...comment,
          replies: replies || []
        }
      })
    )

    return { success: true, comments: commentsWithReplies }
  } catch (error) {
    console.error('Error getting general post comments:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Funciones para outfits (extender funcionalidad existente)

// Dar like a un outfit
export async function likeOutfit(outfitId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    // Verificar si ya existe el like
    const { data: existingLike } = await supabase
      .from('outfit_likes')
      .select('id')
      .eq('outfit_id', outfitId)
      .eq('user_id', user.id)
      .single()

    if (existingLike) {
      // Quitar like
      const { error } = await supabase
        .from('outfit_likes')
        .delete()
        .eq('outfit_id', outfitId)
        .eq('user_id', user.id)

      if (error) throw error
    } else {
      // Agregar like
      const { error } = await supabase
        .from('outfit_likes')
        .insert({
          outfit_id: outfitId,
          user_id: user.id
        })

      if (error) throw error

      // Crear notificación para el dueño del outfit
      console.log('Creating like notification for outfit:', outfitId)
      const { data: outfit } = await supabase
        .from('outfits')
        .select('user_id, titulo')
        .eq('id', outfitId)
        .single()

      console.log('Outfit data for notification:', outfit)

      if (outfit && outfit.user_id !== user.id) {
        // Obtener datos del usuario que dio like
        const { data: likerProfile } = await supabase
          .from('profiles')
          .select('username, full_name')
          .eq('id', user.id)
          .single()

        const likerName = likerProfile?.full_name || likerProfile?.username || 'Alguien'
        const outfitTitle = outfit.titulo || 'tu outfit'

        console.log('Creating notification for user:', outfit.user_id, 'from:', user.id)
        const notificationResult = await createNotification(
          outfit.user_id,
          'like',
          `le gustó ${outfitTitle}`,
          `${likerName} le dio like a tu outfit`
        )
        console.log('Like notification result:', notificationResult)
      } else {
        console.log('No notification created - same user or outfit not found')
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error liking outfit:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Verificar si el usuario actual le dio like a un outfit
export async function isOutfitLiked(outfitId: string): Promise<boolean> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) return false

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data } = await supabase
      .from('outfit_likes')
      .select('id')
      .eq('outfit_id', outfitId)
      .eq('user_id', user.id)
      .single()

    return !!data
  } catch (error) {
    console.error('Error checking if outfit is liked:', error)
    return false
  }
}

// Guardados de outfit
export async function toggleSaveOutfit(outfitId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    const { data: existing } = await supabase
      .from('saved_outfits')
      .select('id')
      .eq('outfit_id', outfitId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from('saved_outfits')
        .delete()
        .eq('outfit_id', outfitId)
        .eq('user_id', user.id)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('saved_outfits')
        .insert({ outfit_id: outfitId, user_id: user.id })
      if (error) throw error

      // Crear notificación para el dueño del outfit
      const { data: outfit } = await supabase
        .from('outfits')
        .select('user_id, titulo')
        .eq('id', outfitId)
        .single()

      if (outfit && outfit.user_id !== user.id) {
        // Obtener datos del usuario que guardó
        const { data: saverProfile } = await supabase
          .from('profiles')
          .select('username, full_name')
          .eq('id', user.id)
          .single()

        const saverName = saverProfile?.full_name || saverProfile?.username || 'Alguien'
        const outfitTitle = outfit.titulo || 'tu outfit'

        await createNotification(
          outfit.user_id,
          'save',
          `guardó ${outfitTitle}`,
          `${saverName} guardó tu outfit en sus favoritos`
        )
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error toggling save outfit:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

export async function isOutfitSaved(outfitId: string): Promise<boolean> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) return false

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data } = await supabase
      .from('saved_outfits')
      .select('id')
      .eq('outfit_id', outfitId)
      .eq('user_id', user.id)
      .maybeSingle()

    return !!data
  } catch (error) {
    console.error('Error checking if outfit is saved:', error)
    return false
  }
}

// Comentar en un outfit
export async function commentOnOutfit(outfitId: string, contenido: string, parentCommentId?: string): Promise<{ success: boolean; error?: string; comment?: PostComment }> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    const { data: comment, error } = await supabase
      .from('outfit_comments')
      .insert({
        outfit_id: outfitId,
        user_id: user.id,
        contenido,
        parent_comment_id: parentCommentId
      })
      .select(`
        *,
        profiles (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (error) throw error

    // Crear notificación para el dueño del outfit
    const { data: outfit } = await supabase
      .from('outfits')
      .select('user_id, titulo')
      .eq('id', outfitId)
      .single()

    if (outfit && outfit.user_id !== user.id) {
      // Obtener datos del usuario que comentó
      const { data: commenterProfile } = await supabase
        .from('profiles')
        .select('username, full_name')
        .eq('id', user.id)
        .single()

      const commenterName = commenterProfile?.full_name || commenterProfile?.username || 'Alguien'
      const outfitTitle = outfit.titulo || 'tu outfit'

      await createNotification(
        outfit.user_id,
        'comment',
        `comentó en ${outfitTitle}`,
        `${commenterName} comentó: "${contenido.substring(0, 50)}${contenido.length > 50 ? '...' : ''}"`
      )
    }

    // Formatear el comentario para que coincida con la estructura esperada
    const formattedComment = {
      ...comment,
      user: comment.profiles || {
        id: comment.user_id,
        username: null,
        full_name: "Usuario",
        avatar_url: null
      }
    }

    return { success: true, comment: formattedComment }
  } catch (error) {
    console.error('Error commenting on outfit:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Obtener comentarios de un outfit
export async function getOutfitComments(outfitId: string): Promise<{ success: boolean; error?: string; comments?: PostComment[] }> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    console.log('Fetching comments for outfit:', outfitId)

    // Primero, obtener comentarios sin join para verificar que existen
    const { data: commentsRaw, error: commentsError } = await supabase
      .from('outfit_comments')
      .select('*')
      .eq('outfit_id', outfitId)
      .is('parent_comment_id', null)
      .order('created_at', { ascending: true })

    console.log('Raw comments without join:', commentsRaw)
    console.log('Raw comments error:', commentsError)

    if (commentsError) {
      console.error('Error fetching raw comments:', commentsError)
      throw commentsError
    }

    // Luego, obtener los perfiles por separado
    const userIds = commentsRaw?.map((c: any) => c.user_id) || []
    console.log('User IDs to fetch:', userIds)

    let profilesMap: Record<string, any> = {}
    if (userIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', userIds)

      console.log('Profiles fetched:', profiles)
      console.log('Profiles error:', profilesError)

      if (!profilesError && profiles) {
        profilesMap = profiles.reduce((acc: any, profile: any) => {
          acc[profile.id] = profile
          return acc
        }, {} as Record<string, any>)
      }
    }

    console.log('Profiles map:', profilesMap)

    // Formatear comentarios con los datos separados
    const formattedComments = (commentsRaw || []).map((comment: any) => {
      const userProfile = profilesMap[comment.user_id] || {
        id: comment.user_id,
        username: null,
        full_name: "Usuario",
        avatar_url: null
      }

      return {
        id: comment.id,
        contenido: comment.contenido,
        created_at: comment.created_at,
        user: userProfile
      }
    })

    console.log('Formatted comments:', formattedComments)

    return { success: true, comments: formattedComments }
  } catch (error) {
    console.error('Error getting outfit comments:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}
