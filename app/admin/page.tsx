"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { useRouter } from "next/navigation"
import { DashboardStats } from "@/components/admin/dashboard-stats"
import { UsersManagement } from "@/components/admin/users-management"
import { RewardsManagement } from "@/components/admin/rewards-management"

export default function AdminPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    const checkAuthAndAdmin = async () => {
      try {
        // Obtener usuario directamente desde Supabase
        const { createClient } = await import('@/lib/supabase')
        const supabase = createClient()
        
        const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !currentUser) {
          router.push('/auth/login')
          return
        }

        setUser(currentUser)

        // Verificar si es admin
        const { data: profile } = await supabase
          .from('profiles')
          .select('tipo_usuario')
          .eq('id', currentUser.id)
          .single()

        if (profile?.tipo_usuario === 'admin') {
          setIsAdmin(true)
        } else {
          router.push('/home')
        }
      } catch (error) {
        console.error('Error:', error)
        router.push('/home')
      } finally {
        setLoading(false)
      }
    }

    checkAuthAndAdmin()
  }, [router])

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Verificando permisos...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h1>
            <p>No tienes permisos de administrador</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Panel de Administración
            </h1>
            <p className="text-lg text-muted-foreground">
              Bienvenido, {user?.email}
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-8 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-background text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'users'
                  ? 'bg-background text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Usuarios
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'rewards'
                  ? 'bg-background text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Recompensas
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <DashboardStats />
            </div>
          )}

          {activeTab === 'users' && (
            <UsersManagement />
          )}

          {activeTab === 'rewards' && (
            <RewardsManagement />
          )}
        </div>
      </div>
    </AppLayout>
  )
}