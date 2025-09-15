"use client"

import { useState, useMemo } from "react"
import { WatchCard } from "@/components/marketplace/watch-card"
import { Filters } from "@/components/marketplace/filters"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Grid, List, SlidersHorizontal, Loader2 } from "lucide-react"


import { mockWatches } from "@/lib/watches-data"

interface FilterState {
  priceRange: [number, number]
  selectedBrands: string[]
  selectedCategories: string[]
  search?: string
}

export function MarketplaceListings() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState("newest")
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 100000],
    selectedBrands: [],
    selectedCategories: [],
    search: ""
  })

  // Mock data
  const listingsLoading = false;
  const listingsError = null;
  const brandsLoading = false;
  const categoriesLoading = false;

  const listings = mockWatches.map(watch => ({
    ...watch,
    created_at: new Date().toISOString(),
    views_count: Math.floor(Math.random() * 1000),
    watches: watch,
  }));

  const brands = [...new Set(mockWatches.map(watch => watch.brand))].map(brand => ({ name: brand }));
  const categories = [...new Set(mockWatches.map(watch => watch.category))].map(category => ({ name: category }));

  // Process and filter listings
  const filteredAndSortedWatches = useMemo(() => {
    if (!listings) return []

    // Client-side filtering for brands and categories (since we can't do complex filtering in the initial query)
    const filtered = listings.filter((listing) => {
      const watch = listing.watches || listing.user_watches?.watches
      const brand = watch?.brands || { name: listing.user_watches?.custom_brand || 'Custom' }
      const category = watch?.categories || { name: 'Luxury Watch' }

      const matchesBrand = filters.selectedBrands.length === 0 || filters.selectedBrands.includes(brand.name)
      const matchesCategory = filters.selectedCategories.length === 0 || filters.selectedCategories.includes(category.name)

      return matchesBrand && matchesCategory
    })

    // Sort listings
    const sorted = [...filtered]
    switch (sortBy) {
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price)
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price)
      case "brand":
        const getBrandName = (listing: any) => {
          const watch = listing.watches || listing.user_watches?.watches
          return watch?.brands?.name || listing.user_watches?.custom_brand || 'Custom'
        }
        return sorted.sort((a, b) => getBrandName(a).localeCompare(getBrandName(b)))
      case "newest":
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      case "popular":
        return sorted.sort((a, b) => b.views_count - a.views_count)
      default:
        return sorted
    }
  }, [listings, filters, sortBy])

  // Format listing data for WatchCard component
  const formatWatchData = (listing: any) => {
    const watch = listing.watches || listing.user_watches?.watches
    const brand = watch?.brands || { name: listing.user_watches?.custom_brand || 'Custom' }
    const category = watch?.categories?.name || 'Luxury Watch'
    
    // Get main image
    const mainImage = watch?.watch_images?.find((img: any) => img.image_type === 'main')?.image_url ||
                     watch?.watch_images?.[0]?.image_url ||
                     '/placeholder.svg'

    return {
      id: listing.id,
      name: listing.title || watch?.name || listing.user_watches?.custom_name || 'Luxury Watch',
      brand: brand.name,
      price: listing.price,
      cryptoPrice: listing.crypto_prices?.btc ? `${listing.crypto_prices.btc} BTC` : '',
      image: mainImage,
      isNew: false, // Could add logic based on listing date
      isLimited: watch?.is_limited_edition || false,
      category: category,
      condition: listing.condition_rating,
      isAuthenticated: listing.is_authenticated,
      seller: listing.users?.name || 'Vendedor',
      sellerType: listing.users?.user_type || 'client'
    }
  }

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm }))
  }

  if (listingsError) {
    return (
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Erro ao carregar marketplace</h1>
            <p className="text-muted-foreground">{listingsError}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Tentar novamente
            </Button>
          </div>
        </div>
    )
  }

  return (
    <div className="mt-12 space-y-8">
      {/* Filters and Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
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
            {listingsLoading ? (
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

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="w-80 shrink-0">
            <Filters
              onFiltersChange={handleFiltersChange}
            />
          </div>
        )}

        {/* Products Grid */}
        <div className="flex-1">
          {listingsLoading ? (
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
              {filteredAndSortedWatches.map((listing) => {
                const watchData = formatWatchData(listing)
                return (
                  <WatchCard
                    key={listing.id}
                    {...watchData}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
