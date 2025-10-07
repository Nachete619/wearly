"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { WearlyLogo } from "@/components/wearly-logo"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { supabase } = useAuth()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const code = searchParams.get('code')
        const token = searchParams.get('token')
        const type = searchParams.get('type')
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        console.log('Callback params:', { code, token, type, error, errorDescription })

        if (error) {
          console.error('Auth callback error:', error, errorDescription)
          setStatus('error')
          setMessage(`Error de autenticación: ${errorDescription || error}`)
          return
        }

        if (code) {
          // Intercambiar código por sesión (para OAuth)
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (exchangeError) {
            console.error('Error exchanging code for session:', exchangeError)
            setStatus('error')
            setMessage('Error al confirmar la cuenta. Intenta de nuevo.')
            return
          }

          if (data.user) {
            setStatus('success')
            setMessage('¡Cuenta confirmada exitosamente!')
            
            // Redirigir al home después de 2 segundos
            setTimeout(() => {
              router.push('/home')
            }, 2000)
          } else {
            setStatus('error')
            setMessage('No se pudo confirmar la cuenta.')
          }
        } else if (token && type === 'signup') {
          // Confirmar email con token (para confirmación de email)
          const { data, error: confirmError } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup'
          })
          
          if (confirmError) {
            console.error('Error confirming email:', confirmError)
            
            // Si el token expiró, mostrar mensaje más específico
            if (confirmError.message.includes('expired') || confirmError.message.includes('invalid')) {
              setStatus('error')
              setMessage('El enlace de confirmación ha expirado. Por favor, solicita un nuevo enlace de confirmación.')
            } else {
              setStatus('error')
              setMessage('Error al confirmar la cuenta. Intenta de nuevo.')
            }
            return
          }

          if (data.user) {
            setStatus('success')
            setMessage('¡Cuenta confirmada exitosamente!')
            
            // Redirigir al home después de 2 segundos
            setTimeout(() => {
              router.push('/home')
            }, 2000)
          } else {
            setStatus('error')
            setMessage('No se pudo confirmar la cuenta.')
          }
        } else {
          setStatus('error')
          setMessage('Parámetros de confirmación no encontrados.')
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error)
        setStatus('error')
        setMessage('Error inesperado. Intenta de nuevo.')
      }
    }

    if (supabase) {
      handleAuthCallback()
    }
  }, [searchParams, supabase, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-background/80 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-xl text-center">
          <div className="flex justify-center mb-6">
            <WearlyLogo />
          </div>

          {status === 'loading' && (
            <>
              <div className="flex justify-center mb-6">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-4">
                Confirmando cuenta...
              </h1>
              <p className="text-muted-foreground">
                Por favor espera mientras confirmamos tu cuenta.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex justify-center mb-6">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-4">
                ¡Cuenta Confirmada!
              </h1>
              <p className="text-muted-foreground mb-6">
                {message}
              </p>
              <p className="text-sm text-muted-foreground">
                Serás redirigido automáticamente...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex justify-center mb-6">
                <XCircle className="w-16 h-16 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-4">
                Error de Confirmación
              </h1>
              <p className="text-muted-foreground mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/auth/login')}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg transition-colors"
                >
                  Ir al inicio de sesión
                </button>
                {message.includes('expirado') && (
                  <button
                    onClick={() => router.push('/auth/register')}
                    className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 px-4 py-2 rounded-lg transition-colors"
                  >
                    Registrar nuevamente
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
