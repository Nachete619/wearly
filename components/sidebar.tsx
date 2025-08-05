"use client"

import type React from "react"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { TrendingUp, Home, Bell, Bookmark, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { WearlyLogo } from "@/components/wearly-logo"
import { useAuth } from "@/hooks/use-auth"

const navigation = [
  { name: "Tendencias", href: "/trends", icon: TrendingUp },
  { name: "Inicio", href: "/home", icon: Home },
  { name: "Notificaciones", href: "/notifications", icon: Bell, requiresAuth: true },
  { name: "Guardados", href: "/saved", icon: Bookmark, requiresAuth: true },
]

interface SidebarProps {
  onUploadClick: () => void
}

export function Sidebar({ onUploadClick }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()

  const handleUploadClick = () => {
    if (!user) {
      router.push("/auth/login")
      return
    }
    onUploadClick()
  }

  const handleAuthRequiredClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault()
    router.push("/auth/login")
  }

  return (
    <div className="fixed left-0 top-0 z-40 h-screen w-16 bg-background border-r border-border flex flex-col items-center py-4 transition-colors">
      {/* Logo */}
      <Link href="/home" className="mb-8 hover:scale-110 transition-transform">
        <WearlyLogo size="sm" />
      </Link>

      {/* Navigation */}
      <nav className="flex flex-col space-y-2 flex-1">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === "/home" && pathname === "/") ||
            (pathname.startsWith("/home") && item.href === "/home")

          // Show disabled state for auth-required items when not logged in
          const isDisabled = item.requiresAuth && !user

          return (
            <Link
              key={item.name}
              href={isDisabled ? "#" : item.href}
              className={cn(
                "p-3 rounded-lg transition-all duration-200 group relative",
                isDisabled ? "opacity-50" : "hover:bg-accent",
                isActive && !isDisabled && "bg-primary/10 text-primary",
              )}
              onClick={isDisabled ? (e) => handleAuthRequiredClick(e, item.href) : undefined}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  isActive && !isDisabled
                    ? "text-primary"
                    : isDisabled
                      ? "text-muted-foreground/50"
                      : "text-muted-foreground group-hover:text-foreground",
                )}
              />

              {/* Tooltip */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border shadow-md">
                {item.name}
                {isDisabled && " (Requiere login)"}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Upload button */}
      <Button
        onClick={handleUploadClick}
        size="sm"
        className={cn(
          "w-10 h-10 rounded-lg transition-all duration-200 hover:scale-105",
          user ? "bg-primary hover:bg-primary/90" : "bg-muted hover:bg-muted/80 text-muted-foreground",
        )}
      >
        <Plus className="w-5 h-5" />
      </Button>
    </div>
  )
}
