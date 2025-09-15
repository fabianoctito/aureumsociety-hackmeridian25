"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context-api"
import { Footer } from "@/components/layout/footer"
import { AdminDashboard, AdminSidebar } from "@/components/admin"
import { Button } from "@/components/ui/button"
import { Lock, Loader2, Shield } from "lucide-react"
import Link from "next/link"

export default function AdminPage() {
  const [isMounted, setIsMounted] = useState(false)
  const { user, loading } = useAuth()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted || loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Carregando painel administrativo...</p>
          </div>
        </div>
      </div>
    )
  }

  // Verificar se o usuário é admin
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-6 rounded-full bg-destructive/10">
                <Lock className="h-12 w-12 text-destructive" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Acesso Negado</h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                Esta área é restrita a administradores do sistema. 
                Você não tem permissão para acessar esta página.
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <Link href="/marketplace">
                <Button variant="outline">Voltar ao Marketplace</Button>
              </Link>
              <Link href="/login">
                <Button>Fazer Login</Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar />
        
        {/* Main Content */}
        <div className="flex-1 ml-64">
          <header className="bg-card border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  Painel Administrativo
                </h1>
                <p className="text-sm text-muted-foreground">
                  Bem-vindo, {user.full_name}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/marketplace">
                  <Button variant="outline" size="sm">
                    Ver Marketplace
                  </Button>
                </Link>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="p-6">
            <AdminDashboard />
          </main>
        </div>
      </div>
    </div>
  )
}