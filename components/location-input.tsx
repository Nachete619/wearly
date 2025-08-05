"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Loader2, X } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { getCurrentLocation, type LocationData } from "@/lib/location-utils"

interface LocationInputProps {
  value: LocationData | null
  onChange: (location: LocationData | null) => void
  disabled?: boolean
}

export function LocationInput({ value, onChange, disabled }: LocationInputProps) {
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [manualInput, setManualInput] = useState({
    name: "",
    lat: "",
    lng: "",
  })

  const handleGetCurrentLocation = async () => {
    setIsGettingLocation(true)
    try {
      const location = await getCurrentLocation()
      onChange(location)
      toast({
        title: "Ubicación obtenida",
        description: "Se ha obtenido tu ubicación actual",
      })
    } catch (error) {
      console.error("Error getting location:", error)
      toast({
        title: "Error",
        description: "No se pudo obtener la ubicación. Verifica los permisos.",
        variant: "destructive",
      })
    } finally {
      setIsGettingLocation(false)
    }
  }

  const handleManualSubmit = () => {
    const lat = Number.parseFloat(manualInput.lat)
    const lng = Number.parseFloat(manualInput.lng)

    if (isNaN(lat) || isNaN(lng)) {
      toast({
        title: "Error",
        description: "Por favor ingresa coordenadas válidas",
        variant: "destructive",
      })
      return
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast({
        title: "Error",
        description: "Las coordenadas están fuera del rango válido",
        variant: "destructive",
      })
      return
    }

    onChange({
      name: manualInput.name || `${lat}, ${lng}`,
      lat,
      lng,
    })

    setManualInput({ name: "", lat: "", lng: "" })
  }

  const handleClear = () => {
    onChange(null)
  }

  return (
    <div className="space-y-4">
      <Label>Ubicación (opcional)</Label>

      {value ? (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">{value.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClear} disabled={disabled}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleGetCurrentLocation}
            disabled={disabled || isGettingLocation}
            className="w-full bg-transparent"
          >
            {isGettingLocation ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4 mr-2" />
            )}
            {isGettingLocation ? "Obteniendo ubicación..." : "Usar mi ubicación actual"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">o</div>

          <div className="space-y-3">
            <Input
              placeholder="Nombre del lugar (opcional)"
              value={manualInput.name}
              onChange={(e) => setManualInput((prev) => ({ ...prev, name: e.target.value }))}
              disabled={disabled}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Latitud"
                value={manualInput.lat}
                onChange={(e) => setManualInput((prev) => ({ ...prev, lat: e.target.value }))}
                disabled={disabled}
                type="number"
                step="any"
              />
              <Input
                placeholder="Longitud"
                value={manualInput.lng}
                onChange={(e) => setManualInput((prev) => ({ ...prev, lng: e.target.value }))}
                disabled={disabled}
                type="number"
                step="any"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleManualSubmit}
              disabled={disabled || !manualInput.lat || !manualInput.lng}
              className="w-full bg-transparent"
            >
              Agregar ubicación manual
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
