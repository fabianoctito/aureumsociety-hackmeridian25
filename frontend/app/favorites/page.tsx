"use client"

import { Footer } from "@/components/layout/footer"
import { WatchCard } from "@/components/marketplace/watch-card"
import { useFavorites } from "@/contexts/favorites-context"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingBag } from "lucide-react"

// Extended mock data for more watches
const allWatches = [
  {
    id: "1",
    name: "Submariner Date",
    brand: "Rolex",
    price: 12500,
    cryptoPrice: "0.285 BTC",
    image: "/luxury-rolex-submariner.png",
    isNew: true,
  },
  {
    id: "2",
    name: "Nautilus 5711/1A",
    brand: "Patek Philippe",
    price: 85000,
    cryptoPrice: "1.94 BTC",
    image: "/patek-philippe-nautilus-luxury-watch.png",
    isLimited: true,
  },
  {
    id: "3",
    name: "Royal Oak Offshore",
    brand: "Audemars Piguet",
    price: 32000,
    cryptoPrice: "0.73 BTC",
    image: "/audemars-piguet-royal-oak-luxury-watch.png",
  },
  {
    id: "4",
    name: "Speedmaster Professional",
    brand: "Omega",
    price: 6500,
    cryptoPrice: "0.148 BTC",
    image: "/omega-speedmaster-luxury-watch.png",
    isNew: true,
  },
  {
    id: "5",
    name: "Santos de Cartier",
    brand: "Cartier",
    price: 7200,
    cryptoPrice: "0.164 BTC",
    image: "/cartier-santos-luxury-watch.png",
  },
  {
    id: "6",
    name: "Navitimer B01",
    brand: "Breitling",
    price: 8900,
    cryptoPrice: "0.203 BTC",
    image: "/breitling-navitimer-luxury-watch.png",
  },
  {
    id: "7",
    name: "Daytona Cosmograph",
    brand: "Rolex",
    price: 28000,
    cryptoPrice: "0.64 BTC",
    image: "/placeholder-6zz16.png",
    isLimited: true,
  },
  {
    id: "8",
    name: "Aquanaut 5167A",
    brand: "Patek Philippe",
    price: 45000,
    cryptoPrice: "1.03 BTC",
    image: "/placeholder-4eqns.png",
  },
  {
    id: "9",
    name: "Big Bang Unico",
    brand: "Hublot",
    price: 18500,
    cryptoPrice: "0.42 BTC",
    image: "/placeholder-j3329.png",
    isNew: true,
  },
  {
    id: "10",
    name: "Seamaster Planet Ocean",
    brand: "Omega",
    price: 5800,
    cryptoPrice: "0.132 BTC",
    image: "/placeholder-m1iss.png",
  },
]

export default function FavoritesPage() {
  const { favorites, removeFromFavorites } = useFavorites()

  const favoriteWatches = allWatches.filter((watch) => favorites.includes(watch.id))

  const handleAddToCart = (id: string) => {
  }

  const handleToggleFavorite = (id: string) => {
    removeFromFavorites(id)
  }

  const handleQuickView = (id: string) => {
  }

  return (
    <div className="min-h-screen bg-background">

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-red-50 dark:bg-red-950">
                <Heart className="h-8 w-8 text-red-500" />
              </div>
            </div>
            <h1 className="text-3xl font-bold">Meus Favoritos</h1>
            <p className="text-muted-foreground">
              {favoriteWatches.length > 0
                ? `${favoriteWatches.length} relógio${favoriteWatches.length > 1 ? "s" : ""} na sua lista de favoritos`
                : "Você ainda não tem relógios favoritos"}
            </p>
          </div>

          {/* Favorites Grid */}
          {favoriteWatches.length > 0 ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {favoriteWatches.map((watch) => (
                <WatchCard
                  key={watch.id}
                  {...watch}
                  onAddToCart={handleAddToCart}
                  onToggleFavorite={handleToggleFavorite}
                  onQuickView={handleQuickView}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 space-y-6">
              <div className="flex justify-center">
                <div className="p-6 rounded-full bg-muted">
                  <Heart className="h-12 w-12 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">    
                <h3 className="text-xl font-semibold">Nenhum favorito ainda</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Explore nossa coleção e adicione relógios aos seus favoritos para encontrá-los facilmente depois.
                </p>
              </div>
              <Button asChild>
                <a href="/marketplace">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Explorar Marketplace
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
