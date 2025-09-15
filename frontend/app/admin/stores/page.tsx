"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Search, 
  MoreHorizontal, 
  Edit, 
  Ban, 
  CheckCircle,
  XCircle,
  Eye,
  Store,
  Package,
  DollarSign,
  Star,
  Clock,
  AlertCircle
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getApiClient } from "@/lib/api-client"

interface AdminStore {
  id: number
  name: string
  description?: string
  owner_id: number
  owner_name: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  total_watches: number
  total_sales: number
  average_rating: number
  last_activity?: string
}

export default function AdminStoresPage() {
  const [stores, setStores] = useState<AdminStore[]>([])
  const [filteredStores, setFilteredStores] = useState<AdminStore[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedStore, setSelectedStore] = useState<AdminStore | null>(null)
  const [showStoreDetails, setShowStoreDetails] = useState(false)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve')
  const [approvalReason, setApprovalReason] = useState("")

  useEffect(() => {
    loadStores()
  }, [])

  useEffect(() => {
    filterStores()
  }, [stores, searchTerm, statusFilter])

  const loadStores = async () => {
    try {
      setLoading(true)
      const apiClient = getApiClient()
      const response = await apiClient.get<AdminStore[]>("/admin/stores")
      
      if (response.data) {
        setStores(response.data)
      }
    } catch (error) {
      console.error("Erro ao carregar lojas:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterStores = () => {
    let filtered = stores

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(store => 
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.id.toString().includes(searchTerm)
      )
    }

    // Filtro por status
    if (statusFilter !== "all") {
      filtered = filtered.filter(store => store.status === statusFilter)
    }

    setFilteredStores(filtered)
  }

  const updateStoreStatus = async (storeId: number, status: 'approved' | 'rejected', reason?: string) => {
    try {
      const apiClient = getApiClient()
      await apiClient.put(`/admin/stores/${storeId}/status`, {
        status,
        reason
      })
      
      // Atualizar a lista local
      setStores(stores.map(store => 
        store.id === storeId 
          ? { ...store, status }
          : store
      ))
      
      setShowApprovalDialog(false)
      setApprovalReason("")
    } catch (error) {
      console.error("Erro ao atualizar status da loja:", error)
    }
  }

  const handleApprovalAction = (store: AdminStore, action: 'approve' | 'reject') => {
    setSelectedStore(store)
    setApprovalAction(action)
    setShowApprovalDialog(true)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any, label: string }> = {
      pending: { variant: "outline", icon: Clock, label: "Pendente" },
      approved: { variant: "default", icon: CheckCircle, label: "Aprovada" },
      rejected: { variant: "destructive", icon: XCircle, label: "Rejeitada" }
    }
    
    const config = variants[status] || variants.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < Math.floor(rating) 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">
          ({rating.toFixed(1)})
        </span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-4">
          <div className="h-8 bg-muted rounded w-48 animate-pulse" />
          <div className="h-32 bg-muted rounded animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Lojas</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todas as lojas da plataforma
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Lojas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stores.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lojas Aprovadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stores.filter(s => s.status === 'approved').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stores.filter(s => s.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rejeitadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stores.filter(s => s.status === 'rejected').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nome da loja, proprietário ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stores Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lojas ({filteredStores.length})</CardTitle>
          <CardDescription>
            Lista de todas as lojas cadastradas na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome da Loja</TableHead>
                <TableHead>Proprietário</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Relógios</TableHead>
                <TableHead>Vendas</TableHead>
                <TableHead>Avaliação</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell className="font-mono text-sm">
                    {store.id}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      {store.name}
                    </div>
                  </TableCell>
                  <TableCell>{store.owner_name}</TableCell>
                  <TableCell>
                    {getStatusBadge(store.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3 text-muted-foreground" />
                      {store.total_watches}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      {store.total_sales}
                    </div>
                  </TableCell>
                  <TableCell>
                    {store.average_rating > 0 ? (
                      getRatingStars(store.average_rating)
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Sem avaliações
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(store.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedStore(store)
                            setShowStoreDetails(true)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </DropdownMenuItem>
                        {store.status === 'pending' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleApprovalAction(store, 'approve')}
                              className="text-green-600"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Aprovar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleApprovalAction(store, 'reject')}
                              className="text-red-600"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Rejeitar
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Store Details Dialog */}
      <Dialog open={showStoreDetails} onOpenChange={setShowStoreDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Loja</DialogTitle>
            <DialogDescription>
              Informações detalhadas sobre {selectedStore?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedStore && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">ID</Label>
                  <p className="font-mono">{selectedStore.id}</p>
                </div>
                <div>
                  <Label className="font-medium">Nome</Label>
                  <p>{selectedStore.name}</p>
                </div>
                <div>
                  <Label className="font-medium">Proprietário</Label>
                  <p>{selectedStore.owner_name}</p>
                </div>
                <div>
                  <Label className="font-medium">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedStore.status)}
                  </div>
                </div>
                <div>
                  <Label className="font-medium">Criado em</Label>
                  <p>{new Date(selectedStore.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="font-medium">Última atividade</Label>
                  <p>
                    {selectedStore.last_activity 
                      ? new Date(selectedStore.last_activity).toLocaleString()
                      : "Nenhuma atividade"
                    }
                  </p>
                </div>
              </div>
              
              {selectedStore.description && (
                <div>
                  <Label className="font-medium">Descrição</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedStore.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="font-medium">Total de Relógios</Label>
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedStore.total_watches}
                  </p>
                </div>
                <div>
                  <Label className="font-medium">Total de Vendas</Label>
                  <p className="text-2xl font-bold text-green-600">
                    {selectedStore.total_sales}
                  </p>
                </div>
                <div>
                  <Label className="font-medium">Avaliação Média</Label>
                  <div className="mt-1">
                    {selectedStore.average_rating > 0 ? (
                      getRatingStars(selectedStore.average_rating)
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Sem avaliações
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowStoreDetails(false)}
            >
              Fechar
            </Button>
            {selectedStore?.status === 'pending' && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => handleApprovalAction(selectedStore, 'reject')}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Rejeitar
                </Button>
                <Button 
                  onClick={() => handleApprovalAction(selectedStore, 'approve')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Aprovar
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'approve' ? 'Aprovar' : 'Rejeitar'} Loja
            </DialogTitle>
            <DialogDescription>
              {approvalAction === 'approve' 
                ? `Confirme a aprovação da loja "${selectedStore?.name}"`
                : `Confirme a rejeição da loja "${selectedStore?.name}"`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {approvalAction === 'reject' && (
              <div>
                <Label htmlFor="reason">Motivo da rejeição</Label>
                <Textarea
                  id="reason"
                  placeholder="Explique o motivo da rejeição..."
                  value={approvalReason}
                  onChange={(e) => setApprovalReason(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowApprovalDialog(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                if (selectedStore) {
                  updateStoreStatus(
                    selectedStore.id, 
                    approvalAction === 'approve' ? 'approved' : 'rejected', 
                    approvalAction === 'reject' ? approvalReason : undefined
                  )
                }
              }}
              variant={approvalAction === 'approve' ? 'default' : 'destructive'}
              disabled={approvalAction === 'reject' && !approvalReason.trim()}
            >
              {approvalAction === 'approve' ? 'Aprovar' : 'Rejeitar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}