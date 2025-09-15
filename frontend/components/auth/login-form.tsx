"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Crown } from "lucide-react"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login, loading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await login({ email, password })
    if (result.success) {
      router.push("/my-watches")
    }
  }

  const handleCreateAccount = () => {
    router.push("/register")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-primary/10">
              <Crown className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-serif font-bold text-balance">Acesse sua conta</CardTitle>
          <CardDescription className="text-muted-foreground">
            Entre para explorar nossa coleção exclusiva de relógios de luxo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
            <div className="text-center">
              <Button variant="link" className="text-sm text-muted-foreground">
                Esqueceu sua senha?
              </Button>
            </div>
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Não tem uma conta?{" "}
                <Button variant="link" className="p-0 h-auto text-primary" onClick={handleCreateAccount}>
                  Criar conta
                </Button>
              </p>
            </div>
            <div className="text-center pt-4 border-t bg-muted/30 rounded-lg p-4 space-y-2">
              <p className="text-xs text-muted-foreground mb-2 font-medium">Exemplos de Login (Demo)</p>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Cliente:</span> cliente@aurum.com / 123456
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Loja:</span> loja@aurum.com / 123456
                </p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
