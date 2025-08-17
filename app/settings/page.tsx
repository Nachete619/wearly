"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Save, 
  Building2, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Edit,
  Trash2,
  Package
} from "lucide-react"
import { 
  getCurrentUserProfile, 
  getCurrentCompanyProfile, 
  convertToCompany, 
  convertToRegularUser,
  updateCompanyProfile,
  UserProfile,
  CompanyProfile
} from "@/lib/user-actions"

export default function SettingsPage() {
  const [username, setUsername] = useState("TuNombreDeUsuario")
  const [isSaving, setIsSaving] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Estados para el formulario de empresa
  const [showCompanyForm, setShowCompanyForm] = useState(false)
  const [companyForm, setCompanyForm] = useState({
    nombre_empresa: '',
    descripcion: '',
    direccion: '',
    telefono: '',
    horarios: '',
    sitio_web: ''
  })

  // Cargar datos del usuario
  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setLoading(true)
      const profile = await getCurrentUserProfile()
      const company = await getCurrentCompanyProfile()
      
      setUserProfile(profile)
      setCompanyProfile(company)
      
      if (company) {
        setCompanyForm({
          nombre_empresa: company.nombre_empresa,
          descripcion: company.descripcion,
          direccion: company.direccion,
          telefono: company.telefono,
          horarios: company.horarios,
          sitio_web: company.sitio_web
        })
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      setMessage({ type: 'error', text: 'Error al cargar los datos del usuario' })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveUsername = async () => {
    setIsSaving(true)
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  const handleConvertToCompany = async () => {
    try {
      setLoading(true)
      const result = await convertToCompany(companyForm)
      
      if (result.success) {
        setMessage({ type: 'success', text: '¡Convertido a empresa exitosamente!' })
        await loadUserData() // Recargar datos
        setShowCompanyForm(false)
      } else {
        setMessage({ type: 'error', text: result.error || 'Error al convertir a empresa' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error inesperado al convertir a empresa' })
    } finally {
      setLoading(false)
    }
  }

  const handleConvertToRegularUser = async () => {
    if (!confirm('¿Estás seguro de que quieres convertir tu cuenta a usuario común? Esto eliminará tu perfil de empresa.')) {
      return
    }

    try {
      setLoading(true)
      const result = await convertToRegularUser()
      
      if (result.success) {
        setMessage({ type: 'success', text: '¡Convertido a usuario común exitosamente!' })
        await loadUserData() // Recargar datos
      } else {
        setMessage({ type: 'error', text: result.error || 'Error al convertir a usuario común' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error inesperado al convertir a usuario común' })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateCompanyProfile = async () => {
    try {
      setLoading(true)
      const result = await updateCompanyProfile(companyForm)
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Perfil de empresa actualizado exitosamente!' })
        await loadUserData() // Recargar datos
        setShowCompanyForm(false)
      } else {
        setMessage({ type: 'error', text: result.error || 'Error al actualizar el perfil de empresa' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error inesperado al actualizar el perfil de empresa' })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="px-6 py-6">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="px-6 py-6">
        <div className="max-w-2xl mx-auto space-y-8">
          <h1 className="text-2xl font-bold text-gray-900">Configuración de la Cuenta</h1>

          {/* Mensaje de estado */}
          {message && (
            <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          {/* Tipo de Usuario */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-blue-500" />
                Tipo de Usuario
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant={userProfile?.tipo_usuario === 'empresa' ? 'default' : 'secondary'}>
                  {userProfile?.tipo_usuario === 'empresa' ? 'Empresa' : 'Usuario Común'}
                </Badge>
                {userProfile?.tipo_usuario === 'empresa' && (
                  <Building2 className="w-4 h-4 text-blue-500" />
                )}
              </div>
              
              <p className="text-sm text-gray-600">
                {userProfile?.tipo_usuario === 'empresa' 
                  ? 'Tu cuenta está configurada como empresa. Puedes crear ofertas y gestionar tu perfil empresarial.'
                  : 'Tu cuenta está configurada como usuario común. Puedes convertirte a empresa para crear ofertas.'
                }
              </p>

              {userProfile?.tipo_usuario === 'comun' && (
                <Button 
                  onClick={() => setShowCompanyForm(true)} 
                  className="flex items-center gap-2"
                  disabled={loading}
                >
                  <Building2 className="w-4 h-4" />
                  Convertir a Empresa
                </Button>
              )}

              {userProfile?.tipo_usuario === 'empresa' && (
                <Button 
                  variant="outline"
                  onClick={handleConvertToRegularUser}
                  className="flex items-center gap-2"
                  disabled={loading}
                >
                  <User className="w-4 h-4" />
                  Convertir a Usuario Común
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Perfil de Empresa */}
          {userProfile?.tipo_usuario === 'empresa' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="w-5 h-5 text-blue-500" />
                  Perfil de Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {companyProfile ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Nombre de la Empresa</Label>
                        <p className="text-sm text-gray-600">{companyProfile.nombre_empresa}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Teléfono</Label>
                        <p className="text-sm text-gray-600">{companyProfile.telefono}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Dirección</Label>
                        <p className="text-sm text-gray-600">{companyProfile.direccion}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Horarios</Label>
                        <p className="text-sm text-gray-600">{companyProfile.horarios}</p>
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium">Descripción</Label>
                        <p className="text-sm text-gray-600">{companyProfile.descripcion}</p>
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium">Sitio Web</Label>
                        <p className="text-sm text-gray-600">
                          <a href={companyProfile.sitio_web} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {companyProfile.sitio_web}
                          </a>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => setShowCompanyForm(true)} 
                        variant="outline"
                        className="flex items-center gap-2"
                        disabled={loading}
                      >
                        <Edit className="w-4 h-4" />
                        Editar Perfil de Empresa
                      </Button>
                      
                      <Button 
                        onClick={() => window.location.href = '/products'} 
                        className="flex items-center gap-2"
                        disabled={loading}
                      >
                        <Package className="w-4 h-4" />
                        Gestionar Productos
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No tienes un perfil de empresa configurado</p>
                    <Button 
                      onClick={() => setShowCompanyForm(true)} 
                      className="flex items-center gap-2"
                      disabled={loading}
                    >
                      <Building2 className="w-4 h-4" />
                      Crear Perfil de Empresa
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Formulario de Empresa */}
          {showCompanyForm && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="w-5 h-5 text-blue-500" />
                  {companyProfile ? 'Editar Perfil de Empresa' : 'Crear Perfil de Empresa'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre_empresa">Nombre de la Empresa *</Label>
                    <Input 
                      id="nombre_empresa" 
                      value={companyForm.nombre_empresa} 
                      onChange={(e) => setCompanyForm({...companyForm, nombre_empresa: e.target.value})}
                      placeholder="Mi Empresa S.L."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono *</Label>
                    <Input 
                      id="telefono" 
                      value={companyForm.telefono} 
                      onChange={(e) => setCompanyForm({...companyForm, telefono: e.target.value})}
                      placeholder="+34 123 456 789"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="direccion">Dirección *</Label>
                    <Input 
                      id="direccion" 
                      value={companyForm.direccion} 
                      onChange={(e) => setCompanyForm({...companyForm, direccion: e.target.value})}
                      placeholder="Calle Principal 123, Ciudad"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="horarios">Horarios *</Label>
                    <Input 
                      id="horarios" 
                      value={companyForm.horarios} 
                      onChange={(e) => setCompanyForm({...companyForm, horarios: e.target.value})}
                      placeholder="Lunes a Viernes: 9:00-18:00"
                    />
                  </div>
                  
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="descripcion">Descripción *</Label>
                    <Textarea 
                      id="descripcion" 
                      value={companyForm.descripcion} 
                      onChange={(e) => setCompanyForm({...companyForm, descripcion: e.target.value})}
                      placeholder="Describe tu empresa y los servicios que ofreces..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="sitio_web">Sitio Web</Label>
                    <Input 
                      id="sitio_web" 
                      value={companyForm.sitio_web} 
                      onChange={(e) => setCompanyForm({...companyForm, sitio_web: e.target.value})}
                      placeholder="https://miempresa.com"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={companyProfile ? handleUpdateCompanyProfile : handleConvertToCompany}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Guardando...' : (companyProfile ? 'Actualizar Perfil' : 'Crear Perfil y Convertir a Empresa')}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => setShowCompanyForm(false)}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

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
