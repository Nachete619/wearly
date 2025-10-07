"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Building2 } from "lucide-react"
import Link from "next/link"

interface ClickableUserProfileProps {
  user: {
    id: string
    username: string
    full_name: string
    avatar_url?: string
    tipo_usuario?: 'usuario' | 'empresa'
  }
  avatarSize?: 'sm' | 'md' | 'lg'
  showName?: boolean
  showUsername?: boolean
  className?: string
}

const avatarSizes = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12'
}

const textSizes = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base'
}

export function ClickableUserProfile({
  user,
  avatarSize = 'md',
  showName = true,
  showUsername = true,
  className = ''
}: ClickableUserProfileProps) {
  if (!user.username) {
    // Si no hay username, renderizar sin enlace
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <Avatar className={avatarSizes[avatarSize]}>
          <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.full_name} />
          <AvatarFallback>
            {user.tipo_usuario === "empresa" ? (
              <Building2 className="w-3 h-3" />
            ) : (
              <User className="w-3 h-3" />
            )}
          </AvatarFallback>
        </Avatar>
        {(showName || showUsername) && (
          <div>
            {showName && (
              <p className={`font-medium ${textSizes[avatarSize]} truncate`}>
                {user.full_name}
              </p>
            )}
            {showUsername && (
              <p className={`text-muted-foreground ${textSizes[avatarSize]} truncate`}>
                @{user.username}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <Link 
      href={`/profile/${user.username}`}
      className={`flex items-center gap-3 hover:opacity-80 transition-opacity ${className}`}
    >
      <Avatar className={avatarSizes[avatarSize]}>
        <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.full_name} />
        <AvatarFallback>
          {user.tipo_usuario === "empresa" ? (
            <Building2 className="w-3 h-3" />
          ) : (
            <User className="w-3 h-3" />
          )}
        </AvatarFallback>
      </Avatar>
      {(showName || showUsername) && (
        <div>
          {showName && (
            <p className={`font-medium ${textSizes[avatarSize]} truncate hover:underline`}>
              {user.full_name}
            </p>
          )}
          {showUsername && (
            <p className={`text-muted-foreground ${textSizes[avatarSize]} truncate`}>
              @{user.username}
            </p>
          )}
        </div>
      )}
    </Link>
  )
}
