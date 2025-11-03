'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppLayout } from '@/components/app-layout'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Share,
  Copy,
  ShoppingCart,
  Package,
  Star,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { getProduct, getActiveProducts } from '@/lib/product-actions'
import { toast } from '@/hooks/use-toast'
import Image from 'next/image'

interface ProductData {
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
  link_tienda?: string | null
  empresa_nombre?: string
  empresa_username?: string
  empresa_avatar?: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const productId = params.id as string

  const [product, setProduct] = useState<ProductData | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<ProductData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Fetch product data
  const fetchProductData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch product
      const productData = await getProduct(productId)

      if (!productData) {
        setError('Producto no encontrado')
        return
      }

      // Transform data to match ProductData interface
      const transformedProduct: ProductData = {
        id: productData.id,
        titulo: productData.titulo,
        descripcion: productData.descripcion || null,
        precio: productData.precio,
        precio_original: productData.precio_original || null,
        rebaja_porcentaje: productData.rebaja_porcentaje || null,
        categoria: productData.categoria || null,
        stock_disponible: productData.stock_disponible,
        ubicacion: productData.ubicacion || null,
        imagenes: Array.isArray(productData.imagenes) ? productData.imagenes : null,
        es_activo: productData.es_activo,
        es_destacado: productData.es_destacado,
        created_at: productData.created_at,
        empresa_id: productData.empresa_id,
        link_tienda: productData.link_tienda || null,
        empresa_nombre: productData.empresa_nombre || undefined,
        empresa_username: productData.empresa_username || undefined,
        empresa_avatar: productData.empresa_avatar || undefined,
      }

      setProduct(transformedProduct)

      // Fetch related products (excluding current one)
      const allProducts = await getActiveProducts()
      const related = allProducts
        .filter((p) => p.id !== productId && (p.categoria === productData.categoria || p.es_destacado))
        .slice(0, 6)
        .map((p) => ({
          id: p.id,
          titulo: p.titulo,
          descripcion: p.descripcion || null,
          precio: p.precio,
          precio_original: p.precio_original || null,
          rebaja_porcentaje: p.rebaja_porcentaje || null,
          categoria: p.categoria || null,
          stock_disponible: p.stock_disponible,
          ubicacion: p.ubicacion || null,
          imagenes: Array.isArray(p.imagenes) ? p.imagenes : null,
          es_activo: p.es_activo,
          es_destacado: p.es_destacado,
          created_at: p.created_at,
          empresa_id: p.empresa_id,
          link_tienda: p.link_tienda || null,
          empresa_nombre: p.empresa_nombre || undefined,
          empresa_username: p.empresa_username || undefined,
          empresa_avatar: p.empresa_avatar || undefined,
        }))

