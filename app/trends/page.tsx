"use client"

import type React from "react"

import { useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, FlameIcon as Fire, Star, ArrowRight, Users, Heart, MoreHorizontal } from "lucide-react"

// Datos expandidos para tendencias estilo Pinterest con imágenes reales
const trendingStylesGrid = [
  {
    id: 1,
    name: "Cottagecore Aesthetic",
    description: "Estilo romántico inspirado en la vida rural",
    image: "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=400&h=600&fit=crop",
    growth: "+45%",
    followers: "12.5K",
    posts: "2.3K",
    tags: ["romántico", "natural", "vintage"],
    color: "from-green-400 to-emerald-600",
    user: "Estilo Cottagecore",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: 2,
    name: "Dark Academia",
    description: "Elegancia académica con toques góticos",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=650&fit=crop",
    growth: "+38%",
    followers: "18.2K",
    posts: "3.1K",
    tags: ["elegante", "académico", "clásico"],
    color: "from-gray-700 to-gray-900",
    user: "Academia Oscura",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: 3,
    name: "Y2K Revival",
    description: "Nostalgia de los 2000 con un toque moderno",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=550&fit=crop",
    growth: "+52%",
    followers: "25.8K",
    posts: "4.7K",
    tags: ["retro", "colorido", "futurista"],
    color: "from-purple-500 to-pink-500",
    user: "Y2K Vibes",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: 4,
    name: "Minimalist Chic",
    description: "Menos es más: elegancia en la simplicidad",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=600&fit=crop",
    growth: "+29%",
    followers: "31.4K",
    posts: "5.2K",
    tags: ["minimalista", "limpio", "moderno"],
    color: "from-gray-400 to-gray-600",
    user: "Minimal Style",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: 5,
    name: "Grunge Revival",
    description: "Los 90s están de vuelta con actitud",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=620&fit=crop",
    growth: "+41%",
    followers: "19.7K",
    posts: "3.8K",
    tags: ["grunge", "90s", "alternativo"],
    color: "from-gray-800 to-black",
    user: "Grunge Queen",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: 6,
    name: "Soft Girl Aesthetic",
    description: "Dulzura y feminidad en cada look",
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop",
    growth: "+33%",
    followers: "22.1K",
    posts: "4.2K",
    tags: ["soft", "femenino", "pastel"],
    color: "from-pink-300 to-rose-400",
    user: "Soft Vibes",
    avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: 7,
    name: "Streetwear Luxury",
    description: "Cuando el street style se encuentra con el lujo",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=650&fit=crop",
    growth: "+47%",
    followers: "28.3K",
    posts: "5.1K",
    tags: ["streetwear", "luxury", "urbano"],
    color: "from-yellow-400 to-orange-500",
    user: "Street Luxury",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: 8,
    name: "Coastal Grandmother",
    description: "Elegancia relajada inspirada en la costa",
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=580&fit=crop",
    growth: "+36%",
    followers: "16.8K",
    posts: "2.9K",
    tags: ["coastal", "relajado", "elegante"],
    color: "from-blue-300 to-teal-400",
    user: "Coastal Style",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: 9,
    name: "Goblincore",
    description: "Estética inspirada en la naturaleza y lo místico",
    image: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=400&h=600&fit=crop",
    growth: "+28%",
    followers: "14.2K",
    posts: "2.1K",
    tags: ["místico", "natural", "alternativo"],
    color: "from-green-600 to-brown-500",
    user: "Mystic Nature",
    avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: 10,
    name: "Coquette Style",
    description: "Feminidad vintage con toques románticos",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=650&fit=crop",
    growth: "+44%",
    followers: "21.5K",
    posts: "3.7K",
    tags: ["coquette", "vintage", "romántico"],
    color: "from-pink-400 to-red-400",
    user: "Coquette Dreams",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: 11,
    name: "Indie Sleaze",
    description: "Estética indie de los 2000s con actitud rebelde",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=580&fit=crop",
    growth: "+39%",
    followers: "17.9K",
    posts: "3.3K",
    tags: ["indie", "2000s", "rebelde"],
    color: "from-purple-600 to-indigo-700",
    user: "Indie Rebel",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: 12,
    name: "Clean Girl",
    description: "Belleza natural y minimalista",
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=520&fit=crop",
    growth: "+31%",
    followers: "24.7K",
    posts: "4.5K",
    tags: ["natural", "minimalista", "fresh"],
    color: "from-green-300 to-blue-300",
    user: "Clean Beauty",
    avatar: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=150&h=150&fit=crop&crop=face",
  },
]

const weeklyTrends = [
  { name: "Blazers Oversized", posts: "1.2K", growth: "+23%" },
  { name: "Mom Jeans", posts: "2.8K", growth: "+18%" },
  { name: "Crop Tops", posts: "3.5K", growth: "+31%" },
  { name: "Sneakers Chunky", posts: "1.9K", growth: "+27%" },
  { name: "Vestidos Midi", posts: "2.1K", growth: "+15%" },
]

const colorTrends = [
  { name: "Sage Green", hex: "#9CAF88", popularity: 85 },
  { name: "Lavender", hex: "#E6E6FA", popularity: 72 },
  { name: "Terracotta", hex: "#E2725B", popularity: 68 },
  { name: "Cream", hex: "#F5F5DC", popularity: 91 },
  { name: "Navy Blue", hex: "#000080", popularity: 76 },
]

