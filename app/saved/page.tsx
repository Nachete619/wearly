"use client"

import { useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { EmptyState } from "@/components/empty-state"
import { LayersIcon } from "@/components/layers-icon"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bookmark, Search, Filter, Heart, Grid3X3, List, Trash2, Share2 } from "lucide-react"
import { useRouter } from "next/navigation"

// Datos de ejemplo para outfits guardados
const savedOutfits = [
  {
    id: 1,
    user: {
      name: "Sofia Martinez",
      username: "@sofia_style",
      avatar: "/placeholder.svg?height=40&width=40&text=SM",
    },
    image: "/placeholder.svg?height=300&width=200&text=Casual+Friday",
    title: "Look casual para viernes",
    category: "Casual",
    likes: 234,
    savedDate: "2024-01-15",
    tags: ["casual", "oficina", "viernes"],
  },
  {
    id: 2,
    user: {
      name: "Ana Rodriguez",
      username: "@ana_fashion",
      avatar: "/placeholder.svg?height=40&width=40&text=AR",
    },
    image: "/placeholder.svg?height=400&width=200&text=Evening+Dress",
    title: "Elegancia nocturna",
    category: "Elegante",
    likes: 456,
    savedDate: "2024-01-14",
    tags: ["elegante", "noche", "cena"],
  },
  {
    id: 3,
    user: {
      name: "Lucia Fernandez",
      username: "@lucia_trends",
      avatar: "/placeholder.svg?height=40&width=40&text=LF",
    },
    image: "/placeholder.svg?height=250&width=200&text=Street+Style",
    title: "Street style urbano",
    category: "Urbano",
    likes: 189,
    savedDate: "2024-01-13",
    tags: ["urbano", "street", "casual"],
  },
  {
    id: 4,
    user: {
      name: "Carmen Lopez",
      username: "@carmen_chic",
      avatar: "/placeholder.svg?height=40&width=40&text=CL",
    },
    image: "/placeholder.svg?height=350&width=200&text=Boho+Chic",
    title: "Vibes bohemios",
    category: "Bohemio",
    likes: 312,
    savedDate: "2024-01-12",
    tags: ["bohemio", "natural", "artesanal"],
  },
  {
    id: 5,
    user: {
      name: "Maria Gonzalez",
      username: "@maria_minimal",
      avatar: "/placeholder.svg?height=40&width=40&text=MG",
    },
    image: "/placeholder.svg?height=280&width=200&text=Minimal+Look",
    title: "Outfit minimalista",
    category: "Minimalista",
    likes: 278,
    savedDate: "2024-01-11",
    tags: ["minimalista", "limpio", "moderno"],
  },
  {
    id: 6,
    user: {
      name: "Isabella Torres",
      username: "@isa_vintage",
      avatar: "/placeholder.svg?height=40&width=40&text=IT",
    },
    image: "/placeholder.svg?height=320&width=200&text=Vintage+Style",
    title: "Estilo vintage",
    category: "Vintage",
    likes: 345,
    savedDate: "2024-01-10",
    tags: ["vintage", "retro", "clásico"],
  },
]

