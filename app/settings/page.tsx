"use client"

import { useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Save } from "lucide-react"

export default function SettingsPage() {
  const [username, setUsername] = useState("TuNombreDeUsuario")
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveUsername = async () => {
    setIsSaving(true)
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  return (
    <AppLayout>
      <div className="px-6 py-6">
        <div className="max-w-2xl mx-auto space-y-8">
          <h1 className="text-2xl font-bold text-gray-900">Configuración de la Cuenta</h1>

          {/* Username Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-blue-500" />
                Nombre de Usuario
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nuevo nombre de usuario</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} maxLength={30} />
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span></span>
                  <span>{username.length}/30</span>
                </div>
              </div>

              <Button onClick={handleSaveUsername} disabled={isSaving} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                {isSaving ? "Guardando..." : "Guardar Nombre"}
              </Button>
            </CardContent>
          </Card>

          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-blue-500" />
                Foto de Perfil y Bio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-gray-100">
                    <User className="w-8 h-8 text-gray-400" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-gray-600">Cambia tu foto de perfil y tu biografía editando tu perfil.</p>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                Editar Perfil Completo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
