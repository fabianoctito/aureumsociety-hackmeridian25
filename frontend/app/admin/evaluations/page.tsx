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
  CheckCircle,
  XCircle,
  Eye,
  Star,
  Package,
  Clock,
  AlertCircle,
  User,
  Calendar,
  DollarSign,
  FileText
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

interface Evaluation {
  id: number
  watch_id: number
  watch_brand: string
  watch_model: string
  watch_reference: string
  evaluator_id?: number
  evaluator_name?: string
  store_id: number
  store_name: string
  status: 'pending' | 'in_progress' | 'completed' | 'approved' | 'rejected'
  priority: 'low' | 'medium' | 'high'
  estimated_value?: number
  final_value?: number
  condition_assessment?: string
  authenticity_verified?: boolean
  notes?: string
  created_at: string
  assigned_at?: string
  completed_at?: string
  deadline?: string
}

export default function AdminEvaluationsPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [filteredEvaluations, setFilteredEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [evaluatorFilter, setEvaluatorFilter] = useState<string>("all")
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null)
  const [showEvaluationDetails, setShowEvaluationDetails] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [selectedEvaluatorId, setSelectedEvaluatorId] = useState<string>("")
  const [availableEvaluators, setAvailableEvaluators] = useState<{ id: number, name: string }[]>([])

  useEffect(() => {
    loadEvaluations()
    loadEvaluators()
  }, [])

  useEffect(() => {
    filterEvaluations()
  }, [evaluations, searchTerm, statusFilter, priorityFilter, evaluatorFilter])

  const loadEvaluations = async () => {
    try {
      setLoading(true)
      const apiClient = getApiClient()
      const response = await apiClient.get<Evaluation[]>("/admin/evaluations")
      
      if (response.data) {
        setEvaluations(response.data)
      }
    } catch (error) {
      console.error("Erro ao carregar avaliações:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadEvaluators = async () => {
    try {
      const apiClient = getApiClient()
      const response = await apiClient.get<{ id: number, name: string }[]>("/admin/evaluators/available")
      
      if (response.data) {
        setAvailableEvaluators(response.data)
      }
    } catch (error) {
      console.error("Erro ao carregar avaliadores:", error)
    }
  }

  const filterEvaluations = () => {
    let filtered = evaluations

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(evaluation => 
        evaluation.watch_brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evaluation.watch_model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evaluation.watch_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evaluation.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (evaluation.evaluator_name && evaluation.evaluator_name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filtro por status
    if (statusFilter !== "all") {
      filtered = filtered.filter(evaluation => evaluation.status === statusFilter)
    }

    // Filtro por prioridade
    if (priorityFilter !== "all") {
      filtered = filtered.filter(evaluation => evaluation.priority === priorityFilter)
    }

    // Filtro por avaliador
    if (evaluatorFilter !== "all") {
      if (evaluatorFilter === "unassigned") {
        filtered = filtered.filter(evaluation => !evaluation.evaluator_id)
      } else {
        filtered = filtered.filter(evaluation => evaluation.evaluator_id?.toString() === evaluatorFilter)
      }
    }

    setFilteredEvaluations(filtered)
  }

  const assignEvaluator = async (evaluationId: number, evaluatorId: string) => {
    try {
      const apiClient = getApiClient()
      await apiClient.put(`/admin/evaluations/${evaluationId}/assign`, {
        evaluator_id: parseInt(evaluatorId)
      })
      
      setEvaluations(evaluations.map(evaluation => 
        evaluation.id === evaluationId 
          ? { 
              ...evaluation, 
              evaluator_id: parseInt(evaluatorId),
              evaluator_name: availableEvaluators.find(e => e.id === parseInt(evaluatorId))?.name,
              status: 'in_progress' as const,
              assigned_at: new Date().toISOString()
            }
          : evaluation
      ))
      
      setShowAssignDialog(false)
      setSelectedEvaluatorId("")
    } catch (error) {
      console.error("Erro ao atribuir avaliador:", error)
    }
  }

  const updateEvaluationStatus = async (evaluationId: number, status: string) => {
    try {
      const apiClient = getApiClient()
      await apiClient.put(`/admin/evaluations/${evaluationId}/status`, { status })
      
      setEvaluations(evaluations.map(evaluation => 
        evaluation.id === evaluationId 
          ? { ...evaluation, status: status as any }
          : evaluation
      ))
    } catch (error) {
      console.error("Erro ao atualizar status da avaliação:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any, label: string }> = {
      pending: { variant: "outline", icon: Clock, label: "Pendente" },
      in_progress: { variant: "secondary", icon: AlertCircle, label: "Em Andamento" },
      completed: { variant: "default", icon: CheckCircle, label: "Concluída" },
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

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      low: { variant: "outline", label: "Baixa" },
      medium: { variant: "secondary", label: "Média" },
      high: { variant: "destructive", label: "Alta" }
    }
    
    const config = variants[priority] || variants.low

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getDaysUntilDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline)
    const today = new Date()
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
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
          <h1 className="text-3xl font-bold">Gerenciamento de Avaliações</h1>
          <p className="text-muted-foreground">
            Gerencie todas as avaliações de relógios da plataforma
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{evaluations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {evaluations.filter(e => e.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {evaluations.filter(e => e.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {evaluations.filter(e => e.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Não Atribuídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {evaluations.filter(e => !e.evaluator_id).length}
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
                  placeholder="Marca, modelo, referência, loja..."
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
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="approved">Aprovada</SelectItem>
                  <SelectItem value="rejected">Rejeitada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prioridade</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Avaliador</Label>
              <Select value={evaluatorFilter} onValueChange={setEvaluatorFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="unassigned">Não atribuídas</SelectItem>
                  {availableEvaluators.map((evaluator) => (
                    <SelectItem key={evaluator.id} value={evaluator.id.toString()}>
                      {evaluator.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evaluations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Avaliações ({filteredEvaluations.length})</CardTitle>
          <CardDescription>
            Lista de todas as avaliações de relógios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Relógio</TableHead>
                <TableHead>Loja</TableHead>
                <TableHead>Avaliador</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Valor Estimado</TableHead>
                <TableHead>Prazo</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvaluations.map((evaluation) => (
                <TableRow key={evaluation.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        {evaluation.watch_brand} {evaluation.watch_model}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Ref: {evaluation.watch_reference}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{evaluation.store_name}</TableCell>
                  <TableCell>
                    {evaluation.evaluator_name ? (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {evaluation.evaluator_name}
                      </div>
                    ) : (
                      <Badge variant="outline">Não atribuído</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(evaluation.status)}
                  </TableCell>
                  <TableCell>
                    {getPriorityBadge(evaluation.priority)}
                  </TableCell>
                  <TableCell>
                    {evaluation.estimated_value ? (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        {formatCurrency(evaluation.estimated_value)}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Não informado</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {evaluation.deadline ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {new Date(evaluation.deadline).toLocaleDateString()}
                          </span>
                        </div>
                        {(() => {
                          const daysLeft = getDaysUntilDeadline(evaluation.deadline)
                          if (daysLeft < 0) {
                            return <Badge variant="destructive" className="text-xs">Atrasado</Badge>
                          } else if (daysLeft <= 2) {
                            return <Badge variant="secondary" className="text-xs">Urgente</Badge>
                          } else {
                            return <Badge variant="outline" className="text-xs">{daysLeft} dias</Badge>
                          }
                        })()}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Sem prazo</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(evaluation.created_at).toLocaleDateString()}
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
                            setSelectedEvaluation(evaluation)
                            setShowEvaluationDetails(true)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </DropdownMenuItem>
                        {!evaluation.evaluator_id && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedEvaluation(evaluation)
                              setShowAssignDialog(true)
                            }}
                          >
                            <User className="mr-2 h-4 w-4" />
                            Atribuir avaliador
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {evaluation.status === 'completed' && (
                          <>
                            <DropdownMenuItem
                              onClick={() => updateEvaluationStatus(evaluation.id, 'approved')}
                              className="text-green-600"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Aprovar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateEvaluationStatus(evaluation.id, 'rejected')}
                              className="text-red-600"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Rejeitar
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Evaluation Details Dialog */}
      <Dialog open={showEvaluationDetails} onOpenChange={setShowEvaluationDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Avaliação</DialogTitle>
            <DialogDescription>
              Informações completas sobre a avaliação #{selectedEvaluation?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedEvaluation && (
            <div className="grid gap-6 py-4">
              {/* Watch Info */}
              <div>
                <h3 className="font-semibold mb-3">Informações do Relógio</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">Marca e Modelo</Label>
                    <p>{selectedEvaluation.watch_brand} {selectedEvaluation.watch_model}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Referência</Label>
                    <p>{selectedEvaluation.watch_reference}</p>
                  </div>
                </div>
              </div>

              {/* Evaluation Info */}
              <div>
                <h3 className="font-semibold mb-3">Informações da Avaliação</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">Status</Label>
                    <div className="mt-1">
                      {getStatusBadge(selectedEvaluation.status)}
                    </div>
                  </div>
                  <div>
                    <Label className="font-medium">Prioridade</Label>
                    <div className="mt-1">
                      {getPriorityBadge(selectedEvaluation.priority)}
                    </div>
                  </div>
                  <div>
                    <Label className="font-medium">Loja</Label>
                    <p>{selectedEvaluation.store_name}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Avaliador</Label>
                    <p>{selectedEvaluation.evaluator_name || "Não atribuído"}</p>
                  </div>
                </div>
              </div>

              {/* Values */}
              <div>
                <h3 className="font-semibold mb-3">Valores</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">Valor Estimado</Label>
                    <p className="text-lg font-bold text-blue-600">
                      {selectedEvaluation.estimated_value 
                        ? formatCurrency(selectedEvaluation.estimated_value)
                        : "Não informado"
                      }
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Valor Final</Label>
                    <p className="text-lg font-bold text-green-600">
                      {selectedEvaluation.final_value 
                        ? formatCurrency(selectedEvaluation.final_value)
                        : "Não avaliado"
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div>
                <h3 className="font-semibold mb-3">Datas</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="font-medium">Criado em</Label>
                    <p>{new Date(selectedEvaluation.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Atribuído em</Label>
                    <p>
                      {selectedEvaluation.assigned_at 
                        ? new Date(selectedEvaluation.assigned_at).toLocaleString()
                        : "Não atribuído"
                      }
                    </p>
                  </div>
                  <div>
                    <Label className="font-medium">Concluído em</Label>
                    <p>
                      {selectedEvaluation.completed_at 
                        ? new Date(selectedEvaluation.completed_at).toLocaleString()
                        : "Não concluído"
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Assessment */}
              {selectedEvaluation.condition_assessment && (
                <div>
                  <Label className="font-medium">Avaliação da Condição</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedEvaluation.condition_assessment}
                  </p>
                </div>
              )}

              {/* Authenticity */}
              {selectedEvaluation.authenticity_verified !== undefined && (
                <div>
                  <Label className="font-medium">Autenticidade Verificada</Label>
                  <div className="mt-1">
                    <Badge variant={selectedEvaluation.authenticity_verified ? "default" : "destructive"}>
                      {selectedEvaluation.authenticity_verified ? "Verificada" : "Não verificada"}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedEvaluation.notes && (
                <div>
                  <Label className="font-medium">Observações</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedEvaluation.notes}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowEvaluationDetails(false)}
            >
              Fechar
            </Button>
            <Button>
              Editar Avaliação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Evaluator Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Avaliador</DialogTitle>
            <DialogDescription>
              Selecione um avaliador para a avaliação #{selectedEvaluation?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="evaluator">Avaliador</Label>
              <Select value={selectedEvaluatorId} onValueChange={setSelectedEvaluatorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um avaliador" />
                </SelectTrigger>
                <SelectContent>
                  {availableEvaluators.map((evaluator) => (
                    <SelectItem key={evaluator.id} value={evaluator.id.toString()}>
                      {evaluator.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAssignDialog(false)
                setSelectedEvaluatorId("")
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                if (selectedEvaluation && selectedEvaluatorId) {
                  assignEvaluator(selectedEvaluation.id, selectedEvaluatorId)
                }
              }}
              disabled={!selectedEvaluatorId}
            >
              Atribuir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}