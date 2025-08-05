export const deleteOldAvatar = async (supabase: any, userId: string, currentAvatarUrl: string) => {
  if (!currentAvatarUrl || !currentAvatarUrl.includes("profile-images")) {
    return // No es una imagen de nuestro storage
  }

  try {
    // Extract file path from URL
    const url = new URL(currentAvatarUrl)
    const pathParts = url.pathname.split("/")
    const bucketIndex = pathParts.indexOf("profile-images")

    if (bucketIndex === -1) return

    const filePath = pathParts.slice(bucketIndex + 1).join("/")

    // Delete old file
    const { error } = await supabase.storage.from("profile-images").remove([filePath])

    if (error) {
      console.warn("Could not delete old avatar:", error)
    }
  } catch (error) {
    console.warn("Error parsing avatar URL:", error)
  }
}

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type (exclude PNG as requested)
  const allowedTypes = ["image/jpeg", "image/jpg", "image/webp", "image/gif"]
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Formato no permitido. Usa JPG, JPEG, WebP o GIF",
    }
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: "El archivo es demasiado grande. Máximo 5MB",
    }
  }

  return { valid: true }
}

export const generateAvatarFileName = (userId: string, originalName: string): string => {
  const fileExt = originalName.split(".").pop()
  return `avatars/${userId}-${Date.now()}.${fileExt}`
}
