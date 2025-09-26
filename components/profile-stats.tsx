"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Users, UserPlus, Eye, MessageSquare } from "lucide-react"
import { getBrowserSupabase } from "@/lib/supabase"

interface ProfileStatsProps {
  userId: string
  profile?: {
    followers_count: number
    following_count: number
  }
}

interface Stats {
  totalLikes: number
  totalPosts: number
  totalOutfits: number
  totalProducts: number
}

export function ProfileStats({ userId, profile }: ProfileStatsProps) {
  const [stats, setStats] = useState<Stats>({
    totalLikes: 0,
    totalPosts: 0,
    totalOutfits: 0,
    totalProducts: 0
  })
  const [loading, setLoading] = useState(true)
  const supabase = getBrowserSupabase()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Obtener likes en outfits
        const { data: outfitLikes, error: outfitLikesError } = await supabase
          .from('outfit_likes')
          .select('outfit_id, outfits!inner(user_id)')
          .eq('outfits.user_id', userId)

        // Obtener likes en publicaciones generales
        const { data: postLikes, error: postLikesError } = await supabase
          .from('general_posts_likes')
          .select('post_id, general_posts!inner(user_id)')
          .eq('general_posts.user_id', userId)

        // Obtener publicaciones generales
        const { data: posts, error: postsError } = await supabase
          .from('general_posts')
          .select('id')
          .eq('user_id', userId)
          .eq('es_publico', true)

        // Obtener outfits
        const { data: outfits, error: outfitsError } = await supabase
          .from('outfits')
          .select('id')
          .eq('user_id', userId)

        // Obtener productos (si es empresa)
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('id')
          .eq('empresa_id', userId)
          .eq('es_activo', true)

        if (!outfitLikesError && !postLikesError && !postsError && !outfitsError && !productsError) {
          setStats({
            totalLikes: (outfitLikes?.length || 0) + (postLikes?.length || 0),
            totalPosts: posts?.length || 0,
            totalOutfits: outfits?.length || 0,
            totalProducts: products?.length || 0
          })
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [userId, supabase])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-6 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* Seguidores */}
      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Seguidores</p>
          <p className="text-2xl font-bold">{profile?.followers_count || 0}</p>
        </CardContent>
      </Card>

      {/* Siguiendo */}
      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <UserPlus className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Siguiendo</p>
          <p className="text-2xl font-bold">{profile?.following_count || 0}</p>
        </CardContent>
      </Card>

      {/* Likes totales */}
      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Heart className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Likes</p>
          <p className="text-2xl font-bold">{stats.totalLikes}</p>
        </CardContent>
      </Card>

      {/* Publicaciones */}
      <Card>
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <MessageSquare className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Publicaciones</p>
          <p className="text-2xl font-bold">{stats.totalPosts + stats.totalOutfits + stats.totalProducts}</p>
        </CardContent>
      </Card>
    </div>
  )
}
