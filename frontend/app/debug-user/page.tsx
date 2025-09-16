"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context-api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Footer } from "@/components/layout/footer"
import { getApiClient } from "@/lib/api-client"
import { User } from "@/types/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

export default function DebugUserPage() {
  const { user, refreshUser } = useAuth()
  const [localUser, setLocalUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [tokenDecoded, setTokenDecoded] = useState<any>(null)
  
  // Function to fetch user directly from API
  const fetchUserDirectly = async () => {
    try {
      const storedToken = localStorage.getItem('access_token')
      if (!storedToken) {
        setError("No access token. Please login first.")
        return
      }
      
      setToken(storedToken)
      
      // Try to decode JWT token
      try {
        const base64Url = storedToken.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        }).join(''))
        
        setTokenDecoded(JSON.parse(jsonPayload))
      } catch (e) {
        console.error("Error decoding token:", e)
      }
      
      const apiClient = getApiClient()
      apiClient.setToken(storedToken)
      const response = await apiClient.getProfile()
      
      if (response.data) {
        setLocalUser(response.data)
        setError(null)
      } else {
        setError("Error getting profile: " + (response.error || "Unknown error"))
      }
    } catch (err) {
      setError("Unexpected error: " + (err instanceof Error ? err.message : String(err)))
    }
  }

  useEffect(() => {
    // Try to fetch user when the page loads
    fetchUserDirectly()
  }, [])
  
  const formatUser = (user: any) => {
    if (!user) return "No user data"
    return JSON.stringify(user, null, 2)
  }
  
  // Helper function to check if user is store or admin
  const isStoreOrAdmin = (userData: any) => {
    if (!userData) return false
    const role = userData.role
    return role === 'store' || role === 'admin'
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">User Debug Information</h1>
        <p className="text-muted-foreground mb-6">Detailed information about the current user session</p>
        
        <Tabs defaultValue="user-info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="user-info">User Info</TabsTrigger>
            <TabsTrigger value="token">Token & Auth</TabsTrigger>
            <TabsTrigger value="role-check">Role Checks</TabsTrigger>
          </TabsList>
          
          {/* User Info Tab */}
          <TabsContent value="user-info" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Auth Context User */}
              <Card>
                <CardHeader>
                  <CardTitle>Auth Context User</CardTitle>
                  <CardDescription>User from useAuth() context</CardDescription>
                </CardHeader>
                <CardContent>
                  {user ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-medium">ID:</div>
                        <div>{user.id}</div>
                        
                        <div className="font-medium">Name:</div>
                        <div>{user.full_name}</div>
                        
                        <div className="font-medium">Email:</div>
                        <div>{user.email}</div>
                        
                        <div className="font-medium">Role:</div>
                        <div className="bg-yellow-100 p-1 px-2 rounded">{user.role}</div>
                        
                        <div className="font-medium">Legacy Type:</div>
                        <div>{user.type || 'not defined'}</div>
                        
                        <div className="font-medium">Active:</div>
                        <div>{user.is_active ? 'Yes' : 'No'}</div>
                        
                        <div className="font-medium">BRL Balance:</div>
                        <div>R$ {user.balance_brl?.toFixed(2)}</div>
                      </div>
                      
                      <details className="mt-4">
                        <summary className="cursor-pointer text-sm text-muted-foreground">Complete Object</summary>
                        <pre className="mt-2 p-4 bg-muted rounded-md text-xs overflow-auto">
                          {formatUser(user)}
                        </pre>
                      </details>
                    </div>
                  ) : (
                    <div className="text-muted-foreground">
                      No user in auth context
                    </div>
                  )}
                  
                  <Button onClick={refreshUser} className="mt-4">
                    Refresh from Context
                  </Button>
                </CardContent>
              </Card>
              
              {/* Direct API User */}
              <Card>
                <CardHeader>
                  <CardTitle>Direct API User</CardTitle>
                  <CardDescription>User fetched directly from API</CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {localUser ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-medium">ID:</div>
                        <div>{localUser.id}</div>
                        
                        <div className="font-medium">Name:</div>
                        <div>{localUser.full_name}</div>
                        
                        <div className="font-medium">Email:</div>
                        <div>{localUser.email}</div>
                        
                        <div className="font-medium">Role:</div>
                        <div className="bg-yellow-100 p-1 px-2 rounded">{localUser.role}</div>
                        
                        <div className="font-medium">Legacy Type:</div>
                        <div>{localUser.type || 'not defined'}</div>
                        
                        <div className="font-medium">Active:</div>
                        <div>{localUser.is_active ? 'Yes' : 'No'}</div>
                        
                        <div className="font-medium">BRL Balance:</div>
                        <div>R$ {localUser.balance_brl?.toFixed(2)}</div>
                      </div>
                      
                      <details className="mt-4">
                        <summary className="cursor-pointer text-sm text-muted-foreground">Complete Object</summary>
                        <pre className="mt-2 p-4 bg-muted rounded-md text-xs overflow-auto">
                          {formatUser(localUser)}
                        </pre>
                      </details>
                    </div>
                  ) : !error ? (
                    <div className="text-muted-foreground">
                      Fetching user from API...
                    </div>
                  ) : null}
                  
                  <Button onClick={fetchUserDirectly} className="mt-4">
                    Fetch from API
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Token Tab */}
          <TabsContent value="token" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>JWT Token Information</CardTitle>
                <CardDescription>Details about your authentication token</CardDescription>
              </CardHeader>
              <CardContent>
                {token ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="font-medium">Token (first 20 chars):</div>
                      <div className="break-all bg-muted p-2 rounded text-sm">
                        {token.substring(0, 20)}...
                      </div>
                    </div>
                    
                    {tokenDecoded && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <div className="font-medium">Decoded Token:</div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="font-medium">Subject (User ID):</div>
                            <div>{tokenDecoded.sub}</div>
                            
                            <div className="font-medium">Email:</div>
                            <div>{tokenDecoded.email}</div>
                            
                            <div className="font-medium">Role:</div>
                            <div className="bg-yellow-100 p-1 px-2 rounded">{tokenDecoded.role}</div>
                            
                            <div className="font-medium">Expiry:</div>
                            <div>
                              {tokenDecoded.exp 
                                ? new Date(tokenDecoded.exp * 1000).toLocaleString() 
                                : 'Not specified'}
                            </div>
                          </div>
                          
                          <details className="mt-2">
                            <summary className="cursor-pointer text-sm text-muted-foreground">Raw Decoded Data</summary>
                            <pre className="mt-2 p-4 bg-muted rounded-md text-xs overflow-auto">
                              {JSON.stringify(tokenDecoded, null, 2)}
                            </pre>
                          </details>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-destructive">No authentication token found</div>
                )}
                
                <div className="mt-4 flex gap-4">
                  <Button 
                    onClick={fetchUserDirectly}
                    variant="outline"
                  >
                    Refresh Token Info
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        localStorage.removeItem('access_token')
                        window.location.href = '/login'
                      }
                    }} 
                    variant="destructive"
                  >
                    Clear Token & Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Role Check Tab */}
          <TabsContent value="role-check" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Role Check Helper</CardTitle>
                <CardDescription>Check what roles the current user has</CardDescription>
              </CardHeader>
              <CardContent>
                {user ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-medium">User ID:</div>
                      <div>{user.id}</div>
                      
                      <div className="font-medium">Current Role:</div>
                      <div className="bg-yellow-100 p-1 px-2 rounded font-bold">
                        {user.role || 'undefined'}
                      </div>
                      
                      <div className="font-medium">Legacy Type Property:</div>
                      <div>{user.type || 'not defined'}</div>
                      
                      <div className="font-medium">Is Store or Admin:</div>
                      <div className={isStoreOrAdmin(user) ? 'text-green-600 font-bold' : 'text-red-600'}>
                        {isStoreOrAdmin(user) ? 'YES' : 'NO'}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <h3 className="font-medium">Role Test Results:</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div>Is Admin:</div>
                        <div className={user.role === 'admin' ? 'text-green-600 font-bold' : 'text-gray-600'}>
                          {user.role === 'admin' ? 'YES' : 'NO'}
                        </div>
                        
                        <div>Is Store:</div>
                        <div className={user.role === 'store' ? 'text-green-600 font-bold' : 'text-gray-600'}>
                          {user.role === 'store' ? 'YES' : 'NO'}
                        </div>
                        
                        <div>Is Regular User:</div>
                        <div className={user.role === 'user' ? 'text-green-600 font-bold' : 'text-gray-600'}>
                          {user.role === 'user' ? 'YES' : 'NO'}
                        </div>
                        
                        <div>Is Evaluator:</div>
                        <div className={user.role === 'evaluator' ? 'text-green-600 font-bold' : 'text-gray-600'}>
                          {user.role === 'evaluator' ? 'YES' : 'NO'}
                        </div>
                      </div>
                    </div>
                    
                    <Alert className="bg-blue-50 mt-4">
                      <AlertDescription>
                        <strong>Debug Info:</strong> The function <code>isStoreOrAdmin(user)</code> checks if 
                        <code>user.role === 'store' || user.role === 'admin'</code>. This is used to show/hide
                        the "Add Watch" button in My Collection page.
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <div className="text-destructive">
                    No user data available. Please login first.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  )
}