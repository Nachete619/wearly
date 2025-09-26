"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EmptyState } from "@/components/empty-state"
import { 
  Package, 
  FileText, 
  Plus,
  Heart,
  MapPin,
  Building2,
  User
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { getBrowserSupabase } from "@/lib/supabase"
import { GeneralPost, getGeneralPosts } from "@/lib/social-actions"

interface Product {
  id: string
  titulo: string
  descripcion?: string
  precio: number
  precio_original?: number
  rebaja_porcentaje?: number
  imagenes: string[]
  link_tienda?: string
  ubicacion?: string
  categoria?: string
  es_destacado: boolean
  created_at: string
}

interface CompanyProfileTabsProps {
  userId: string
  isOwnProfile?: boolean
  onUploadProduct?: () => void
  onUploadPost?: () => void
}

export function CompanyProfileTabs({ 
  userId, 
  isOwnProfile = false, 
  onUploadProduct,
  onUploadPost 
}: CompanyProfileTabsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [generalPosts, setGeneralPosts] = useState<GeneralPost[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("products")
  const supabase = getBrowserSupabase()

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("empresa_id", userId)
        .eq("es_activo", true)
        .order("created_at", { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const fetchPosts = async () => {
    try {
      const result = await getGeneralPosts({ userId })
      if (result.success && result.posts) {
        setGeneralPosts(result.posts)
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await Promise.all([fetchProducts(), fetchPosts()])
      setLoading(false)
    }
    fetchData()
  }, [userId])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-10 bg-muted rounded-md mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-48 bg-muted rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex items-center justify-between mb-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Productos ({products.length})
          </TabsTrigger>
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Publicaciones ({generalPosts.length})
          </TabsTrigger>
        </TabsList>

        {isOwnProfile && (
          <div className="flex gap-2">
            <Button size="sm" onClick={onUploadProduct} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Producto
            </Button>
            <Button size="sm" variant="outline" onClick={onUploadPost} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Publicación
            </Button>
          </div>
        )}
      </div>

      {/* Tab: Productos */}
      <TabsContent value="products" className="mt-0">
        {products.length === 0 ? (
          <EmptyState
            icon={<Package className="w-20 h-20" />}
            title="No hay productos"
            description={isOwnProfile ? "Comienza a publicar tus productos" : "Esta empresa aún no tiene productos"}
            action={isOwnProfile ? {
              label: "Publicar producto",
              onClick: onUploadProduct
            } : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-square">
                  <Image
                    src={product.imagenes?.[0] || "/placeholder.svg"}
                    alt={product.titulo}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=400&width=400&text=Producto"
                    }}
                  />
                  {product.es_destacado && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="default" className="bg-yellow-500 text-white">
                        Destacado
                      </Badge>
                    </div>
                  )}
                  {product.rebaja_porcentaje && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="destructive">
                        -{product.rebaja_porcentaje}%
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg line-clamp-1">{product.titulo}</h3>
                    {product.categoria && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {product.categoria}
                      </Badge>
                    )}
                  </div>

                  {product.descripcion && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {product.descripcion}
                    </p>
                  )}

                  {product.ubicacion && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{product.ubicacion}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {product.precio_original && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.precio_original}
                        </span>
                      )}
                      <span className="font-bold text-lg">${product.precio}</span>
                    </div>

                    {product.link_tienda && (
                      <Button size="sm" asChild>
                        <a 
                          href={product.link_tienda} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1"
                        >
                          Ver en tienda
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      {/* Tab: Publicaciones */}
      <TabsContent value="posts" className="mt-0">
        {generalPosts.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-20 h-20" />}
            title="No hay publicaciones"
            description={isOwnProfile ? "Comienza a compartir contenido" : "Esta empresa aún no ha publicado contenido"}
            action={isOwnProfile ? {
              label: "Crear publicación",
              onClick: onUploadPost
            } : undefined}
          />
        ) : (
          <div className="space-y-6">
            {generalPosts.map((post) => (
              <Card key={post.id}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Link 
                      href={`/profile/${post.user?.username}`}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={post.user?.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>
                          <Building2 className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold hover:underline">{post.user?.full_name}</h4>
                        <p className="text-sm text-muted-foreground">@{post.user?.username}</p>
                      </div>
                    </Link>
                    <Badge variant="secondary">{post.tipo_publicacion}</Badge>
                  </div>

                  <h3 className="text-lg font-semibold mb-2">{post.titulo}</h3>
                  
                  {post.contenido && (
                    <p className="text-muted-foreground mb-4">{post.contenido}</p>
                  )}

                  {post.imagen_url && (
                    <div className="relative aspect-video mb-4 rounded-lg overflow-hidden">
                      <Image
                        src={post.imagen_url}
                        alt={post.titulo}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  )}

                  {post.fecha_evento && (
                    <div className="mb-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Evento programado:</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(post.fecha_evento).toLocaleDateString("es-ES", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                  )}

                  {post.ubicacion && (
                    <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{post.ubicacion}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {post.likes_count}
                    </span>
                    <span>{new Date(post.created_at).toLocaleDateString("es-ES")}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
