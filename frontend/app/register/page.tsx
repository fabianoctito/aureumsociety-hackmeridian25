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
import { formatErrorMessage } from "@/lib/utils"

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

  // Function to validate email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Function to format CNPJ
  const formatCNPJ = (value: string): string => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 2) return numbers
    if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`
    if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`
    if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`
  }

  // Function to validate CNPJ
  const validateCNPJ = (cnpj: string): boolean => {
    const numbers = cnpj.replace(/\D/g, '')
    if (numbers.length !== 14) return false
    
    // Check if all digits are the same
    if (/^(\d)\1+$/.test(numbers)) return false
    
    // CNPJ validation algorithm
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

  // Function to validate password
  const validatePassword = (password: string): boolean => {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /[0-9]/.test(password)
  }

  // Full form validation function
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {}

    // Name validation only for client
    if (formData.type === "client") {
      if (!formData.name.trim()) {
        newErrors.name = "Full name is required"
      } else if (formData.name.trim().length < 2) {
        newErrors.name = "Name must have at least 2 characters"
      }
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Invalid email"
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "Password must be at least 8 characters, including uppercase, lowercase, and number"
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    // Specific validations for stores
    if (formData.type === "store") {
      if (!formData.storeName.trim()) {
        newErrors.storeName = "Business name is required"
      } else if (formData.storeName.trim().length < 3) {
        newErrors.storeName = "Business name must have at least 3 characters"
      }

      if (!formData.cnpj.trim()) {
        newErrors.cnpj = "CNPJ is required"
      } else if (!validateCNPJ(formData.cnpj)) {
        newErrors.cnpj = "Invalid CNPJ"
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
      // Define role as the correct type
      const role = formData.type === "store" ? "store" as const : "user" as const
      
      // Prepare registration data
      const registerData = {
        email: formData.email,
        password: formData.password,
        role: role,
        // Always include full_name, using appropriate field based on account type
        full_name: formData.type === "client" ? formData.name : formData.storeName
      }
      
      console.log("Registering with data:", registerData)
      const result = await register(registerData)

      if (result.success) {
        if (formData.type === "store") {
          router.push("/store/products")
        } else {
          router.push("/marketplace")
        }
      } else {
        setErrors({ submit: formatErrorMessage(result.error, "Registration error. Please try again.") })
      }
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : "Unexpected error during registration" })
    } finally {
      setIsLoading(false)
    }
  }

  // Function to clear specific error when user starts typing
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
              <CardTitle className="text-2xl font-serif">Create Account - Aurum</CardTitle>
              <CardDescription>Join the luxury watch marketplace</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Account Type */}
                <div className="space-y-3">
                  <Label>Account Type</Label>
                  <RadioGroup
                    value={formData.type}
                    onValueChange={(value) => {
                      const newType = value as "client" | "store"
                      
                      setFormData({ 
                        ...formData, 
                        type: newType,
                        // Clear fields depending on selected type
                        ...(newType === "client" ? 
                          { storeName: "", cnpj: "" } : 
                          { name: "" })
                      })
                      // Clear related errors
                      setErrors({})
                    }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="client" id="client" />
                      <Label htmlFor="client" className="flex items-center gap-2 cursor-pointer">
                        <User className="h-4 w-4" />
                        Client
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                      <RadioGroupItem value="store" id="store" />
                      <Label htmlFor="store" className="flex items-center gap-2 cursor-pointer">
                        <Store className="h-4 w-4" />
                        Store
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Personal Data - only for client */}
                {formData.type === "client" && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
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

                {/* Store Data (if applicable) */}
                {formData.type === "store" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="storeName">Business Name</Label>
                      <Input
                        id="storeName"
                        type="text"
                        value={formData.storeName}
                        onChange={(e) => {
                          setFormData({ ...formData, storeName: e.target.value })
                          clearError('storeName')
                        }}
                        className={errors.storeName ? "border-destructive" : ""}
                        placeholder="e.g. Premium Watches Ltd."
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
                        Enter numbers only, formatting will be applied automatically
                      </p>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
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
                    Minimum 8 characters, including uppercase, lowercase, and number
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
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

                {/* General submission error */}
                {errors.submit && (
                  <div className="bg-destructive/10 border border-destructive text-destructive px-3 py-2 rounded-md text-sm">
                    {errors.submit}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary hover:underline">
                    Log in
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
