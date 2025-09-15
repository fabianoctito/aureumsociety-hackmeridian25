"use client"

import { useAuth } from "@/contexts/auth-context-api"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Download, Search, TrendingUp, TrendingDown, DollarSign, Package } from "lucide-react"

interface StoreTransaction {
  id: string
  date: string
  time: string
  type: "sale" | "commission" | "withdrawal" | "fee"
  description: string
  amount: number
  status: "completed" | "pending" | "cancelled"
  orderId?: string
  productName?: string
}

export default function StoreStatementPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [transactions, setTransactions] = useState<StoreTransaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<StoreTransaction[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    if (!user || user.role !== "store") {
      router.push("/login")
      return
    }

    // Mock store transactions
    const mockTransactions: StoreTransaction[] = [
      {
        id: "1",
        date: "15 Ago 2024",
        time: "14:30",
        type: "sale",
        description: "Venda - Rolex Submariner",
        amount: 85000.0,
        status: "completed",
        orderId: "ORD-001",
        productName: "Rolex Submariner Date",
      },
      {
        id: "2",
        date: "15 Ago 2024",
        time: "14:35",
        type: "commission",
        description: "Taxa da plataforma (5%)",
        amount: -4250.0,
        status: "completed",
        orderId: "ORD-001",
      },
      {
        id: "3",
        date: "12 Ago 2024",
        time: "09:15",
        type: "sale",
        description: "Venda - Omega Speedmaster",
        amount: 45000.0,
        status: "completed",
        orderId: "ORD-002",
        productName: "Omega Speedmaster Professional",
      },
      {
        id: "4",
        date: "12 Ago 2024",
        time: "09:20",
        type: "commission",
        description: "Taxa da plataforma (5%)",
        amount: -2250.0,
        status: "completed",
        orderId: "ORD-002",
      },
      {
        id: "5",
        date: "10 Ago 2024",
        time: "16:45",
        type: "withdrawal",
        description: "Saque para conta bancária",
        amount: -50000.0,
        status: "pending",
      },
      {
        id: "6",
        date: "08 Ago 2024",
        time: "11:20",
        type: "fee",
        description: "Taxa de manutenção mensal",
        amount: -99.0,
        status: "completed",
      },
    ]

    setTransactions(mockTransactions)
    setFilteredTransactions(mockTransactions)
  }, [user, router])

  useEffect(() => {
    let filtered = transactions

    if (searchTerm) {
      filtered = filtered.filter((t) => t.description.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((t) => t.type === typeFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((t) => t.status === statusFilter)
    }

    setFilteredTransactions(filtered)
  }, [searchTerm, typeFilter, statusFilter, transactions])

  if (!user || user.role !== "store") return null

  const totalRevenue = transactions
    .filter((t) => t.type === "sale" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalCommissions = transactions
    .filter((t) => t.type === "commission" && t.status === "completed")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const netRevenue = totalRevenue - totalCommissions

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Concluído</Badge>
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">Pendente</Badge>
      case "cancelled":
        return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">Cancelado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "sale":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "commission":
      case "fee":
      case "withdrawal":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "sale":
        return "Venda"
      case "commission":
        return "Comissão"
      case "withdrawal":
        return "Saque"
      case "fee":
        return "Taxa"
      default:
        return type
    }
  }

  return (
    <div className="min-h-screen bg-background">

      <main className="container mx-auto px-4 py-8">
        {/* Store Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                  <p className="text-2xl font-bold text-green-500">
                    R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Comissões Pagas</p>
                  <p className="text-2xl font-bold text-red-500">
                    R$ {totalCommissions.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Receita Líquida</p>
                  <p className="text-2xl font-bold text-primary">
                    R$ {netRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Store Statement */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Extrato da Loja</span>
              </CardTitle>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar transações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="sale">Venda</SelectItem>
                  <SelectItem value="commission">Comissão</SelectItem>
                  <SelectItem value="withdrawal">Saque</SelectItem>
                  <SelectItem value="fee">Taxa</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(transaction.type)}
                      <Badge variant="outline">{getTypeLabel(transaction.type)}</Badge>
                    </div>

                    <div>
                      <p className="font-medium text-foreground">{transaction.description}</p>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>
                          {transaction.date} às {transaction.time}
                        </span>
                        {transaction.orderId && <span>• Pedido: {transaction.orderId}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className={`font-bold ${transaction.amount > 0 ? "text-green-500" : "text-red-500"}`}>
                        {transaction.amount > 0 ? "+" : ""}R${" "}
                        {Math.abs(transaction.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </p>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                </div>
              ))}

              {filteredTransactions.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nenhuma transação encontrada</p>
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
