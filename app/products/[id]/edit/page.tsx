'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Package, Upload, X, Plus, Save } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { getProductById, updateProduct, type Product, type UpdateProductData } from '@/lib/product-actions'
import { getCurrentUserProfile } from '@/lib/user-actions'
import { getBrowserSupabase } from '@/lib/supabase'
import { validateImageFile } from '@/lib/storage-utils'

const CATEGORIAS_PREDEFINIDAS = [
  'Electrónicos', 'Ropa', 'Hogar', 'Deportes', 'Libros', 'Juguetes', 
  'Belleza', 'Automotriz', 'Jardín', 'Mascotas', 'Alimentos', 'Otros'
]

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [userProfile, setUserProfile] = useState<any>(null)
  const [product, setProduct] = useState<Product | null>(null)

  // Campos del formulario - precio y stock_disponible pueden ser undefined inicialmente
  const [formData, setFormData] = useState<Omit<UpdateProductData, 'precio' | 'stock_disponible'> & { precio?: number; stock_disponible?: number }>({
    titulo: '',
    descripcion: '',
    link_tienda: '',
    ubicacion: '',
    precio: undefined,
    precio_original: undefined,
    rebaja_porcentaje: undefined,
    categoria: '',
    etiquetas: [],
    imagenes: [],
    stock_disponible: undefined,
    es_destacado: false,
    es_activo: true
  })

  // Campos temporales
  const [newTag, setNewTag] = useState('')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])

  // Verificar acceso del usuario
  useEffect(() => {
    const checkUserAccess = async () => {
      try {
        const profile = await getCurrentUserProfile()
        if (!profile) {
          router.push('/login')
          return
        }
        
        if (profile.tipo_usuario !== 'empresa') {
          setError('Solo los usuarios de tipo empresa pueden editar productos')
          setLoading(false)
          return
        }

        setUserProfile(profile)
        
        // Cargar el producto
        const productData = await getProductById(productId)
        if (!productData.success) {
          setError('Producto no encontrado')
          setLoading(false)
          return
        }

        const product = productData.product!
        
        // Verificar que el usuario es el propietario del producto
        if (product.empresa_id !== profile.id) {
          setError('No tienes permisos para editar este producto')
          setLoading(false)
          return
        }

        setProduct(product)
        // Determinar si el producto tiene descuento (precio original > precio actual)
        const tieneDescuento = product.precio_original && product.precio_original > product.precio
        
        setFormData({
          titulo: product.titulo,
          descripcion: product.descripcion || '',
          link_tienda: product.link_tienda || '',
          ubicacion: product.ubicacion || '',
          // Precio actual: solo se llena si hay descuento (precio original > precio actual)
          // Si no hay descuento, significa que el precio mostrado es el precio_original
          // y el usuario debería decidir si quiere ingresar un precio actual
          precio: tieneDescuento ? product.precio : undefined,
          precio_original: product.precio_original && product.precio_original > 0 ? product.precio_original : undefined,
          rebaja_porcentaje: product.rebaja_porcentaje && product.rebaja_porcentaje > 0 ? product.rebaja_porcentaje : undefined,
          categoria: product.categoria || '',
          etiquetas: product.etiquetas || [],
          imagenes: product.imagenes || [],
          stock_disponible: product.stock_disponible !== undefined && product.stock_disponible > 0 ? product.stock_disponible : undefined,
          es_destacado: product.es_destacado || false,
          es_activo: product.es_activo
        })
        
        setImageUrls(product.imagenes || [])
        setLoading(false)
      } catch (error) {
        console.error('Error checking user access:', error)
        setError('Error al verificar acceso')
        setLoading(false)
      }
    }

    checkUserAccess()
  }, [productId, router])

  const handleInputChange = (field: keyof UpdateProductData | 'precio', value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value } as any
      
      // Si se está cambiando precio o precio_original, calcular descuento automáticamente
      // Solo calcular descuento si hay AMBOS precios (actual y original) y el original > actual
      if (field === 'precio' || field === 'precio_original') {
        if (updated.precio !== undefined && updated.precio_original && updated.precio_original > updated.precio) {
          // Calcular el porcentaje de descuento: ((precio_original - precio_actual) / precio_original) * 100
          const discount = Math.round(((updated.precio_original - updated.precio) / updated.precio_original) * 100)
          updated.rebaja_porcentaje = discount
        } else {
          // Si no hay descuento válido (no hay ambos precios o el original no es mayor), limpiar el campo
          updated.rebaja_porcentaje = undefined
        }
      }
      
      return updated
    })
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.etiquetas?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        etiquetas: [...(prev.etiquetas || []), newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      etiquetas: prev.etiquetas?.filter(tag => tag !== tagToRemove) || []
    }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newFiles = Array.from(files)
      const validFiles = newFiles.filter(file => {
        // Validar usando la función de validación que incluye webp
        const validation = validateImageFile(file)
        if (!validation.valid) {
          setError(validation.error || 'Formato de imagen no válido')
          return false
        }
        return true
      })

      if (validFiles.length > 0) {
        setImageFiles(prev => [...prev, ...validFiles])
        
        // Crear URLs temporales para previsualización
        validFiles.forEach(file => {
          const url = URL.createObjectURL(file)
          setImageUrls(prev => [...prev, url])
        })
        
        setError('')
      }
    }
  }

  const handleRemoveImage = (indexToRemove: number) => {
    setImageUrls(prev => prev.filter((_, index) => index !== indexToRemove))
    setImageFiles(prev => prev.filter((_, index) => index !== indexToRemove))
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const supabase = getBrowserSupabase()
      if (!supabase) throw new Error('Supabase client not available')

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `product-images/${userProfile.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      setError('Error al subir la imagen')
      return null
    }
  }

  const calculateDiscount = () => {
    if (formData.precio_original && formData.precio && formData.precio_original > formData.precio) {
      return Math.round(((formData.precio_original - formData.precio) / formData.precio_original) * 100)
    }
    return 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.titulo.trim()) {
      setError('El título es obligatorio')
      return
    }

    // Validar que si hay precio ingresado, sea mayor a 0
    // No validar si precio es undefined (opcional)
    if (formData.precio !== undefined && formData.precio !== null && formData.precio <= 0) {
      setError('El precio debe ser mayor a 0')
      return
    }

    // Validar que si hay precio original y precio actual, el original sea mayor o igual
    if (formData.precio_original && formData.precio && formData.precio_original < formData.precio) {
      setError('El precio original debe ser mayor o igual al precio actual')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      // Subir nuevas imágenes si las hay
      const uploadedUrls: string[] = []
      for (const file of imageFiles) {
        const url = await uploadImage(file)
        if (url) {
          uploadedUrls.push(url)
        }
      }

      // Combinar URLs existentes con nuevas
      const existingUrls = formData.imagenes?.filter(url => !url.startsWith('blob:')) || []
      const allImages = [...existingUrls, ...uploadedUrls]

      // Si no hay precio actual pero sí hay precio original, usar el precio original como precio
      let precioFinal: number = formData.precio ?? 0
      let precioOriginalFinal = formData.precio_original
      let rebajaPorcentajeFinal = formData.rebaja_porcentaje

      // Si no hay precio actual pero sí hay precio original, usar el precio original como precio
      if (formData.precio === undefined && precioOriginalFinal) {
        precioFinal = precioOriginalFinal
        precioOriginalFinal = undefined // No mostrar precio original si no hay descuento
        rebajaPorcentajeFinal = undefined // No hay descuento en este caso
      }

      // Limpiar el objeto de datos antes de enviarlo (eliminar campos undefined)
      const updateData: UpdateProductData = {
        titulo: formData.titulo,
        descripcion: formData.descripcion || undefined,
        link_tienda: formData.link_tienda || undefined,
        ubicacion: formData.ubicacion || undefined,
        precio: precioFinal,
        precio_original: precioOriginalFinal || undefined,
        rebaja_porcentaje: rebajaPorcentajeFinal || undefined,
        categoria: formData.categoria || undefined,
        etiquetas: formData.etiquetas && formData.etiquetas.length > 0 ? formData.etiquetas : undefined,
        imagenes: allImages.length > 0 ? allImages : undefined,
        stock_disponible: formData.stock_disponible !== undefined ? formData.stock_disponible : undefined,
        es_destacado: formData.es_destacado,
        es_activo: formData.es_activo
      }

      // Eliminar campos undefined para evitar errores en Supabase
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof UpdateProductData] === undefined) {
          delete updateData[key as keyof UpdateProductData]
        }
      })

      // Actualizar producto
      const result = await updateProduct(productId, updateData)
      
      if (result.success) {
        setSuccess('Producto actualizado exitosamente')
        setTimeout(() => {
          router.push('/products')
        }, 2000)
      } else {
        console.error('Error updating product:', result.error)
        setError(result.error || 'Error al actualizar el producto')
      }
    } catch (error) {
      console.error('Error updating product (exception):', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      setError(`Error al actualizar el producto: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  if (userProfile?.tipo_usuario !== 'empresa') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            Solo los usuarios de tipo empresa pueden editar productos.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push('/products')}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Editar Producto</h1>
              <p className="text-gray-600">Modifica la información de tu producto</p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Información Básica
              </CardTitle>
              <CardDescription>
                Información principal del producto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => handleInputChange('titulo', e.target.value)}
                  placeholder="Nombre del producto"
                  required
                />
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange('descripcion', e.target.value)}
                  placeholder="Describe tu producto..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="categoria">Categoría</Label>
                  <Select value={formData.categoria} onValueChange={(value) => handleInputChange('categoria', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS_PREDEFINIDAS.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="ubicacion">Ubicación</Label>
                  <Input
                    id="ubicacion"
                    value={formData.ubicacion}
                    onChange={(e) => handleInputChange('ubicacion', e.target.value)}
                    placeholder="Ciudad, País"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Precios */}
          <Card>
            <CardHeader>
              <CardTitle>Precios</CardTitle>
              <CardDescription>
                Configura los precios y descuentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="precio">Precio Actual</Label>
                  <Input
                    id="precio"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.precio !== undefined ? formData.precio : ''}
                    onChange={(e) => {
                      const value = e.target.value.trim()
                      handleInputChange('precio', value === '' || value === '0' ? undefined : parseFloat(value))
                    }}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Opcional</p>
                </div>

                <div>
                  <Label htmlFor="precio_original">Precio Original</Label>
                  <Input
                    id="precio_original"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.precio_original || ''}
                    onChange={(e) => handleInputChange('precio_original', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="rebaja">Descuento (%)</Label>
                  <Input
                    id="rebaja"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.rebaja_porcentaje || ''}
                    onChange={(e) => handleInputChange('rebaja_porcentaje', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="0"
                    readOnly={!!(formData.precio_original && formData.precio && formData.precio_original > formData.precio)}
                  />
                  {formData.precio_original && formData.precio && formData.precio_original > formData.precio && (
                    <p className="text-xs text-muted-foreground mt-1">Calculado automáticamente</p>
                  )}
                </div>
              </div>

              {formData.precio_original && formData.precio && formData.precio_original > formData.precio && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm">
                    Descuento calculado: <strong>{calculateDiscount()}%</strong>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stock y Enlaces */}
          <Card>
            <CardHeader>
              <CardTitle>Stock y Enlaces</CardTitle>
              <CardDescription>
                Información de inventario y enlaces externos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stock">Stock Disponible</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock_disponible || ''}
                    onChange={(e) => handleInputChange('stock_disponible', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="link_tienda">Link de la Tienda</Label>
                  <Input
                    id="link_tienda"
                    type="url"
                    value={formData.link_tienda}
                    onChange={(e) => handleInputChange('link_tienda', e.target.value)}
                    placeholder="https://tu-tienda.com/producto"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Etiquetas */}
          <Card>
            <CardHeader>
              <CardTitle>Etiquetas</CardTitle>
              <CardDescription>
                Añade etiquetas para mejorar la búsqueda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Nueva etiqueta"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {formData.etiquetas && formData.etiquetas.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.etiquetas.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Imágenes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Imágenes
              </CardTitle>
              <CardDescription>
                Sube imágenes de tu producto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="images">Añadir Imágenes</Label>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="cursor-pointer"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Formatos: JPEG, PNG, WebP, GIF. Máximo 5MB por imagen.
                </p>
              </div>

              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imageUrls.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Opciones */}
          <Card>
            <CardHeader>
              <CardTitle>Opciones</CardTitle>
              <CardDescription>
                Configuración adicional del producto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="destacado">Producto Destacado</Label>
                  <p className="text-sm text-gray-500">
                    Los productos destacados aparecen en posiciones privilegiadas
                  </p>
                </div>
                <Switch
                  id="destacado"
                  checked={formData.es_destacado}
                  onCheckedChange={(checked) => handleInputChange('es_destacado', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="activo">Producto Activo</Label>
                  <p className="text-sm text-gray-500">
                    Los productos inactivos no son visibles públicamente
                  </p>
                </div>
                <Switch
                  id="activo"
                  checked={formData.es_activo}
                  onCheckedChange={(checked) => handleInputChange('es_activo', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botones */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/products')}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
