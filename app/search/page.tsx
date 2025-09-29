'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, User, FileText, Package, MapPin, Heart, Bookmark, MessageCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AppLayout } from '@/components/app-layout'
import { getBrowserSupabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import Image from 'next/image'
import Link from 'next/link'

interface SearchResult {
  type: 'profile' | 'outfit' | 'post' | 'product'
  id: string
  title: string
  description?: string
  image_url?: string
  username?: string
  full_name?: string
  avatar_url?: string
  created_at: string
  likes_count?: number
  saves_count?: number
  comments_count?: number
  location_name?: string
  precio?: number
  categoria?: string
  nombre_empresa?: string
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const supabase = getBrowserSupabase()
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch(searchQuery.trim())
    }
  }, [searchQuery])

  const performSearch = async (query: string) => {
    if (!supabase || !query.trim()) return

    setLoading(true)
    try {
      const searchResults: SearchResult[] = []

      // Buscar perfiles - consulta simple primero
      console.log('Searching profiles for query:', query)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          full_name,
          avatar_url,
          created_at,
          company_profiles (
            nombre_empresa
          )
        `)
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(10)

      console.log('Profiles search result:', profiles)
      console.log('Profiles search error:', profilesError)

      // Buscar perfiles de empresa por nombre de empresa
      const { data: companyProfiles, error: companyProfilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          full_name,
          avatar_url,
          created_at,
          company_profiles (
            nombre_empresa
          )
        `)
        .not('company_profiles', 'is', null)
        .limit(10)

      console.log('All company profiles:', companyProfiles)

      // Filtrar perfiles de empresa que coincidan con la búsqueda
      const matchingCompanyProfiles = companyProfiles?.filter(profile => 
        profile.company_profiles?.nombre_empresa?.toLowerCase().includes(query.toLowerCase())
      ) || []

      console.log('Matching company profiles:', matchingCompanyProfiles)

      // Combinar resultados de perfiles regulares y empresas
      const allProfiles = [...(profiles || []), ...matchingCompanyProfiles]
      
      // Eliminar duplicados por ID
      const uniqueProfiles = allProfiles.filter((profile, index, self) => 
        index === self.findIndex(p => p.id === profile.id)
      )

      console.log('Unique profiles:', uniqueProfiles)

      uniqueProfiles.forEach(profile => {
        searchResults.push({
          type: 'profile',
          id: profile.id,
          title: profile.company_profiles?.nombre_empresa || profile.full_name || profile.username,
          description: profile.company_profiles ? `Empresa` : `Usuario`,
          username: profile.username,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          created_at: profile.created_at
        })
      })

      // Buscar outfits
      const { data: outfits, error: outfitsError } = await supabase
        .from('outfits')
        .select(`
          id,
          title,
          description,
          likes_count,
          saves_count,
          comments_count,
          location_name,
          created_at,
          outfit_images (image_url),
          profiles (username, full_name, avatar_url)
        `)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(10)

      if (!outfitsError && outfits) {
        outfits.forEach(outfit => {
          searchResults.push({
            type: 'outfit',
            id: outfit.id,
            title: outfit.title,
            description: outfit.description,
            image_url: outfit.outfit_images?.[0]?.image_url,
            username: outfit.profiles?.username,
            full_name: outfit.profiles?.full_name,
            avatar_url: outfit.profiles?.avatar_url,
            created_at: outfit.created_at,
            likes_count: outfit.likes_count,
            saves_count: outfit.saves_count,
            comments_count: outfit.comments_count,
            location_name: outfit.location_name
          })
        })
      }

      // Buscar publicaciones generales
      const { data: posts, error: postsError } = await supabase
        .from('general_posts')
        .select(`
          id,
          titulo,
          contenido,
          likes_count,
          comentarios_count,
          created_at,
          profiles (username, full_name, avatar_url)
        `)
        .or(`titulo.ilike.%${query}%,contenido.ilike.%${query}%`)
        .limit(10)

      if (!postsError && posts) {
        posts.forEach(post => {
          searchResults.push({
            type: 'post',
            id: post.id,
            title: post.titulo,
            description: post.contenido,
            username: post.profiles?.username,
            full_name: post.profiles?.full_name,
            avatar_url: post.profiles?.avatar_url,
            created_at: post.created_at,
            likes_count: post.likes_count,
            comments_count: post.comentarios_count
          })
        })
      }

      // Buscar productos
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select(`
          id,
          titulo,
          descripcion,
          precio,
          categoria,
          created_at,
          profiles (
            username,
            full_name,
            avatar_url,
            company_profiles (nombre_empresa)
          )
        `)
        .eq('es_activo', true)
        .or(`titulo.ilike.%${query}%,descripcion.ilike.%${query}%,categoria.ilike.%${query}%`)
        .limit(10)

      if (!productsError && products) {
        products.forEach(product => {
          searchResults.push({
            type: 'product',
            id: product.id,
            title: product.titulo,
            description: product.descripcion,
            username: product.profiles?.username,
            full_name: product.profiles?.full_name,
            avatar_url: product.profiles?.avatar_url,
            created_at: product.created_at,
            precio: product.precio,
            categoria: product.categoria,
            nombre_empresa: product.profiles?.company_profiles?.nombre_empresa
          })
        })
      }

      // Ordenar por fecha de creación
      searchResults.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setResults(searchResults)

    } catch (error) {
      console.error('Error performing search:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      performSearch(searchQuery.trim())
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Hace unos minutos"
    if (diffInHours < 24) return `Hace ${diffInHours}h`
    if (diffInHours < 168) return `Hace ${Math.floor(diffInHours / 24)}d`
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const filteredResults = activeTab === 'all' 
    ? results 
    : results.filter(result => result.type === activeTab)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'profile': return <User className="w-4 h-4" />
      case 'outfit': return <Heart className="w-4 h-4" />
      case 'post': return <FileText className="w-4 h-4" />
      case 'product': return <Package className="w-4 h-4" />
      default: return <Search className="w-4 h-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'profile': return 'Perfil'
      case 'outfit': return 'Outfit'
      case 'post': return 'Publicación'
      case 'product': return 'Producto'
      default: return 'Resultado'
    }
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Búsqueda</h1>
          <p className="text-muted-foreground">
            Encuentra perfiles, outfits, publicaciones y productos
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar perfiles, outfits, publicaciones y productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
            />
          </div>
        </form>

        {/* Results */}
        {searchQuery && (
          <>
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">Todos ({results.length})</TabsTrigger>
                <TabsTrigger value="profile">Perfiles ({results.filter(r => r.type === 'profile').length})</TabsTrigger>
                <TabsTrigger value="outfit">Outfits ({results.filter(r => r.type === 'outfit').length})</TabsTrigger>
                <TabsTrigger value="post">Publicaciones ({results.filter(r => r.type === 'post').length})</TabsTrigger>
                <TabsTrigger value="product">Productos ({results.filter(r => r.type === 'product').length})</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Loading */}
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Buscando...</p>
              </div>
            )}

            {/* Results */}
            {!loading && (
              <>
                {filteredResults.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No se encontraron resultados</h3>
                    <p className="text-muted-foreground">
                      No hay resultados para "{searchQuery}". Intenta con otros términos.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredResults.map((result) => (
                      <Card key={`${result.type}-${result.id}`} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            {/* Image/Avatar */}
                            <div className="flex-shrink-0">
                              {result.type === 'profile' ? (
                                <Avatar className="w-12 h-12">
                                  <AvatarImage src={result.avatar_url || "/placeholder.svg"} />
                                  <AvatarFallback>
                                    {result.full_name?.charAt(0) || result.username?.charAt(0) || "U"}
                                  </AvatarFallback>
                                </Avatar>
                              ) : result.image_url ? (
                                <div className="w-12 h-12 rounded-lg overflow-hidden">
                                  <Image
                                    src={result.image_url}
                                    alt={result.title}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                                  {getTypeIcon(result.type)}
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-lg line-clamp-1">{result.title}</h3>
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="text-xs">
                                      {getTypeIcon(result.type)}
                                      <span className="ml-1">{getTypeLabel(result.type)}</span>
                                    </Badge>
                                    {result.categoria && (
                                      <Badge variant="secondary" className="text-xs">
                                        {result.categoria}
                                      </Badge>
                                    )}
                                    {result.location_name && (
                                      <Badge variant="secondary" className="text-xs">
                                        <MapPin className="w-3 h-3 mr-1" />
                                        {result.location_name}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <span className="text-xs text-muted-foreground ml-2">
                                  {formatDate(result.created_at)}
                                </span>
                              </div>

                              {result.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                  {result.description}
                                </p>
                              )}

                              {/* User info */}
                              {result.username && (
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-sm text-muted-foreground">
                                    por <strong>@{result.username}</strong>
                                    {result.nombre_empresa && ` (${result.nombre_empresa})`}
                                  </span>
                                </div>
                              )}

                              {/* Stats */}
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                {result.likes_count !== undefined && (
                                  <span className="flex items-center gap-1">
                                    <Heart className="w-3 h-3" />
                                    {result.likes_count}
                                  </span>
                                )}
                                {result.saves_count !== undefined && (
                                  <span className="flex items-center gap-1">
                                    <Bookmark className="w-3 h-3" />
                                    {result.saves_count}
                                  </span>
                                )}
                                {result.comments_count !== undefined && (
                                  <span className="flex items-center gap-1">
                                    <MessageCircle className="w-3 h-3" />
                                    {result.comments_count}
                                  </span>
                                )}
                                {result.precio && (
                                  <span className="font-semibold text-green-600">
                                    {formatPrice(result.precio)}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Action */}
                            <div className="flex-shrink-0">
                              <Button asChild size="sm">
                                <Link href={
                                  result.type === 'profile' ? `/profile/${result.username}` :
                                  result.type === 'outfit' ? `/outfit/${result.id}` :
                                  result.type === 'product' ? `/products/${result.id}` :
                                  `/post/${result.id}`
                                }>
                                  Ver
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* No search query */}
        {!searchQuery && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Busca algo</h3>
            <p className="text-muted-foreground">
              Escribe en la barra de búsqueda para encontrar perfiles, outfits, publicaciones y productos.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
