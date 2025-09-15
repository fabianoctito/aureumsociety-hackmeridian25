"use client"

import { useState } from "react"
import Image from "next/image"
import { useFavorites } from "@/contexts/favorites-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Heart, ShoppingBag, Star, Shield, Truck, RotateCcw } from "lucide-react"

interface Watch {
  id: string
  name: string
  brand: string
  price: number
  cryptoPrice: string
  image: string
  isNew?: boolean
  isLimited?: boolean
}

interface WatchQuickViewProps {
  isOpen: boolean
  onClose: () => void
  watch: Watch
  onAddToCart: () => void
  onToggleFavorite: () => void
}

export function WatchQuickView({ isOpen, onClose, watch, onAddToCart, onToggleFavorite }: WatchQuickViewProps) {
  const { isFavorite } = useFavorites()
  const [selectedImage, setSelectedImage] = useState(0)

  // Mock additional images for demo
  const images = [
    watch.image,
    "/luxury-watch-side-view.png",
    "/luxury-watch-back-view.png",
    "/luxury-watch-detail-view.png",
  ]

  const specifications = [
    { label: "Movimento", value: "Automático Suíço" },
    { label: "Caixa", value: "Aço Inoxidável 42mm" },
    { label: "Resistência à Água", value: "100m" },
    { label: "Cristal", value: "Safira Anti-reflexo" },
    { label: "Pulseira", value: "Aço Inoxidável" },
    { label: "Garantia", value: "2 Anos Internacional" },
  ]

  

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {watch.brand} {watch.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
              <Image
                src={images[selectedImage] || "/placeholder.svg"}
                alt={`${watch.brand} ${watch.name}`}
                fill
                className="object-cover"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {watch.isNew && (
                  <Badge variant="secondary" className="bg-primary text-primary-foreground">
                    Novo
                  </Badge>
                )}
                {watch.isLimited && (
                  <Badge variant="outline" className="bg-background/90 backdrop-blur-sm">
                    Edição Limitada
                  </Badge>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="flex gap-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? "border-primary" : "border-muted"
                  }`}
                >
                  <Image src={img || "/placeholder.svg"} alt={`View ${index + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(127 avaliações)</span>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-foreground">${watch.price.toLocaleString()}</div>
                <div className="text-lg text-primary font-medium">{watch.cryptoPrice}</div>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-semibold">Descrição</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Este magnífico relógio representa o ápice da relojoaria de luxo, combinando tradição suíça com inovação
                moderna. Cada detalhe foi meticulosamente crafted para oferecer precisão excepcional e elegância
                atemporal.
              </p>
            </div>

            <Separator />

            {/* Specifications */}
            <div className="space-y-3">
              <h3 className="font-semibold">Especificações</h3>
              <div className="grid grid-cols-1 gap-2">
                {specifications.map((spec, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{spec.label}:</span>
                    <span className="font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-primary" />
                <span>Garantia 2 Anos</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-primary" />
                <span>Frete Grátis</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <RotateCcw className="h-4 w-4 text-primary" />
                <span>Troca em 30 dias</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-primary" />
                <span>Certificado</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  
                  onToggleFavorite()
                }}
                className="flex-1 bg-transparent"
              >
                <Heart className={`h-4 w-4 mr-2 ${isFavorite(watch.id) ? "fill-red-500 text-red-500" : ""}`} />
                {isFavorite(watch.id) ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
              </Button>
              <Button
                size="lg"
                onClick={() => {
                  
                  onAddToCart()
                  onClose() // Close modal after adding to cart
                }}
                className="flex-1"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Comprar Agora
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