export default function TrendsPage() {
  const [selectedCategory, setSelectedCategory] = useState("estilos")
  const [hoveredStyle, setHoveredStyle] = useState<number | null>(null)
  const [savedStyles, setSavedStyles] = useState<Set<number>>(new Set())

  const handleSaveStyle = (styleId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setSavedStyles((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(styleId)) {
        newSet.delete(styleId)
      } else {
        newSet.add(styleId)
      }
      return newSet
    })
  }

  return (
    <AppLayout>
      <div className="px-6 py-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Tendencias</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Descubre los estilos más populares y las tendencias emergentes en moda
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: "estilos", name: "Estilos", icon: Star },
              { id: "prendas", name: "Prendas", icon: Fire },
              { id: "colores", name: "Colores", icon: TrendingUp },
            ].map((category) => {
              const Icon = category.icon
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="whitespace-nowrap transition-all duration-300 hover:scale-105"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {category.name}
                </Button>
              )
            })}
          </div>
        </div>

        {/* Trending Styles - Pinterest Masonry */}
        {selectedCategory === "estilos" && (
          <div className="space-y-8">
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
              {trendingStylesGrid.map((style, index) => (
                <div
                  key={style.id}
                  className="break-inside-avoid mb-4 group cursor-pointer animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onMouseEnter={() => setHoveredStyle(style.id)}
                  onMouseLeave={() => setHoveredStyle(null)}
                >
                  <div className="relative bg-card rounded-2xl overflow-hidden border border-border hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
                    {/* Image */}
                    <div className="relative overflow-hidden">
                      <img
                        src={style.image || "/placeholder.svg"}
                        alt={style.name}
                        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />

                      {/* Growth Badge */}
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-white/90 text-green-600 font-semibold shadow-lg">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {style.growth}
                        </Badge>
                      </div>

                      {/* Save Button - Pinterest Style */}
                      <div
                        className={`absolute top-3 left-3 transition-all duration-300 ${
                          hoveredStyle === style.id ? "opacity-100 scale-100" : "opacity-0 scale-75"
                        }`}
                      >
                        <Button
                          size="sm"
                          onClick={(e) => handleSaveStyle(style.id, e)}
                          className={`rounded-full font-medium transition-all duration-300 hover:scale-110 shadow-lg ${
                            savedStyles.has(style.id)
                              ? "bg-primary text-primary-foreground"
                              : "bg-background/90 text-foreground hover:bg-primary hover:text-primary-foreground"
                          }`}
                        >
                          {savedStyles.has(style.id) ? "Guardado" : "Guardar"}
                        </Button>
                      </div>

                      {/* More Options */}
                      <div
                        className={`absolute bottom-3 right-3 transition-all duration-300 ${
                          hoveredStyle === style.id ? "opacity-100 scale-100" : "opacity-0 scale-75"
                        }`}
                      >
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-full bg-background/90 text-foreground hover:bg-background w-8 h-8 p-0"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Gradient Overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-t ${style.color} opacity-40`} />

                      {/* Style Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <h3 className="text-white text-lg font-bold mb-1">{style.name}</h3>
                        <p className="text-white/90 text-sm line-clamp-2">{style.description}</p>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="p-4 space-y-3">
                      {/* User Info */}
                      <div className="flex items-center gap-2">
                        <img
                          src={style.avatar || "/placeholder.svg"}
                          alt={style.user}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm font-medium text-foreground">{style.user}</span>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {style.followers}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {style.posts}
                          </span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex gap-2 flex-wrap">
                        {style.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Action Button */}
                      <Button className="w-full group-hover:bg-primary/90 transition-colors duration-300">
                        Explorar estilo
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weekly Trends */}
        {selectedCategory === "prendas" && (
          <div className="space-y-6">
            <div className="animate-fade-in-up">
              <h2 className="text-2xl font-bold text-foreground mb-4">Prendas de la Semana</h2>
              <p className="text-muted-foreground mb-6">Las piezas más buscadas y compartidas esta semana</p>
            </div>

            <div className="grid gap-4">
              {weeklyTrends.map((trend, index) => (
                <Card
                  key={trend.name}
                  className="p-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] animate-fade-in-up border-border"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Fire className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{trend.name}</h3>
                        <p className="text-sm text-muted-foreground">{trend.posts} posts esta semana</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-100 text-green-700 mb-2">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {trend.growth}
                      </Badge>
                      <Button variant="ghost" size="sm" className="hover:text-primary transition-colors">
                        Ver más
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Color Trends */}
        {selectedCategory === "colores" && (
          <div className="space-y-6">
            <div className="animate-fade-in-up">
              <h2 className="text-2xl font-bold text-foreground mb-4">Paleta de Tendencias</h2>
              <p className="text-muted-foreground mb-6">Los colores más populares en outfits esta temporada</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {colorTrends.map((color, index) => (
                <Card
                  key={color.name}
                  className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in-up border-border"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 rounded-full mx-auto shadow-lg" style={{ backgroundColor: color.hex }} />
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">{color.name}</h3>
                      <p className="text-sm text-muted-foreground">{color.hex}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Popularidad</span>
                        <span className="font-medium">{color.popularity}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${color.popularity}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 text-center animate-fade-in-up">
          <Card className="p-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-4">¿Quieres crear la próxima tendencia?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Comparte tus outfits únicos y ayuda a inspirar a miles de usuarios en nuestra comunidad
            </p>
            <Button size="lg" className="hover:scale-105 transition-transform duration-300">
              Subir mi outfit
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
