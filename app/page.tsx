"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/use-auth"
import { WearlyLogo } from "@/components/wearly-logo"
import { Search, ArrowRight, Sparkles, Heart, Camera, TrendingUp } from "lucide-react"
import Link from "next/link"

// Datos de ejemplo para las imágenes de outfits con imágenes reales
const sampleOutfits = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop",
    title: "Look casual de verano",
    category: "Casual",
    likes: 234,
    saves: 89,
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=650&fit=crop",
    title: "Outfit elegante oficina",
    category: "Elegante",
    likes: 456,
    saves: 123,
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1445205170230-e382a71b7160?w=400&h=500&fit=crop",
    title: "Estilo urbano",
    category: "Urbano",
    likes: 189,
    saves: 67,
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=650&fit=crop",
    title: "Look bohemio chic",
    category: "Bohemio",
    likes: 312,
    saves: 145,
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=550&fit=crop",
    title: "Outfit minimalista",
    category: "Minimalista",
    likes: 278,
    saves: 98,
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=400&h=600&fit=crop",
    title: "Estilo vintage",
    category: "Vintage",
    likes: 345,
    saves: 156,
  },
  {
    id: 7,
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=650&fit=crop",
    title: "Look deportivo chic",
    category: "Deportivo",
    likes: 423,
    saves: 189,
  },
  {
    id: 8,
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=500&fit=crop",
    title: "Outfit romántico",
    category: "Romántico",
    likes: 567,
    saves: 234,
  },
]

const heroTexts = [
  "tu próxima idea de outfit de verano",
  "inspiración para tu look de trabajo",
  "el estilo perfecto para tu cita",
  "outfits cómodos para el día a día",
]

const floatingElements = [
  { icon: Heart, delay: 0, position: "top-1/4 left-1/4" },
  { icon: Camera, delay: 1000, position: "top-1/3 right-1/4" },
  { icon: Sparkles, delay: 2000, position: "bottom-1/3 left-1/3" },
  { icon: TrendingUp, delay: 3000, position: "bottom-1/4 right-1/3" },
]

