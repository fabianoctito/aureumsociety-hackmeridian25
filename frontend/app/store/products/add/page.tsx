"use client"

import type React from "react"
import Image from "next/image"

import { useAuth } from "@/contexts/auth-context-api"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Upload, X, ArrowLeft, Save } from "lucide-react"

export default function AddProductPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [mainImage, setMainImage] = useState<string>("")
  const [thumbnails, setThumbnails] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    model: "",
    price: "",
    originalPrice: "",
    category: "",
    condition: "",
    material: "",
    diameter: "",
    movement: "",
    waterResistance: "",
    stock: "1",
    description: "",
    features: "",
    warranty: "",
    origin: "",
  })

  useEffect(() => {
    if (!user || user.role !== "store") {
      router.push("/login")
      return
    }
  }, [user, router])

  const handleImageUpload = (type: "main" | "thumbnail") => {
    // Simular upload de imagem
    const mockImageUrl = `/placeholder.svg?height=400&width=400&text=${type === "main" ? "Principal" : "Miniatura"}`

    if (type === "main") {
      setMainImage(mockImageUrl)
    } else {
      if (thumbnails.length < 4) {
        setThumbnails([...thumbnails, mockImageUrl])
      }
    }
  }

  const removeThumbnail = (index: number) => {
    setThumbnails(thumbnails.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simular salvamento do produto
    router.push("/store/products")
  }

  if (!user || user.role !== "store") return null

  return (
    <div className="min-h-screen bg-background">

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-serif font-bold text-foreground">Product Registration</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Seção de Imagens */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Imagem Principal */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Main Image</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                    {mainImage ? (
                      <div className="relative">
                        <Image
                          src={mainImage || "/placeholder.svg"}
                          alt="Main product"
                          width={400}
                          height={192}
                          className="object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => setMainImage("")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="cursor-pointer" onClick={() => handleImageUpload("main")}>
                        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Click to add main image</p>
                        <p className="text-sm text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Miniaturas */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Additional Images</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="aspect-square">
                        {thumbnails[index] ? (
                          <div className="relative h-full">
                            <Image
                              src={thumbnails[index] || "/placeholder.svg"}
                              alt={`Thumbnail ${index + 1}`}
                              width={100}
                              height={100}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 h-6 w-6 p-0"
                              onClick={() => removeThumbnail(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div
                            className="h-full border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                            onClick={() => handleImageUpload("thumbnail")}
                          >
                            <Upload className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações do Produto */}
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Submariner Date"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="brand">Brand *</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="Ex: Rolex"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="Ex: 126610LN"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Sale Price (R$) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="85000"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="originalPrice">Original Price (R$)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      placeholder="95000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="esportivo">Sports</SelectItem>
                        <SelectItem value="cronografo">Chronograph</SelectItem>
                        <SelectItem value="luxo">Luxury</SelectItem>
                        <SelectItem value="classico">Classic</SelectItem>
                        <SelectItem value="dress">Dress Watch</SelectItem>
                        <SelectItem value="outros">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="condition">Condition *</Label>
                    <Select
                      value={formData.condition}
                      onValueChange={(value) => setFormData({ ...formData, condition: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="novo">New</SelectItem>
                        <SelectItem value="seminovo">Like New</SelectItem>
                        <SelectItem value="usado">Used</SelectItem>
                        <SelectItem value="vintage">Vintage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Especificações Técnicas */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Technical Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="material">Material</Label>
                  <Input
                    id="material"
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    placeholder="Ex: Stainless Steel"
                  />
                </div>
                <div>
                  <Label htmlFor="diameter">Diameter (mm)</Label>
                  <Input
                    id="diameter"
                    value={formData.diameter}
                    onChange={(e) => setFormData({ ...formData, diameter: e.target.value })}
                    placeholder="Ex: 40"
                  />
                </div>
                <div>
                  <Label htmlFor="movement">Movement</Label>
                  <Input
                    id="movement"
                    value={formData.movement}
                    onChange={(e) => setFormData({ ...formData, movement: e.target.value })}
                    placeholder="Ex: Automatic"
                  />
                </div>
                <div>
                  <Label htmlFor="waterResistance">Water Resistance</Label>
                  <Input
                    id="waterResistance"
                    value={formData.waterResistance}
                    onChange={(e) => setFormData({ ...formData, waterResistance: e.target.value })}
                    placeholder="Ex: 300m"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações Adicionais */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="description">Detailed Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the characteristics, history and important details of the watch..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="1"
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="warranty">Warranty</Label>
                  <Input
                    id="warranty"
                    value={formData.warranty}
                    onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                    placeholder="Ex: 2 years"
                  />
                </div>
                <div>
                  <Label htmlFor="origin">Origin</Label>
                  <Input
                    id="origin"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    placeholder="Ex: Switzerland"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="features">Special Features</Label>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Ex: Unidirectional bezel, Chromalight luminescence, calibre 3235..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-8">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              <Save className="h-4 w-4 mr-2" />
              Complete Registration
            </Button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  )
}
