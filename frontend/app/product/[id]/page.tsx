"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFavorites } from "@/contexts/favorites-context"
import { useAuth } from "@/contexts/auth-context-api"
import { mockWatches } from "@/lib/watches-data"
import { getApiClient } from "@/lib/api-client"
import { Watch } from "@/types/api"
import { 
  Heart, 
  ShoppingCart, 
  Shield, 
  Truck, 
  ArrowLeft,
  Star,
  Clock,
  Award,
  CheckCircle,
  ShoppingBag,
  RotateCcw,
  Loader2
} from "lucide-react"

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { user } = useAuth()
  const [selectedImage, setSelectedImage] = useState(0)
  const [watch, setWatch] = useState<Watch | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const watchId = params.id as string

  useEffect(() => {
    const loadWatch = async () => {
      if (!watchId) return
      
      try {
        setLoading(true)
        setError(null)
        
        console.log('Loading watch with ID:', watchId)
        
        // First try to find in mock data (for marketplace items)
        const mockWatch = mockWatches.find((w) => w.id === watchId)
        
        if (mockWatch) {
          console.log('Found mock watch:', mockWatch.brand, mockWatch.name)
          // Convert mock data to Watch type
          const convertedWatch: Watch = {
            id: parseInt(mockWatch.id),
            brand: mockWatch.brand,
            model: mockWatch.name,
            reference: mockWatch.id,
            serial_number: `SN${mockWatch.id}`,
            condition: mockWatch.condition as 'novo' | 'seminovo' | 'usado',
            price: mockWatch.price,
            crypto_price: mockWatch.cryptoPrice,
            description: mockWatch.description,
            images: mockWatch.images,
            store_id: 1,
            is_active: true,
            is_sold: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          setWatch(convertedWatch)
          setLoading(false)
          return
        }
        
        console.log('Mock watch not found, trying API...')
        // If not found in mock data, try API
        const response = await getApiClient().getWatch(watchId)
        if (response.data) {
          setWatch(response.data)
        } else {
          setError("Relógio não encontrado")
        }
      } catch (err) {
        console.error("Error loading watch:", err)
        setError("Erro ao carregar relógio")
      } finally {
        setLoading(false)
      }
    }

    if (watchId) {
      loadWatch()
    }
  }, [watchId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-primary">Carregando relógio...</p>
      </div>
    )
  }

  if (error || !watch) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">{error || "Relógio não encontrado"}</h1>
          <Button onClick={() => router.back()} className="mt-4">Voltar</Button>
        </div>
        <Footer />
      </div>
    )
  }

  const handleAddToCart = () => {
    if (!user) {
      router.push("/login")
      return
    }
    router.push("/checkout")
  }

  const handleToggleFavorite = () => {
    if (!user) {
      router.push("/login")
      return
    }
    // Assuming watch.id is a number for the API call
    toggleFavorite(watch.id.toString())
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
              <Image
                src={watch.images?.[selectedImage] || "/placeholder.svg"}
                alt={watch.model}
                layout="fill"
                objectFit="cover"
                className="transition-opacity duration-300"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {watch.condition === 'novo' && <Badge className="bg-primary text-primary-foreground">Novo</Badge>}
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="flex gap-2 overflow-x-auto">
              {watch.images && watch.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? "border-primary" : "border-transparent"
                  }`}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${watch.brand} ${watch.model} - Imagem ${index + 1}`}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-muted-foreground font-medium mb-2">{watch.brand}</p>
              <h1 className="font-serif text-3xl font-bold text-foreground mb-4">{watch.model}</h1>

            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-foreground">${watch.price.toLocaleString()}</span>
                <span className="text-lg text-primary font-medium">{watch.crypto_price || 'N/A'}</span>
              </div>
              <p className="text-sm text-muted-foreground">Preço em criptomoedas pode variar conforme cotação</p>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Descrição</h3>
              <p className="text-muted-foreground leading-relaxed">{watch.description}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button className="flex-1" onClick={handleAddToCart}>
                <ShoppingBag className="h-4 w-4 mr-2" />
                Comprar Agora
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleToggleFavorite}
                className={isFavorite(watch.id.toString()) ? "text-red-500 border-red-500" : ""}
              >
                <Heart className={`h-4 w-4 ${isFavorite(watch.id.toString()) ? "fill-current" : ""}`} />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-primary" />
                <span>Garantia 2 anos</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-primary" />
                <span>Frete grátis</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <RotateCcw className="h-4 w-4 text-primary" />
                <span>Troca em 30 dias</span>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="font-serif text-xl font-bold mb-4">Especificações Técnicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Marca</span>
                <span className="text-sm">{watch.brand}</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Modelo</span>
                <span className="text-sm">{watch.model}</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Referência</span>
                <span className="text-sm">{watch.reference}</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Número de Série</span>
                <span className="text-sm">{watch.serial_number}</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">Condição</span>
                <span className="text-sm capitalize">{watch.condition}</span>
              </div>
              {watch.year && (
                <div className="flex flex-col space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Ano</span>
                  <span className="text-sm">{watch.year}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}
