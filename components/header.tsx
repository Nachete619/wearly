"use client"

import type React from "react"

import { useState } from "react"
import { Search, Plus, Bell, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface HeaderProps {
  onUploadClick: () => void
}

export function Header({ onUploadClick }: HeaderProps) {
  const { user, supabase } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    router.push("/")
  }

  const handleUploadClick = () => {
    if (!user) {
      router.push("/auth/login")
      return
    }
    onUploadClick()
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
            />
          </form>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Upload Button */}
          <Button onClick={handleUploadClick} size="sm" className="hidden sm:flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Subir outfit
          </Button>

          {/* Mobile Upload Button */}
          <Button onClick={handleUploadClick} size="sm" className="sm:hidden">
            <Plus className="h-4 w-4" />
          </Button>

          {user ? (
            <>
              {/* Notifications */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative"
                onClick={() => router.push('/notifications')}
                asChild
              >
                <Link href="/notifications">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 text-xs"></span>
                </Link>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={user.user_metadata?.avatar_url || "/placeholder-user.jpg"} 
                        alt="Avatar" 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          console.log("Error cargando avatar:", e);
                          // Intentar cargar desde Supabase si está disponible
                          if (user.id) {
                            const avatarUrl = `https://xsgames.co/randomusers/avatar.php?g=pixel&key=${user.id}`;
                            e.currentTarget.src = avatarUrl;
                          }
                        }}
                      />
                      <AvatarFallback>
                        {user.email ? user.email.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.user_metadata?.full_name || "Usuario"}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Mi perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/saved">Guardados</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Configuración</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>Cerrar sesión</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Iniciar sesión</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/register">Registrarse</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
