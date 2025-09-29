"use client"

import { useEffect, useState } from "react"

interface Stats {
  totalUsers: number
  newUsersToday: number
  totalOutfits: number
  newOutfitsToday: number
  totalProducts: number
  newProductsToday: number
  totalRewards: number
  activeRewards: number
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { createClient } = await import('@/lib/supabase')
        const supabase = createClient()
        
        const today = new Date().toISOString().split('T')[0]

        // Obtener estadísticas
        const [
          { count: totalUsers },
          { count: newUsersToday },
          { count: totalOutfits },
          { count: newOutfitsToday },
          { count: totalProducts },
          { count: newProductsToday },
          { count: totalRewards },
          { count: activeRewards }
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', today),
          supabase.from('outfits').select('*', { count: 'exact', head: true }),
          supabase.from('outfits').select('*', { count: 'exact', head: true }).gte('created_at', today),
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('products').select('*', { count: 'exact', head: true }).gte('created_at', today),
          supabase.from('rewards').select('*', { count: 'exact', head: true }),
          supabase.from('rewards').select('*', { count: 'exact', head: true }).eq('is_active', true)
        ])

        setStats({
          totalUsers: totalUsers || 0,
          newUsersToday: newUsersToday || 0,
          totalOutfits: totalOutfits || 0,
          newOutfitsToday: newOutfitsToday || 0,
          totalProducts: totalProducts || 0,
          newProductsToday: newProductsToday || 0,
          totalRewards: totalRewards || 0,
          activeRewards: activeRewards || 0
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card p-6 rounded-lg border animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-muted rounded w-1/3"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <div className="bg-card p-6 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Usuarios</p>
            <p className="text-3xl font-bold text-primary">{stats?.totalUsers || 0}</p>
            <p className="text-sm text-green-600">+{stats?.newUsersToday || 0} hoy</p>
          </div>
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Outfits</p>
            <p className="text-3xl font-bold text-primary">{stats?.totalOutfits || 0}</p>
            <p className="text-sm text-green-600">+{stats?.newOutfitsToday || 0} hoy</p>
          </div>
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Productos</p>
            <p className="text-3xl font-bold text-primary">{stats?.totalProducts || 0}</p>
            <p className="text-sm text-green-600">+{stats?.newProductsToday || 0} hoy</p>
          </div>
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Recompensas</p>
            <p className="text-3xl font-bold text-primary">{stats?.totalRewards || 0}</p>
            <p className="text-sm text-blue-600">{stats?.activeRewards || 0} activas</p>
          </div>
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
