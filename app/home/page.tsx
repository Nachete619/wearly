"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/hooks/use-auth"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { UploadOutfitModal } from "@/components/upload-outfit-modal"
import { likeOutfit, toggleSaveOutfit, isOutfitLiked, isOutfitSaved } from "@/lib/social-actions"
import { Search, Filter, Heart, Bookmark, MessageCircle, MapPin, Plus, TrendingUp } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Mock data with working image URLs
const MOCK_OUTFITS = [
  {
    id: "1",
    title: "Casual Summer Look",
    description: "Perfect for a sunny day out with friends. Comfortable and stylish!",
    image_url: "https://picsum.photos/400/600?random=1",
    user_id: "user1",
    created_at: "2024-01-15T10:30:00Z",
    likes_count: 24,
    saves_count: 12,
    comments_count: 8,
    location_name: "Barcelona",
    location_lat: 41.3851,
    location_lng: 2.1734,
    clothing_items: ["Camiseta blanca", "Jeans azules", "Sneakers"],
    user: {
      id: "user1",
      username: "fashionista_ana",
      full_name: "Ana García",
      avatar_url: "https://picsum.photos/100/100?random=10",
    },
    is_liked: false,
    is_saved: false,
  },
  {
    id: "2",
    title: "Business Casual",
    description: "Professional yet comfortable outfit for the office",
    image_url: "https://picsum.photos/400/650?random=2",
    user_id: "user2",
    created_at: "2024-01-14T15:45:00Z",
    likes_count: 18,
    saves_count: 25,
    comments_count: 5,
    location_name: "Madrid",
    location_lat: 40.4168,
    location_lng: -3.7038,
    clothing_items: ["Blazer negro", "Pantalón de vestir", "Zapatos oxford"],
    user: {
      id: "user2",
      username: "carlos_style",
      full_name: "Carlos Ruiz",
      avatar_url: "https://picsum.photos/100/100?random=11",
    },
    is_liked: true,
    is_saved: false,
  },
  {
    id: "3",
    title: "Weekend Vibes",
    description: "Relaxed outfit for weekend adventures",
    image_url: "https://picsum.photos/400/580?random=3",
    user_id: "user3",
    created_at: "2024-01-13T09:20:00Z",
    likes_count: 31,
    saves_count: 19,
    comments_count: 12,
    location_name: null,
    location_lat: null,
    location_lng: null,
    clothing_items: ["Hoodie gris", "Joggers", "Zapatillas deportivas"],
    user: {
      id: "user3",
      username: "maria_casual",
      full_name: "María López",
      avatar_url: "https://picsum.photos/100/100?random=12",
    },
    is_liked: false,
    is_saved: true,
  },
  {
    id: "4",
    title: "Night Out",
    description: "Elegant look for a special evening",
    image_url: "https://picsum.photos/400/620?random=4",
    user_id: "user4",
    created_at: "2024-01-12T20:15:00Z",
    likes_count: 45,
    saves_count: 33,
    comments_count: 15,
    location_name: "Valencia",
    location_lat: 39.4699,
    location_lng: -0.3763,
    clothing_items: ["Vestido negro", "Tacones", "Clutch"],
    user: {
      id: "user4",
      username: "lucia_elegant",
      full_name: "Lucía Martín",
      avatar_url: "https://picsum.photos/100/100?random=13",
    },
    is_liked: true,
    is_saved: true,
  },
  {
    id: "5",
    title: "Street Style",
    description: "Urban fashion with attitude",
    image_url: "https://picsum.photos/400/590?random=5",
    user_id: "user5",
    created_at: "2024-01-11T14:30:00Z",
    likes_count: 28,
    saves_count: 16,
    comments_count: 9,
    location_name: "Sevilla",
    location_lat: 37.3886,
    location_lng: -5.9823,
    clothing_items: ["Chaqueta de cuero", "Jeans rotos", "Botas"],
    user: {
      id: "user5",
      username: "david_urban",
      full_name: "David Sánchez",
      avatar_url: "https://picsum.photos/100/100?random=14",
    },
    is_liked: false,
    is_saved: false,
  },
  {
    id: "6",
    title: "Boho Chic",
    description: "Free-spirited and artistic style",
    image_url: "https://picsum.photos/400/640?random=6",
    user_id: "user6",
    created_at: "2024-01-10T11:45:00Z",
    likes_count: 22,
    saves_count: 28,
    comments_count: 7,
    location_name: null,
    location_lat: null,
    location_lng: null,
    clothing_items: ["Blusa estampada", "Falda larga", "Sandalias"],
    user: {
      id: "user6",
      username: "sofia_boho",
      full_name: "Sofía Herrera",
      avatar_url: "https://picsum.photos/100/100?random=15",
    },
    is_liked: true,
    is_saved: false,
  },
  {
    id: "7",
    title: "Minimalist Look",
    description: "Less is more - clean and simple",
    image_url: "https://picsum.photos/400/610?random=7",
    user_id: "user7",
    created_at: "2024-01-09T16:20:00Z",
    likes_count: 35,
    saves_count: 41,
    comments_count: 11,
    location_name: "Bilbao",
    location_lat: 43.2627,
    location_lng: -2.9253,
    clothing_items: ["Camiseta básica", "Pantalón recto", "Zapatillas blancas"],
    user: {
      id: "user7",
      username: "alex_minimal",
      full_name: "Alex Torres",
      avatar_url: "https://picsum.photos/100/100?random=16",
    },
    is_liked: false,
    is_saved: true,
  },
  {
    id: "8",
    title: "Vintage Inspired",
    description: "Classic pieces with a modern twist",
    image_url: "https://picsum.photos/400/570?random=8",
    user_id: "user8",
    created_at: "2024-01-08T13:10:00Z",
    likes_count: 19,
    saves_count: 22,
    comments_count: 6,
    location_name: "Granada",
    location_lat: 37.1773,
    location_lng: -3.5986,
    clothing_items: ["Camisa vintage", "Pantalón de pinzas", "Mocasines"],
    user: {
      id: "user8",
      username: "elena_vintage",
      full_name: "Elena Morales",
      avatar_url: "https://picsum.photos/100/100?random=17",
    },
    is_liked: true,
    is_saved: false,
  },
]

