"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import { X, Camera, User, Building2, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { createGeneralPost, GeneralPost } from "@/lib/social-actions"
import { ClickableUserProfile } from "@/components/clickable-user-profile"
import Image from "next/image"

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  onPostCreated?: (post: GeneralPost) => void
}

interface PostFormData {
  tipo_publicacion: 'noticia' | 'anuncio' | 'foto' | 'evento' | 'general'
  titulo: string
  contenido: string
  imagen_url: string
  fecha_evento: string
  ubicacion: string
  es_publico: boolean
}

export function CreatePostModal({ isOpen, onClose, onPostCreated }: CreatePostModalProps) {
  const { user, supabase } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const [formData, setFormData] = useState<PostFormData>({
    tipo_publicacion: 'general',
    titulo: '',
    contenido: '',
    imagen_url: '',
    fecha_evento: '',
    ubicacion: '',
    es_publico: true
  })

  const handleInputChange = (field: keyof PostFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
    setSuccess(false)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar archivo
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      setError('La imagen debe ser menor a 5MB')
      return
    }

    setSelectedFile(file)
    setError(null)

    // Crear preview
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    const newPreviewUrl = URL.createObjectURL(file)
    setPreviewUrl(newPreviewUrl)
  }

  const uploadImage = async (file: File): Promise<string> => {
    if (!user) throw new Error('Usuario no autenticado')

    // Generar nombre único
    const timestamp = Date.now()
    const fileName = `${user.id}_${timestamp}_${file.name}`
    const filePath = `general-posts/${fileName}`

    // Subir archivo a Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('general-posts-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) throw uploadError

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('general-posts-images')
      .getPublicUrl(filePath)

    return publicUrl
  }

  const validateForm = () => {
    if (!formData.titulo.trim()) {
      setError('El título es requerido')
      return false
    }

    if (formData.titulo.length > 100) {
      setError('El título no puede exceder 100 caracteres')
      return false
    }

    if (formData.contenido.length > 1000) {
      setError('El contenido no puede exceder 1000 caracteres')
      return false
    }

    if (formData.tipo_publicacion === 'evento' && !formData.fecha_evento) {
      setError('La fecha del evento es requerida')
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setLoading(true)
    setError(null)

    try {
      let imagenUrl = formData.imagen_url

      // Subir imagen si se seleccionó
      if (selectedFile) {
        try {
          imagenUrl = await uploadImage(selectedFile)
        } catch (uploadError: any) {
          console.error('Error uploading image:', uploadError)
          setError('Error al subir la imagen: ' + uploadError.message)
          return
        }
      }

      // Crear publicación
      const result = await createGeneralPost({
        tipo_publicacion: formData.tipo_publicacion,
        titulo: formData.titulo.trim(),
        contenido: formData.contenido.trim() || undefined,
        imagen_url: imagenUrl || undefined,
        fecha_evento: formData.fecha_evento || undefined,
        ubicacion: formData.ubicacion.trim() || undefined,
        es_publico: formData.es_publico
      })

      if (!result.success) {
        setError(result.error || 'Error al crear la publicación')
        return
      }

      setSuccess(true)

      // Callback para actualizar la lista
      if (onPostCreated && result.post) {
        onPostCreated(result.post)
      }

      // Cerrar modal después de un delay
      setTimeout(() => {
        handleClose()
        setSuccess(false)
      }, 1500)

    } catch (error: any) {
      console.error('Error creating post:', error)
      setError(error.message || 'Error al crear la publicación')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (loading) return
    onClose()
    setError(null)
    setSuccess(false)
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    setFormData({
      tipo_publicacion: 'general',
      titulo: '',
      contenido: '',
      imagen_url: '',
      fecha_evento: '',
      ubicacion: '',
      es_publico: true
    })
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const removeSelectedImage = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Crear Publicación
            <Button variant="ghost" size="sm" onClick={handleClose} disabled={loading}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Usuario info */}
          <div className="p-3 bg-muted rounded-lg">
            <ClickableUserProfile
              user={{
                id: user?.id || '',
                username: user?.email?.split('@')[0] || "usuario",
                full_name: user?.user_metadata?.full_name || "Usuario",
                avatar_url: user?.user_metadata?.avatar_url,
                tipo_usuario: user?.user_metadata?.tipo_usuario || 'usuario'
              }}
              avatarSize="md"
              showName={true}
              showUsername={true}
            />
          </div>

          {/* Success Alert */}
          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>¡Publicación creada exitosamente!</AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Tipo de publicación */}
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Publicación</Label>
              <Select
                value={formData.tipo_publicacion}
                onValueChange={(value) => handleInputChange('tipo_publicacion', value as any)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="noticia">Noticia</SelectItem>
                  <SelectItem value="anuncio">Anuncio</SelectItem>
                  <SelectItem value="foto">Foto</SelectItem>
                  <SelectItem value="evento">Evento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => handleInputChange('titulo', e.target.value)}
                placeholder="Título de tu publicación"
                disabled={loading}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                {formData.titulo.length}/100 caracteres
              </p>
            </div>

            {/* Contenido */}
            <div className="space-y-2">
              <Label htmlFor="contenido">Contenido</Label>
              <Textarea
                id="contenido"
                value={formData.contenido}
                onChange={(e) => handleInputChange('contenido', e.target.value)}
                placeholder="Escribe tu publicación..."
                disabled={loading}
                maxLength={1000}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {formData.contenido.length}/1000 caracteres
              </p>
            </div>

            {/* Fecha de evento (solo para eventos) */}
            {formData.tipo_publicacion === 'evento' && (
              <div className="space-y-2">
                <Label htmlFor="fecha_evento">Fecha del Evento *</Label>
                <Input
                  id="fecha_evento"
                  type="datetime-local"
                  value={formData.fecha_evento}
                  onChange={(e) => handleInputChange('fecha_evento', e.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            {/* Ubicación */}
            <div className="space-y-2">
              <Label htmlFor="ubicacion">Ubicación</Label>
              <Input
                id="ubicacion"
                value={formData.ubicacion}
                onChange={(e) => handleInputChange('ubicacion', e.target.value)}
                placeholder="Ubicación (opcional)"
                disabled={loading}
              />
            </div>

            {/* Imagen */}
            <div className="space-y-2">
              <Label>Imagen (Opcional)</Label>
              
              {previewUrl ? (
                <div className="relative">
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={removeSelectedImage}
                    disabled={loading}
                    className="absolute top-2 right-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                  onClick={handleImageClick}
                >
                  <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Haz clic para agregar una imagen
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG, WebP (máx. 5MB)
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Visibilidad */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.es_publico}
                  onChange={(e) => handleInputChange('es_publico', e.target.checked)}
                  disabled={loading}
                  className="rounded"
                />
                Publicación pública
              </Label>
              <p className="text-xs text-muted-foreground">
                Las publicaciones públicas pueden ser vistas por todos los usuarios
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={handleClose} 
              disabled={loading} 
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !formData.titulo.trim()}
              className="flex-1"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creando...
                </div>
              ) : (
                'Crear Publicación'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