      setRelatedProducts(related)
    } catch (error) {
      console.error('Error fetching product:', error)
      setError('Error al cargar el producto')
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    fetchProductData()
  }, [fetchProductData])

  // Image navigation
  const nextImage = () => {
    if (product?.imagenes && product.imagenes.length > 0) {
      setCurrentImageIndex((prev) => (prev === product.imagenes!.length - 1 ? 0 : prev + 1))
    }
  }

  const prevImage = () => {
    if (product?.imagenes && product.imagenes.length > 0) {
      setCurrentImageIndex((prev) => (prev === 0 ? product.imagenes!.length - 1 : prev - 1))
    }
  }

  // Handle share
  const handleShare = async () => {
    const url = `${window.location.origin}/products/${productId}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Producto: ${product?.titulo}`,
          text: `Mira este producto en Wearly`,
          url: url,
        })
      } catch (error) {
        copyToClipboard(url)
      }
    } else {
      copyToClipboard(url)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast({
          title: 'Enlace copiado',
          description: 'El enlace se ha copiado al portapapeles',
        })
      })
      .catch(() => {
        toast({
          title: 'Error',
          description: 'No se pudo copiar el enlace',
          variant: 'destructive',
        })
      })
  }

  // Handle copy location
  const handleCopyLocation = () => {
    if (product?.ubicacion) {
      copyToClipboard(product.ubicacion)
    }
  }

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price)
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Loading state
  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Skeleton className="w-full h-96 rounded-2xl" />
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="w-16 h-16 rounded-lg" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-12 w-full" />
              <div className="flex gap-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  // Error state
  if (error || !product) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="text-center py-12">
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-6 inline-block">
              {error || 'Producto no encontrado'}
            </div>
            <Button onClick={() => router.back()} variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  const productImages = product.imagenes && product.imagenes.length > 0 ? product.imagenes : ['/placeholder.svg']

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Back button */}
        <Button onClick={() => router.back()} variant="ghost" className="mb-6 flex items-center gap-2 hover:bg-muted">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-card rounded-2xl overflow-hidden border aspect-square">
              <Image
                src={productImages[currentImageIndex] || '/placeholder.svg'}
                alt={product.titulo}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/placeholder.svg?height=600&width=600&text=Producto'
                }}
              />

              {/* Navigation arrows */}
              {productImages.length > 1 && (
                <>
                  <Button
                    onClick={prevImage}
                    variant="ghost"
                    size="sm"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={nextImage}
                    variant="ghost"
                    size="sm"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}

              {/* Image counter */}
              {productImages.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                  {currentImageIndex + 1} / {productImages.length}
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
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

              {/* Location */}
              {product.ubicacion && (
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-black/70 text-white border-0 text-xs">
                    <MapPin className="w-2 h-2 mr-1" />
                    {product.ubicacion}
                  </Badge>
                </div>
              )}
            </div>

            {/* Thumbnail navigation */}
            {productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all aspect-square ${
                      index === currentImageIndex ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <Image
                      src={image || '/placeholder.svg'}
                      alt={`${product.titulo} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/placeholder.svg?height=100&width=100&text=Thumbnail'
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Company info */}
            {product.empresa_username && (
              <div className="flex items-center gap-3">
                <Link
                  href={`/profile/${product.empresa_username}`}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={product.empresa_avatar || '/placeholder.svg'} />
                    <AvatarFallback>
                      {product.empresa_nombre
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('') || 'E'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold hover:underline">{product.empresa_nombre || 'Empresa'}</p>
                    {product.empresa_username && (
                      <p className="text-sm text-muted-foreground">@{product.empresa_username}</p>
                    )}
                  </div>
                </Link>
              </div>
            )}

            {/* Title and category */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.titulo}</h1>
              {product.categoria && (
                <Badge variant="outline" className="mb-3">
                  {product.categoria}
                </Badge>
              )}
              {product.descripcion && <p className="text-muted-foreground mt-2">{product.descripcion}</p>}
              <p className="text-sm text-muted-foreground mt-2">{formatDate(product.created_at)}</p>
            </div>

            <Separator />

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-green-600">{formatPrice(product.precio)}</span>
                {product.precio_original && product.precio_original > product.precio && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.precio_original)}
                  </span>
                )}
              </div>
              {product.rebaja_porcentaje && product.rebaja_porcentaje > 0 && (
                <p className="text-sm text-green-600 font-medium">
                  Ahorras {formatPrice(product.precio_original! - product.precio)} ({product.rebaja_porcentaje}% de
                  descuento)
                </p>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2 text-sm">
              <Package className="w-4 h-4 text-muted-foreground" />
              <span className={product.stock_disponible > 0 ? 'text-foreground' : 'text-destructive'}>
                {product.stock_disponible > 0
                  ? `Stock disponible: ${product.stock_disponible} unidades`
                  : 'Sin stock disponible'}
              </span>
            </div>

            <Separator />

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              {product.link_tienda && (
                <Button
                  onClick={() => window.open(product.link_tienda!, '_blank')}
                  className="w-full flex items-center justify-center gap-2"
                  size="lg"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Comprar ahora
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
              <div className="flex gap-3">
                <Button onClick={handleShare} variant="outline" className="flex-1 flex items-center gap-2">
                  <Share className="w-4 h-4" />
                  Compartir
                </Button>
                <Button
                  onClick={handleCopyLocation}
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={!product.ubicacion}
                >
                  <Copy className="w-4 h-4" />
                  Copiar ubicación
                </Button>
              </div>
            </div>

            {/* Location */}
            {product.ubicacion && (
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Ubicación
                </h3>
                <div className="bg-muted rounded-lg p-4">
                  <p className="font-medium">{product.ubicacion}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related products section */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-6">Productos relacionados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/products/${relatedProduct.id}`}
                  className="group"
                >
                  <div className="bg-card rounded-lg overflow-hidden border hover:shadow-lg transition-all duration-300">
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={relatedProduct.imagenes?.[0] || '/placeholder.svg'}
                        alt={relatedProduct.titulo}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/placeholder.svg?height=400&width=400&text=Producto'
                        }}
                      />
                      {relatedProduct.rebaja_porcentaje && relatedProduct.rebaja_porcentaje > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute top-2 left-2 text-xs"
                        >
                          -{relatedProduct.rebaja_porcentaje}%
                        </Badge>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                        {relatedProduct.titulo}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-green-600">
                          {formatPrice(relatedProduct.precio)}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Package className="w-3 h-3" />
                          {relatedProduct.stock_disponible}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
