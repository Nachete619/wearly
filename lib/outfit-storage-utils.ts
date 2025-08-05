export const validateOutfitImage = (file: File): { valid: boolean; error?: string } => {
  // Check file type (exclude PNG as requested)
  const allowedTypes = ["image/jpeg", "image/jpg", "image/webp", "image/gif"]
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Formato no permitido. Usa JPG, JPEG, WebP o GIF",
    }
  }

  // Check file size (max 10MB for outfit images)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: "El archivo es demasiado grande. Máximo 10MB",
    }
  }

  return { valid: true }
}

export const generateOutfitImageFileName = (
  userId: string,
  outfitId: string,
  originalName: string,
  index: number,
): string => {
  const fileExt = originalName.split(".").pop()
  return `outfits/${userId}/${outfitId}/${index}-${Date.now()}.${fileExt}`
}

export const uploadOutfitImages = async (
  supabase: any,
  userId: string,
  outfitId: string,
  files: File[],
): Promise<string[]> => {
  const uploadPromises = files.map(async (file, index) => {
    try {
      // Validar la imagen antes de subirla
      const validation = validateOutfitImage(file)
      if (!validation.valid) {
        throw new Error(validation.error || `Imagen ${index + 1} no válida`)
      }

      const filePath = generateOutfitImageFileName(userId, outfitId, file.name, index)

      const { error: uploadError } = await supabase.storage.from("outfit-images").upload(filePath, file, {
        cacheControl: "3600",
        upsert: true, // Cambiado a true para permitir sobrescribir si es necesario
      })

      if (uploadError) {
        console.error(`Error al subir imagen ${index + 1}:`, uploadError)
        throw new Error(`Error subiendo imagen ${index + 1}: ${uploadError.message}`)
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("outfit-images").getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error(`Error procesando imagen ${index + 1}:`, error)
      throw error
    }
  })

  try {
    return await Promise.all(uploadPromises)
  } catch (error) {
    console.error("Error al subir imágenes:", error)
    throw error
  }
}

export const deleteOutfitImages = async (supabase: any, imageUrls: string[]) => {
  const deletePromises = imageUrls.map(async (imageUrl) => {
    try {
      const url = new URL(imageUrl)
      const pathParts = url.pathname.split("/")
      const bucketIndex = pathParts.indexOf("outfit-images")

      if (bucketIndex === -1) return

      const filePath = pathParts.slice(bucketIndex + 1).join("/")

      const { error } = await supabase.storage.from("outfit-images").remove([filePath])

      if (error) {
        console.warn("Could not delete outfit image:", error)
      }
    } catch (error) {
      console.warn("Error parsing image URL:", error)
    }
  })

  await Promise.all(deletePromises)
}
