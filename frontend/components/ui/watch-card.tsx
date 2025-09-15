"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, ShoppingCart, Star, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface WatchCardProps {
  id: string
  name: string
  brand: string
  price: number
  cryptoPrice: string
  image: string
  rating?: number
  reviews?: number
  isNew?: boolean
  isLimited?: boolean
  isFavorite?: boolean
  onToggleFavorite?: () => void
  onAddToCart?: () => void
  className?: string
}

export function WatchCard({
  id,
  name,
  brand,
  price,
  cryptoPrice,
  image,
  rating = 0,
  reviews = 0,
  isNew = false,
  isLimited = false,
  isFavorite = false,
  onToggleFavorite,
  onAddToCart,
  className,
}: WatchCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  return (
    <Card className={cn("relative w-full max-w-sm mx-auto group", className)}>
      <CardContent className="p-0">
        {/* Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {isNew && (
            <Badge className="bg-green-500 hover:bg-green-600 text-white">
              <Zap className="w-3 h-3 mr-1" />
              Novo
            </Badge>
          )}
          {isLimited && (
            <Badge className="bg-red-500 hover:bg-red-600 text-white">
              Edição Limitada
            </Badge>
          )}
        </div>

        {/* Favorite Button */}
        {onToggleFavorite && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white shadow-lg"
            onClick={onToggleFavorite}
          >
            <Heart 
              className={cn(
                "w-4 h-4",
                isFavorite ? "text-red-500 fill-red-500" : "text-gray-600"
              )} 
            />
          </Button>
        )}

        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-t-xl bg-gradient-to-br from-luxury-cream to-luxury-champagne">
          <Image
            src={image}
            alt={`${brand} ${name}`}
            fill
            className="object-contain p-6 group-hover:scale-110 transition-transform duration-700"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Brand & Name */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-gold-600 uppercase tracking-wide">
              {brand}
            </p>
            <h3 className="font-serif text-lg font-semibold text-foreground line-clamp-2 leading-tight">
              {name}
            </h3>
          </div>

          {/* Rating */}
          {rating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-4 h-4",
                      i < Math.floor(rating) 
                        ? "text-gold-500 fill-gold-500" 
                        : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                ({reviews})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                {formatPrice(price)}
              </span>
            </div>
            <p className="text-sm text-gold-600 font-medium">
              {cryptoPrice}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Link href={`/product/${id}`} className="flex-1">
              <Button 
                variant="outline" 
                className="w-full border-gold-200 hover:border-gold-400 hover:bg-gold-50"
              >
                Ver Detalhes
              </Button>
            </Link>
            {onAddToCart && (
              <Button 
                variant="luxury" 
                size="icon-lg"
                onClick={onAddToCart}
                className="shrink-0"
              >
                <ShoppingCart className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default WatchCard