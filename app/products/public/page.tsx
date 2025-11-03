'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Filter, Package, MapPin, Star, Heart, ShoppingCart } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AppLayout } from '@/components/app-layout'
import { getBrowserSupabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import Image from 'next/image'
import Link from 'next/link'

interface Product {
  id: string
  titulo: string
  descripcion: string | null
  precio: number
  precio_original: number | null
  rebaja_porcentaje: number | null
  categoria: string | null
  stock_disponible: number
  ubicacion: string | null
  imagenes: string[] | null
  es_activo: boolean
  es_destacado: boolean
  created_at: string
  empresa_id: string
  profiles: {
    id: string
    username: string
    full_name: string
    avatar_url: string | null
    company_profiles: {
      nombre_empresa: string
      descripcion: string | null
    } | null
  }
}

export default function PublicProductsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = getBrowserSupabase()
  
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    if (!supabase) return

    try {
      setLoading(true)
      console.log('Loading products...')

      // Primero, verificar si hay productos en la tabla
      const { data: allProducts, error: allProductsError } = await supabase
        .from('products')
        .select('*')
        .limit(5)

      console.log('All products (sample):', allProducts)
      console.log('All products error:', allProductsError)

      // Cargar productos activos de empresas
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          profiles (
            id,
            username,
            full_name,
            avatar_url,
            company_profiles (
              nombre_empresa,
              descripcion
            )
          )
        `)
        .eq('es_activo', true)
        .order('created_at', { ascending: false })

      console.log('Products with profiles:', productsData)
      console.log('Products error:', productsError)
      
      // Debug: verificar la estructura de los datos
      if (productsData && productsData.length > 0) {
        console.log('First product structure:', productsData[0])
        console.log('First product profiles:', productsData[0].profiles)
        console.log('First product company_profiles:', productsData[0].profiles?.company_profiles)
      }

      if (productsError) {
        console.error('Error fetching products:', productsError)
        throw productsError
      }

      // Los productos ya vienen filtrados por es_activo = true
      // Solo necesitamos verificar que tengan información de empresa
      const companyProducts = productsData?.filter(product => 
        product.profiles && product.profiles.company_profiles
      ) || []

      console.log('Company products:', companyProducts)
      console.log('Total products found:', productsData?.length || 0)

      setProducts(companyProducts)

      // Extraer categorías únicas
      const uniqueCategories = [...new Set(
        companyProducts
          .map(p => p.categoria)
          .filter(Boolean)
      )] as string[]
      setCategories(uniqueCategories)

      console.log('Categories:', uniqueCategories)

    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.categoria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.profiles?.company_profiles?.nombre_empresa.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || product.categoria === categoryFilter
    
    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return a.precio - b.precio
      case 'price_high':
        return b.precio - a.precio
      case 'featured':
        if (a.es_destacado && !b.es_destacado) return -1
        if (!a.es_destacado && b.es_destacado) return 1
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'recent':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price)
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

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Package className="w-8 h-8 mx-auto mb-4 animate-spin" />
              <p>Cargando productos...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Productos de Empresas</h1>
          <p className="text-muted-foreground">
            Descubre productos únicos de las mejores empresas de moda
          </p>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar productos o empresas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Más recientes</SelectItem>
                  <SelectItem value="featured">Destacados</SelectItem>
                  <SelectItem value="price_low">Precio: menor a mayor</SelectItem>
                  <SelectItem value="price_high">Precio: mayor a menor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Productos */}
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron productos</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm || categoryFilter !== 'all'
                  ? 'No hay productos que coincidan con tu búsqueda'
                  : 'Aún no hay productos disponibles'
                }
              </p>
              {(searchTerm || categoryFilter !== 'all') && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('')
                    setCategoryFilter('all')
                  }}
                >
                  Limpiar filtros
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                {/* Imagen del producto */}
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={product.imagenes?.[0] || "/placeholder.svg"}
                    alt={product.titulo}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=400&width=400&text=Producto"
                    }}
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.es_destacado && (
                      <Badge variant="secondary" className="bg-yellow-500 text-white border-0">
                        <Star className="w-3 h-3 mr-1" />
                        Destacado
                      </Badge>
                    )}
                    {product.rebaja_porcentaje && product.rebaja_porcentaje > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        -{product.rebaja_porcentaje}%
                      </Badge>
                    )}
                  </div>

                  {/* Ubicación */}
                  {product.ubicacion && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-black/70 text-white border-0 text-xs">
                        <MapPin className="w-2 h-2 mr-1" />
                        {product.ubicacion}
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  {/* Información de la empresa */}
                  <div className="flex items-center gap-3 mb-3">
                    <Link 
                      href={`/profile/${product.profiles.username}`}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={product.profiles.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>
                          {product.profiles.company_profiles?.nombre_empresa
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("") || "E"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {product.profiles.company_profiles?.nombre_empresa || product.profiles.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          @{product.profiles.username}
                        </p>
                      </div>
                    </Link>
                    <span className="text-xs text-muted-foreground">{formatDate(product.created_at)}</span>
                  </div>

                  {/* Información del producto */}
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.titulo}</h3>
                    {product.categoria && (
                      <Badge variant="outline" className="text-xs mb-2">
                        {product.categoria}
                      </Badge>
                    )}
                    {product.descripcion && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{product.descripcion}</p>
                    )}
                  </div>

                  {/* Precio */}
                  <div className="flex items-center gap-2 mb-3">
                    {/* Si precio actual es 0 o no existe, mostrar precio original si existe */}
                    {((!product.precio || product.precio === 0) && product.precio_original) ? (
                      <span className="text-xl font-bold text-green-600">
                        {formatPrice(product.precio_original)}
                      </span>
                    ) : (
                      <>
                        <span className="text-xl font-bold text-green-600">
                          {formatPrice(product.precio)}
                        </span>
                        {product.precio_original && product.precio_original > product.precio && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.precio_original)}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Stock */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Package className="w-4 h-4" />
                    <span>Stock: {product.stock_disponible}</span>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => router.push(`/products/${product.id}`)}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Ver detalles
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="p-2"
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Estadísticas */}
        {products.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {products.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Total productos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {products.filter(p => p.es_destacado).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Destacados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {categories.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Categorías</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {new Set(products.map(p => p.user_id)).size}
                  </div>
                  <div className="text-sm text-muted-foreground">Empresas</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
