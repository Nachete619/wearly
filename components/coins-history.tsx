"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { History, Coins, Gift, UserPlus, Calendar, Loader2, ChevronDown } from "lucide-react"
import { getCoinsLog, CoinsLogEntry } from "@/lib/coins-actions"
import { toast } from "@/components/ui/use-toast"

interface CoinsHistoryProps {
  limit?: number
}

export function CoinsHistory({ limit = 20 }: CoinsHistoryProps) {
  const [log, setLog] = useState<CoinsLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [currentBalance, setCurrentBalance] = useState(0)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    fetchLog()
  }, [])

  const fetchLog = async (loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true)
      } else {
        setLoading(true)
        setOffset(0)
      }

      const currentOffset = loadMore ? offset : 0
      const result = await getCoinsLog(limit, currentOffset)
      
      if (result.success && result.data) {
        if (loadMore) {
          setLog(prev => [...prev, ...result.data!.log])
        } else {
          setLog(result.data.log)
        }
        setCurrentBalance(result.data.currentBalance)
        setHasMore(result.data.pagination.hasMore)
        setOffset(currentOffset + limit)
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo cargar el historial",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching coins log:', error)
      toast({
        title: "Error",
        description: "Error inesperado al cargar el historial",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case 'registration':
        return <UserPlus className="w-4 h-4 text-green-500" />
      case 'daily_login':
        return <Calendar className="w-4 h-4 text-blue-500" />
      case 'reward_redeemed':
        return <Gift className="w-4 h-4 text-purple-500" />
      default:
        return <Coins className="w-4 h-4 text-yellow-500" />
    }
  }

  const getReasonText = (reason: string) => {
    switch (reason) {
      case 'registration':
        return 'Registro de usuario'
      case 'daily_login':
        return 'Login diario'
      case 'reward_redeemed':
        return 'Recompensa canjeada'
      case 'admin_adjustment':
        return 'Ajuste administrativo'
      default:
        return reason
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Historial de Monedas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Cargando historial...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Historial de Monedas
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Coins className="w-4 h-4" />
          <span>Balance actual: {currentBalance.toLocaleString()} monedas</span>
        </div>
      </CardHeader>
      <CardContent>
        {log.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No hay movimientos de monedas aún</p>
          </div>
        ) : (
          <div className="space-y-3">
            {log.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    {getReasonIcon(entry.reason)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {getReasonText(entry.reason)}
                      </span>
                      {entry.rewards && (
                        <Badge variant="outline" className="text-xs">
                          {entry.rewards.name}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(entry.created_at)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <span
                    className={`font-semibold ${
                      entry.amount > 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {entry.amount > 0 ? '+' : ''}{entry.amount.toLocaleString()}
                  </span>
                  <p className="text-xs text-muted-foreground">monedas</p>
                </div>
              </div>
            ))}
            
            {hasMore && (
              <div className="text-center pt-4">
                <Button
                  onClick={() => fetchLog(true)}
                  disabled={loadingMore}
                  variant="outline"
                  size="sm"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-2" />
                      Cargar más
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
