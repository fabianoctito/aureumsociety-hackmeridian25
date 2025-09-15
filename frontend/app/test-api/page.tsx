"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error'
  message?: string
  data?: any
}

export default function ApiTestPage() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Backend Health Check', status: 'pending' },
    { name: 'Get Watches', status: 'pending' },
    { name: 'Test Register', status: 'pending' },
    { name: 'Test Login', status: 'pending' },
  ])
  
  const [isRunning, setIsRunning] = useState(false)

  const updateTest = (index: number, status: TestResult['status'], message?: string, data?: any) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status, message, data } : test
    ))
  }

  const runTests = async () => {
    setIsRunning(true)
    
    // Reset tests
    setTests(prev => prev.map(test => ({ ...test, status: 'pending' })))

    // Test 1: Backend Health Check
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/')
      if (response.ok) {
        const data = await response.json()
        updateTest(0, 'success', `Backend online: ${data.message}`, data)
      } else {
        updateTest(0, 'error', `HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      updateTest(0, 'error', `Connection failed: ${error}`)
    }

    // Test 2: Get Watches
    try {
      const result = await apiClient.getWatches()
      if (result.error) {
        updateTest(1, 'error', result.error)
      } else {
        updateTest(1, 'success', `Found ${result.data?.length || 0} watches`, result.data)
      }
    } catch (error) {
      updateTest(1, 'error', `API call failed: ${error}`)
    }

    // Test 3: Test Register
    try {
      const testUser = {
        email: `test_${Date.now()}@example.com`,
        password: 'test123456',
        full_name: 'Test User',
        role: 'user' as const
      }
      
      const result = await apiClient.register(testUser)
      if (result.error) {
        updateTest(2, 'error', result.error)
      } else {
        updateTest(2, 'success', 'Registration successful', result.data)
      }
    } catch (error) {
      updateTest(2, 'error', `Registration failed: ${error}`)
    }

    // Test 4: Test Login with invalid credentials (just to test endpoint)
    try {
      const result = await apiClient.login('test@example.com', 'wrongpassword')
      if (result.error) {
        updateTest(3, 'success', 'Login endpoint responding (with expected error)', result.error)
      } else {
        updateTest(3, 'success', 'Login successful', result.data)
      }
    } catch (error) {
      updateTest(3, 'error', `Login test failed: ${error}`)
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>API Connectivity Test</CardTitle>
            <CardDescription>
              Teste a conectividade entre o frontend e backend
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="mb-6">
              <Alert>
                <AlertDescription>
                  <strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}
                </AlertDescription>
              </Alert>
            </div>

            <Button 
              onClick={runTests} 
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Executando testes...
                </>
              ) : (
                'Executar Testes de API'
              )}
            </Button>

            <div className="grid gap-4">
              {tests.map((test, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(test.status)}
                        <span className="font-medium">{test.name}</span>
                      </div>
                      <span className={`text-sm capitalize ${
                        test.status === 'success' ? 'text-green-600' :
                        test.status === 'error' ? 'text-red-600' :
                        'text-muted-foreground'
                      }`}>
                        {test.status}
                      </span>
                    </div>
                    
                    {test.message && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        {test.message}
                      </div>
                    )}
                    
                    {test.data && (
                      <details className="mt-2">
                        <summary className="text-sm cursor-pointer hover:text-primary">
                          Ver dados da resposta
                        </summary>
                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                          {JSON.stringify(test.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}