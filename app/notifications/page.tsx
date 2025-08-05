"use client"

import { useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Heart, MessageCircle, UserPlus, TrendingUp, Settings, Check } from "lucide-react"

// Datos de ejemplo para notificaciones
const sampleNotifications = [
  {
    id: 1,
    type: "like",
    user: {
      name: "Sofia Martinez",
      username: "@sofia_style",
      avatar: "/placeholder.svg?height=40&width=40&text=SM",
    },
    action: "le gustó tu outfit",
    target: "Look casual para viernes",
    targetImage: "/placeholder.svg?height=60&width=60&text=Outfit",
    time: "hace 2 minutos",
    read: false,
  },
  {
    id: 2,
    type: "comment",
    user: {
      name: "Ana Rodriguez",
      username: "@ana_fashion",
      avatar: "/placeholder.svg?height=40&width=40&text=AR",
    },
    action: "comentó en tu outfit",
    target: "Elegancia nocturna",
    targetImage: "/placeholder.svg?height=60&width=60&text=Outfit",
    comment: "¡Me encanta esta combinación! ¿Dónde conseguiste el vestido?",
    time: "hace 15 minutos",
    read: false,
  },
  {
    id: 3,
    type: "follow",
    user: {
      name: "Lucia Fernandez",
      username: "@lucia_trends",
      avatar: "/placeholder.svg?height=40&width=40&text=LF",
    },
    action: "comenzó a seguirte",
    time: "hace 1 hora",
    read: true,
  },
  {
    id: 4,
    type: "trending",
    action: "Tu outfit está en tendencia",
    target: "Street style urbano",
    targetImage: "/placeholder.svg?height=60&width=60&text=Trending",
    description: "Tu outfit ha recibido más de 100 likes en las últimas 24 horas",
    time: "hace 3 horas",
    read: true,
  },
  {
    id: 5,
    type: "like",
    user: {
      name: "Carmen Lopez",
      username: "@carmen_chic",
      avatar: "/placeholder.svg?height=40&width=40&text=CL",
    },
    action: "guardó tu outfit",
    target: "Vibes bohemios",
    targetImage: "/placeholder.svg?height=60&width=60&text=Saved",
    time: "hace 5 horas",
    read: true,
  },
]

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "like":
      return <Heart className="w-4 h-4 text-red-500" />
    case "comment":
      return <MessageCircle className="w-4 h-4 text-blue-500" />
    case "follow":
      return <UserPlus className="w-4 h-4 text-green-500" />
    case "trending":
      return <TrendingUp className="w-4 h-4 text-purple-500" />
    default:
      return <Bell className="w-4 h-4 text-gray-500" />
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(sampleNotifications)
  const [filter, setFilter] = useState("todas")

  const markAsRead = (id: number) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
  }

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "no-leidas") return !notif.read
    if (filter === "likes") return notif.type === "like"
    if (filter === "comentarios") return notif.type === "comment"
    if (filter === "seguidores") return notif.type === "follow"
    return true
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <AppLayout>
      <div className="px-6 py-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Notificaciones</h1>
                {unreadCount > 0 && (
                  <p className="text-muted-foreground">
                    Tienes {unreadCount} notificación{unreadCount !== 1 ? "es" : ""} nueva{unreadCount !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="hover:bg-primary/10 transition-colors">
                <Settings className="w-4 h-4 mr-2" />
                Configurar
              </Button>
              {unreadCount > 0 && (
                <Button onClick={markAllAsRead} size="sm" className="hover:scale-105 transition-transform duration-300">
                  <Check className="w-4 h-4 mr-2" />
                  Marcar todas como leídas
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: "todas", name: "Todas", count: notifications.length },
              { id: "no-leidas", name: "No leídas", count: unreadCount },
              { id: "likes", name: "Likes", count: notifications.filter((n) => n.type === "like").length },
              {
                id: "comentarios",
                name: "Comentarios",
                count: notifications.filter((n) => n.type === "comment").length,
              },
              { id: "seguidores", name: "Seguidores", count: notifications.filter((n) => n.type === "follow").length },
            ].map((filterOption) => (
              <Button
                key={filterOption.id}
                variant={filter === filterOption.id ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(filterOption.id)}
                className="whitespace-nowrap transition-all duration-300 hover:scale-105"
              >
                {filterOption.name}
                {filterOption.count > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
                    {filterOption.count}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card className="p-8 text-center animate-fade-in-up">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No hay notificaciones</h3>
              <p className="text-muted-foreground">
                {filter === "todas"
                  ? "No tienes notificaciones en este momento"
                  : `No tienes notificaciones de tipo "${filter}"`}
              </p>
            </Card>
          ) : (
            filteredNotifications.map((notification, index) => (
              <Card
                key={notification.id}
                className={`p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-fade-in-up cursor-pointer ${
                  !notification.read ? "bg-primary/5 border-primary/20" : "hover:bg-muted/50"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar or Icon */}
                  <div className="relative">
                    {notification.user ? (
                      <Avatar className="hover:scale-110 transition-transform duration-300">
                        <AvatarImage src={notification.user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{notification.user.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-foreground">
                          {notification.user && (
                            <span className="font-semibold hover:text-primary transition-colors cursor-pointer">
                              {notification.user.name}
                            </span>
                          )}{" "}
                          <span className="text-muted-foreground">{notification.action}</span>
                          {notification.target && (
                            <span className="font-medium text-foreground"> "{notification.target}"</span>
                          )}
                        </p>

                        {notification.comment && (
                          <p className="text-muted-foreground text-sm mt-1 italic">"{notification.comment}"</p>
                        )}

                        {notification.description && (
                          <p className="text-muted-foreground text-sm mt-1">{notification.description}</p>
                        )}

                        <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                      </div>

                      {/* Target Image */}
                      {notification.targetImage && (
                        <div className="flex-shrink-0">
                          <img
                            src={notification.targetImage || "/placeholder.svg"}
                            alt="Outfit"
                            className="w-12 h-12 rounded-lg object-cover hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Unread Indicator */}
                  {!notification.read && (
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse flex-shrink-0 mt-2" />
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Load More */}
        {filteredNotifications.length > 0 && (
          <div className="text-center mt-8 animate-fade-in-up">
            <Button
              variant="outline"
              size="lg"
              className="hover:bg-primary/10 hover:border-primary transition-all duration-300 hover:scale-105"
            >
              Cargar más notificaciones
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
