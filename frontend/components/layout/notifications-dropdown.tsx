"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, Check, Eye, AlertCircle, Package, Star, User } from "lucide-react"
import { getApiClient } from "@/lib/api-client"
import Link from "next/link"

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  created_at: string
  read: boolean
  action_url?: string
}

interface NotificationsProps {
  className?: string
}

export function NotificationsDropdown({ className }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const apiClient = getApiClient()
      const response = await apiClient.get<Notification[]>("/notifications")
      
      if (response.data) {
        setNotifications(response.data)
      }
    } catch (error) {
      console.error("Erro ao carregar notificações:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const apiClient = getApiClient()
      await apiClient.post(`/notifications/${notificationId}/read`)
      
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ))
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const apiClient = getApiClient()
      await apiClient.post("/notifications/mark-all-read")
      
      setNotifications(notifications.map(n => ({ ...n, read: true })))
    } catch (error) {
      console.error("Erro ao marcar todas as notificações como lidas:", error)
    }
  }

  const getNotificationIcon = (type: string) => {
    const icons = {
      info: AlertCircle,
      success: Check,
      warning: AlertCircle,
      error: AlertCircle,
      watch: Package,
      evaluation: Star,
      user: User
    }
    
    const Icon = icons[type as keyof typeof icons] || AlertCircle
    return <Icon className="h-4 w-4" />
  }

  const getNotificationColor = (type: string) => {
    const colors = {
      info: "text-blue-600 dark:text-blue-400",
      success: "text-green-600 dark:text-green-400", 
      warning: "text-yellow-600 dark:text-yellow-400",
      error: "text-red-600 dark:text-red-400",
      watch: "text-purple-600 dark:text-purple-400",
      evaluation: "text-orange-600 dark:text-orange-400",
      user: "text-indigo-600 dark:text-indigo-400"
    }
    
    return colors[type as keyof typeof colors] || "text-gray-600 dark:text-gray-400"
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const recentNotifications = notifications.slice(0, 5)

  return (
    <div className={`relative ${className}`}>
      <Popover open={open} onOpenChange={(newOpen) => {
        console.log('Popover onOpenChange:', newOpen)
        setOpen(newOpen)
      }}>
        <PopoverTrigger asChild>
          <button 
            className="flex items-center justify-center p-2 rounded-md hover:bg-gray-100 relative"
            onClick={(e) => {
              console.log('Button clicked:', e)
              e.preventDefault()
              setOpen(!open)
            }}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </button>
        </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-background border shadow-lg z-50" align="end">
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <h3 className="font-semibold text-foreground">Notificações</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-xs"
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-96 bg-background">
          {loading ? (
            <div className="p-4 space-y-3 bg-background">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground bg-background">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y bg-background">
              {recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 cursor-pointer bg-background ${
                    !notification.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                  }`}
                  onClick={() => {
                    if (!notification.read) {
                      markAsRead(notification.id)
                    }
                    if (notification.action_url) {
                      setOpen(false)
                    }
                  }}
                >
                  <div className="flex gap-3">
                    <div className={`flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between">
                        <p className={`font-medium text-sm ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="h-2 w-2 bg-blue-600 dark:bg-blue-400 rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 5 && (
          <div className="p-3 border-t bg-background">
            <Link href="/notifications" onClick={() => setOpen(false)}>
              <Button variant="ghost" className="w-full text-sm">
                Ver todas as notificações
              </Button>
            </Link>
          </div>
        )}
      </PopoverContent>
    </Popover>
    </div>
  )
}