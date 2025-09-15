"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context-api"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  DollarSign, 
  ArrowUpCircle, 
  ArrowDownCircle,
  Clock,
  Check,
  X,
  Filter,
  Download,
  Lock,
  Loader2,
  AlertCircle
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

import Link from "next/link"

const transactionTypeConfig = {
  'deposit': {
    icon: ArrowUpCircle,
    label: 'Depósito',
    className: 'text-green-600 bg-green-50 border-green-200'
  },
  'withdrawal': {
    icon: ArrowDownCircle,
    label: 'Saque',
    className: 'text-red-600 bg-red-50 border-red-200'
  },
  'purchase': {
    icon: DollarSign,
    label: 'Compra',
    className: 'text-blue-600 bg-blue-50 border-blue-200'
  },
  'sale': {
    icon: TrendingUp,
    label: 'Venda',
    className: 'text-green-600 bg-green-50 border-green-200'
  },
  'payment': {
    icon: DollarSign,
    label: 'Pagamento',
    className: 'text-orange-600 bg-orange-50 border-orange-200'
  }
}

const statusConfig = {
  'pending': {
    icon: Clock,
    label: 'Pendente',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  'completed': {
    icon: Check,
    label: 'Concluído',
    className: 'bg-green-100 text-green-800 border-green-200'
  },
  'failed': {
    icon: X,
    label: 'Falhou',
    className: 'bg-red-100 text-red-800 border-red-200'
  },
  'cancelled': {
    icon: X,
    label: 'Cancelado',
    className: 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export default function BalancePage() {
  const { user } = useAuth()
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [withdrawalAmount, setWithdrawalAmount] = useState("")
  const [depositAmount, setDepositAmount] = useState("")

  // Mock data
  const transactionsLoading = false;
  const transactionsError = null;
  const portfolioLoading = false;
  const balanceLoading = false;

  const transactions = [
    {
      id: "1",
      transaction_type: "deposit",
      status: "completed",
      amount: 1000,
      description: "Initial deposit",
      created_at: new Date().toISOString(),
      fee: 0,
    },
    {
      id: "2",
      transaction_type: "purchase",
      status: "completed",
      amount: 500,
      description: "Rolex Submariner",
      created_at: new Date().toISOString(),
      fee: 0,
    },
  ];

  const portfolio = {
    current_value: 1200,
    total_investment: 1000,
  };

  const balance = {
    available_balance: 500,
    pending_balance: 0,
  };

  const addFunds = async (amount: number, type: string, description: string) => {
  };

  const withdrawFunds = async (amount: number, type: string, description: string) => {
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
                Você precisa estar logado para acessar seu saldo e transações.
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

  // Filter transactions
  const filteredTransactions = transactions?.filter((transaction) => {
    const matchesType = filterType === "all" || transaction.transaction_type === filterType
    const matchesStatus = filterStatus === "all" || transaction.status === filterStatus
    return matchesType && matchesStatus
  }) || []

  // Calculate monthly change
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthlyTransactions = transactions?.filter(t => {
    const date = new Date(t.created_at)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  }) || []

  const monthlyIncome = monthlyTransactions
    .filter(t => t.transaction_type === 'deposit' || t.transaction_type === 'sale')
    .reduce((sum, t) => sum + t.amount, 0)

  const monthlyExpenses = monthlyTransactions
    .filter(t => t.transaction_type === 'withdrawal' || t.transaction_type === 'purchase')
    .reduce((sum, t) => sum + t.amount, 0)

  const monthlyChange = monthlyIncome - monthlyExpenses

  // Portfolio stats
  const portfolioValue = portfolio?.current_value || 0
  const totalInvestment = portfolio?.total_investment || 0
  const totalProfit = portfolioValue - totalInvestment

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount)
    if (amount > 0) {
      try {
        await addFunds(amount, 'deposit', 'Depósito via plataforma')
        setDepositAmount("")
        // Adicionar toast de sucesso
      } catch (error) {
        console.error("Error adding funds:", error)
        // Adicionar toast de erro
      }
    }
  }

  const handleWithdrawal = async () => {
    const amount = parseFloat(withdrawalAmount)
    if (amount > 0 && amount <= (balance?.available_balance || 0)) {
      try {
        await withdrawFunds(amount, 'withdrawal', 'Saque via plataforma')
        setWithdrawalAmount("")
        // Adicionar toast de sucesso
      } catch (error) {
        console.error("Error withdrawing funds:", error)
        // Adicionar toast de erro
      }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (transactionsError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar dados financeiros: {transactionsError}
            </AlertDescription>
          </Alert>
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
              <h1 className="text-3xl font-bold">Meu Saldo</h1>
              <p className="text-muted-foreground">Gerencie suas finanças na plataforma</p>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar Extrato
            </Button>
          </div>

          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Available Balance */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {balanceLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                ) : (
                  <div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(balance?.available_balance || 0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Bloqueado: {formatCurrency(balance?.pending_balance || 0)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Portfolio Value */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor do Portfólio</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {portfolioLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                ) : (
                  <div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(portfolioValue)}
                    </div>
                    <p className={`text-xs flex items-center ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {totalProfit >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {formatCurrency(Math.abs(totalProfit))} 
                      {totalProfit >= 0 ? ' lucro' : ' prejuízo'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Monthly Change */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Movimentação Mensal</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                ) : (
                  <div>
                    <div className={`text-2xl font-bold ${monthlyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {monthlyChange >= 0 ? '+' : ''}{formatCurrency(monthlyChange)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {monthlyTransactions.length} transações este mês
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ArrowUpCircle className="h-5 w-5 mr-2 text-green-600" />
                  Adicionar Fundos
                </CardTitle>
                <CardDescription>
                  Deposite dinheiro na sua conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deposit-amount">Valor (R$)</Label>
                  <Input
                    id="deposit-amount"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleDeposit} 
                  className="w-full"
                  disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                >
                  Depositar
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ArrowDownCircle className="h-5 w-5 mr-2 text-red-600" />
                  Sacar Fundos
                </CardTitle>
                <CardDescription>
                  Retire dinheiro da sua conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="withdrawal-amount">Valor (R$)</Label>
                  <Input
                    id="withdrawal-amount"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Disponível: {formatCurrency(balance?.available_balance || 0)}
                  </p>
                </div>
                <Button 
                  onClick={handleWithdrawal}
                  variant="outline" 
                  className="w-full"
                  disabled={
                    !withdrawalAmount || 
                    parseFloat(withdrawalAmount) <= 0 || 
                    parseFloat(withdrawalAmount) > (balance?.available_balance || 0)
                  }
                >
                  Sacar
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Transactions */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Histórico de Transações</CardTitle>
                  <CardDescription>
                    Todas as suas movimentações financeiras
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="deposit">Depósitos</SelectItem>
                      <SelectItem value="withdrawal">Saques</SelectItem>
                      <SelectItem value="purchase">Compras</SelectItem>
                      <SelectItem value="sale">Vendas</SelectItem>
                      <SelectItem value="payment">Pagamentos</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="failed">Falhou</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-4 p-4">
                      <div className="w-10 h-10 bg-muted rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                      <div className="h-4 bg-muted rounded w-20"></div>
                    </div>
                  ))}
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nenhuma transação encontrada</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {filteredTransactions.map((transaction) => {
                      const typeConfig = transactionTypeConfig[transaction.transaction_type as keyof typeof transactionTypeConfig]
                      const statusConf = statusConfig[transaction.status as keyof typeof statusConfig]
                      const TypeIcon = typeConfig?.icon || DollarSign
                      const StatusIcon = statusConf?.icon || Clock

                      return (
                        <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-full ${typeConfig?.className || 'bg-muted'}`}>
                              <TypeIcon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{typeConfig?.label || transaction.transaction_type}</p>
                                <Badge variant="outline" className={statusConf?.className}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {statusConf?.label || transaction.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {transaction.description || 'Sem descrição'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(transaction.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${
                              transaction.transaction_type === 'deposit' || transaction.transaction_type === 'sale' 
                                ? 'text-green-600' 
                                : 'text-red-600'
                            }`}>
                              {transaction.transaction_type === 'deposit' || transaction.transaction_type === 'sale' ? '+' : '-'}
                              {formatCurrency(transaction.amount)}
                            </p>
                            {transaction.fee && transaction.fee > 0 && (
                              <p className="text-xs text-muted-foreground">
                                Taxa: {formatCurrency(transaction.fee)}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
