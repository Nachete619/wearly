"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import { X, Camera, User, Instagram, LinkIcon, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
// Import the storage utilities at the top
import { deleteOldAvatar, validateImageFile, generateAvatarFileName } from "@/lib/storage-utils"

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onProfileUpdated?: () => void
}

interface ProfileData {
  username: string
  full_name: string
  bio: string
  avatar_url: string
  instagram_url: string
  pinterest_url: string
}

export function EditProfileModal({ isOpen, onClose, onProfileUpdated }: EditProfileModalProps) {
  const { user, supabase } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const [formData, setFormData] = useState<ProfileData>({
    username: "",
    full_name: "",
    bio: "",
    avatar_url: "",
    instagram_url: "",
    pinterest_url: "",
  })

  // Load user profile data when modal opens
  useEffect(() => {
    if (isOpen && user && supabase) {
      loadProfileData()
    }
  }, [isOpen, user, supabase])

  // Clean up preview URL when modal closes
  useEffect(() => {
    if (!isOpen) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
      setSelectedFile(null)
    }
  }, [isOpen, previewUrl])

  const loadProfileData = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profileError) {
        throw profileError
      }

      setFormData({
        username: profile?.username || "",
        full_name: profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || "",
        bio: profile?.bio || "",
        avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || "",
        instagram_url: profile?.instagram_url || "",
        pinterest_url: profile?.pinterest_url || "",
      })
    } catch (error: any) {
      console.error("Error loading profile:", error)
      setError("Error al cargar el perfil")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
    setSuccess(false)
  }

  // Replace the handleFileSelect function with this improved version:
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file using utility function
    const validation = validateImageFile(file)
    if (!validation.valid) {
      setError(validation.error!)
      return
    }

    setSelectedFile(file)
    setError(null)

    // Create preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    const newPreviewUrl = URL.createObjectURL(file)
    setPreviewUrl(newPreviewUrl)
  }

  // Replace the uploadAvatar function with this improved version:
  const uploadAvatar = async (file: File): Promise<string> => {
    if (!user) throw new Error("Usuario no autenticado")

    // Delete old avatar if it exists and is from our storage
    if (formData.avatar_url) {
      await deleteOldAvatar(supabase, user.id, formData.avatar_url)
    }

    // Generate unique filename
    const filePath = generateAvatarFileName(user.id, file.name)

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage.from("profile-images").upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (uploadError) {
      throw uploadError
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("profile-images").getPublicUrl(filePath)

    return publicUrl
  }

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      setError("El nombre es requerido")
      return false
    }

    if (formData.username.trim() && formData.username.length < 3) {
      setError("El nombre de usuario debe tener al menos 3 caracteres")
      return false
    }

    if (formData.username.trim() && !/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError("El nombre de usuario solo puede contener letras, números y guiones bajos")
      return false
    }

    if (formData.bio.length > 150) {
      setError("La bio no puede exceder 150 caracteres")
      return false
    }

    if (formData.instagram_url && !formData.instagram_url.includes("instagram.com")) {
      setError("La URL de Instagram debe ser válida")
      return false
    }

    if (formData.pinterest_url && !formData.pinterest_url.includes("pinterest.com")) {
      setError("La URL de Pinterest debe ser válida")
      return false
    }

    return true
  }

  const handleSave = async () => {
    if (!user || !validateForm()) return

    setSaving(true)
    setError(null)

    try {
      let avatarUrl = formData.avatar_url

      // Upload new avatar if file is selected
      if (selectedFile) {
        setUploadingAvatar(true)
        try {
          avatarUrl = await uploadAvatar(selectedFile)
        } catch (uploadError: any) {
          console.error("Error uploading avatar:", uploadError)
          setError("Error al subir la imagen: " + uploadError.message)
          return
        } finally {
          setUploadingAvatar(false)
        }
      }

      // Check if username is already taken (if changed)
      if (formData.username.trim()) {
        const { data: existingUser, error: checkError } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", formData.username.trim())
          .neq("id", user.id)
          .single()

        if (checkError && checkError.code !== "PGRST116") {
          throw checkError
        }

        if (existingUser) {
          setError("Este nombre de usuario ya está en uso")
          return
        }
      }

      // Update profile
      const updateData = {
        username: formData.username.trim() || null,
        full_name: formData.full_name.trim(),
        bio: formData.bio.trim() || null,
        avatar_url: avatarUrl || null,
        instagram_url: formData.instagram_url.trim() || null,
        pinterest_url: formData.pinterest_url.trim() || null,
        updated_at: new Date().toISOString(),
      }

      const { error: updateError } = await supabase.from("profiles").update(updateData).eq("id", user.id)

      if (updateError) {
        throw updateError
      }

      setSuccess(true)

      // Call callback to refresh parent component
      if (onProfileUpdated) {
        onProfileUpdated()
      }

      // Close modal after a short delay
      setTimeout(() => {
        onClose()
        setSuccess(false)
      }, 1500)
    } catch (error: any) {
      console.error("Error updating profile:", error)
      setError(error.message || "Error al guardar los cambios")
    } finally {
      setSaving(false)
      setUploadingAvatar(false)
    }
  }

  const handleClose = () => {
    if (saving || uploadingAvatar) return
    onClose()
    setError(null)
    setSuccess(false)
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const removeSelectedImage = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const currentAvatarUrl = previewUrl || formData.avatar_url

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Editar Perfil
            <Button variant="ghost" size="sm" onClick={handleClose} disabled={saving || uploadingAvatar}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">Personaliza tu información pública.</p>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4 py-6">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
            <p className="text-center text-muted-foreground">Cargando perfil...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Success Alert */}
            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>¡Perfil actualizado exitosamente!</AlertDescription>
              </Alert>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={currentAvatarUrl || "/placeholder.svg"} alt="Avatar" />
                  <AvatarFallback className="bg-muted">
                    <User className="w-12 h-12 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAvatarClick}
                  disabled={saving || uploadingAvatar}
                  className="flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  {selectedFile ? "Cambiar Imagen" : "Cambiar Foto de Perfil"}
                </Button>

                {selectedFile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeSelectedImage}
                    disabled={saving || uploadingAvatar}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {selectedFile && (
                <p className="text-xs text-muted-foreground text-center">
                  Archivo seleccionado: {selectedFile.name}
                  <br />
                  <span className="text-green-600">✓ Listo para subir</span>
                </p>
              )}

              <p className="text-xs text-muted-foreground text-center">
                Formatos permitidos: JPG, JPEG, WebP, GIF (máx. 5MB)
              </p>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/webp,image/gif"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre Completo</Label>
                <Input
                  id="fullName"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  placeholder="Tu nombre completo"
                  disabled={saving || uploadingAvatar}
                  maxLength={50}
                />
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de Usuario</Label>
                <div className="relative">
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    placeholder="tunombredeusuario"
                    disabled={saving || uploadingAvatar}
                    maxLength={30}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                    {formData.username.length}/30
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Solo letras, números y guiones bajos. Mínimo 3 caracteres.
                </p>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <div className="relative">
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Cuéntanos sobre ti..."
                    disabled={saving || uploadingAvatar}
                    maxLength={150}
                    rows={3}
                    className="resize-none"
                  />
                  <div className="absolute right-3 bottom-3 text-xs text-muted-foreground">
                    {formData.bio.length}/150
                  </div>
                </div>
              </div>

              {/* Instagram */}
              <div className="space-y-2">
                <Label htmlFor="instagram" className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-pink-500" />
                  Instagram (Opcional)
                </Label>
                <Input
                  id="instagram"
                  value={formData.instagram_url}
                  onChange={(e) => handleInputChange("instagram_url", e.target.value)}
                  placeholder="https://instagram.com/tuusuario"
                  disabled={saving || uploadingAvatar}
                  type="url"
                />
              </div>

              {/* Pinterest */}
              <div className="space-y-2">
                <Label htmlFor="pinterest" className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-red-500" />
                  Pinterest (Opcional)
                </Label>
                <Input
                  id="pinterest"
                  value={formData.pinterest_url}
                  onChange={(e) => handleInputChange("pinterest_url", e.target.value)}
                  placeholder="https://pinterest.com/tuusuario"
                  disabled={saving || uploadingAvatar}
                  type="url"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleClose} disabled={saving || uploadingAvatar} className="flex-1">
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || uploadingAvatar || !formData.full_name.trim()}
                className="flex-1"
              >
                {saving || uploadingAvatar ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {uploadingAvatar ? "Subiendo imagen..." : "Guardando..."}
                  </div>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
