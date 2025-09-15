"use client"

import { useAuth } from "@/contexts/auth-context-api"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Eye, Package, TrendingUp } from "lucide-react"

interface Product {
  id: string
  name: string
  brand: string
  price: number
  category: string
  status: "active" | "inactive" | "sold"
  stock: number
  image: string
  description: string
  createdAt: string
}

export default function StoreProductsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    if (!user || user.role !== "store") {
      router.push("/login")
      return
    }

    // Mock products data for store
    const mockProducts: Product[] = [
      {
        id: "1",
        name: "Submariner Date",
        brand: "Rolex",
        price: 85000,
        category: "Esportivo",
        status: "active",
        stock: 2,
        image: "/luxury-rolex-submariner.png",
        description: "Relógio icônico de mergulho com resistência à água de 300m",
        createdAt: "2024-01-15",
      },
      {
        id: "2",
        name: "Speedmaster Professional",
        brand: "Omega",
        price: 45000,
        category: "Cronógrafo",
        status: "active",
        stock: 1,
        image: "/omega-speedmaster-luxury-watch.png",
        description: "O relógio que foi à lua, cronógrafo manual clássico",
        createdAt: "2024-01-10",
      },
      {
        id: "3",
        name: "Royal Oak",
        brand: "Audemars Piguet",
        price: 120000,
        category: "Luxo",
        status: "sold",
        stock: 0,
        image: "/audemars-piguet-royal-oak-luxury-watch.png",
        description: "Ícone do design octogonal em aço inoxidável",
        createdAt: "2024-01-05",
      },
    ]

    setProducts(mockProducts)
    setFilteredProducts(mockProducts)
  }, [user, router])

  useEffect(() => {
    let filtered = products

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter)
    }

    setFilteredProducts(filtered)
  }, [searchTerm, statusFilter, products])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Ativo</Badge>
      case "inactive":
        return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">Inativo</Badge>
      case "sold":
        return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">Vendido</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (!user || user.role !== "store") return null

  const totalProducts = products.length
  const activeProducts = products.filter((p) => p.status === "active").length
  const totalValue = products.filter((p) => p.status === "active").reduce((sum, p) => sum + p.price * p.stock, 0)

  return (
    <div className="min-h-screen bg-background">

      <main className="container mx-auto px-4 py-8">
        {/* Store Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Produtos</p>
                  <p className="text-2xl font-bold text-foreground">{totalProducts}</p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Produtos Ativos</p>
                  <p className="text-2xl font-bold text-foreground">{activeProducts}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="text-2xl font-bold text-primary">
                    R$ {totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Meus Produtos</CardTitle>
              <Button onClick={() => router.push("/store/products/add")}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Produto
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="sold">Vendido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={64}
                      height={64}
                      className="rounded-lg object-cover bg-muted"
                    />

                    <div>
                      <h3 className="font-semibold text-foreground">
                        {product.brand} {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusBadge(product.status)}
                        <span className="text-sm text-muted-foreground">Estoque: {product.stock}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        R$ {product.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-muted-foreground">Criado em {product.createdAt}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredProducts.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nenhum produto encontrado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
