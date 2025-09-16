// API Configuration and HTTP Client
import { User, UserCreate, Watch, WatchCreate, WatchFilter, AuthResponse, Purchase, Notification } from '@/types/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface ApiResponse<T = any> {
  data?: T
  error?: string
  detail?: string
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        // Trata diferentes tipos de erro do backend
        let errorMessage = 'Erro na requisição'
        
        if (data.detail) {
          if (typeof data.detail === 'string') {
            errorMessage = data.detail
          } else if (Array.isArray(data.detail)) {
            // Se for um array de erros de validação, pega a primeira mensagem
            errorMessage = data.detail[0]?.msg || data.detail[0]?.message || 'Erro de validação'
          } else if (typeof data.detail === 'object') {
            errorMessage = data.detail.msg || data.detail.message || 'Erro de validação'
          }
        } else if (data.message) {
          errorMessage = data.message
        }
        
        return {
          error: errorMessage,
        }
      }

      return { data }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Erro de conexão',
      }
    }
  }

  // Generic HTTP methods
  async get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async put<T>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const details = {
      'username': email,
      'password': password
    };
    const formBody = Object.keys(details).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(details[key as keyof typeof details])).join('&');

    return this.request<{ access_token: string; token_type: string }>('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formBody,
    })
  }

  async register(userData: UserCreate) {
    console.log("API client sending registration data:", userData)
    return this.request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async getProfile() {
    console.log("Getting user profile with token:", this.token ? "Token exists" : "No token")
    const response = await this.request<User>('/auth/profile')
    console.log("API getProfile response:", response)
    return response
  }

  // Watches endpoints
  async getWatches(params?: any) {
    const queryParams = new URLSearchParams()
    if (params) {
      // Map frontend filter params to backend expected params
      const paramMapping: Record<string, string> = {
        price_min: 'min_price',
        price_max: 'max_price',
      };

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Use mapped param name if exists, otherwise use original key
          const paramName = paramMapping[key] || key;
          queryParams.append(paramName, String(value));
        }
      });
    }
    
    const query = queryParams.toString()
    return this.request<Watch[]>(`/watches/marketplace${query ? `?${query}` : ''}`)
  }

  async getWatch(id: string) {
    return this.request<Watch>(`/watches/${id}`)
  }

  async createWatch(watchData: WatchCreate) {
    return this.request<Watch>('/watches', {
      method: 'POST',
      body: JSON.stringify(watchData),
    })
  }

  async purchaseWatch(watchId: string, paymentData: any) {
    return this.request<Purchase>(`/watches/${watchId}/purchase`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    })
  }

  // Favorites endpoints
  async toggleFavorite(watchId: string) {
    return this.request<{ is_favorite: boolean }>(`/watches/${watchId}/favorite`, {
      method: 'POST',
    })
  }

  async getFavorites() {
    return this.request<Watch[]>('/watches/favorites')
  }

  // User balance and transactions
  async getBalance() {
    return this.request<{ balance_brl: number; balance_xlm: number }>('/auth/balance')
  }

  // Notifications
  async getNotifications() {
    return this.request<Notification[]>('/notifications')
  }

  async markNotificationRead(id: string) {
    return this.request<any>(`/notifications/${id}/read`, {
      method: 'POST',
    })
  }
}

let _apiClient: ApiClient | null = null;

export function getApiClient(): ApiClient {
  if (!_apiClient) {
    _apiClient = new ApiClient(API_BASE_URL);
  }
  return _apiClient;
}
export type { ApiResponse }