export default function LandingPage() {
  const [currentHeroText, setCurrentHeroText] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (user && !loading) {
      router.push("/home")
    }
  }, [user, loading, router])

  // Cambiar texto del hero cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroText((prev) => (prev + 1) % heroTexts.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  // Mouse tracking para efectos parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const handleGetStarted = async () => {
    setIsLoading(true)
    // Redirect to register page
    router.push("/auth/register")
    setIsLoading(false)
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/home?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <WearlyLogo size="lg" className="animate-pulse" />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {floatingElements.map((element, index) => {
          const Icon = element.icon
          return (
            <div
              key={index}
              className={`absolute ${element.position} animate-float opacity-10`}
              style={{
                animationDelay: `${element.delay}ms`,
                transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
              }}
            >
              <Icon className="w-16 h-16 text-primary" />
            </div>
          )
        })}
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border transition-all duration-300 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <WearlyLogo size="md" showText className="hover:scale-105 transition-transform duration-300" />
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/home"
                className="text-muted-foreground hover:text-primary font-medium transition-all duration-300 hover:scale-105"
              >
                Explorar
              </Link>
              <Link
                href="/trends"
                className="text-muted-foreground hover:text-primary font-medium transition-all duration-300 hover:scale-105"
              >
                Tendencias
              </Link>
              <Link
                href="/about"
                className="text-muted-foreground hover:text-primary font-medium transition-all duration-300 hover:scale-105"
              >
                Información
              </Link>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => router.push("/auth/login")}
              variant="ghost"
              className="text-muted-foreground hover:text-foreground font-medium transition-all duration-300 hover:scale-105"
            >
              Iniciar sesión
            </Button>
            <Button
              onClick={() => router.push("/auth/register")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Registrarse
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-16 px-4 min-h-[80vh] flex items-center">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Main Title */}
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight animate-fade-in-up">
            Descubrí{" "}
            <span className="transition-all duration-500 ease-in-out inline-block text-primary animate-gradient-text">
              {heroTexts[currentHeroText]}
            </span>
          </h1>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mb-12 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            {heroTexts.map((_, index) => (
              <button
                key={index}
                className={`h-2 rounded-full transition-all duration-300 hover:scale-125 ${
                  index === currentHeroText ? "bg-primary w-6" : "bg-muted-foreground/30 w-2"
                }`}
                onClick={() => setCurrentHeroText(index)}
              />
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-primary/50 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Outfit Grid Section */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Inspiración <span className="text-primary">Infinita</span>
            </h2>
            <p className="text-xl text-muted-foreground">Descubre outfits únicos de nuestra comunidad</p>
          </div>

          {/* Masonry Grid */}
          <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
            {sampleOutfits.map((outfit, index) => (
              <div
                key={outfit.id}
                className="break-inside-avoid mb-4 group cursor-pointer animate-fade-in-up hover-lift"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-500 transform hover:scale-105">
                  <img
                    src={outfit.image || "/placeholder.svg"}
                    alt={outfit.title}
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                    <p className="text-white text-sm font-medium mb-1">{outfit.title}</p>
                    <div className="flex items-center justify-between text-white/80 text-xs">
                      <span>{outfit.category}</span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {outfit.likes}
                        </span>
                        <span>{outfit.saves} guardados</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Search Demo */}
            <div className="relative animate-fade-in-left">
              <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-border">
                <div className="relative mb-6">
                  <div className="absolute -top-4 -left-4 w-32 h-32 bg-primary/20 rounded-full opacity-80 animate-pulse" />
                  <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/10 rounded-full opacity-60 animate-pulse" />
                  <div className="relative bg-background rounded-full p-4 shadow-lg border border-border">
                    <div className="flex items-center gap-3">
                      <Search className="w-5 h-5 text-primary animate-pulse" />
                      <span className="text-muted-foreground font-medium">outfit casual para trabajo</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted rounded-xl h-32 animate-pulse" />
                  <div className="bg-muted rounded-xl h-32 animate-pulse" style={{ animationDelay: "200ms" }} />
                  <div className="bg-muted rounded-xl h-24 animate-pulse" style={{ animationDelay: "400ms" }} />
                  <div className="bg-muted rounded-xl h-24 animate-pulse" style={{ animationDelay: "600ms" }} />
                </div>
              </div>
            </div>

            {/* Right side - Content */}
            <div className="space-y-6 animate-fade-in-right">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">
                Busca una <span className="text-primary animate-gradient-text">idea</span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                ¿Qué querés probar ahora? Pensá en algo que te guste, como "outfit casual para trabajo", y mirá lo que
                encontrarás.
              </p>

              {/* Search Bar */}
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Buscar ideas de outfits..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 py-3 text-lg border-2 border-border rounded-full focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Explorar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            ¿Listo para mostrar tu <span className="text-primary animate-gradient-text">Estilo</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Únete a miles de usuarios que ya están compartiendo su pasión por la moda en Wearly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={handleGetStarted}
              disabled={isLoading}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-medium rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl animate-pulse-glow"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
                  Cargando...
                </div>
              ) : (
                <>
                  Comenzar Ahora
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>

            <Button
              onClick={() => router.push("/home")}
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg font-medium border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 rounded-full transition-all duration-300 hover:scale-105"
            >
              Ver Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="animate-fade-in-up">
              <WearlyLogo size="md" showText className="mb-4 hover:scale-105 transition-transform duration-300" />
              <p className="text-muted-foreground text-sm">
                La plataforma donde la moda cobra vida. Descubre, comparte y conecta con tu estilo.
              </p>
            </div>

            {[
              {
                title: "Explorar",
                links: [
                  { name: "Tendencias", href: "/trends" },
                  { name: "Outfits", href: "/home" },
                  { name: "Categorías", href: "/categories" },
                ],
              },
              {
                title: "Comunidad",
                links: [
                  { name: "Acerca de", href: "/about" },
                  { name: "Contacto", href: "/contact" },
                  { name: "Ayuda", href: "/help" },
                ],
              },
              {
                title: "Legal",
                links: [
                  { name: "Términos", href: "/terms" },
                  { name: "Privacidad", href: "/privacy" },
                  { name: "Cookies", href: "/cookies" },
                ],
              },
            ].map((section, index) => (
              <div key={section.title} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <h3 className="font-semibold text-foreground mb-3">{section.title}</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="hover:text-primary transition-colors duration-300 hover:translate-x-1 inline-block"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground animate-fade-in-up">
            © 2025 Wearly. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
