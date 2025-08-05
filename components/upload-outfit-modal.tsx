"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Upload, X, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/hooks/use-toast"
import { uploadOutfitImages } from "@/lib/outfit-storage-utils"
import { LocationInput } from "./location-input"
import { generateMapUrls, type LocationData } from "@/lib/location-utils"

interface ClothingItem {
  name: string
  url: string
}

interface UploadOutfitModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function UploadOutfitModal({ open, onOpenChange, onSuccess }: UploadOutfitModalProps) {
  const { user, supabase } = useAuth()
  const [isUploading, setIsUploading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([])
  const [newItemName, setNewItemName] = useState("")
  const [newItemUrl, setNewItemUrl] = useState("")
  const [location, setLocation] = useState<LocationData | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + images.length > 5) {
      toast({
        title: "Límite excedido",
        description: "Puedes subir máximo 5 imágenes",
        variant: "destructive",
      })
      return
    }
    setImages((prev) => [...prev, ...files])
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const addClothingItem = () => {
    if (!newItemName.trim()) return

    setClothingItems((prev) => [
      ...prev,
      {
        name: newItemName.trim(),
        url: newItemUrl.trim() || "",
      },
    ])
    setNewItemName("")
    setNewItemUrl("")
  }

  const removeClothingItem = (index: number) => {
    setClothingItems((prev) => prev.filter((_, i) => i !== index))
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setImages([])
    setClothingItems([])
    setLocation(null)
    setNewItemName("")
    setNewItemUrl("")
  }

  const handleClose = () => {
    if (!isUploading) {
      resetForm()
      onOpenChange(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para subir outfits",
        variant: "destructive",
      })
      return
    }

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "El título es requerido",
        variant: "destructive",
      })
      return
    }

    if (images.length === 0) {
      toast({
        title: "Error",
        description: "Debes subir al menos una imagen",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // If Supabase is available, use it. Otherwise, simulate success
      if (supabase) {
        // Generate a unique outfit ID
        const outfitId = `outfit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        // Upload images first
        const imageUrls = await uploadOutfitImages(supabase, user.id, outfitId, images)

        // Prepare outfit data
        const outfitData: any = {
          id: outfitId,
          title: title.trim(),
          description: description.trim() || null,
          user_id: user.id,
          likes_count: 0,
          saves_count: 0,
          created_at: new Date().toISOString(),
        }

        // Add location data if provided
        if (location) {
          const mapUrls = generateMapUrls(location.lat, location.lng, location.name)
          outfitData.location_name = location.name
          outfitData.location_lat = location.lat
          outfitData.location_lng = location.lng
          outfitData.url_google = mapUrls.google
          outfitData.url_waze = mapUrls.waze
          outfitData.url_apple = mapUrls.apple
        }

        // Insert outfit
        const { data: outfit, error: outfitError } = await supabase.from("outfits").insert(outfitData).select().single()

        if (outfitError) throw outfitError

        // Insert images
        const imageInserts = imageUrls.map((url, index) => ({
          outfit_id: outfit.id,
          image_url: url,
          image_order: index + 1,
        }))

        const { error: imagesError } = await supabase.from("outfit_images").insert(imageInserts)

        if (imagesError) throw imagesError

        // Insert clothing items
        if (clothingItems.length > 0) {
          const itemInserts = clothingItems.map((item) => ({
            outfit_id: outfit.id,
            name: item.name,
            url: item.url || null,
          }))

          const { error: itemsError } = await supabase.from("clothing_items").insert(itemInserts)

          if (itemsError) throw itemsError
        }
      } else {
        // Simulate upload delay for demo
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }

      toast({
        title: "¡Éxito!",
        description: "Tu outfit se ha subido correctamente",
      })

      // Reset form and close modal
      resetForm()
      onOpenChange(false)

      // Notify parent component
      onSuccess?.()
    } catch (error) {
      console.error("Error uploading outfit:", error)
      toast({
        title: "Error",
        description: "No se pudo subir el outfit. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Subir Nuevo Outfit</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Look casual de verano"
              disabled={isUploading}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe tu outfit, ocasión, inspiración..."
              disabled={isUploading}
              rows={3}
            />
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label>Imágenes * (máximo 5)</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                disabled={isUploading}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="flex flex-col items-center justify-center cursor-pointer">
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Haz clic para seleccionar imágenes</p>
              </label>
            </div>

            {/* Image previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image) || "/placeholder.svg"}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0"
                      onClick={() => removeImage(index)}
                      disabled={isUploading}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Location */}
          <LocationInput value={location} onChange={setLocation} disabled={isUploading} />

          {/* Clothing Items */}
          <div className="space-y-4">
            <Label>Prendas y accesorios</Label>

            {/* Add new item */}
            <div className="space-y-2">
              <Input
                placeholder="Nombre de la prenda (ej: Camisa blanca)"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                disabled={isUploading}
              />
              <Input
                placeholder="URL de compra (opcional)"
                value={newItemUrl}
                onChange={(e) => setNewItemUrl(e.target.value)}
                disabled={isUploading}
                type="url"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addClothingItem}
                disabled={isUploading || !newItemName.trim()}
                className="w-full bg-transparent"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar prenda
              </Button>
            </div>

            {/* Items list */}
            {clothingItems.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {clothingItems.map((item, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-2">
                    {item.name}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeClothingItem(index)}
                      disabled={isUploading}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
              className="flex-1 bg-transparent"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isUploading || !title.trim() || images.length === 0} className="flex-1">
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Subiendo...
                </>
              ) : (
                "Subir Outfit"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
