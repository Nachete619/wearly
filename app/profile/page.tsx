"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { getBrowserSupabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Heart, Bookmark, MapPin, User, Edit, Settings, Plus } from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { LayersIcon } from "@/components/layers-icon"
import { UploadOutfitModal } from "@/components/upload-outfit-modal"
import Link from "next/link"
import Image from "next/image"
import { EditProfileModal } from "@/components/edit-profile-modal"

interface UserProfile {
  id: string
  username: string
  full_name: string
  bio?: string
  avatar_url?: string
  followers_count: number
  following_count: number
  outfits_count: number
}

interface Outfit {
  id: string
  title: string
  description: string
  image_url: string
  likes_count: number
  saves_count: number
  location_name?: string
  created_at: string
}

export default function ProfilePage() {
  const { user, loading: authLoading, initialized } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const mountedRef = useRef(true)
  const supabase = getBrowserSupabase()

  useEffect(() => {
    mountedRef.current = true
    setMounted(true)

    return () => {
      mountedRef.current = false
    }
  }, [])

  const fetchProfile = useCallback(async () => {
    if (!user || !mountedRef.current) return

    try {
      setLoading(true)

      // Try to fetch from Supabase
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profileError) {
        console.error("Error fetching profile:", profileError)
        // Use mock data
        setProfile({
          id: user.id,
          username: user.email?.split("@")[0] || "usuario",
          full_name: user.user_metadata?.full_name || "Usuario",
          bio: "Amante de la moda y el estilo",
          avatar_url: user.user_metadata?.avatar_url,
          followers_count: 0,
          following_count: 0,
          outfits_count: 0,
        })
      } else {
        setProfile({
          ...profileData,
          followers_count: profileData.followers_count || 0,
          following_count: profileData.following_count || 0,
          outfits_count: profileData.outfits_count || 0,
        })
      }

      // Fetch user outfits
      const { data: outfitsData, error: outfitsError } = await supabase
        .from("outfits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (!outfitsError && outfitsData) {
        setOutfits(outfitsData)
      } else {
        // Mock outfits for demo
        setOutfits([
          {
            id: "1",
            title: "Mi look favorito",
            description: "Perfecto para cualquier ocasión",
            image_url: "https://picsum.photos/400/600?random=21",
            likes_count: 15,
            saves_count: 8,
            location_name: "Madrid, España",
            created_at: "2024-01-15T10:30:00Z",
          },
          {
            id: "2",
            title: "Estilo casual",
            description: "Para un día relajado",
            image_url: "https://picsum.photos/400/700?random=22",
            likes_count: 23,
            saves_count: 12,
            location_name: null,
            created_at: "2024-01-14T18:45:00Z",
          },
        ])
      }
    } catch (error) {
      console.error("Error fetching profile data:", error)
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [user, supabase])

  useEffect(() => {
    if (initialized && mounted && user) {
      fetchProfile()
    }
  }, [initialized, mounted, user, fetchProfile])

  const handleUploadSuccess = () => {
    // Refresh the profile data to show new outfit
    fetchProfile()
    setShowUploadModal(false)
  }

  if (!mounted || !initialized) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <EmptyState
            icon={<User className="w-20 h-20" />}
            title="Inicia sesión"
            description="Debes iniciar sesión para ver tu perfil"
            action={{
              label: "Iniciar sesión",
              onClick: () => (window.location.href = "/auth/login"),
            }}
          />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-start gap-6 mb-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="text-2xl">
                <User className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-2xl font-bold">{profile?.full_name || "Usuario"}</h1>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Editar perfil
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-muted-foreground mb-3">@{profile?.username}</p>

              {profile?.bio && <p className="text-sm mb-4">{profile.bio}</p>}

              <div className="flex gap-6 text-sm">
                <span>
                  <strong>{outfits.length}</strong> outfits
                </span>
                <span>
                  <strong>{profile?.followers_count || 0}</strong> seguidores
                </span>
                <span>
                  <strong>{profile?.following_count || 0}</strong> siguiendo
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Outfits Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Mis Outfits</h2>
            <Button size="sm" onClick={() => setShowUploadModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Subir outfit
            </Button>
          </div>

          {outfits.length === 0 ? (
            <EmptyState
              icon={<LayersIcon className="w-20 h-20" />}
              title="No tienes outfits"
              description="Comparte tu primer look con la comunidad"
              action={{
                label: "Subir outfit",
                onClick: () => setShowUploadModal(true),
              }}
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {outfits.map((outfit) => (
                <Link key={outfit.id} href={`/outfit/${outfit.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer">
                    <div className="relative aspect-square">
                      <Image
                        src={outfit.image_url || "/placeholder.svg"}
                        alt={outfit.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      />

                      {/* Location badge */}
                      {outfit.location_name && (
                        <div className="absolute top-2 left-2">
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1 bg-black/70 text-white border-0 text-xs"
                          >
                            <MapPin className="w-2 h-2" />
                            <span className="truncate max-w-16">{outfit.location_name}</span>
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-3">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-1">{outfit.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{outfit.description}</p>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {outfit.likes_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bookmark className="w-3 h-3" />
                            {outfit.saves_count}
                          </span>
                        </div>
                        <span>
                          {new Date(outfit.created_at).toLocaleDateString("es-ES", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Edit Profile Modal */}
        {showEditModal && (
          <EditProfileModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            profile={profile}
            onProfileUpdate={(updatedProfile) => {
              setProfile(updatedProfile)
              setShowEditModal(false)
            }}
          />
        )}

        {/* Upload Modal */}
        <UploadOutfitModal open={showUploadModal} onOpenChange={setShowUploadModal} onSuccess={handleUploadSuccess} />
      </div>
    </AppLayout>
  )
}
