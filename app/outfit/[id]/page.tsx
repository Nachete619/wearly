"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppLayout } from "@/components/app-layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Heart,
  Bookmark,
  Share,
  MapPin,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Send,
  Copy,
  Navigation,
  User,
  MessageCircle,
  Loader2,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/hooks/use-toast"

// Mock data for demonstration
const MOCK_OUTFITS = {
  "1": {
    id: "1",
    title: "Look casual para viernes",
    description: "Perfecto para una salida casual con amigos. Cómodo pero con estilo.",
    user_id: "user1",
    created_at: "2024-01-15T10:30:00Z",
    likes_count: 24,
    saves_count: 12,
    location_name: "Café Central, Madrid",
    location_lat: 40.4168,
    location_lng: -3.7038,
    url_google: "https://maps.google.com/?q=40.4168,-3.7038",
    url_waze: "https://waze.com/ul?ll=40.4168,-3.7038",
    url_apple: "http://maps.apple.com/?ll=40.4168,-3.7038",
    outfit_images: [
      { id: "img1", image_url: "/placeholder.svg?height=600&width=400&text=Outfit+Principal", image_order: 1 },
      { id: "img2", image_url: "/placeholder.svg?height=600&width=400&text=Detalle+1", image_order: 2 },
      { id: "img3", image_url: "/placeholder.svg?height=600&width=400&text=Detalle+2", image_order: 3 },
    ],
    clothing_items: [
      { id: "item1", name: "Jeans azules", url: "https://example.com/jeans" },
      { id: "item2", name: "Camiseta blanca", url: "https://example.com/shirt" },
      { id: "item3", name: "Sneakers blancos", url: null },
    ],
    profiles: {
      id: "user1",
      username: "fashionista",
      full_name: "Ana García",
      avatar_url: "/placeholder.svg?height=100&width=100&text=Ana",
    },
  },
  "2": {
    id: "2",
    title: "Elegancia nocturna",
    description: "Para esas noches especiales donde quieres brillar.",
    user_id: "user2",
    created_at: "2024-01-14T18:45:00Z",
    likes_count: 45,
    saves_count: 28,
    location_name: "Restaurante Elegante, Barcelona",
    location_lat: 41.3851,
    location_lng: 2.1734,
    url_google: "https://maps.google.com/?q=41.3851,2.1734",
    url_waze: "https://waze.com/ul?ll=41.3851,2.1734",
    url_apple: "http://maps.apple.com/?ll=41.3851,2.1734",
    outfit_images: [
      { id: "img4", image_url: "/placeholder.svg?height=600&width=400&text=Vestido+Elegante", image_order: 1 },
      { id: "img5", image_url: "/placeholder.svg?height=600&width=400&text=Accesorios", image_order: 2 },
    ],
    clothing_items: [
      { id: "item4", name: "Vestido negro", url: "https://example.com/dress" },
      { id: "item5", name: "Tacones dorados", url: "https://example.com/heels" },
      { id: "item6", name: "Clutch pequeño", url: null },
    ],
    profiles: {
      id: "user2",
      username: "styleicon",
      full_name: "María López",
      avatar_url: "/placeholder.svg?height=100&width=100&text=María",
    },
  },
  "3": {
    id: "3",
    title: "Street style urbano",
    description: "Inspirado en las calles de Nueva York. Actitud y personalidad.",
    user_id: "user3",
    created_at: "2024-01-13T14:20:00Z",
    likes_count: 67,
    saves_count: 34,
    location_name: "SoHo, Nueva York",
    location_lat: 40.7231,
    location_lng: -74.0028,
    url_google: "https://maps.google.com/?q=40.7231,-74.0028",
    url_waze: "https://waze.com/ul?ll=40.7231,-74.0028",
    url_apple: "http://maps.apple.com/?ll=40.7231,-74.0028",
    outfit_images: [
      { id: "img6", image_url: "/placeholder.svg?height=600&width=400&text=Street+Style", image_order: 1 },
    ],
    clothing_items: [
      { id: "item7", name: "Chaqueta de cuero", url: "https://example.com/jacket" },
      { id: "item8", name: "Jeans rotos", url: "https://example.com/ripped-jeans" },
      { id: "item9", name: "Botas militares", url: "https://example.com/boots" },
    ],
    profiles: {
      id: "user3",
      username: "urbanstyle",
      full_name: "Carlos Ruiz",
      avatar_url: "/placeholder.svg?height=100&width=100&text=Carlos",
    },
  },
  "4": {
    id: "4",
    title: "Vibes bohemios",
    description: "Conectando con la naturaleza y la libertad. Estilo boho chic.",
    user_id: "user4",
    created_at: "2024-01-12T11:15:00Z",
    likes_count: 38,
    saves_count: 22,
    location_name: "Parque del Retiro, Madrid",
    location_lat: 40.4153,
    location_lng: -3.6844,
    url_google: "https://maps.google.com/?q=40.4153,-3.6844",
    url_waze: "https://waze.com/ul?ll=40.4153,-3.6844",
    url_apple: "http://maps.apple.com/?ll=40.4153,-3.6844",
    outfit_images: [
      { id: "img7", image_url: "/placeholder.svg?height=600&width=400&text=Boho+Style", image_order: 1 },
      { id: "img8", image_url: "/placeholder.svg?height=600&width=400&text=Detalles+Boho", image_order: 2 },
    ],
    clothing_items: [
      { id: "item10", name: "Vestido floral", url: "https://example.com/floral-dress" },
      { id: "item11", name: "Sandalias de cuero", url: null },
      { id: "item12", name: "Collar étnico", url: "https://example.com/necklace" },
    ],
    profiles: {
      id: "user4",
      username: "bohochic",
      full_name: "Luna Martín",
      avatar_url: "/placeholder.svg?height=100&width=100&text=Luna",
    },
  },
  "5": {
    id: "5",
    title: "Estética minimalista",
    description: "Menos es más. Líneas limpias y colores neutros.",
    user_id: "user5",
    created_at: "2024-01-11T16:30:00Z",
    likes_count: 52,
    saves_count: 31,
    location_name: "Museo de Arte Moderno",
    location_lat: 40.4637,
    location_lng: -3.6919,
    url_google: "https://maps.google.com/?q=40.4637,-3.6919",
    url_waze: "https://waze.com/ul?ll=40.4637,-3.6919",
    url_apple: "http://maps.apple.com/?ll=40.4637,-3.6919",
    outfit_images: [
      { id: "img9", image_url: "/placeholder.svg?height=600&width=400&text=Minimal+Look", image_order: 1 },
    ],
    clothing_items: [
      { id: "item13", name: "Blazer beige", url: "https://example.com/blazer" },
      { id: "item14", name: "Pantalón recto", url: "https://example.com/pants" },
      { id: "item15", name: "Zapatos oxford", url: "https://example.com/oxford" },
    ],
    profiles: {
      id: "user5",
      username: "minimal_style",
      full_name: "Alex Chen",
      avatar_url: "/placeholder.svg?height=100&width=100&text=Alex",
    },
  },
}

