"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { CoinsDisplay } from "@/components/coins-display"
import { RewardsList } from "@/components/rewards-list"
import { CoinsHistory } from "@/components/coins-history"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Coins, Gift, History, Calendar, Loader2 } from "lucide-react"
import { addCoins, canReceiveDailyCoins } from "@/lib/coins-actions"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"

export default function CoinsPage() {
  const { user } = useAuth()
  const [currentBalance, setCurrentBalance] = useState(0)
  const [canReceiveDaily, setCanReceiveDaily] = useState(false)
  const [claimingDaily, setClaimingDaily] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        setLoading(true)
        
        // Verificar si puede recibir monedas diarias
        const dailyResult = await canReceiveDailyCoins()
        if (dailyResult.success) {
          setCanReceiveDaily(dailyResult.canReceive || false)
        }
      } catch (error) {
        console.error('Error fetching daily coins status:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const handleClaimDaily = async () => {
    if (!user) return

    try {
      setClaimingDaily(true)
      
      const result = await addCoins(10, 'daily_login')
      
      if (result.success) {
        setCurrentBalance(result.newBalance || 0)
        setCanReceiveDaily(false)
        
        toast({
          title: "¡Monedas reclamadas!",
          description: "Has recibido 10 monedas por tu login diario",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudieron reclamar las monedas",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error claiming daily coins:', error)
      toast({
        title: "Error",
        description: "Error inesperado al reclamar monedas",
        variant: "destructive"
      })
    } finally {
      setClaimingDaily(false)
    }
  }

  const handleRewardRedeemed = (newBalance: number) => {
    setCurrentBalance(newBalance)
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="text-center py-12">
            <Coins className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Sistema de Monedas</h1>
            <p className="text-muted-foreground">Inicia sesión para acceder al sistema de monedas</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Coins className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Sistema de Monedas</h1>
              <p className="text-muted-foreground">Gana monedas y canjea recompensas increíbles</p>
            </div>
          </div>
        </div>

        {/* Daily Coins Card */}
        {canReceiveDaily && (
          <Card className="mb-6 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-200">
                      ¡Monedas diarias disponibles!
                    </h3>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Reclama 10 monedas por tu login diario
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleClaimDaily}
                  disabled={claimingDaily}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {claimingDaily ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Reclamando...
                    </>
                  ) : (
                    <>
                      <Coins className="w-4 h-4 mr-2" />
                      Reclamar +10
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Balance Card */}
          <div className="lg:col-span-1">
            <CoinsDisplay showDetails={true} />
          </div>

          {/* Quick Stats */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Cómo ganar monedas?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium">Login diario</p>
                      <p className="text-sm text-muted-foreground">+10 monedas cada día</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Coins className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium">Registro</p>
                      <p className="text-sm text-muted-foreground">+50 monedas al registrarse</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="rewards" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rewards" className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Recompensas
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Historial
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="rewards" className="mt-6">
            <RewardsList onRedeem={handleRewardRedeemed} />
          </TabsContent>
          
          <TabsContent value="history" className="mt-6">
            <CoinsHistory />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
