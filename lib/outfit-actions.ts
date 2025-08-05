import { deleteOutfitImages } from "./outfit-storage-utils"

export const deleteOutfit = async (supabase: any, outfitId: string, userId: string) => {
  try {
    // First, get the outfit images to delete from storage
    const { data: outfitImages, error: imagesError } = await supabase
      .from("outfit_images")
      .select("image_url")
      .eq("outfit_id", outfitId)

    if (imagesError) {
      throw new Error(`Error fetching outfit images: ${imagesError.message}`)
    }

    // Delete images from storage
    if (outfitImages && outfitImages.length > 0) {
      const imageUrls = outfitImages.map((img: any) => img.image_url)
      await deleteOutfitImages(supabase, imageUrls)
    }

    // Delete outfit images records
    const { error: deleteImagesError } = await supabase.from("outfit_images").delete().eq("outfit_id", outfitId)

    if (deleteImagesError) {
      throw new Error(`Error deleting outfit images: ${deleteImagesError.message}`)
    }

    // Delete clothing items
    const { error: deleteItemsError } = await supabase.from("clothing_items").delete().eq("outfit_id", outfitId)

    if (deleteItemsError) {
      throw new Error(`Error deleting clothing items: ${deleteItemsError.message}`)
    }

    // Finally, delete the outfit
    const { error: deleteOutfitError } = await supabase
      .from("outfits")
      .delete()
      .eq("id", outfitId)
      .eq("user_id", userId) // Extra security check

    if (deleteOutfitError) {
      throw new Error(`Error deleting outfit: ${deleteOutfitError.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Error deleting outfit:", error)
    throw error
  }
}

export const duplicateOutfit = async (supabase: any, outfitId: string, userId: string) => {
  try {
    // Get the original outfit
    const { data: originalOutfit, error: outfitError } = await supabase
      .from("outfits")
      .select(`
        *,
        outfit_images (*),
        clothing_items (*)
      `)
      .eq("id", outfitId)
      .single()

    if (outfitError) {
      throw new Error(`Error fetching outfit: ${outfitError.message}`)
    }

    // Create new outfit
    const { data: newOutfit, error: createError } = await supabase
      .from("outfits")
      .insert({
        user_id: userId,
        title: `${originalOutfit.title} (Copia)`,
        description: originalOutfit.description,
        likes_count: 0,
        saves_count: 0,
      })
      .select()
      .single()

    if (createError) {
      throw new Error(`Error creating outfit copy: ${createError.message}`)
    }

    // Copy images (this would require downloading and re-uploading)
    // For now, we'll just reference the same images
    if (originalOutfit.outfit_images && originalOutfit.outfit_images.length > 0) {
      const imageInserts = originalOutfit.outfit_images.map((img: any) => ({
        outfit_id: newOutfit.id,
        image_url: img.image_url,
        image_order: img.image_order,
      }))

      const { error: imagesError } = await supabase.from("outfit_images").insert(imageInserts)

      if (imagesError) {
        throw new Error(`Error copying images: ${imagesError.message}`)
      }
    }

    // Copy clothing items
    if (originalOutfit.clothing_items && originalOutfit.clothing_items.length > 0) {
      const itemInserts = originalOutfit.clothing_items.map((item: any) => ({
        outfit_id: newOutfit.id,
        name: item.name,
        url: item.url,
      }))

      const { error: itemsError } = await supabase.from("clothing_items").insert(itemInserts)

      if (itemsError) {
        throw new Error(`Error copying clothing items: ${itemsError.message}`)
      }
    }

    return { success: true, newOutfitId: newOutfit.id }
  } catch (error) {
    console.error("Error duplicating outfit:", error)
    throw error
  }
}
