"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { WearlyLogo } from "@/components/wearly-logo"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (user && !loading) {
      router.push("/home")
    }
  }, [user, loading, router])

  const handleSignIn = async () => {
    setIsLoading(true)

    try {
      // Check if we have real Supabase credentials
      const hasRealSupabase =
        process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== "http://localhost:54321"

      if (hasRealSupabase) {
        // Use real Supabase OAuth
        const { supabase } = await import("@/lib/supabase")
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/home`,
          },
        })
        if (error) throw error
      } else {
        // Demo mode - simulate successful login
        console.log("🎭 Demo mode: Simulating successful login...")

        // Simulate loading time
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Store demo user in localStorage
        const demoUser = {
          id: "demo-user-123",
          email: "demo@wearly.com",
          user_metadata: {
            full_name: "Usuario Demo",
            avatar_url: "/placeholder.svg?height=40&width=40",
          },
        }

        localStorage.setItem("demo-user", JSON.stringify(demoUser))

        // Redirect to home
        router.push("/home")
      }
    } catch (error) {
      console.error("Error signing in:", error)
      alert("Error al iniciar sesión. Por favor intenta de nuevo.")
    } finally {
      setIsLoading(false)
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center px-4 transition-colors">
      <div className="max-w-md w-full">
        {/* Back button */}
        <div className="mb-6">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>

        <div className="text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <WearlyLogo size="xl" className="hover:scale-105 transition-transform duration-300" />
          </div>

          {/* Brand */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-primary">Wearly</h1>
          </div>

          {/* Hero */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground">Únete a la Comunidad</h2>
            <p className="text-muted-foreground leading-relaxed">
              Inicia sesión para compartir tus outfits, guardar looks que te inspiren y conectar con otros amantes de la
              moda.
            </p>
          </div>

          {/* Demo Notice */}
          {(!process.env.NEXT_PUBLIC_SUPABASE_URL ||
            process.env.NEXT_PUBLIC_SUPABASE_URL === "http://localhost:54321") && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-sm text-primary">
              <p className="font-medium">🎭 Modo Demo</p>
              <p>Esta es una demostración. Los botones te llevarán directamente a la aplicación.</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-4">
            <Button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                  Iniciando sesión...
                </div>
              ) : (
                "→ Iniciar Sesión con Google"
              )}
            </Button>

            <Button
              onClick={handleSignIn}
              disabled={isLoading}
              variant="outline"
              className="w-full py-3 rounded-xl font-medium border-border hover:bg-accent transition-all duration-200 hover:scale-105"
              size="lg"
            >
              Crear Cuenta Nueva
            </Button>
          </div>

          {/* Benefits */}
          <div className="pt-6 space-y-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Con tu cuenta podrás:</p>
            <ul className="space-y-1 text-left max-w-xs mx-auto">
              <li>• Subir y compartir tus outfits</li>
              <li>• Guardar looks que te inspiren</li>
              <li>• Recibir notificaciones de actividad</li>
              <li>• Seguir a otros usuarios</li>
              <li>• Personalizar tu perfil</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="pt-8 text-xs text-muted-foreground">© 2025 Wearly. Inspirando estilos.</div>
        </div>
      </div>
    </div>
  )
}
