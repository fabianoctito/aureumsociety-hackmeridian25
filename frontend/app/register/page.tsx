"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Crown, User, Store } from "lucide-react"
import { Footer } from "@/components/layout/footer"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    type: "client" as "client" | "store",
    storeName: "",
    cnpj: "",
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  // Função para validar email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Função para formatar CNPJ
  const formatCNPJ = (value: string): string => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 2) return numbers
    if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`
    if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`
    if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`
  }

  // Função para validar CNPJ
  const validateCNPJ = (cnpj: string): boolean => {
    const numbers = cnpj.replace(/\D/g, '')
    if (numbers.length !== 14) return false
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(numbers)) return false
    
    // Algoritmo de validação do CNPJ
    let sum = 0
    let weight = 2
    for (let i = 11; i >= 0; i--) {
      sum += parseInt(numbers[i]) * weight
      weight = weight === 9 ? 2 : weight + 1
    }
    let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11)
    if (parseInt(numbers[12]) !== digit) return false
    
    sum = 0
    weight = 2
    for (let i = 12; i >= 0; i--) {
      sum += parseInt(numbers[i]) * weight
      weight = weight === 9 ? 2 : weight + 1
    }
    digit = sum % 11 < 2 ? 0 : 11 - (sum % 11)
    return parseInt(numbers[13]) === digit
  }

  // Função para validar senha
  const validatePassword = (password: string): boolean => {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /[0-9]/.test(password)
  }

  // Função de validação completa
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {}

    // Validação do nome apenas para cliente
    if (formData.type === "client") {
      if (!formData.name.trim()) {
        newErrors.name = "Nome completo é obrigatório"
      } else if (formData.name.trim().length < 2) {
        newErrors.name = "Nome deve ter pelo menos 2 caracteres"
      }
    }

    // Validação do email
    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório"
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Email inválido"
    }

    // Validação da senha
    if (!formData.password) {
      newErrors.password = "Senha é obrigatória"
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "Senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula e número"
    }

    // Validação da confirmação de senha
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem"
    }

    // Validações específicas para lojas
    if (formData.type === "store") {
      if (!formData.storeName.trim()) {
        newErrors.storeName = "Razão social é obrigatória"
      } else if (formData.storeName.trim().length < 3) {
        newErrors.storeName = "Razão social deve ter pelo menos 3 caracteres"
      }

      if (!formData.cnpj.trim()) {
        newErrors.cnpj = "CNPJ é obrigatório"
      } else if (!validateCNPJ(formData.cnpj)) {
        newErrors.cnpj = "CNPJ inválido"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const role = formData.type === "store" ? "store" : "user"
      
      // Preparar dados de registro
      const registerData: any = {
        email: formData.email,
        password: formData.password,
        role: role
      }
      
      // Incluir nome apenas para clientes
      if (formData.type === "client") {
        registerData.full_name = formData.name
      }

      const result = await register(registerData)

      if (result.success) {
        if (formData.type === "store") {
          router.push("/store/products")
        } else {
          router.push("/marketplace")
        }
      } else {
        setErrors({ submit: result.error || "Erro no cadastro. Tente novamente." })
      }
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : "Erro inesperado ao cadastrar" })
    } finally {
      setIsLoading(false)
    }
  }

  // Função para limpar erro específico quando o usuário começa a digitar
  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Crown className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-serif">Criar Conta - Aurum</CardTitle>
              <CardDescription>Junte-se ao marketplace de relógios de luxo</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Tipo de Usuário */}
                <div className="space-y-3">
                  <Label>Tipo de Conta</Label>
                  <RadioGroup
                    value={formData.type}
                    onValueChange={(value) => {
                      const newType = value as "client" | "store"
                      
                      setFormData({ 
                        ...formData, 
                        type: newType,
                        // Limpar campos dependendo do tipo selecionado
                        ...(newType === "client" ? 
                          { storeName: "", cnpj: "" } : 
                          { name: "" })
                      })
                      // Limpar erros relacionados
                      setErrors({})
                    }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="client" id="client" />
                      <Label htmlFor="client" className="flex items-center gap-2 cursor-pointer">
                        <User className="h-4 w-4" />
                        Cliente
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="store" id="store" />
                      <Label htmlFor="store" className="flex items-center gap-2 cursor-pointer">
                        <Store className="h-4 w-4" />
                        Loja
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Dados Pessoais - apenas para cliente */}
                {formData.type === "client" && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value })
                        clearError('name')
                      }}
                      className={errors.name ? "border-destructive" : ""}
                      required
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value })
                      clearError('email')
                    }}
                    className={errors.email ? "border-destructive" : ""}
                    required
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                {/* Dados da Loja (se aplicável) */}
                {formData.type === "store" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="storeName">Razão Social</Label>
                      <Input
                        id="storeName"
                        type="text"
                        value={formData.storeName}
                        onChange={(e) => {
                          setFormData({ ...formData, storeName: e.target.value })
                          clearError('storeName')
                        }}
                        className={errors.storeName ? "border-destructive" : ""}
                        placeholder="Ex: Relógios Premium LTDA"
                        required
                      />
                      {errors.storeName && (
                        <p className="text-sm text-destructive">{errors.storeName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cnpj">CNPJ</Label>
                      <Input
                        id="cnpj"
                        type="text"
                        placeholder="00.000.000/0000-00"
                        value={formData.cnpj}
                        onChange={(e) => {
                          const formattedCNPJ = formatCNPJ(e.target.value)
                          setFormData({ ...formData, cnpj: formattedCNPJ })
                          clearError('cnpj')
                        }}
                        className={errors.cnpj ? "border-destructive" : ""}
                        maxLength={18}
                        required
                      />
                      {errors.cnpj && (
                        <p className="text-sm text-destructive">{errors.cnpj}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Digite apenas os números, a formatação será aplicada automaticamente
                      </p>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value })
                      clearError('password')
                    }}
                    className={errors.password ? "border-destructive" : ""}
                    required
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Mínimo 8 caracteres, incluindo maiúscula, minúscula e número
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData({ ...formData, confirmPassword: e.target.value })
                      clearError('confirmPassword')
                    }}
                    className={errors.confirmPassword ? "border-destructive" : ""}
                    required
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Erro geral de submissão */}
                {errors.submit && (
                  <div className="bg-destructive/10 border border-destructive text-destructive px-3 py-2 rounded-md text-sm">
                    {errors.submit}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Criando conta..." : "Criar Conta"}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Já tem uma conta?{" "}
                  <Link href="/login" className="text-primary hover:underline">
                    Fazer login
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}
