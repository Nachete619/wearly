"use client"

import { useEffect, useState } from "react"

interface User {
  id: string
  username: string
  full_name: string
  avatar_url: string
  tipo_usuario: string
  is_active: boolean
  outfits_count: number
  followers_count: number
  created_at: string
}

export function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      
      console.log('Fetching users with search term:', searchTerm)
      
      // Primero intentar obtener todos los campos disponibles
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (searchTerm) {
        query = query.or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching users:', error)
        alert('Error al cargar usuarios: ' + error.message)
        return
      }

      console.log('Users fetched:', data)
      
      // Mapear los datos para asegurar que todos los campos existan
      const mappedUsers = (data || []).map(user => ({
        id: user.id,
        username: user.username || 'Sin username',
        full_name: user.full_name || 'Sin nombre',
        avatar_url: user.avatar_url || null,
        tipo_usuario: user.tipo_usuario || 'usuario',
        is_active: user.is_active !== undefined ? user.is_active !== false : true, // Default to true if column doesn't exist
        outfits_count: user.outfits_count || 0,
        followers_count: user.followers_count || 0,
        created_at: user.created_at || new Date().toISOString()
      }))

      setUsers(mappedUsers)
    } catch (error) {
      console.error('Error:', error)
      alert('Error al cargar usuarios: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers()
    }, 300) // Debounce de 300ms para evitar muchas consultas

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      setUpdatingUserId(userId)
      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      
      console.log('Updating user status:', userId, 'from', currentStatus, 'to', !currentStatus)
      
      // Primero verificar si la columna is_active existe
      const { data: columnCheck, error: columnError } = await supabase
        .from('profiles')
        .select('is_active')
        .eq('id', userId)
        .limit(1)

      if (columnError && columnError.message.includes('column "is_active" does not exist')) {
        alert('La columna is_active no existe en la base de datos. Ejecuta el script add-is-active-column.sql primero.')
        return
      }

      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', userId)

      if (error) {
        console.error('Error updating user:', error)
        alert('Error al actualizar el usuario: ' + error.message)
        return
      }

      // Actualizar estado local
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, is_active: !currentStatus } : u
      ))

      alert(`Usuario ${!currentStatus ? 'activado' : 'desactivado'} correctamente`)
    } catch (error) {
      console.error('Error:', error)
      alert('Error al actualizar el usuario: ' + (error as Error).message)
    } finally {
      setUpdatingUserId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="bg-card rounded-lg border">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-foreground">Gestión de Usuarios</h2>
          <div className="flex items-center gap-4">
            {!loading && (
              <span className="text-sm text-muted-foreground">
                {users.length} usuario{users.length !== 1 ? 's' : ''} encontrado{users.length !== 1 ? 's' : ''}
              </span>
            )}
            <button
              onClick={() => fetchUsers()}
              disabled={loading}
              className="text-sm text-primary hover:underline disabled:opacity-50"
            >
              Recargar
            </button>
          </div>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar usuarios por nombre o username..."
            className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="w-12 h-12 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/4"></div>
                  <div className="h-3 bg-muted rounded w-1/6"></div>
                </div>
                <div className="h-8 bg-muted rounded w-20"></div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-muted-foreground">
              {searchTerm ? `No se encontraron usuarios que coincidan con "${searchTerm}"` : "No hay usuarios registrados"}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-2 text-sm text-primary hover:underline"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <span className="text-lg font-semibold text-muted-foreground">
                        {user.full_name?.charAt(0) || user.username?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{user.full_name || 'Sin nombre'}</h3>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.tipo_usuario === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        user.tipo_usuario === 'empresa' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {user.tipo_usuario}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {user.outfits_count} outfits • {user.followers_count} seguidores
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Registrado: {formatDate(user.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    user.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {user.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                  <button
                    onClick={() => toggleUserStatus(user.id, user.is_active)}
                    disabled={updatingUserId === user.id}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      user.is_active
                        ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800'
                        : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800'
                    } disabled:opacity-50`}
                  >
                    {updatingUserId === user.id ? '...' : user.is_active ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
