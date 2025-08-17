'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Package, Upload, X, Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { createProduct, type CreateProductData } from '@/lib/product-actions'
import { getCurrentUserProfile } from '@/lib/user-actions'
import { getBrowserSupabase } from '@/lib/supabase'

const CATEGORIAS_PREDEFINIDAS = [
  'Ropa y Accesorios',
  'Calzado',
  'Electrónica',
  'Hogar y Jardín',
  'Deportes',
  'Belleza y Cuidado Personal',
  'Juguetes y Juegos',
  'Libros y Música',
  'Automoción',
  'Alimentación',
  'Otros'
]

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Formulario
  const [formData, setFormData] = useState<CreateProductData>({
    titulo: '',
    descripcion: '',
    link_tienda: '',
    ubicacion: '',
    precio: 0,
    precio_original: undefined,
    rebaja_porcentaje: undefined,
    categoria: '',
    etiquetas: [],
    imagenes: [],
    stock_disponible: 0,
    es_destacado: false
  })

  // Campos temporales
  const [newTag, setNewTag] = useState('')
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])

  useEffect(() => {
    checkUserAccess()
  }, [])

  const checkUserAccess = async () => {
    try {
      const profile = await getCurrentUserProfile()
      setUserProfile(profile)
      
      if (profile?.tipo_usuario !== 'empresa') {
        setError('Solo los usuarios de tipo empresa pueden crear productos')
      }
    } catch (error) {
      console.error('Error checking user access:', error)
      setError('Error al verificar permisos')
    }
  }

  const handleInputChange = (field: keyof CreateProductData, value: any) => {
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
        if (!file.type.startsWith('image/')) {
          setError('Solo se permiten archivos de imagen')
          return false
        }
        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError('Las imágenes deben ser menores a 5MB')
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

  const handleRemoveImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImageUrls(prev => {
      const newUrls = prev.filter((_, i) => i !== index)
      // Revocar URL para liberar memoria
      URL.revokeObjectURL(prev[index])
      return newUrls
    })
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

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Subir imágenes primero
      const uploadedImageUrls: string[] = []
      
      for (const file of imageFiles) {
        const imageUrl = await uploadImage(file)
        if (imageUrl) {
          uploadedImageUrls.push(imageUrl)
        }
      }

      // Crear producto con las URLs de las imágenes subidas
      const productData = {
        ...formData,
        imagenes: uploadedImageUrls
      }

      const result = await createProduct(productData)
      
      if (result.success) {
        setSuccess('Producto creado exitosamente')
        setTimeout(() => {
          router.push('/products')
        }, 2000)
      } else {
        setError(result.error || 'Error al crear el producto')
      }
    } catch (error) {
      console.error('Error creating product:', error)
      setError('Error inesperado al crear el producto')
    } finally {
      setLoading(false)
    }
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const supabase = getBrowserSupabase()
      if (!supabase) throw new Error('Supabase client not available')

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

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

  if (userProfile?.tipo_usuario !== 'empresa') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            Solo los usuarios de tipo empresa pueden crear productos.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Crear Nuevo Producto</h1>
            <p className="text-gray-600">Añade un nuevo producto a tu catálogo</p>
          </div>
        </div>

        {/* Alertas */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => handleInputChange('titulo', e.target.value)}
                    placeholder="Nombre del producto"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    placeholder="Describe tu producto..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="categoria">Categoría</Label>
                  <Select value={formData.categoria} onValueChange={(value) => handleInputChange('categoria', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS_PREDEFINIDAS.map(categoria => (
                        <SelectItem key={categoria} value={categoria}>
                          {categoria}
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
              <CardTitle>Precios y Descuentos</CardTitle>
              <CardDescription>
                Configura los precios y descuentos del producto
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
                    value={formData.precio_original || ''}
                    onChange={(e) => handleInputChange('precio_original', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="rebaja_porcentaje">Descuento (%)</Label>
                  <Input
                    id="rebaja_porcentaje"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.rebaja_porcentaje || ''}
                    onChange={(e) => handleInputChange('rebaja_porcentaje', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="0"
                  />
                </div>
              </div>

              {formData.precio_original && formData.precio_original > formData.precio && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    Descuento calculado: <strong>{calculateDiscount()}%</strong>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stock y enlaces */}
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
                  <Label htmlFor="stock_disponible">Stock Disponible</Label>
                  <Input
                    id="stock_disponible"
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
                    placeholder="https://..."
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
                  {formData.etiquetas.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
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
                 Sube imágenes de tu producto (máximo 5MB por imagen)
               </CardDescription>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="flex gap-2">
                 <Input
                   type="file"
                   accept="image/*"
                   multiple
                   onChange={handleImageUpload}
                   className="flex-1"
                 />
               </div>

               {imageUrls.length > 0 && (
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {imageUrls.map((imageUrl, index) => (
                     <div key={index} className="relative group">
                       <div className="w-full h-24 bg-gray-100 rounded-lg overflow-hidden">
                         <img
                           src={imageUrl}
                           alt={`Imagen ${index + 1}`}
                           className="w-full h-full object-cover"
                         />
                       </div>
                       <button
                         type="button"
                         onClick={() => handleRemoveImage(index)}
                         className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
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
                <div className="space-y-0.5">
                  <Label>Producto Destacado</Label>
                  <p className="text-sm text-gray-500">
                    Los productos destacados aparecen primero en las búsquedas
                  </p>
                </div>
                <Switch
                  checked={formData.es_destacado}
                  onCheckedChange={(checked) => handleInputChange('es_destacado', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botones */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Package className="w-4 h-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Package className="w-4 h-4" />
                  Crear Producto
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
