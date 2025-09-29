import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { rewardId } = await request.json()

    if (!rewardId) {
      return NextResponse.json({ error: 'ID de recompensa requerido' }, { status: 400 })
    }

    // Obtener información de la recompensa
    const { data: reward, error: rewardError } = await supabase
      .from('rewards')
      .select('*')
      .eq('id', rewardId)
      .eq('is_active', true)
      .single()

    if (rewardError || !reward) {
      return NextResponse.json({ error: 'Recompensa no encontrada' }, { status: 404 })
    }

    // Obtener balance actual del usuario
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('coins')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Error al obtener perfil' }, { status: 500 })
    }

    // Verificar si tiene suficientes monedas
    if (profile.coins < reward.cost_coins) {
      return NextResponse.json({ 
        error: 'Monedas insuficientes',
        required: reward.cost_coins,
        current: profile.coins
      }, { status: 400 })
    }

    // Canjear recompensa (restar monedas)
    const { data: success, error: redeemError } = await supabase
      .rpc('add_coins', {
        user_id_param: user.id,
        amount_param: -reward.cost_coins, // Negativo para restar
        reason_param: 'reward_redeemed',
        reward_id_param: rewardId
      })

    if (redeemError || !success) {
      console.error('Error redeeming reward:', redeemError)
      return NextResponse.json({ error: 'Error al canjear recompensa' }, { status: 500 })
    }

    // Obtener el nuevo balance
    const { data: updatedProfile } = await supabase
      .from('profiles')
      .select('coins')
      .eq('id', user.id)
      .single()

    return NextResponse.json({ 
      success: true, 
      newBalance: updatedProfile?.coins || 0,
      reward: {
        id: reward.id,
        name: reward.name,
        description: reward.description,
        cost_coins: reward.cost_coins
      },
      message: `Recompensa "${reward.name}" canjeada exitosamente`
    })

  } catch (error) {
    console.error('Error in coins/redeem:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
