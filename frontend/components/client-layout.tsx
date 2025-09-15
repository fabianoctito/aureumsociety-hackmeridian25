"use client"

import { ReactNode, useEffect, useState } from "react"
import { AuthProvider } from "@/contexts/auth-context-api"
import { FavoritesProvider } from "@/contexts/favorites-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/layout/header"

interface ClientLayoutProps {
  children: ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <FavoritesProvider>
          <Header />
          {children}
        </FavoritesProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
