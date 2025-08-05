import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Users, Camera, MapPin, Sparkles, Shield } from "lucide-react"

export default function AboutPage() {
  return (
    <AppLayout>
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Sobre Wearly</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              La plataforma social donde la moda cobra vida. Comparte tu estilo, descubre tendencias y conecta con una
              comunidad apasionada por la moda.
            </p>
          </div>

          {/* Mission */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Nuestra Misión
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                En Wearly creemos que la moda es una forma de expresión personal y creatividad. Nuestra misión es crear
                un espacio donde cada persona pueda compartir su estilo único, inspirarse con otros y descubrir nuevas
                formas de expresarse a través de la ropa.
              </p>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Comparte tu Estilo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sube fotos de tus outfits favoritos, agrega descripciones detalladas y etiqueta las prendas para que
                  otros puedan encontrar inspiración en tu estilo.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Descubre Tendencias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Explora una feed infinito de looks únicos, dale like a tus favoritos y guarda outfits para inspirarte
                  más tarde.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Conecta con la Comunidad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sigue a tus fashionistas favoritos, comenta en sus publicaciones y construye una red de personas que
                  comparten tu pasión por la moda.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Ubicaciones y Contexto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Agrega ubicaciones a tus outfits para mostrar dónde los usaste y ayudar a otros a encontrar
                  inspiración para ocasiones similares.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Values */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Nuestros Valores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center space-y-2">
                  <Badge variant="secondary" className="text-sm">
                    Inclusividad
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Celebramos todos los estilos, tallas y formas de expresión
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <Badge variant="secondary" className="text-sm">
                    Creatividad
                  </Badge>
                  <p className="text-sm text-muted-foreground">Fomentamos la experimentación y la originalidad</p>
                </div>
                <div className="text-center space-y-2">
                  <Badge variant="secondary" className="text-sm">
                    Comunidad
                  </Badge>
                  <p className="text-sm text-muted-foreground">Construimos conexiones auténticas entre personas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-sm text-muted-foreground">Outfits compartidos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold">5K+</div>
                <div className="text-sm text-muted-foreground">Usuarios activos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold">50K+</div>
                <div className="text-sm text-muted-foreground">Likes dados</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold">100+</div>
                <div className="text-sm text-muted-foreground">Países</div>
              </CardContent>
            </Card>
          </div>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>¿Tienes preguntas?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Estamos aquí para ayudarte. Si tienes alguna pregunta, sugerencia o simplemente quieres saludar, no
                dudes en contactarnos.
              </p>
              <div className="flex flex-wrap gap-4">
                <Badge variant="outline">hello@wearly.com</Badge>
                <Badge variant="outline">@wearly_official</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
