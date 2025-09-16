"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, LoginCredentials, UserCreate } from '@/types/api'
import { getApiClient } from '@/lib/api-client'
import { formatErrorMessage } from '@/lib/utils'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>
  register: (userData: UserCreate) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshUser: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const isAuthenticated = !!user

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      getApiClient().setToken(token)
      refreshUser()
    } else {
      setLoading(false)
    }
  }, [])

  const refreshUser = async () => {
    try {
      setLoading(true)
      const response = await getApiClient().getProfile()
      console.log('Profile response:', response)
      if (response.data) {
        console.log('User data from API:', JSON.stringify(response.data, null, 2))
        setUser(response.data)
      } else {
        // Token invalid, clear it
        getApiClient().clearToken()
        setUser(null)
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
      getApiClient().clearToken()
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true)
      const response = await getApiClient().login(credentials.email, credentials.password)
      
      if (response.data?.access_token) {
        getApiClient().setToken(response.data.access_token)
        await refreshUser()
        return { success: true }
      } else {
        return { 
          success: false, 
          error: formatErrorMessage(response.error, 'Erro no login')
        }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro no login' 
      }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: UserCreate) => {
    try {
      setLoading(true)
      console.log("Auth context sending registration data:", userData)
      const response = await getApiClient().register(userData)
      
      if (response.data) {
        // After successful registration, log the user in
        const loginResult = await login({
          email: userData.email,
          password: userData.password
        })
        return loginResult
      } else {
        return { 
          success: false, 
          error: formatErrorMessage(response.error, 'Erro no cadastro')
        }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro no cadastro' 
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    getApiClient().clearToken()
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}