const MOCK_COMMENTS = {
  "1": [
    {
      id: "c1",
      content: "¡Me encanta este look! ¿Dónde compraste los jeans?",
      created_at: "2024-01-15T12:00:00Z",
      profiles: {
        id: "commenter1",
        username: "styleseeker",
        full_name: "Sofia Vega",
        avatar_url: "/placeholder.svg?height=50&width=50&text=Sofia",
      },
    },
    {
      id: "c2",
      content: "Perfecto para el día a día 👌",
      created_at: "2024-01-15T14:30:00Z",
      profiles: {
        id: "commenter2",
        username: "casualfan",
        full_name: "Diego Morales",
        avatar_url: "/placeholder.svg?height=50&width=50&text=Diego",
      },
    },
  ],
  "2": [
    {
      id: "c3",
      content: "Elegancia pura! 😍",
      created_at: "2024-01-14T20:00:00Z",
      profiles: {
        id: "commenter3",
        username: "glamlover",
        full_name: "Isabella Torres",
        avatar_url: "/placeholder.svg?height=50&width=50&text=Isa",
      },
    },
  ],
  "3": [
    {
      id: "c4",
      content: "Este estilo urbano es increíble!",
      created_at: "2024-01-13T16:45:00Z",
      profiles: {
        id: "commenter4",
        username: "streetfashion",
        full_name: "Javier Ramos",
        avatar_url: "/placeholder.svg?height=50&width=50&text=Javi",
      },
    },
  ],
  "4": [
    {
      id: "c5",
      content: "Amo el estilo boho! ¿Tienes más outfits así?",
      created_at: "2024-01-12T13:20:00Z",
      profiles: {
        id: "commenter5",
        username: "bohofan",
        full_name: "Carmen Silva",
        avatar_url: "/placeholder.svg?height=50&width=50&text=Carmen",
      },
    },
  ],
  "5": [
    {
      id: "c6",
      content: "La simplicidad es hermosa ✨",
      created_at: "2024-01-11T18:15:00Z",
      profiles: {
        id: "commenter6",
        username: "minimalist",
        full_name: "Andrea Kim",
        avatar_url: "/placeholder.svg?height=50&width=50&text=Andrea",
      },
    },
  ],
}

