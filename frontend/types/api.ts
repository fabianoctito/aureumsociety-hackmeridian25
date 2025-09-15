// TypeScript interfaces based on backend Pydantic schemas

export interface User {
  id: number
  full_name: string
  email: string
  role: 'admin' | 'store' | 'evaluator' | 'user'
  stellar_public_key?: string
  balance_brl: number
  balance_xlm: number
  is_active: boolean
  created_at: string
  
  // Legacy properties for compatibility
  type?: 'admin' | 'store' | 'evaluator' | 'user' | 'client'
  balance?: number
}

export interface UserCreate {
  full_name: string
  email: string
  password: string
  role: 'admin' | 'store' | 'evaluator' | 'user'
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export interface Watch {
  id: number
  brand: string
  model: string
  reference: string
  serial_number: string
  year?: number
  condition: 'novo' | 'seminovo' | 'usado'
  price: number
  crypto_price?: string
  description?: string
  images: string[]
  store_id: number
  store_name?: string
  current_owner_user_id?: number
  is_active: boolean
  is_sold: boolean
  is_favorite?: boolean
  created_at: string
  updated_at: string
  // NFT and blockchain fields
  nft_token_id?: string
  stellar_asset_code?: string
  escrow_account?: string
}

export interface WatchCreate {
  brand: string
  model: string
  reference: string
  serial_number: string
  year?: number
  condition: 'novo' | 'seminovo' | 'usado'
  price: number
  description?: string
  images?: string[]
}

export interface WatchFilter {
  brand?: string
  model?: string
  min_price?: number
  max_price?: number
  condition?: string
  category?: string 
  year_from?: number
  year_to?: number
  price_min?: number // For compatibility with frontend filters
  price_max?: number // For compatibility with frontend filters
  search?: string
  sort_by?: string
  skip?: number
  limit?: number
}

export interface Store {
  id: number
  user_id: number
  name: string
  cnpj?: string
  address?: string
  phone?: string
  email?: string
  credentialed: boolean
  commission_rate: number
  created_at: string
}

export interface Favorite {
  id: number
  user_id: number
  watch_id: number
  created_at: string
}

export interface Purchase {
  id: number
  buyer_user_id: number
  watch_id: number
  amount: number
  payment_method: 'brl' | 'xlm' | 'crypto'
  stellar_transaction_id?: string
  escrow_account?: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  created_at: string
}

export interface Notification {
  id: number
  user_id: number
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  created_at: string
}

export interface Evaluation {
  id: number
  watch_id: number
  evaluator_id: number
  authenticity_score: number
  condition_score: number
  market_value: number
  notes?: string
  images: string[]
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

// API Response wrapper
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  detail?: string
  message?: string
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  pages: number
}

// Error types
export interface ApiError {
  detail: string
  status_code: number
  error_type?: string
}