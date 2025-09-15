"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context-api"
import { Footer } from "@/components/layout/footer"
import { UserWatchCard } from "@/components/user/user-watch-card"
import { ProfileStats } from "@/components/user/profile-stats"
import { AddWatchDialog } from "@/components/user/add-watch-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Grid, List, Lock, Loader2, Plus } from "lucide-react"

import Link from "next/link"

export default function MyWatchesPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  // Mock data
  const watchesLoading = false;
  const watchesError = null;
  const portfolioLoading = false;

  const userWatches = [
    {
      id: "1",
      watches: {
        id: "1",
        name: "Submariner Date",
        brands: {
          name: "Rolex",
        },
        watch_images: [
          {
            image_url: "/luxury-rolex-submariner.png",
            image_type: "main",
          },
        ],
      },
      purchase_price: 85000,
      current_value: 95000,
      purchase_date: "2023-01-15",
      status: "owned",
      condition_rating: 9,
      is_authenticated: true,
      serial_number: "X1234567",
      notes: "Purchased from an authorized dealer.",
    },
    {
      id: "2",
      watches: {
        id: "2",
        name: "Speedmaster Professional",
        brands: {
          name: "Omega",
        },
        watch_images: [
          {
            image_url: "/omega-speedmaster-luxury-watch.png",
            image_type: "main",
          },
        ],
      },
      purchase_price: 45000,
      current_value: 48000,
      purchase_date: "2022-11-20",
      status: "for_sale",
      condition_rating: 8,
      is_authenticated: true,
      serial_number: "Y7654321",
      notes: "Recently serviced.",
    },
  ];

  const portfolio = {
    total_watches: 2,
    total_investment: 130000,
    current_value: 143000,
    account_balance: 500,
  };

  const updateWatch = async (id: string, updates: any) => {
  };

  const deleteWatch = async (id: string) => {
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-6 rounded-full bg-muted">
                <Lock className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Acesso Restrito</h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                Você precisa estar logado para acessar sua coleção de relógios.
              </p>
            </div>
            <Link href="/login">
              <Button size="lg">Fazer Login</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Filter watches based on search and status
  const filteredWatches = userWatches?.filter((watch) => {
    const watchName = watch.watches?.name || ""
    const brandName = watch.watches?.brands?.name || ""
    
    const matchesSearch =
      watchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brandName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === "all" || watch.status === filterStatus
    
    return matchesSearch && matchesStatus
  }) || []

  // Calculate stats from portfolio or fallback to manual calculation
  const stats = portfolio || {
    total_watches: userWatches?.filter(w => w.status !== 'sold').length || 0,
    total_investment: userWatches?.reduce((sum, w) => sum + w.purchase_price, 0) || 0,
    current_value: userWatches?.filter(w => w.status !== 'sold').reduce((sum, w) => sum + (w.current_value || w.purchase_price), 0) || 0,
    account_balance: user.balance_brl || 0
  }

  const totalProfit = (stats.current_value || 0) - (stats.total_investment || 0)

  const handleWatchAction = async (id: string, action: string) => {
    try {
      switch (action) {
        case "sell":
          await updateWatch(id, { status: "for_sale" })
          break
        case "delete":
          if (confirm("Tem certeza que deseja remover este relógio da sua coleção?")) {
            await deleteWatch(id)
          }
          break
        case "edit":
          // Implementar modal de edição
          
          break
        case "view":
          // Navegar para página de detalhes
          
          break
        case "share":
          // Implementar compartilhamento
          
          break
      }
    } catch (error) {
      console.error("Error performing action:", error)
      // Aqui você pode adicionar um toast de erro
    }
  }

  const formatWatchForCard = (userWatch: any) => {
    const watch = userWatch.watches
    const brand = watch?.brands || { name: userWatch.custom_brand || 'Custom' }
    
    // Get main image
    const mainImage = watch?.watch_images?.find((img: any) => img.image_type === 'main')?.image_url ||
                     watch?.watch_images?.[0]?.image_url ||
                     '/placeholder.svg'

    return {
      id: userWatch.id,
      name: watch?.name || userWatch.custom_name || 'Relógio',
      brand: brand.name,
      purchasePrice: userWatch.purchase_price,
      currentValue: userWatch.current_value || userWatch.purchase_price,
      purchaseDate: userWatch.purchase_date,
      image: mainImage,
      status: userWatch.status,
      condition: userWatch.condition_rating,
      isAuthenticated: userWatch.is_authenticated,
      serialNumber: userWatch.serial_number,
      notes: userWatch.notes
    }
  }

  if (watchesError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Erro ao carregar coleção</h1>
            <p className="text-muted-foreground">{watchesError}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
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

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Minha Coleção</h1>
              <p className="text-muted-foreground">Gerencie seus relógios de luxo</p>
            </div>
            <AddWatchDialog 
              onAddWatch={async (watchData) => {
                // Implementar lógica de adicionar relógio
                
              }}
            />
          </div>

          {/* Stats */}
          {portfolioLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-muted rounded-lg h-24"></div>
              ))}
            </div>
          ) : (
            <ProfileStats
              totalWatches={stats.total_watches || 0}
              totalValue={stats.current_value || 0}
              totalInvestment={stats.total_investment || 0}
              totalProfit={totalProfit}
            />
          )}

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar relógios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="owned">Meus Relógios</SelectItem>
                  <SelectItem value="for_sale">À Venda</SelectItem>
                  <SelectItem value="sold">Vendidos</SelectItem>
                </SelectContent>
              </Select>
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

          {/* Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">
                Todos ({userWatches?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="owned">
                Meus Relógios ({userWatches?.filter((w) => w.status === "owned").length || 0})
              </TabsTrigger>
              <TabsTrigger value="for_sale">
                À Venda ({userWatches?.filter((w) => w.status === "for_sale").length || 0})
              </TabsTrigger>
              <TabsTrigger value="sold">
                Vendidos ({userWatches?.filter((w) => w.status === "sold").length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              {watchesLoading ? (
                <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
                  {Array.from({ length: 6 }).map((_, i) => (
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
              ) : (
                <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
                  {filteredWatches.map((userWatch) => {
                    const watchData = formatWatchForCard(userWatch)
                    return (
                      <UserWatchCard
                        key={userWatch.id}
                        {...watchData}
                        onView={(id) => handleWatchAction(id, "view")}
                        onEdit={(id) => handleWatchAction(id, "edit")}
                        onDelete={(id) => handleWatchAction(id, "delete")}
                        onSell={(id) => handleWatchAction(id, "sell")}
                        onShare={(id) => handleWatchAction(id, "share")}
                      />
                    )
                  })}
                </div>
              )}
            </TabsContent>

            {/* Similar structure for other tabs */}
            {["owned", "for_sale", "sold"].map((status) => (
              <TabsContent key={status} value={status} className="mt-6">
                <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
                  {filteredWatches
                    .filter((w) => w.status === status)
                    .map((userWatch) => {
                      const watchData = formatWatchForCard(userWatch)
                      return (
                        <UserWatchCard
                          key={userWatch.id}
                          {...watchData}
                          onView={(id) => handleWatchAction(id, "view")}
                          onEdit={(id) => handleWatchAction(id, "edit")}
                          onDelete={(id) => handleWatchAction(id, "delete")}
                          onSell={(id) => handleWatchAction(id, "sell")}
                          onShare={(id) => handleWatchAction(id, "share")}
                        />
                      )
                    })}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {filteredWatches.length === 0 && !watchesLoading && (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <div className="p-6 rounded-full bg-muted">
                  <Plus className="h-12 w-12 text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum relógio encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterStatus !== "all" 
                  ? "Tente ajustar os filtros ou termos de busca"
                  : "Comece adicionando seu primeiro relógio à coleção"
                }
              </p>
              {(!searchTerm && filterStatus === "all") && (
                <AddWatchDialog 
                  onAddWatch={async (watchData) => {
                    
                  }}
                  trigger={
                    <Button size="lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Primeiro Relógio
                    </Button>
                  }
                />
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