interface Outfit {
  id: string
  title: string
  description: string
  image_url: string
  user_id: string
  created_at: string
  likes_count: number
  saves_count: number
  comments_count: number
  location_name: string | null
  location_lat: number | null
  location_lng: number | null
  clothing_items: string[]
  user: {
    id: string
    username: string
    full_name: string
    avatar_url: string
  }
  is_liked: boolean
  is_saved: boolean
}

export default function HomePage() {
  const { user, supabase, loading } = useAuth()
  const [outfits, setOutfits] = useState<Outfit[]>([])
  const [filteredOutfits, setFilteredOutfits] = useState<Outfit[]>([])
  const [activeFilter, setActiveFilter] = useState("Todos")
  const [isLoading, setIsLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    const loadOutfits = async () => {
      if (!mountedRef.current) return

      try {
        setIsLoading(true)

        if (supabase) {
          // Fetch outfits from Supabase
          const { data, error } = await supabase
            .from("outfits")
            .select(`
              *,
              outfit_images (id, image_url, image_order),
              clothing_items (id, name, url),
              profiles (id, username, full_name, avatar_url)
            `)
            .order("created_at", { ascending: false })

          if (error) {
            console.error("Error fetching outfits:", error)
            throw error
          }

          if (mountedRef.current && data) {
            // Transform data to match Outfit interface
            const transformedOutfits = data.map((outfit: any) => ({
              ...outfit,
              user: {
                id: outfit.profiles?.id || "",
                username: outfit.profiles?.username || "",
                full_name: outfit.profiles?.full_name || "",
                avatar_url: outfit.profiles?.avatar_url || "",
              },
              is_liked: false,
              is_saved: false,
            }))

            // Enriquecer con estado real de like/save del usuario actual
            const enriched = await Promise.all(
              transformedOutfits.map(async (o: any) => {
                const [liked, saved] = await Promise.all([
                  isOutfitLiked(o.id),
                  isOutfitSaved(o.id),
                ])
                return { ...o, is_liked: liked, is_saved: saved }
              })
            )

            setOutfits(enriched)
            setFilteredOutfits(enriched)
          }
        }
      } catch (error) {
        console.error("Error loading outfits:", error)
      } finally {
        if (mountedRef.current) {
          setIsLoading(false)
        }
      }
    }

    loadOutfits()
  }, [supabase])

  useEffect(() => {
    if (!mountedRef.current) return

    let filtered = outfits

    // Apply category filter
    if (activeFilter === "Recientes") {
      filtered = [...filtered].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else if (activeFilter === "Con ubicación") {
      filtered = filtered.filter((outfit) => outfit.location_name)
    }

    setFilteredOutfits(filtered)
  }, [activeFilter, outfits])

  const handleLike = async (outfitId: string) => {
    if (!mountedRef.current) return

    console.log('handleLike called for outfit:', outfitId)

    setOutfits((prev) =>
      prev.map((outfit) => {
        if (outfit.id === outfitId) {
          return {
            ...outfit,
            is_liked: !outfit.is_liked,
            likes_count: Math.max(0, outfit.is_liked ? outfit.likes_count - 1 : outfit.likes_count + 1),
          }
        }
        return outfit
      }),
    )

    try {
      console.log('Calling likeOutfit function...')
      const result = await likeOutfit(outfitId)
      console.log('likeOutfit result:', result)
    } catch (error) {
      console.error('Error in handleLike:', error)
      // rollback
      setOutfits((prev) =>
        prev.map((outfit) => {
          if (outfit.id === outfitId) {
            return {
              ...outfit,
              is_liked: !outfit.is_liked,
              likes_count: Math.max(0, !outfit.is_liked ? outfit.likes_count - 1 : outfit.likes_count + 1),
            }
          }
          return outfit
        }),
      )
    }
  }

  const handleSave = async (outfitId: string) => {
    if (!mountedRef.current) return

    console.log('handleSave called for outfit:', outfitId)

    setOutfits((prev) =>
      prev.map((outfit) => {
        if (outfit.id === outfitId) {
          return {
            ...outfit,
            is_saved: !outfit.is_saved,
            saves_count: Math.max(0, outfit.is_saved ? outfit.saves_count - 1 : outfit.saves_count + 1),
          }
        }
        return outfit
      }),
    )

    try {
      console.log('Calling toggleSaveOutfit function...')
      const result = await toggleSaveOutfit(outfitId)
      console.log('toggleSaveOutfit result:', result)
    } catch (error) {
      console.error('Error in handleSave:', error)
      // rollback
      setOutfits((prev) =>
        prev.map((outfit) => {
          if (outfit.id === outfitId) {
            return {
              ...outfit,
              is_saved: !outfit.is_saved,
              saves_count: Math.max(0, !outfit.is_saved ? outfit.saves_count - 1 : outfit.saves_count + 1),
            }
          }
          return outfit
        }),
      )
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Hace unos minutos"
    if (diffInHours < 24) return `Hace ${diffInHours}h`
    if (diffInHours < 168) return `Hace ${Math.floor(diffInHours / 24)}d`
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    })
  }

  const handleUploadSuccess = () => {
    // Refresh the page to show new outfit
    window.location.reload()
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Descubre los últimos looks de nuestra comunidad</h1>
          <p className="text-muted-foreground">
            Inspírate con los outfits más populares y encuentra tu próximo look favorito
          </p>
        </div>


        {/* Filters */}
        <div className="flex justify-center gap-2 mb-8">
          {["Todos", "Recientes", "Con ubicación"].map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(filter)}
              className="flex items-center gap-2"
            >
              {filter === "Todos" && <Filter className="w-4 h-4" />}
              {filter === "Recientes" && <TrendingUp className="w-4 h-4" />}
              {filter === "Con ubicación" && <MapPin className="w-4 h-4" />}
              {filter}
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="w-full h-64" />
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Content */}
        {!isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredOutfits.map((outfit) => (
              <Card
                key={outfit.id}
                className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <Link href={`/outfit/${outfit.id}`}>
                  <div className="relative">
                    <div className="relative w-full aspect-[3/4] overflow-hidden">
                      <Image
                        src={outfit.outfit_images?.[0]?.image_url || outfit.image_url || "/placeholder.svg"}
                        alt={outfit.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=400&width=300&text=Outfit"
                        }}
                      />

                      {/* Location Badge */}
                      {outfit.location_name && (
                        <Badge
                          variant="secondary"
                          className="absolute top-3 left-3 flex items-center gap-1 bg-black/70 text-white border-0 backdrop-blur-sm"
                        >
                          <MapPin className="w-3 h-3" />
                          <span className="text-xs truncate max-w-24">{outfit.location_name}</span>
                        </Badge>
                      )}

                      {/* Interaction Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    </div>
                  </div>
                </Link>

                <CardContent className="p-4">
                  {/* User Info */}
                  <div className="flex items-center gap-3 mb-3">
                    <Link 
                      href={`/profile/${outfit.user.username}`}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={outfit.user.avatar_url || "/placeholder.svg"} alt={outfit.user.full_name} />
                        <AvatarFallback>
                          {outfit.user.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate hover:underline">{outfit.user.full_name}</p>
                        <p className="text-xs text-muted-foreground truncate">@{outfit.user.username}</p>
                      </div>
                    </Link>
                    <span className="text-xs text-muted-foreground">{formatDate(outfit.created_at)}</span>
                  </div>

                  {/* Outfit Info */}
                  <div className="mb-3">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-1">{outfit.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{outfit.description}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          handleLike(outfit.id)
                        }}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Heart className={`w-4 h-4 ${outfit.is_liked ? "fill-red-500 text-red-500" : ""}`} />
                        {outfit.likes_count}
                      </button>

                      <Link
                        href={`/outfit/${outfit.id}#comments`}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        {outfit.comments_count}
                      </Link>
                    </div>

                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        handleSave(outfit.id)
                      }}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Bookmark className={`w-4 h-4 ${outfit.is_saved ? "fill-primary text-primary" : ""}`} />
                    </button>
                  </div>
                </CardContent>
              </Card>
                ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredOutfits.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No se encontraron outfits</h3>
                <p className="text-muted-foreground mb-4">
                  Intenta cambiar los filtros o buscar algo diferente
                </p>
                <Button
                  variant="outline"
                  onClick={() => setActiveFilter("Todos")}
                >
                  Limpiar filtros
                </Button>
              </div>
        )}

        {/* Floating Upload Button */}
        <Button
          onClick={() => setShowUploadModal(true)}
          size="lg"
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 z-50"
        >
          <Plus className="w-6 h-6" />
        </Button>

        {/* Upload Modal */}
        <UploadOutfitModal open={showUploadModal} onOpenChange={setShowUploadModal} onSuccess={handleUploadSuccess} />
      </div>
    </AppLayout>
  )
}