export default function SavedPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("todos")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedOutfits, setSelectedOutfits] = useState<Set<number>>(new Set())
  const router = useRouter()

  const categories = ["todos", "casual", "elegante", "urbano", "bohemio", "minimalista", "vintage"]

  const filteredOutfits = savedOutfits.filter((outfit) => {
    const matchesSearch = searchQuery
      ? outfit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        outfit.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        outfit.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      : true

    const matchesCategory = selectedCategory === "todos" || outfit.category.toLowerCase() === selectedCategory

    return matchesSearch && matchesCategory
  })

  const toggleOutfitSelection = (outfitId: number) => {
    setSelectedOutfits((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(outfitId)) {
        newSet.delete(outfitId)
      } else {
        newSet.add(outfitId)
      }
      return newSet
    })
  }

  const removeSelected = () => {
    // Aquí iría la lógica para remover los outfits seleccionados
    setSelectedOutfits(new Set())
  }

  if (filteredOutfits.length === 0 && savedOutfits.length === 0) {
    return (
      <AppLayout>
        <div className="px-6 py-6">
          <div className="mb-6 flex items-center gap-3 animate-fade-in-up">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bookmark className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Mis Outfits Guardados</h1>
          </div>

          <EmptyState
            icon={<LayersIcon className="w-20 h-20" />}
            title="No tienes outfits guardados"
            description="Explora y guarda los looks que te inspiren para verlos aquí."
            action={{
              label: "Explorar Outfits",
              onClick: () => router.push("/home"),
            }}
          />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="px-6 py-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bookmark className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Mis Outfits Guardados</h1>
                <p className="text-muted-foreground">
                  {savedOutfits.length} outfit{savedOutfits.length !== 1 ? "s" : ""} guardado
                  {savedOutfits.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="transition-all duration-300 hover:scale-105"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="transition-all duration-300 hover:scale-105"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar en tus outfits guardados..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border focus:border-primary transition-all duration-300"
              />
            </div>
            <Button variant="outline" size="icon" className="hover:bg-primary/10 transition-colors duration-300">
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap transition-all duration-300 hover:scale-105"
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>

          {/* Bulk Actions */}
          {selectedOutfits.size > 0 && (
            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg animate-bounce-in">
              <span className="text-sm font-medium text-primary">
                {selectedOutfits.size} outfit{selectedOutfits.size !== 1 ? "s" : ""} seleccionado
                {selectedOutfits.size !== 1 ? "s" : ""}
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="hover:bg-background">
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartir
                </Button>
                <Button size="sm" variant="destructive" onClick={removeSelected}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {filteredOutfits.length === 0 ? (
          <Card className="p-8 text-center animate-fade-in-up">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No se encontraron resultados</h3>
            <p className="text-muted-foreground mb-4">
              No hay outfits guardados que coincidan con "{searchQuery}" en la categoría "{selectedCategory}"
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("todos")
              }}
            >
              Limpiar filtros
            </Button>
          </Card>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredOutfits.map((outfit, index) => (
                  <Card
                    key={outfit.id}
                    className={`overflow-hidden hover:shadow-lg transition-all duration-500 hover:scale-105 animate-fade-in-up cursor-pointer group ${
                      selectedOutfits.has(outfit.id) ? "ring-2 ring-primary" : ""
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => toggleOutfitSelection(outfit.id)}
                  >
                    <div className="relative">
                      <img
                        src={outfit.outfit_images?.[0]?.image_url || outfit.image || "/placeholder.svg"}
                        alt={outfit.title}
                        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=400&width=300&text=Outfit"
                        }}
                      />
                      <div className="absolute top-2 right-2">
                        <div className="p-1 bg-white/90 rounded-full shadow-lg">
                          <Bookmark className="w-4 h-4 text-primary fill-current" />
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
                    </div>

                    <div className="p-3 space-y-2">
                      <h3 className="font-medium text-foreground text-sm line-clamp-2">{outfit.title}</h3>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={outfit.user.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">{outfit.user.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground truncate">{outfit.user.username}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {outfit.likes}
                        </span>
                        <span>{new Date(outfit.savedDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
              <div className="space-y-4">
                {filteredOutfits.map((outfit, index) => (
                  <Card
                    key={outfit.id}
                    className={`p-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-fade-in-up cursor-pointer ${
                      selectedOutfits.has(outfit.id) ? "ring-2 ring-primary bg-primary/5" : ""
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => toggleOutfitSelection(outfit.id)}
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={outfit.outfit_images?.[0]?.image_url || outfit.image || "/placeholder.svg"}
                        alt={outfit.title}
                        className="w-16 h-16 rounded-lg object-cover hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=100&width=100&text=Outfit"
                        }}
                      />

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground mb-1">{outfit.title}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={outfit.user.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">{outfit.user.name.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">{outfit.user.name}</span>
                        </div>
                        <div className="flex gap-2">
                          {outfit.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                          <Heart className="w-4 h-4" />
                          {outfit.likes}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(outfit.savedDate).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="p-2">
                        <Bookmark className="w-5 h-5 text-primary fill-current" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Load More */}
        {filteredOutfits.length > 0 && (
          <div className="text-center mt-12 animate-fade-in-up">
            <Button
              variant="outline"
              size="lg"
              className="hover:bg-primary/10 hover:border-primary transition-all duration-300 hover:scale-105"
            >
              Cargar más outfits guardados
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
