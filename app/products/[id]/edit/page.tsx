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

  // Campos del formulario
  const [formData, setFormData] = useState<UpdateProductData>({
    titulo: '',
    descripcion: '',
    link_tienda: '',
    ubicacion: '',
    precio: 0,
    precio_original: 0,
    rebaja_porcentaje: 0,
    categoria: '',
    etiquetas: [],
    imagenes: [],
    stock_disponible: 0,
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
        setFormData({
          titulo: product.titulo,
          descripcion: product.descripcion || '',
          link_tienda: product.link_tienda || '',
          ubicacion: product.ubicacion || '',
          precio: product.precio,
          precio_original: product.precio_original || 0,
          rebaja_porcentaje: product.rebaja_porcentaje || 0,
          categoria: product.categoria || '',
          etiquetas: product.etiquetas || [],
          imagenes: product.imagenes || [],
          stock_disponible: product.stock_disponible || 0,
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

  const handleInputChange = (field: keyof UpdateProductData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
        // Validar tipo de archivo
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if (!validTypes.includes(file.type)) {
          setError('Solo se permiten archivos de imagen (JPEG, PNG, WebP, GIF)')
          return false
        }
        
        // Validar tamaño (5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError('El archivo es demasiado grande. Máximo 5MB')
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
    if (formData.precio_original && formData.precio_original > formData.precio) {
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

    if (formData.precio <= 0) {
      setError('El precio debe ser mayor a 0')
      return
    }

    if (formData.precio_original && formData.precio_original < formData.precio) {
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

      // Actualizar producto
      const result = await updateProduct(productId, {
        ...formData,
        imagenes: allImages
      })
      
      if (result.success) {
        setSuccess('Producto actualizado exitosamente')
        setTimeout(() => {
          router.push('/products')
        }, 2000)
      } else {
        setError(result.error || 'Error al actualizar el producto')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      setError('Error al actualizar el producto')
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
                  <Label htmlFor="precio">Precio Actual *</Label>
                  <Input
                    id="precio"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.precio}
                    onChange={(e) => handleInputChange('precio', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="precio_original">Precio Original</Label>
                  <Input
                    id="precio_original"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.precio_original}
                    onChange={(e) => handleInputChange('precio_original', parseFloat(e.target.value) || 0)}
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
                    value={formData.rebaja_porcentaje}
                    onChange={(e) => handleInputChange('rebaja_porcentaje', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>

              {formData.precio_original && formData.precio_original > formData.precio && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm">
                    Descuento calculado: {calculateDiscount()}% de ahorro
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
                    value={formData.stock_disponible}
                    onChange={(e) => handleInputChange('stock_disponible', parseInt(e.target.value) || 0)}
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
