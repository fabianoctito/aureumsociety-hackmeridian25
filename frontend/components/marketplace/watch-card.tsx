"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useFavorites } from "@/contexts/favorites-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingBag, Eye } from "lucide-react"
import { WatchQuickView } from "./watch-quick-view"

interface WatchCardProps {
  id: string
  name: string
  brand: string
  price: number
  cryptoPrice: string
  image: string
  isNew?: boolean
  isLimited?: boolean
  onAddToCart?: (id: string) => void
  onToggleFavorite?: (id: string) => void
  onQuickView?: (id: string) => void
}

export function WatchCard({
  id,
  name,
  brand,
  price,
  cryptoPrice,
  image,
  isNew = false,
  isLimited = false,
  onAddToCart,
  onToggleFavorite,
  onQuickView,
}: WatchCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const [isHovered, setIsHovered] = useState(false)
  const [showQuickView, setShowQuickView] = useState(false)
  const router = useRouter()

  const handleToggleFavorite = () => {
    toggleFavorite(id)
    onToggleFavorite?.(id)

    if (!isFavorite(id)) {
      router.push("/favorites")
    }
  }

  const handleAddToCart = () => {
    onAddToCart?.(id)
    router.push("/checkout")
  }

  const handleQuickView = () => {
    router.push(`/product/${id}`)
    onQuickView?.(id)
  }

  const handleCardClick = () => {
    router.push(`/product/${id}`)
  }

  return (
    <>
      <Card
        className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        <div className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={image || "/placeholder.svg"}
            alt={`${brand} ${name}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isNew && (
              <Badge variant="secondary" className="bg-primary text-primary-foreground">
                New
              </Badge>
            )}
            {isLimited && (
              <Badge variant="outline" className="bg-background/90 backdrop-blur-sm">
                Limited Edition
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div
            className={`absolute top-3 right-3 flex flex-col gap-2 transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0 bg-background/90 backdrop-blur-sm hover:bg-background"
              onClick={(e) => {
                e.stopPropagation()
                handleToggleFavorite()
              }}
              aria-label={isFavorite(id) ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={`h-4 w-4 ${isFavorite(id) ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0 bg-background/90 backdrop-blur-sm hover:bg-background"
              onClick={(e) => {
                e.stopPropagation()
                handleQuickView()
              }}
              aria-label="View product details"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          {/* Hover Overlay */}
          <div
            className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>

        <CardContent className="p-4 space-y-3">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{brand}</p>
            <h3 className="font-semibold text-foreground line-clamp-2 text-balance">{name}</h3>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-foreground">${price?.toLocaleString() || '0.00'}</span>
              <span className="text-sm text-primary font-medium">{cryptoPrice}</span>
            </div>
          </div>

          <Button 
            className="w-full" 
            onClick={(e) => {
              e.stopPropagation()
              handleAddToCart()
            }}
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Buy Now
          </Button>
        </CardContent>
      </Card>

      {/* Quick View Modal */}
      <WatchQuickView
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
        watch={{
          id,
          name,
          brand,
          price,
          cryptoPrice,
          image,
          isNew,
          isLimited,
        }}
        onAddToCart={handleAddToCart}
        onToggleFavorite={handleToggleFavorite}
      />
    </>
  )
}
