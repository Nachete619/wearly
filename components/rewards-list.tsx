"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gift, Coins, Loader2 } from "lucide-react"
import { getRewards, redeemReward, getCurrentBalance, Reward } from "@/lib/coins-actions"
import { toast } from "@/components/ui/use-toast"

interface RewardsListProps {
  onRedeem?: (newBalance: number) => void
}

export function RewardsList({ onRedeem }: RewardsListProps) {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState<string | null>(null)
  const [currentBalance, setCurrentBalance] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Obtener recompensas y balance en paralelo
        const [rewardsResult, balanceResult] = await Promise.all([
          getRewards(),
          getCurrentBalance()
        ])

        if (rewardsResult.success && rewardsResult.rewards) {
          setRewards(rewardsResult.rewards)
        }

        if (balanceResult.success && balanceResult.balance !== undefined) {
          setCurrentBalance(balanceResult.balance)
        }
      } catch (error) {
        console.error('Error fetching rewards:', error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las recompensas",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleRedeem = async (reward: Reward) => {
    if (currentBalance < reward.cost_coins) {
      toast({
        title: "Monedas insuficientes",
        description: `Necesitas ${reward.cost_coins} monedas para canjear esta recompensa`,
        variant: "destructive"
      })
      return
    }

    try {
      setRedeeming(reward.id)
      
      const result = await redeemReward(reward.id)
      
      if (result.success) {
        setCurrentBalance(result.newBalance || 0)
        onRedeem?.(result.newBalance || 0)
        
        toast({
          title: "¡Recompensa canjeada!",
          description: `Has canjeado "${reward.name}" exitosamente`,
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo canjear la recompensa",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error redeeming reward:', error)
      toast({
        title: "Error",
        description: "Error inesperado al canjear la recompensa",
        variant: "destructive"
      })
    } finally {
      setRedeeming(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Recompensas Disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Cargando recompensas...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (rewards.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Recompensas Disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No hay recompensas disponibles en este momento</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5" />
          Recompensas Disponibles
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Coins className="w-4 h-4" />
          <span>Tu balance: {currentBalance.toLocaleString()} monedas</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rewards.map((reward) => {
            const canAfford = currentBalance >= reward.cost_coins
            const isRedeeming = redeeming === reward.id

            return (
              <div
                key={reward.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{reward.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      <Coins className="w-3 h-3 mr-1" />
                      {reward.cost_coins.toLocaleString()}
                    </Badge>
                  </div>
                  {reward.description && (
                    <p className="text-sm text-muted-foreground">{reward.description}</p>
                  )}
                </div>
                
                <Button
                  onClick={() => handleRedeem(reward)}
                  disabled={!canAfford || isRedeeming}
                  variant={canAfford ? "default" : "outline"}
                  size="sm"
                  className="ml-4"
                >
                  {isRedeeming ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Canjeando...
                    </>
                  ) : canAfford ? (
                    "Canjear"
                  ) : (
                    "Insuficiente"
                  )}
                </Button>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
