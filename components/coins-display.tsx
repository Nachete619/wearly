"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Coins, Gift, History } from "lucide-react"
import { getCurrentBalance } from "@/lib/coins-actions"
import { useAuth } from "@/hooks/use-auth"

interface CoinsDisplayProps {
  showDetails?: boolean
  className?: string
}

export function CoinsDisplay({ showDetails = false, className = "" }: CoinsDisplayProps) {
  const { user } = useAuth()
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBalance = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        const result = await getCurrentBalance()
        if (result.success && result.balance !== undefined) {
          setBalance(result.balance)
        }
      } catch (error) {
        console.error('Error fetching balance:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBalance()
  }, [user])

  if (!user) return null

  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
            <Coins className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Monedas</span>
              {loading && <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">
                {loading ? "..." : balance.toLocaleString()}
              </span>
              <Badge variant="secondary" className="text-xs">
                <Coins className="w-3 h-3 mr-1" />
                Coins
              </Badge>
            </div>
          </div>
        </div>
        
        {showDetails && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Gift className="w-4 h-4" />
                <span>Canjea recompensas</span>
              </div>
              <div className="flex items-center gap-1">
                <History className="w-4 h-4" />
                <span>Ver historial</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
