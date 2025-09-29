import { getBrowserSupabase } from './supabase'

export interface Reward {
  id: string
  name: string
  description: string | null
  cost_coins: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CoinsLogEntry {
  id: string
  amount: number
  reason: string
  created_at: string
  rewards?: {
    id: string
    name: string
    description: string | null
  } | null
}

export interface CoinsLogResponse {
  success: boolean
  log: CoinsLogEntry[]
  currentBalance: number
  pagination: {
    limit: number
    offset: number
    hasMore: boolean
  }
}

// Obtener recompensas disponibles
export async function getRewards(): Promise<{ success: boolean; error?: string; rewards?: Reward[] }> {
  try {
    const response = await fetch('/api/rewards')
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener recompensas')
    }
    
    return { success: true, rewards: data.rewards }
  } catch (error) {
    console.error('Error getting rewards:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Agregar monedas (para login diario, etc.)
export async function addCoins(amount: number, reason: string): Promise<{ success: boolean; error?: string; newBalance?: number }> {
  try {
    const response = await fetch('/api/coins/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, reason }),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al agregar monedas')
    }
    
    return { success: true, newBalance: data.newBalance }
  } catch (error) {
    console.error('Error adding coins:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Canjear recompensa
export async function redeemReward(rewardId: string): Promise<{ success: boolean; error?: string; newBalance?: number; reward?: Reward }> {
  try {
    const response = await fetch('/api/coins/redeem', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rewardId }),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al canjear recompensa')
    }
    
    return { 
      success: true, 
      newBalance: data.newBalance,
      reward: data.reward
    }
  } catch (error) {
    console.error('Error redeeming reward:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Obtener historial de monedas
export async function getCoinsLog(limit: number = 50, offset: number = 0): Promise<{ success: boolean; error?: string; data?: CoinsLogResponse }> {
  try {
    const response = await fetch(`/api/coins/log?limit=${limit}&offset=${offset}`)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener historial')
    }
    
    return { success: true, data }
  } catch (error) {
    console.error('Error getting coins log:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Obtener balance actual del usuario
export async function getCurrentBalance(): Promise<{ success: boolean; error?: string; balance?: number }> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('coins')
      .eq('id', user.id)
      .single()

    if (error) throw error

    return { success: true, balance: profile?.coins || 0 }
  } catch (error) {
    console.error('Error getting current balance:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Verificar si puede recibir monedas de login diario
export async function canReceiveDailyCoins(): Promise<{ success: boolean; error?: string; canReceive?: boolean }> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    const { data: canReceive, error } = await supabase
      .rpc('can_receive_daily_coins', { user_id_param: user.id })

    if (error) throw error

    return { success: true, canReceive: canReceive || false }
  } catch (error) {
    console.error('Error checking daily coins eligibility:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}
