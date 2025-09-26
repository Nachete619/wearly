"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageSquare, Share, MapPin, Calendar, Building2, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { GeneralPost, getGeneralPosts, likeGeneralPost, isGeneralPostLiked } from "@/lib/social-actions"
import { useAuth } from "@/hooks/use-auth"

interface GeneralPostsFeedProps {
  limit?: number
  tipo_publicacion?: GeneralPost['tipo_publicacion']
  showLoadMore?: boolean
}

export function GeneralPostsFeed({ 
  limit = 10, 
  tipo_publicacion,
  showLoadMore = true 
}: GeneralPostsFeedProps) {
  const { user } = useAuth()
  const [posts, setPosts] = useState<GeneralPost[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [offset, setOffset] = useState(0)

  const fetchPosts = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setLoading(true)
        setOffset(0)
      } else {
        setLoadingMore(true)
      }

      const currentOffset = reset ? 0 : offset
      const result = await getGeneralPosts({
        limit,
        offset: currentOffset,
        tipo_publicacion
      })

      if (result.success && result.posts) {
        if (reset) {
          setPosts(result.posts)
        } else {
          setPosts(prev => [...prev, ...result.posts!])
        }
        setHasMore(result.hasMore || false)
        setOffset(currentOffset + limit)
      }

      // Verificar qué posts le gustan al usuario actual
      if (user) {
        const likedPostsSet = new Set<string>()
        for (const post of result.posts || []) {
          const isLiked = await isGeneralPostLiked(post.id)
          if (isLiked) {
            likedPostsSet.add(post.id)
          }
        }
        setLikedPosts(likedPostsSet)
      }

    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [limit, offset, tipo_publicacion, user])

  useEffect(() => {
    fetchPosts(true)
  }, [tipo_publicacion])

  const handleLike = async (postId: string) => {
    if (!user) return

    try {
      const result = await likeGeneralPost(postId)
      if (result.success) {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                likes_count: likedPosts.has(postId) 
                  ? post.likes_count - 1 
                  : post.likes_count + 1 
              }
            : post
        ))

        setLikedPosts(prev => {
          const newSet = new Set(prev)
          if (newSet.has(postId)) {
            newSet.delete(postId)
          } else {
            newSet.add(postId)
          }
          return newSet
        })
      }
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const getTipoColor = (tipo: GeneralPost['tipo_publicacion']) => {
    switch (tipo) {
      case 'noticia':
        return 'bg-blue-500'
      case 'anuncio':
        return 'bg-green-500'
      case 'foto':
        return 'bg-purple-500'
      case 'evento':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      return 'Hace unos minutos'
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} horas`
    } else if (diffInHours < 48) {
      return 'Ayer'
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-24"></div>
                    <div className="h-3 bg-muted rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No hay publicaciones</h3>
          <p className="text-muted-foreground">
            {tipo_publicacion 
              ? `No hay publicaciones de tipo ${tipo_publicacion}`
              : "Aún no hay publicaciones para mostrar"
            }
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Card key={post.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            {/* Header del post */}
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src={post.user?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>
                  {post.user?.tipo_usuario === "empresa" ? (
                    <Building2 className="w-5 h-5" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Link 
                    href={`/profile/${post.user?.username}`}
                    className="font-semibold hover:underline"
                  >
                    {post.user?.full_name}
                  </Link>
                  <Badge 
                    variant="secondary" 
                    className={`text-white ${getTipoColor(post.tipo_publicacion)}`}
                  >
                    {post.tipo_publicacion}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  @{post.user?.username} · {formatDate(post.created_at)}
                </p>
              </div>
            </div>

            {/* Contenido del post */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">{post.titulo}</h3>
              {post.contenido && (
                <p className="text-muted-foreground whitespace-pre-wrap">{post.contenido}</p>
              )}
            </div>

            {/* Imagen del post */}
            {post.imagen_url && (
              <div className="relative aspect-video mb-4 rounded-lg overflow-hidden bg-muted">
                <Image
                  src={post.imagen_url}
                  alt={post.titulo}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=400&width=600&text=Imagen+no+disponible"
                  }}
                />
              </div>
            )}

            {/* Información adicional para eventos */}
            {post.tipo_publicacion === 'evento' && post.fecha_evento && (
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="font-medium">Evento programado</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(post.fecha_evento).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}

            {/* Ubicación */}
            {post.ubicacion && (
              <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{post.ubicacion}</span>
              </div>
            )}

            {/* Acciones del post */}
            <div className="flex items-center gap-6 pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLike(post.id)}
                className={`flex items-center gap-2 ${
                  likedPosts.has(post.id) ? 'text-red-500' : 'text-muted-foreground'
                }`}
              >
                <Heart 
                  className={`w-4 h-4 ${
                    likedPosts.has(post.id) ? 'fill-current' : ''
                  }`} 
                />
                {post.likes_count}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-muted-foreground"
                asChild
              >
                <Link href={`/post/${post.id}`}>
                  <MessageSquare className="w-4 h-4" />
                  {post.comentarios_count}
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-muted-foreground"
              >
                <Share className="w-4 h-4" />
                Compartir
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Botón cargar más */}
      {showLoadMore && hasMore && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => fetchPosts(false)}
            disabled={loadingMore}
            className="w-full max-w-md"
          >
            {loadingMore ? 'Cargando...' : 'Cargar más publicaciones'}
          </Button>
        </div>
      )}
    </div>
  )
}
