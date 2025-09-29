"use client"

import { useEffect, useState } from "react"

interface Reward {
  id: string
  name: string
  description: string
  cost_coins: number
  is_active: boolean
  created_at: string
}

export function RewardsManagement() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingReward, setEditingReward] = useState<Reward | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cost_coins: 0,
    is_active: true
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchRewards = async () => {
    try {
      setLoading(true)
      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching rewards:', error)
        return
      }

      setRewards(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRewards()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSubmitting(true)
      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      
      if (editingReward) {
        // Actualizar recompensa existente
        const { error } = await supabase
          .from('rewards')
          .update(formData)
          .eq('id', editingReward.id)

        if (error) {
          console.error('Error updating reward:', error)
          alert('Error al actualizar la recompensa')
          return
        }
        alert('Recompensa actualizada correctamente')
      } else {
        // Crear nueva recompensa
        const { error } = await supabase
          .from('rewards')
          .insert([formData])

        if (error) {
          console.error('Error creating reward:', error)
          alert('Error al crear la recompensa')
          return
        }
        alert('Recompensa creada correctamente')
      }

      setShowForm(false)
      setEditingReward(null)
      setFormData({ name: '', description: '', cost_coins: 0, is_active: true })
      fetchRewards()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al procesar la recompensa')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (reward: Reward) => {
    setEditingReward(reward)
    setFormData({
      name: reward.name,
      description: reward.description,
      cost_coins: reward.cost_coins,
      is_active: reward.is_active
    })
    setShowForm(true)
  }

  const handleDelete = async (rewardId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta recompensa?')) {
      return
    }

    try {
      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      
      const { error } = await supabase
        .from('rewards')
        .delete()
        .eq('id', rewardId)

      if (error) {
        console.error('Error deleting reward:', error)
        alert('Error al eliminar la recompensa')
        return
      }

      alert('Recompensa eliminada correctamente')
      fetchRewards()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar la recompensa')
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card p-6 rounded-lg border">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Gestión de Recompensas</h2>
          <button
            onClick={() => {
              setShowForm(true)
              setEditingReward(null)
              setFormData({ name: '', description: '', cost_coins: 0, is_active: true })
            }}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            + Nueva Recompensa
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-xl font-semibold mb-4 text-foreground">
            {editingReward ? 'Editar Recompensa' : 'Nueva Recompensa'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Nombre
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Descripción
              </label>
              <textarea
                required
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Costo en Monedas
              </label>
              <input
                type="number"
                required
                min="1"
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                value={formData.cost_coins}
                onChange={(e) => setFormData({ ...formData, cost_coins: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                className="mr-2"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <label htmlFor="is_active" className="text-sm font-medium text-foreground">
                Recompensa activa
              </label>
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Guardando...' : editingReward ? 'Actualizar' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingReward(null)
                }}
                className="bg-muted text-muted-foreground px-4 py-2 rounded-lg hover:bg-muted/80 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rewards List */}
      <div className="bg-card rounded-lg border">
        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/6"></div>
                </div>
              ))}
            </div>
          ) : rewards.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <p className="text-muted-foreground">No hay recompensas creadas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rewards.map((reward) => (
                <div key={reward.id} className="p-4 border border-border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">{reward.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          reward.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {reward.is_active ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                      <p className="text-muted-foreground mb-2">{reward.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{reward.cost_coins} monedas</span>
                        <span>Creada: {formatDate(reward.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(reward)}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 transition-colors text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(reward.id)}
                        className="bg-red-100 text-red-700 px-3 py-1 rounded-lg hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 transition-colors text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
