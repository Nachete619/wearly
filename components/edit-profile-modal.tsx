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
import { X, Camera, User, Instagram, LinkIcon, AlertCircle, CheckCircle, Loader2, Building2, MapPin, Phone, Clock, Globe } from "lucide-react"
// Import the storage utilities at the top
import { deleteOldAvatar, validateImageFile, generateAvatarFileName } from "@/lib/storage-utils"
// Import user actions and types
import { UserProfile, CompanyProfile, getCurrentCompanyProfile, updateCompanyProfile } from "@/lib/user-actions"

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onProfileUpdated?: () => void
  profile?: UserProfile | null
}

interface ProfileData {
  username: string
  full_name: string
  bio: string
  avatar_url: string
  instagram_url: string
  pinterest_url: string
}

interface CompanyData {
  nombre_empresa: string
  descripcion: string
  direccion: string
  telefono: string
  horarios: string
  sitio_web: string
}

export function EditProfileModal({ isOpen, onClose, onProfileUpdated, profile }: EditProfileModalProps) {
  const { user, supabase } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null)
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null)

  const [formData, setFormData] = useState<ProfileData>({
    username: "",
    full_name: "",
    bio: "",
    avatar_url: "",
    instagram_url: "",
    pinterest_url: "",
  })

  const [companyData, setCompanyData] = useState<CompanyData>({
    nombre_empresa: "",
    descripcion: "",
    direccion: "",
    telefono: "",
    horarios: "",
    sitio_web: "",
  })

  // Load user profile data when modal opens
  useEffect(() => {
    if (isOpen && user && supabase) {
      loadProfileData()
    }
  }, [isOpen, user, supabase])

  // Update current profile when prop changes
  useEffect(() => {
    if (profile) {
      setCurrentProfile(profile)
    }
  }, [profile])

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

      setCurrentProfile(profile)
      setFormData({
        username: profile?.username || "",
        full_name: profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || "",
        bio: profile?.bio || "",
        avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || "",
        instagram_url: profile?.instagram_url || "",
        pinterest_url: profile?.pinterest_url || "",
      })

      // Si es usuario empresa, cargar también los datos de la empresa
      if (profile?.tipo_usuario === "empresa") {
        try {
          const companyProfile = await getCurrentCompanyProfile()
          setCompanyProfile(companyProfile)
          if (companyProfile) {
            setCompanyData({
              nombre_empresa: companyProfile.nombre_empresa || "",
              descripcion: companyProfile.descripcion || "",
              direccion: companyProfile.direccion || "",
              telefono: companyProfile.telefono || "",
              horarios: companyProfile.horarios || "",
              sitio_web: companyProfile.sitio_web || "",
            })
          }
        } catch (error) {
          console.error("Error loading company profile:", error)
        }
      }
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

  const handleCompanyInputChange = (field: keyof CompanyData, value: string) => {
    setCompanyData((prev) => ({ ...prev, [field]: value }))
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

      // Si es usuario empresa, actualizar también los datos de la empresa
      if (currentProfile?.tipo_usuario === "empresa" && companyProfile) {
        try {
          const result = await updateCompanyProfile({
            nombre_empresa: companyData.nombre_empresa.trim(),
            descripcion: companyData.descripcion.trim() || null,
            direccion: companyData.direccion.trim() || null,
            telefono: companyData.telefono.trim() || null,
            horarios: companyData.horarios.trim() || null,
            sitio_web: companyData.sitio_web.trim() || null,
            updated_at: new Date().toISOString(),
          })

          if (!result.success) {
            setError(result.error || "Error al actualizar los datos de la empresa")
            return
          }
        } catch (error: any) {
          console.error("Error updating company profile:", error)
          setError("Error al actualizar los datos de la empresa")
          return
        }
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
                    {currentProfile?.tipo_usuario === "empresa" ? (
                      <Building2 className="w-12 h-12 text-muted-foreground" />
                    ) : (
                      <User className="w-12 h-12 text-muted-foreground" />
                    )}
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

              {/* Campos específicos para empresas */}
              {currentProfile?.tipo_usuario === "empresa" && (
                <>
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Información de la Empresa
                    </h3>
                  </div>

                  {/* Nombre de la empresa */}
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Nombre de la Empresa</Label>
                    <Input
                      id="companyName"
                      value={companyData.nombre_empresa}
                      onChange={(e) => handleCompanyInputChange("nombre_empresa", e.target.value)}
                      placeholder="Nombre de tu empresa"
                      disabled={saving || uploadingAvatar}
                      maxLength={100}
                    />
                  </div>

                  {/* Descripción de la empresa */}
                  <div className="space-y-2">
                    <Label htmlFor="companyDescription">Descripción</Label>
                    <Textarea
                      id="companyDescription"
                      value={companyData.descripcion}
                      onChange={(e) => handleCompanyInputChange("descripcion", e.target.value)}
                      placeholder="Describe tu empresa..."
                      disabled={saving || uploadingAvatar}
                      maxLength={500}
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  {/* Dirección */}
                  <div className="space-y-2">
                    <Label htmlFor="companyAddress" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      Dirección (Opcional)
                    </Label>
                    <Input
                      id="companyAddress"
                      value={companyData.direccion}
                      onChange={(e) => handleCompanyInputChange("direccion", e.target.value)}
                      placeholder="Dirección de la empresa"
                      disabled={saving || uploadingAvatar}
                      maxLength={200}
                    />
                  </div>

                  {/* Teléfono */}
                  <div className="space-y-2">
                    <Label htmlFor="companyPhone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      Teléfono (Opcional)
                    </Label>
                    <Input
                      id="companyPhone"
                      value={companyData.telefono}
                      onChange={(e) => handleCompanyInputChange("telefono", e.target.value)}
                      placeholder="Número de teléfono"
                      disabled={saving || uploadingAvatar}
                      maxLength={20}
                    />
                  </div>

                  {/* Horarios */}
                  <div className="space-y-2">
                    <Label htmlFor="companyHours" className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      Horarios (Opcional)
                    </Label>
                    <Input
                      id="companyHours"
                      value={companyData.horarios}
                      onChange={(e) => handleCompanyInputChange("horarios", e.target.value)}
                      placeholder="Ej: Lunes a Viernes 9:00-18:00"
                      disabled={saving || uploadingAvatar}
                      maxLength={100}
                    />
                  </div>

                  {/* Sitio web */}
                  <div className="space-y-2">
                    <Label htmlFor="companyWebsite" className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      Sitio Web (Opcional)
                    </Label>
                    <Input
                      id="companyWebsite"
                      value={companyData.sitio_web}
                      onChange={(e) => handleCompanyInputChange("sitio_web", e.target.value)}
                      placeholder="https://www.tuempresa.com"
                      disabled={saving || uploadingAvatar}
                      type="url"
                    />
                  </div>
                </>
              )}
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
