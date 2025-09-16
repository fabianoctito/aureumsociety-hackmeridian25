"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Users, 
  Settings, 
  BarChart3, 
  Package, 
  Star, 
  Bell, 
  Shield,
  Store,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AdminSidebarProps {
  className?: string
}

const adminMenuItems = [
  {
    title: "Dashboard",
    icon: BarChart3,
    href: "/admin",
    exact: true
  },
  {
    title: "Usuários",
    icon: Users,
    href: "/admin/users"
  },
  {
    title: "Lojas",
    icon: Store,
    href: "/admin/stores"
  },
  {
    title: "Relógios",
    icon: Package,
    href: "/admin/watches"
  },
  {
    title: "Avaliações",
    icon: Star,
    href: "/admin/evaluations"
  },
  {
    title: "Avaliadores",
    icon: Eye,
    href: "/admin/evaluators"
  },
  {
    title: "Notificações",
    icon: Bell,
    href: "/admin/notifications"
  },
  {
    title: "Relatórios",
    icon: FileText,
    href: "/admin/reports"
  },
  {
    title: "Configurações",
    icon: Settings,
    href: "/admin/settings"
  }
]

export function AdminSidebar({ className }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-card border-r transition-all duration-300 z-50",
      collapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="font-semibold">Admin Panel</h2>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 p-0"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-2 space-y-1">
        {adminMenuItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href, item.exact)

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={active ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-10",
                  collapsed && "justify-center",
                  active && "bg-primary/10 text-primary"
                )}
                title={collapsed ? item.title : undefined}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!collapsed && (
                  <span className="truncate">{item.title}</span>
                )}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="text-xs text-muted-foreground text-center">
            <p>Admin Panel v1.0</p>
            <p>Aurum Society</p>
          </div>
        </div>
      )}
    </div>
  )
}