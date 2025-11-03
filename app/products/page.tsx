'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Filter, Package, Eye, EyeOff, Star, StarOff, Edit, Trash2, ArrowLeft, Settings } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  getMyProducts, 
  deleteProduct, 
  toggleProductFeatured, 
  toggleProductActive,
  getProductCategories,
  type Product 
} from '@/lib/product-actions'
import { getCurrentUserProfile } from '@/lib/user-actions'

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [categories, setCategories] = useState<string[]>([])
  const [userProfile, setUserProfile] = useState<any>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Verificar si el usuario es empresa
      const profile = await getCurrentUserProfile()
      setUserProfile(profile)
      
      if (profile?.tipo_usuario !== 'empresa') {
        setError('Solo los usuarios de tipo empresa pueden acceder a esta página')
        return
      }

      // Cargar productos y categorías
      const [productsData, categoriesData] = await Promise.all([
        getMyProducts(),
        getProductCategories()
      ])
      
      setProducts(productsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error loading data:', error)
      setError('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return

    const result = await deleteProduct(productId)
    if (result.success) {
      setProducts(products.filter(p => p.id !== productId))
    } else {
      setError(result.error || 'Error al eliminar el producto')
    }
  }

  const handleToggleFeatured = async (productId: string) => {
    const result = await toggleProductFeatured(productId)
    if (result.success) {
      setProducts(products.map(p => 
        p.id === productId ? { ...p, es_destacado: !p.es_destacado } : p
      ))
    } else {
      setError(result.error || 'Error al cambiar el estado destacado')
    }
  }

  const handleToggleActive = async (productId: string) => {
    const result = await toggleProductActive(productId)
    if (result.success) {
      setProducts(products.map(p => 
        p.id === productId ? { ...p, es_activo: !p.es_activo } : p
      ))
    } else {
      setError(result.error || 'Error al cambiar el estado activo')
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = !categoryFilter || categoryFilter === 'all' || product.categoria === categoryFilter
    
    return matchesSearch && matchesCategory
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Package className="w-8 h-8 mx-auto mb-4 animate-spin" />
            <p>Cargando productos...</p>
          </div>
        </div>
      </div>
    )
  }

  if (userProfile?.tipo_usuario !== 'empresa') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            Solo los usuarios de tipo empresa pueden acceder a esta página.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push('/settings')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Configuración
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Mis Productos</h1>
              <p className="text-gray-600">Gestiona los productos de tu empresa</p>
            </div>
          </div>
          <Button 
            onClick={() => router.push('/products/new')}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Producto
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
                              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
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
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Productos */}
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay productos</h3>
                             <p className="text-gray-600 text-center mb-4">
                 {searchTerm || (categoryFilter && categoryFilter !== 'all')
                   ? 'No se encontraron productos con los filtros aplicados'
                   : 'Aún no has creado ningún producto'
                 }
               </p>
               {!searchTerm && (!categoryFilter || categoryFilter === 'all') && (
                <Button onClick={() => router.push('/products/new')}>
                  Crear mi primer producto
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <Card key={product.id} className="relative">
                {/* Estado del producto */}
                <div className="absolute top-2 right-2 flex gap-1">
                  <Badge variant={product.es_activo ? "default" : "secondary"}>
                    {product.es_activo ? "Activo" : "Inactivo"}
                  </Badge>
                  {product.es_destacado && (
                    <Badge variant="outline" className="bg-yellow-50">
                      <Star className="w-3 h-3 mr-1" />
                      Destacado
                    </Badge>
                  )}
                </div>

                                 {/* Imagen del producto */}
                 <div className="aspect-video bg-gray-100 rounded-t-lg flex items-center justify-center overflow-hidden">
                   {product.imagenes && product.imagenes.length > 0 && product.imagenes[0] ? (
                     <img 
                       src={product.imagenes[0]} 
                       alt={product.titulo}
                       className="w-full h-full object-cover rounded-t-lg"
                       onError={(e) => {
                         // Si la imagen falla al cargar, mostrar el placeholder
                         e.currentTarget.style.display = 'none'
                         e.currentTarget.nextElementSibling?.classList.remove('hidden')
                       }}
                     />
                   ) : null}
                   <div className={`flex items-center justify-center w-full h-full ${product.imagenes && product.imagenes.length > 0 && product.imagenes[0] ? 'hidden' : ''}`}>
                     <Package className="w-12 h-12 text-gray-400" />
                   </div>
                 </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-2">{product.titulo}</CardTitle>
                  {product.categoria && (
                    <Badge variant="outline" className="w-fit">
                      {product.categoria}
                    </Badge>
                  )}
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Precio */}
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-green-600">
                      {formatPrice(product.precio)}
                    </span>
                    {product.precio_original && product.precio_original > product.precio && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.precio_original)}
                      </span>
                    )}
                    {product.rebaja_porcentaje && product.rebaja_porcentaje > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        -{product.rebaja_porcentaje}%
                      </Badge>
                    )}
                  </div>

                  {/* Descripción */}
                  {product.descripcion && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {product.descripcion}
                    </p>
                  )}

                  {/* Stock */}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Package className="w-4 h-4" />
                    <span>Stock: {product.stock_disponible}</span>
                  </div>

                  {/* Ubicación */}
                  {product.ubicacion && (
                    <div className="text-sm text-gray-500">
                      📍 {product.ubicacion}
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/products/${product.id}/edit`)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      Editar
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleFeatured(product.id)}
                      className="flex items-center gap-1"
                    >
                      {product.es_destacado ? (
                        <>
                          <StarOff className="w-3 h-3" />
                          Quitar destacado
                        </>
                      ) : (
                        <>
                          <Star className="w-3 h-3" />
                          Destacar
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(product.id)}
                      className="flex items-center gap-1"
                    >
                      {product.es_activo ? (
                        <>
                          <EyeOff className="w-3 h-3" />
                          Ocultar
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" />
                          Mostrar
                        </>
                      )}
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Estadísticas */}
        {products.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {products.length}
                  </div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {products.filter(p => p.es_activo).length}
                  </div>
                  <div className="text-sm text-gray-600">Activos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {products.filter(p => p.es_destacado).length}
                  </div>
                  <div className="text-sm text-gray-600">Destacados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {categories.length}
                  </div>
                  <div className="text-sm text-gray-600">Categorías</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
