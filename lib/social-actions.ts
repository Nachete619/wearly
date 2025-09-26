import { getBrowserSupabase } from './supabase'

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
      (comments || []).map(async (comment) => {
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
        user:profiles!outfit_comments_user_id_fkey(
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
    console.error('Error commenting on outfit:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Obtener comentarios de un outfit
export async function getOutfitComments(outfitId: string): Promise<{ success: boolean; error?: string; comments?: PostComment[] }> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    const { data: comments, error } = await supabase
      .from('outfit_comments')
      .select(`
        *,
        user:profiles!outfit_comments_user_id_fkey(
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('outfit_id', outfitId)
      .is('parent_comment_id', null) // Solo comentarios principales
      .order('created_at', { ascending: true })

    if (error) throw error

    // Obtener respuestas para cada comentario
    const commentsWithReplies = await Promise.all(
      (comments || []).map(async (comment) => {
        const { data: replies } = await supabase
          .from('outfit_comments')
          .select(`
            *,
            user:profiles!outfit_comments_user_id_fkey(
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
    console.error('Error getting outfit comments:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}