interface OutfitData {
  id: string
  title: string
  description: string | null
  user_id: string
  created_at: string
  likes_count: number
  saves_count: number
  location_name?: string | null
  location_lat?: number | null
  location_lng?: number | null
  url_google?: string | null
  url_waze?: string | null
  url_apple?: string | null
  outfit_images: Array<{
    id: string
    image_url: string
    image_order: number
  }>
  clothing_items: Array<{
    id: string
    name: string
    url: string | null
  }>
  profiles: {
    id: string
    username: string | null
    full_name: string | null
    avatar_url: string | null
  }
}

interface Comment {
  id: string
  content: string
  created_at: string
  profiles: {
    id: string
    username: string | null
    full_name: string | null
    avatar_url: string | null
  }
}

interface RelatedOutfit {
  id: string
  title: string
  outfit_images: Array<{
    image_url: string
  }>
  likes_count: number
  saves_count: number
  profiles: {
    full_name: string | null
    avatar_url: string | null
  }
}

export default function OutfitDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, supabase } = useAuth()
  const outfitId = params.id as string

  // State
  const [outfit, setOutfit] = useState<OutfitData | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [relatedOutfits, setRelatedOutfits] = useState<RelatedOutfit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [savesCount, setSavesCount] = useState(0)
  const [newComment, setNewComment] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch outfit data
  const fetchOutfitData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Try to fetch from Supabase first, fallback to mock data
      let outfitData: OutfitData | null = null
      let commentsData: Comment[] = []

      if (supabase) {
        try {
          const { data, error: supabaseError } = await supabase
            .from("outfits")
            .select(`
              *,
              outfit_images (
                id,
                image_url,
                image_order
              ),
              clothing_items (
                id,
                name,
                url
              ),
              profiles (
                id,
                username,
                full_name,
                avatar_url
              )
            `)
            .eq("id", outfitId)
            .single()

          if (!supabaseError && data) {
            outfitData = data
          }

          // Fetch comments
          const { data: commentsResponse } = await supabase
            .from("outfit_comments")
            .select(`
              id,
              content,
              created_at,
              profiles (
                id,
                username,
                full_name,
                avatar_url
              )
            `)
            .eq("outfit_id", outfitId)
            .order("created_at", { ascending: false })

          if (commentsResponse) {
            commentsData = commentsResponse
          }
        } catch (supabaseError) {
          console.log("Supabase not available, using mock data")
        }
      }

      // Fallback to mock data
      if (!outfitData) {
        outfitData = MOCK_OUTFITS[outfitId as keyof typeof MOCK_OUTFITS] || null
        commentsData = MOCK_COMMENTS[outfitId as keyof typeof MOCK_COMMENTS] || []
      }

      if (!outfitData) {
        setError("Outfit no encontrado")
        return
      }

      setOutfit(outfitData)
      setComments(commentsData)
      setLikesCount(outfitData.likes_count)
      setSavesCount(outfitData.saves_count)

      // Generate related outfits (excluding current one)
      const related = Object.values(MOCK_OUTFITS)
        .filter((o) => o.id !== outfitId)
        .slice(0, 10)
        .map((o) => ({
          id: o.id,
          title: o.title,
          outfit_images: o.outfit_images,
          likes_count: o.likes_count,
          saves_count: o.saves_count,
          profiles: o.profiles,
        }))

      setRelatedOutfits(related)

      // Check if user has liked/saved (mock for now)
      if (user) {
        setIsLiked(Math.random() > 0.5) // Random for demo
        setIsSaved(Math.random() > 0.5) // Random for demo
      }
    } catch (error) {
      console.error("Error fetching outfit:", error)
      setError("Error al cargar el outfit")
    } finally {
      setLoading(false)
    }
  }, [outfitId, supabase, user])

  useEffect(() => {
    fetchOutfitData()
  }, [fetchOutfitData])

  // Handle like
  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para dar like",
        variant: "destructive",
      })
      return
    }

    if (isLiking) return

    setIsLiking(true)
    const wasLiked = isLiked
    const newLikedState = !wasLiked
    const newCount = wasLiked ? likesCount - 1 : likesCount + 1

    // Optimistic update
    setIsLiked(newLikedState)
    setLikesCount(newCount)

    try {
      if (supabase) {
        if (newLikedState) {
          await supabase.from("outfit_likes").insert({
            outfit_id: outfitId,
            user_id: user.id,
          })
        } else {
          await supabase.from("outfit_likes").delete().eq("outfit_id", outfitId).eq("user_id", user.id)
        }
      }

      toast({
        title: newLikedState ? "¡Like agregado!" : "Like removido",
        description: newLikedState ? "Te gusta este outfit" : "Ya no te gusta este outfit",
      })
    } catch (error) {
      // Rollback on error
      setIsLiked(wasLiked)
      setLikesCount(likesCount)
      toast({
        title: "Error",
        description: "No se pudo procesar la acción",
        variant: "destructive",
      })
    } finally {
      setIsLiking(false)
    }
  }

  // Handle save
  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para guardar",
        variant: "destructive",
      })
      return
    }

    if (isSaving) return

    setIsSaving(true)
    const wasSaved = isSaved
    const newSavedState = !wasSaved
    const newCount = wasSaved ? savesCount - 1 : savesCount + 1

    // Optimistic update
    setIsSaved(newSavedState)
    setSavesCount(newCount)

    try {
      if (supabase) {
        if (newSavedState) {
          await supabase.from("outfit_saves").insert({
            outfit_id: outfitId,
            user_id: user.id,
          })
        } else {
          await supabase.from("outfit_saves").delete().eq("outfit_id", outfitId).eq("user_id", user.id)
        }
      }

      toast({
        title: newSavedState ? "¡Outfit guardado!" : "Outfit removido",
        description: newSavedState ? "Guardado en tu colección" : "Removido de tu colección",
      })
    } catch (error) {
      // Rollback on error
      setIsSaved(wasSaved)
      setSavesCount(savesCount)
      toast({
        title: "Error",
        description: "No se pudo procesar la acción",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle comment submission
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para comentar",
        variant: "destructive",
      })
      return
    }

    if (!newComment.trim() || isSubmittingComment) return

    setIsSubmittingComment(true)

    try {
      const commentData = {
        id: `temp-${Date.now()}`,
        content: newComment.trim(),
        created_at: new Date().toISOString(),
        profiles: {
          id: user.id,
          username: user.user_metadata?.username || null,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || "Usuario",
          avatar_url: user.user_metadata?.avatar_url || null,
        },
      }

      // Optimistic update
      setComments((prev) => [commentData, ...prev])
      setNewComment("")

      if (supabase) {
        await supabase.from("outfit_comments").insert({
          outfit_id: outfitId,
          user_id: user.id,
          content: newComment.trim(),
        })
      }

      toast({
        title: "¡Comentario agregado!",
        description: "Tu comentario se ha publicado correctamente",
      })
    } catch (error) {
      // Remove optimistic update on error
      setComments((prev) => prev.filter((c) => c.id !== `temp-${Date.now()}`))
      setNewComment(newComment.trim())
      toast({
        title: "Error",
        description: "No se pudo enviar el comentario",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingComment(false)
    }
  }

  // Handle share
  const handleShare = async () => {
    const url = `${window.location.origin}/outfit/${outfitId}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Outfit: ${outfit?.title}`,
          text: `Mira este outfit en Wearly`,
          url: url,
        })
      } catch (error) {
        copyToClipboard(url)
      }
    } else {
      copyToClipboard(url)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast({
          title: "Enlace copiado",
          description: "El enlace se ha copiado al portapapeles",
        })
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "No se pudo copiar el enlace",
          variant: "destructive",
        })
      })
  }

  // Handle location actions
  const handleCopyLocation = () => {
    if (outfit?.location_name) {
      copyToClipboard(outfit.location_name)
    }
  }

  const handleOpenMap = (url: string | null | undefined) => {
    if (url) {
      window.open(url, "_blank")
    }
  }

  // Image navigation
  const nextImage = () => {
    if (outfit?.outfit_images) {
      setCurrentImageIndex((prev) => (prev === outfit.outfit_images.length - 1 ? 0 : prev + 1))
    }
  }

  const prevImage = () => {
    if (outfit?.outfit_images) {
      setCurrentImageIndex((prev) => (prev === 0 ? outfit.outfit_images.length - 1 : prev - 1))
    }
  }

  // Loading state
  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Skeleton className="w-full h-96 rounded-2xl" />
              <div className="flex gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="w-16 h-16 rounded-lg" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  // Error state
  if (error || !outfit) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="text-center py-12">
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-6 inline-block">
              {error || "Outfit no encontrado"}
            </div>
            <Button onClick={() => router.back()} variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Back button */}
        <Button onClick={() => router.back()} variant="ghost" className="mb-6 flex items-center gap-2 hover:bg-muted">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-card rounded-2xl overflow-hidden border">
              <img
                src={outfit.outfit_images[currentImageIndex]?.image_url || "/placeholder.svg?height=600&width=400"}
                alt={outfit.title}
                className="w-full h-auto object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=600&width=400&text=Outfit"
                }}
              />

              {/* Navigation arrows */}
              {outfit.outfit_images.length > 1 && (
                <>
                  <Button
                    onClick={prevImage}
                    variant="ghost"
                    size="sm"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={nextImage}
                    variant="ghost"
                    size="sm"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}

              {/* Image counter */}
              {outfit.outfit_images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                  {currentImageIndex + 1} / {outfit.outfit_images.length}
                </div>
              )}
            </div>

            {/* Thumbnail navigation */}
            {outfit.outfit_images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {outfit.outfit_images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img
                      src={image.image_url || "/placeholder.svg"}
                      alt={`${outfit.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=100&width=100&text=Thumbnail"
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* User info */}
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={outfit.profiles.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>
                  <User className="w-6 h-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{outfit.profiles.full_name || "Usuario"}</p>
                {outfit.profiles.username && (
                  <p className="text-sm text-muted-foreground">@{outfit.profiles.username}</p>
                )}
              </div>
            </div>

            {/* Title and description */}
            <div>
              <h1 className="text-2xl font-bold mb-2">{outfit.title}</h1>
              {outfit.description && <p className="text-muted-foreground">{outfit.description}</p>}
              <p className="text-sm text-muted-foreground mt-2">
                {new Date(outfit.created_at).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-4">
              <Button
                onClick={handleLike}
                variant={isLiked ? "default" : "outline"}
                disabled={isLiking}
                className="flex items-center gap-2"
              >
                {isLiking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                )}
                {likesCount}
              </Button>

              <Button
                onClick={handleSave}
                variant={isSaved ? "default" : "outline"}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                )}
                {isSaved ? "Guardado" : "Guardar"} ({savesCount})
              </Button>

              <Button onClick={handleShare} variant="outline" className="flex items-center gap-2 bg-transparent">
                <Share className="w-4 h-4" />
                Compartir
              </Button>
            </div>

            {/* Location */}
            {outfit.location_name && (
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Ubicación
                </h3>
                <div className="bg-muted rounded-lg p-4">
                  <p className="font-medium mb-3">{outfit.location_name}</p>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={handleCopyLocation}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 bg-transparent"
                    >
                      <Copy className="w-3 h-3" />
                      Copiar
                    </Button>
                    <Button
                      onClick={() => handleOpenMap(outfit.url_google)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Navigation className="w-3 h-3" />
                      Google Maps
                    </Button>
                    <Button
                      onClick={() => handleOpenMap(outfit.url_waze)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Navigation className="w-3 h-3" />
                      Waze
                    </Button>
                    <Button
                      onClick={() => handleOpenMap(outfit.url_apple)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Navigation className="w-3 h-3" />
                      Apple Maps
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Clothing items */}
            {outfit.clothing_items.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Prendas y accesorios</h3>
                <div className="space-y-2">
                  {outfit.clothing_items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="font-medium">{item.name}</span>
                      {item.url && (
                        <Button
                          onClick={() => window.open(item.url!, "_blank")}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Ver
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Comments section */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Comentarios ({comments.length})
              </h3>

              {/* Add comment form */}
              {user ? (
                <form onSubmit={handleSubmitComment} className="space-y-3">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribe un comentario..."
                    disabled={isSubmittingComment}
                    rows={3}
                  />
                  <Button
                    type="submit"
                    disabled={!newComment.trim() || isSubmittingComment}
                    className="flex items-center gap-2"
                  >
                    {isSubmittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {isSubmittingComment ? "Enviando..." : "Comentar"}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-4 bg-muted rounded-lg">
                  <p className="text-muted-foreground mb-2">Inicia sesión para comentar</p>
                  <Button onClick={() => router.push("/auth/login")} variant="outline">
                    Iniciar sesión
                  </Button>
                </div>
              )}

              {/* Comments list */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.profiles.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{comment.profiles.full_name || "Usuario"}</span>
                          {comment.profiles.username && (
                            <span className="text-xs text-muted-foreground">@{comment.profiles.username}</span>
                          )}
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(comment.created_at).toLocaleDateString("es-ES", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related outfits section */}
        {relatedOutfits.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-6">Más outfits que te pueden gustar</h2>
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
              {relatedOutfits.map((relatedOutfit) => (
                <div
                  key={relatedOutfit.id}
                  className="break-inside-avoid mb-4 group cursor-pointer"
                  onClick={() => router.push(`/outfit/${relatedOutfit.id}`)}
                >
                  <div className="relative bg-card rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                    <img
                      src={relatedOutfit.outfit_images[0]?.image_url || "/placeholder.svg?height=400&width=300"}
                      alt={relatedOutfit.title}
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="p-3">
                      <h3 className="font-semibold text-sm line-clamp-2 mb-2">{relatedOutfit.title}</h3>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {relatedOutfit.likes_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bookmark className="w-3 h-3" />
                            {relatedOutfit.saves_count}
                          </span>
                        </div>
                        <span>{relatedOutfit.profiles.full_name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
