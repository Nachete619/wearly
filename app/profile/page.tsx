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
import { Heart, Bookmark, MapPin, User, Edit, Settings, Plus, Building2, Clock, Phone, Globe } from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { LayersIcon } from "@/components/layers-icon"
import { UploadOutfitModal } from "@/components/upload-outfit-modal"
import Link from "next/link"
import Image from "next/image"
import { EditProfileModal } from "@/components/edit-profile-modal"
import { CompanyProfileTabs } from "@/components/company-profile-tabs"
import { CreatePostModal } from "@/components/create-post-modal"

// Importar el componente Toast en la parte superior
import { toast } from "@/components/ui/use-toast"
import { Trash2 } from "lucide-react"

// Importar las interfaces y funciones de user-actions
import { UserProfile, CompanyProfile, getCurrentCompanyProfile } from "@/lib/user-actions"
import { GeneralPost } from "@/lib/social-actions"

// La interfaz UserProfile ya está importada desde user-actions

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
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null)
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showCreatePostModal, setShowCreatePostModal] = useState(false)
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
          tipo_usuario: "comun",
          followers_count: 0,
          following_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      } else {
        setProfile({
          ...profileData,
          followers_count: profileData.followers_count || 0,
          following_count: profileData.following_count || 0,
          tipo_usuario: profileData.tipo_usuario || "comun",
        })

        // Si es usuario empresa, obtener también los datos de la empresa
        if (profileData.tipo_usuario === "empresa") {
          try {
            const companyProfile = await getCurrentCompanyProfile()
            setCompanyProfile(companyProfile)
          } catch (error) {
            console.error("Error fetching company profile:", error)
          }
        }
      }

      // Fetch user outfits
      const { data: outfitsData, error: outfitsError } = await supabase
        .from("outfits")
        .select("*, outfit_images(*)")
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

  const handlePostCreated = (post: GeneralPost) => {
    // Refresh the profile data to show new post
    fetchProfile()
    setShowCreatePostModal(false)
    toast({
      title: "Publicación creada",
      description: "Tu publicación ha sido publicada exitosamente",
    })
  }

  const handleUploadProduct = () => {
    // TODO: Implementar modal para subir productos
    toast({
      title: "Próximamente",
      description: "La funcionalidad de productos estará disponible pronto",
    })
  }

  // Añadir la función handleDeleteOutfit DENTRO del componente
  const handleDeleteOutfit = async (e: React.MouseEvent, outfitId: string) => {
    e.preventDefault() // Evitar navegación al outfit
    e.stopPropagation() // Evitar propagación del evento
    
    if (!confirm("¿Estás seguro de que deseas eliminar este outfit?")) {
      return
    }
    
    try {
      const { deleteOutfit } = await import("@/lib/outfit-actions")
      await deleteOutfit(supabase, outfitId, user.id)
      
      // Actualizar la lista de outfits después de eliminar
      setOutfits(outfits.filter(outfit => outfit.id !== outfitId))
      
      toast({
        title: "Outfit eliminado",
        description: "El outfit ha sido eliminado correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar outfit:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el outfit",
        variant: "destructive",
      })
    }
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
                {profile?.tipo_usuario === "empresa" ? (
                  <Building2 className="w-8 h-8" />
                ) : (
                  <User className="w-8 h-8" />
                )}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-2xl font-bold">
                  {profile?.tipo_usuario === "empresa" && companyProfile
                    ? companyProfile.nombre_empresa
                    : profile?.full_name || "Usuario"}
                </h1>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Editar perfil
                </Button>
                {profile?.username && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    asChild
                    className="flex items-center gap-2"
                  >
                    <Link href={`/profile/${profile.username}`}>
                      Ver perfil público
                    </Link>
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-muted-foreground mb-3">@{profile?.username}</p>

              {/* Mostrar descripción según el tipo de usuario */}
              {(profile?.tipo_usuario === "empresa" && companyProfile) ? (
                <div className="space-y-3">
                  {companyProfile.descripcion && (
                    <p className="text-sm mb-4">{companyProfile.descripcion}</p>
                  )}
                  
                  {/* Información de la empresa */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {companyProfile.direccion && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{companyProfile.direccion}</span>
                      </div>
                    )}
                    {companyProfile.telefono && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{companyProfile.telefono}</span>
                      </div>
                    )}
                    {companyProfile.horarios && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{companyProfile.horarios}</span>
                      </div>
                    )}
                    {companyProfile.sitio_web && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <a 
                          href={companyProfile.sitio_web} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Sitio web
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                profile?.bio && <p className="text-sm mb-4">{profile.bio}</p>
              )}

              <div className="flex gap-6 text-sm mt-4">
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

        {/* Content Section */}
        <div className="mb-6">
          {profile?.tipo_usuario === "empresa" ? (
            // Pestañas para empresas
            <CompanyProfileTabs
              userId={user?.id || ""}
              isOwnProfile={true}
              onUploadProduct={handleUploadProduct}
              onUploadPost={() => setShowCreatePostModal(true)}
            />
          ) : (
            // Outfits para usuarios comunes
            <>
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
                    <div key={outfit.id} className="relative">
                      <Link href={`/outfit/${outfit.id}`}>
                        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer">
                          <div className="relative aspect-square">
                            <Image
                              src={outfit.outfit_images?.[0]?.image_url || "/placeholder.svg"}
                              alt={outfit.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = "/placeholder.svg?height=400&width=400&text=Outfit"
                              }}
                            />

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
                      
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="absolute top-2 right-2 w-8 h-8 rounded-full opacity-80 hover:opacity-100"
                        onClick={(e) => handleDeleteOutfit(e, outfit.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Edit Profile Modal */}
        {showEditModal && (
          <EditProfileModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            profile={profile}
            onProfileUpdated={() => {
              // Recargar el perfil y los datos de empresa
              fetchProfile()
              setShowEditModal(false)
            }}
          />
        )}

        {/* Upload Modal */}
        <UploadOutfitModal open={showUploadModal} onOpenChange={setShowUploadModal} onSuccess={handleUploadSuccess} />

        {/* Create Post Modal */}
        <CreatePostModal
          isOpen={showCreatePostModal}
          onClose={() => setShowCreatePostModal(false)}
          onPostCreated={handlePostCreated}
        />
      </div>
    </AppLayout>
  )
}

// Eliminar esta función externa que no funciona
// const handleDeleteOutfit = async (e: React.MouseEvent, outfitId: string) => { ... }
