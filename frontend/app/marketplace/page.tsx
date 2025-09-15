"use client"

import { useState, useMemo, useEffect } from "react"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/marketplace/hero-section"
import { WatchCard } from "@/components/marketplace/watch-card"
import { Filters } from "@/components/marketplace/filters"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Grid, List, SlidersHorizontal, Loader2 } from "lucide-react"
import { getApiClient } from "@/lib/api-client"
import { Watch } from "@/types/api"

interface FilterState {
  priceRange: [number, number]
  selectedBrands: string[]
  selectedCategories: string[]
  selectedConditions: string[]
  search?: string
}

export default function MarketplacePage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(true) // Sempre visível por padrão
  const [sortBy, setSortBy] = useState("newest")
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 100000],
    selectedBrands: [],
    selectedCategories: [],
    selectedConditions: [],
    search: ""
  })

  // State for API data
  const [watches, setWatches] = useState<Watch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch watches from our FastAPI backend or use mock data
  useEffect(() => {
    const loadWatches = async () => {
      try {
        setLoading(true)
        setError(null)

        const apiFilters = {
          brand: filters.selectedBrands.length > 0 ? filters.selectedBrands.join(',') : undefined,
          category: filters.selectedCategories.length > 0 ? filters.selectedCategories.join(',') : undefined,
          condition: filters.selectedConditions.length > 0 ? filters.selectedConditions.join(',') : undefined,
          price_min: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
          price_max: filters.priceRange[1] < 100000 ? filters.priceRange[1] : undefined,
          search: filters.search || undefined,
          sort_by: sortBy !== "newest" ? sortBy : undefined // Only send if not default
        }

        const response = await getApiClient().getWatches(apiFilters)
        console.log('Raw API response:', response)
        
        if (response.data && Array.isArray(response.data)) {
          console.log('Processing', response.data.length, 'items from API')
          // Filter out any error objects that might be in the response
          const validWatches = response.data.filter((watch: any, index: number) => {
            const isValid = watch && 
              typeof watch === 'object' && 
              !(watch.type && watch.loc && watch.msg) && // Not an error object
              (watch.id || watch.brand || watch.model || watch.name)
            
            if (!isValid) {
              console.error(`Invalid watch at index ${index}:`, watch)
            }
            return isValid
          })
          console.log('Valid watches after filtering:', validWatches.length)
          setWatches(validWatches)
        } else {
          console.log('No valid data from API, using mock data')
          // Fallback to mock data if API fails or returns no data
          const { mockWatches } = await import('@/lib/watches-data')
          setWatches(mockWatches as any)
          if (response.error) {
            console.error('API Error:', response.error)
            // Ensure error is a string
            const errorMessage = typeof response.error === 'string' 
              ? response.error 
              : 'Erro na API: ' + String(response.error || 'Erro desconhecido')
            setError(errorMessage)
          }
        }
      } catch (err) {
        console.error('Exception loading watches:', err)
        // Fallback to mock data on network error
        try {
          const { mockWatches } = await import('@/lib/watches-data')
          setWatches(mockWatches as any)
          setError(null)
        } catch (mockError) {
          console.error('Error loading mock data:', mockError)
          setError('Erro ao carregar relógios')
        }
      } finally {
        setLoading(false)
      }
    }

    loadWatches()
  }, [filters, sortBy])

  // Process and filter watches - client-side filtering is now removed as filters are sent to backend
  const filteredAndSortedWatches = useMemo(() => {
    if (!watches) return []
    return watches // Backend handles filtering and sorting
  }, [watches])

  // Format watch data for WatchCard component
  const formatWatchData = (watch: any) => {
    // Check if watch is an error object or invalid
    if (!watch || typeof watch !== 'object' || (watch.type && watch.loc && watch.msg)) {
      console.error("Invalid watch object received in formatWatchData:", watch);
      return null;
    }
    
    // Ensure we have at least an ID
    if (!watch.id && !watch.brand && !watch.model && !watch.name) {
      console.error("Watch missing required fields in formatWatchData:", watch);
      return null;
    }
    
    try {
      const result = {
        id: watch.id?.toString() || String(watch.id) || Math.random().toString(),
        name: watch.name || `${watch.brand || ''} ${watch.model || ''}`.trim() || 'Relógio',
        brand: watch.brand || 'Marca não informada',
        price: typeof watch.price === 'number' ? watch.price : 
               typeof watch.current_value_brl === 'number' ? watch.current_value_brl : 0,
        cryptoPrice: watch.crypto_price || watch.cryptoPrice || '0.001 BTC',
        image: (watch.images && watch.images[0]) || watch.image_url || watch.image || '/placeholder.svg',
        isNew: watch.condition === 'novo' || watch.isNew || false,
        isLimited: watch.isLimited || false,
        category: watch.category || watch.condition || 'Relógio',
        condition: watch.condition || 'usado',
        isAuthenticated: true,
        seller: watch.store_name || 'Loja Premium',
        sellerType: 'store' as const
      }
      console.log('Formatted watch data:', result.id, result.name)
      return result
    } catch (formatError) {
      console.error('Error formatting watch data:', formatError, watch)
      return null
    }
  }

  const handleFiltersChange = (newFilters: FilterState) => {
    // Verificar se há mudanças reais antes de atualizar o estado
    if (JSON.stringify(filters) !== JSON.stringify(newFilters)) {
      setFilters(newFilters);
    }
  }

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm }))
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Erro ao carregar marketplace</h1>
            <p className="text-muted-foreground">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Tentar novamente
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
    
      <main className="container mx-auto px-4 py-8">
        <HeroSection />

        <div className="mt-12 space-y-8">
          {/* Filters and Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
              </Button>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mais recentes</SelectItem>
                  <SelectItem value="popular">Mais populares</SelectItem>
                  <SelectItem value="price-low">Menor preço</SelectItem>
                  <SelectItem value="price-high">Maior preço</SelectItem>
                  <SelectItem value="brand">Marca A-Z</SelectItem>
                </SelectContent>
              </Select>

              <div className="text-sm text-muted-foreground">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Carregando...
                  </div>
                ) : (
                  `${filteredAndSortedWatches.length} relógios encontrados`
                )}
              </div>
            </div>

            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Filters Sidebar */}
            {showFilters && (
              <div className="w-80 shrink-0">
                <div className="sticky top-4">
                  <Filters
                    onFiltersChange={handleFiltersChange}
                    filters={filters}
                  />
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className="flex-1 min-w-0">{/* min-w-0 prevents flex overflow */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-muted rounded-lg aspect-square mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredAndSortedWatches.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold mb-2">Nenhum relógio encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    Tente ajustar os filtros ou remover alguns critérios de busca
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setFilters({
                      priceRange: [0, 100000],
                      selectedBrands: [],
                      selectedCategories: [],
                      selectedConditions: [],
                      search: ""
                    })}
                  >
                    Limpar filtros
                  </Button>
                </div>
              ) : (
                <div
                  className={`grid gap-6 ${
                    viewMode === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      : "grid-cols-1"
                  }`}
                >
                  {filteredAndSortedWatches
                    .filter((watch: any) => 
                      watch && 
                      typeof watch === 'object' && 
                      !(watch.type && watch.loc && watch.msg)
                    )
                    .map((watch: any) => {
                      const watchData = formatWatchData(watch)
                      if (!watchData) return null;
                      return (
                        <WatchCard
                          key={watchData.id}
                          {...watchData}
                        />
                      )
                    })
                    .filter(Boolean)} {/* Remove null values */}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
