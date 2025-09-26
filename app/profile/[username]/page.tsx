"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { getBrowserSupabase } from "@/lib/supabase"
import { useAuth } from "@/hooks/use-auth"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Heart, 
  Bookmark, 
  MapPin, 
  User, 
  Building2, 
  Clock, 
  Phone, 
  Globe,
  Plus,
  Package,
  FileText,
  Users,
  UserPlus,
  UserCheck
} from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { LayersIcon } from "@/components/layers-icon"
import Link from "next/link"
import Image from "next/image"
import { UserProfile, CompanyProfile, getCurrentCompanyProfile } from "@/lib/user-actions"
import { followUser, unfollowUser, isFollowingUser } from "@/lib/follow-actions"

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

interface PublicProfilePageProps {
  params: {
    username: string
  }
}

export default function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { user: currentUser } = useAuth()
  const router = useRouter()
  const username = params.username
  const supabase = getBrowserSupabase()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null)
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [activeTab, setActiveTab] = useState("outfits")

  const fetchProfile = useCallback(async () => {
    if (!username) return

    try {
      setLoading(true)
      setError(null)

      // Buscar perfil por username
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single()

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          setError("Usuario no encontrado")
        } else {
          throw profileError
        }
        return
      }

      setProfile(profileData)

      // Si es usuario empresa, obtener datos de empresa
      if (profileData.tipo_usuario === "empresa") {
        try {
          const companyProfile = await getCurrentCompanyProfile()
          setCompanyProfile(companyProfile)
        } catch (error) {
          console.error("Error fetching company profile:", error)
        }
      }

      // Verificar si el usuario actual sigue a este perfil
      if (currentUser && currentUser.id !== profileData.id) {
        const followingStatus = await isFollowingUser(profileData.id)
        setIsFollowing(followingStatus)
      }

    } catch (error) {
      console.error("Error fetching profile:", error)
      setError("Error al cargar el perfil")
    } finally {
      setLoading(false)
    }
  }, [username, currentUser, supabase])

  const fetchContent = useCallback(async () => {
    if (!profile) return

    try {
      // Obtener outfits del usuario
      const { data: outfitsData, error: outfitsError } = await supabase
        .from("outfits")
        .select("*, outfit_images(*)")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })

      if (!outfitsError && outfitsData) {
        setOutfits(outfitsData)
      }

      // Si es empresa, obtener productos
      if (profile.tipo_usuario === "empresa") {
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .eq("empresa_id", profile.id)
          .eq("es_activo", true)
          .order("created_at", { ascending: false })

        if (!productsError && productsData) {
          setProducts(productsData)
        }
      }


    } catch (error) {
      console.error("Error fetching content:", error)
    }
  }, [profile, supabase])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  useEffect(() => {
    if (profile) {
      fetchContent()
    }
  }, [profile, fetchContent])

  const handleFollow = async () => {
    if (!currentUser || !profile) return

    try {
      if (isFollowing) {
        // Dejar de seguir
        const result = await unfollowUser(profile.id)
        if (result.success) {
          setIsFollowing(false)
          // Actualizar contador
          setProfile(prev => prev ? {
            ...prev,
            followers_count: Math.max(0, prev.followers_count - 1)
          } : null)
        } else {
          console.error("Error unfollowing:", result.error)
        }
      } else {
        // Seguir
        const result = await followUser(profile.id)
        if (result.success) {
          setIsFollowing(true)
          // Actualizar contador
          setProfile(prev => prev ? {
            ...prev,
            followers_count: prev.followers_count + 1
          } : null)
        } else {
          console.error("Error following:", result.error)
        }
      }
    } catch (error) {
      console.error("Error in handleFollow:", error)
    }
  }

  if (loading) {
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

  if (error || !profile) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <EmptyState
            icon={<User className="w-20 h-20" />}
            title="Perfil no encontrado"
            description={error || "El usuario que buscas no existe"}
            action={{
              label: "Volver al inicio",
              onClick: () => router.push("/home"),
            }}
          />
        </div>
      </AppLayout>
    )
  }

  const isOwnProfile = currentUser?.id === profile.id

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
                
                {!isOwnProfile && (
                  <Button
                    variant={isFollowing ? "outline" : "default"}
                    size="sm"
                    onClick={handleFollow}
                    className="flex items-center gap-2"
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-4 h-4" />
                        Siguiendo
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Seguir
                      </>
                    )}
                  </Button>
                )}

                {isOwnProfile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/profile")}
                    className="flex items-center gap-2"
                  >
                    Editar perfil
                  </Button>
                )}
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

        {/* Tabs para contenido */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full ${profile.tipo_usuario === "empresa" ? "grid-cols-2" : "grid-cols-1"}`}>
            <TabsTrigger value="outfits" className="flex items-center gap-2">
              <LayersIcon className="w-4 h-4" />
              Outfits
            </TabsTrigger>
            {profile.tipo_usuario === "empresa" && (
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Productos
              </TabsTrigger>
            )}
          </TabsList>

          {/* Tab: Outfits */}
          <TabsContent value="outfits" className="mt-6">
            {outfits.length === 0 ? (
              <EmptyState
                icon={<LayersIcon className="w-20 h-20" />}
                title="No hay outfits"
                description="Este usuario aún no ha compartido ningún outfit"
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
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab: Productos (solo para empresas) */}
          {profile.tipo_usuario === "empresa" && (
            <TabsContent value="products" className="mt-6">
              {products.length === 0 ? (
                <EmptyState
                  icon={<Package className="w-20 h-20" />}
                  title="No hay productos"
                  description="Esta empresa aún no ha publicado productos"
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                      <div className="relative aspect-square">
                        <Image
                          src={product.imagenes?.[0] || "/placeholder.svg"}
                          alt={product.titulo}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{product.titulo}</h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.descripcion}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-lg">${product.precio}</span>
                          <Button size="sm" asChild>
                            <a href={product.link_tienda} target="_blank" rel="noopener noreferrer">
                              Ver en tienda
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          )}

        </Tabs>
      </div>
    </AppLayout>
  )
}
