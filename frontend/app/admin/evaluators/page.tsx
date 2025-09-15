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
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Search, 
  Plus,
  MoreHorizontal, 
  Edit, 
  Ban, 
  CheckCircle,
  XCircle,
  Eye,
  Star,
  Package,
  TrendingUp,
  Clock,
  Award,
  UserPlus
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

interface Evaluator {
  id: number
  user_id: number
  full_name: string
  email: string
  specialties: string[]
  years_experience: number
  certification_level: 'junior' | 'senior' | 'master'
  is_active: boolean
  created_at: string
  total_evaluations: number
  completed_evaluations: number
  pending_evaluations: number
  average_rating: number
  last_evaluation_date?: string
}

interface NewEvaluatorForm {
  user_id: string
  specialties: string[]
  years_experience: number
  certification_level: 'junior' | 'senior' | 'master'
  notes?: string
}

export default function AdminEvaluatorsPage() {
  const [evaluators, setEvaluators] = useState<Evaluator[]>([])
  const [filteredEvaluators, setFilteredEvaluators] = useState<Evaluator[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [certificationFilter, setCertificationFilter] = useState<string>("all")
  const [selectedEvaluator, setSelectedEvaluator] = useState<Evaluator | null>(null)
  const [showEvaluatorDetails, setShowEvaluatorDetails] = useState(false)
  const [showAddEvaluator, setShowAddEvaluator] = useState(false)
  const [newEvaluatorForm, setNewEvaluatorForm] = useState<NewEvaluatorForm>({
    user_id: "",
    specialties: [],
    years_experience: 0,
    certification_level: 'junior',
    notes: ""
  })

  useEffect(() => {
    loadEvaluators()
  }, [])

  useEffect(() => {
    filterEvaluators()
  }, [evaluators, searchTerm, statusFilter, certificationFilter])

  const loadEvaluators = async () => {
    try {
      setLoading(true)
      const apiClient = getApiClient()
      const response = await apiClient.get<Evaluator[]>("/admin/evaluators")
      
      if (response.data) {
        setEvaluators(response.data)
      }
    } catch (error) {
      console.error("Erro ao carregar avaliadores:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterEvaluators = () => {
    let filtered = evaluators

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(evaluator => 
        evaluator.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evaluator.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evaluator.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filtro por status
    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        filtered = filtered.filter(evaluator => evaluator.is_active)
      } else if (statusFilter === "inactive") {
        filtered = filtered.filter(evaluator => !evaluator.is_active)
      }
    }

    // Filtro por certificação
    if (certificationFilter !== "all") {
      filtered = filtered.filter(evaluator => evaluator.certification_level === certificationFilter)
    }

    setFilteredEvaluators(filtered)
  }

  const toggleEvaluatorStatus = async (evaluatorId: number, currentStatus: boolean) => {
    try {
      const apiClient = getApiClient()
      await apiClient.put(`/admin/evaluators/${evaluatorId}/status`, {
        is_active: !currentStatus
      })
      
      setEvaluators(evaluators.map(evaluator => 
        evaluator.id === evaluatorId 
          ? { ...evaluator, is_active: !currentStatus }
          : evaluator
      ))
    } catch (error) {
      console.error("Erro ao alterar status do avaliador:", error)
    }
  }

  const addEvaluator = async () => {
    try {
      const apiClient = getApiClient()
      await apiClient.post("/admin/evaluators", newEvaluatorForm)
      
      setShowAddEvaluator(false)
      setNewEvaluatorForm({
        user_id: "",
        specialties: [],
        years_experience: 0,
        certification_level: 'junior',
        notes: ""
      })
      loadEvaluators()
    } catch (error) {
      console.error("Erro ao adicionar avaliador:", error)
    }
  }

  const getCertificationBadge = (level: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      junior: { variant: "outline", label: "Júnior" },
      senior: { variant: "default", label: "Sênior" },
      master: { variant: "destructive", label: "Master" }
    }
    
    const config = variants[level] || variants.junior

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Award className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? (
          <>
            <CheckCircle className="h-3 w-3 mr-1" />
            Ativo
          </>
        ) : (
          <>
            <XCircle className="h-3 w-3 mr-1" />
            Inativo
          </>
        )}
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
          <h1 className="text-3xl font-bold">Gerenciamento de Avaliadores</h1>
          <p className="text-muted-foreground">
            Gerencie todos os avaliadores certificados da plataforma
          </p>
        </div>
        <Dialog open={showAddEvaluator} onOpenChange={setShowAddEvaluator}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Adicionar Avaliador
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Avaliador</DialogTitle>
              <DialogDescription>
                Cadastre um novo avaliador certificado na plataforma
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="user_id">ID do Usuário</Label>
                  <Input
                    id="user_id"
                    value={newEvaluatorForm.user_id}
                    onChange={(e) => setNewEvaluatorForm({
                      ...newEvaluatorForm,
                      user_id: e.target.value
                    })}
                    placeholder="ID do usuário"
                  />
                </div>
                <div>
                  <Label htmlFor="years_experience">Anos de Experiência</Label>
                  <Input
                    id="years_experience"
                    type="number"
                    value={newEvaluatorForm.years_experience}
                    onChange={(e) => setNewEvaluatorForm({
                      ...newEvaluatorForm,
                      years_experience: parseInt(e.target.value) || 0
                    })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="certification_level">Nível de Certificação</Label>
                <Select 
                  value={newEvaluatorForm.certification_level} 
                  onValueChange={(value: 'junior' | 'senior' | 'master') => 
                    setNewEvaluatorForm({
                      ...newEvaluatorForm,
                      certification_level: value
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">Júnior</SelectItem>
                    <SelectItem value="senior">Sênior</SelectItem>
                    <SelectItem value="master">Master</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="specialties">Especialidades (separadas por vírgula)</Label>
                <Input
                  id="specialties"
                  value={newEvaluatorForm.specialties.join(", ")}
                  onChange={(e) => setNewEvaluatorForm({
                    ...newEvaluatorForm,
                    specialties: e.target.value.split(",").map(s => s.trim()).filter(s => s)
                  })}
                  placeholder="Rolex, Patek Philippe, Omega..."
                />
              </div>
              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={newEvaluatorForm.notes}
                  onChange={(e) => setNewEvaluatorForm({
                    ...newEvaluatorForm,
                    notes: e.target.value
                  })}
                  placeholder="Observações adicionais..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddEvaluator(false)}>
                Cancelar
              </Button>
              <Button onClick={addEvaluator}>
                Adicionar Avaliador
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Avaliadores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{evaluators.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avaliadores Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {evaluators.filter(e => e.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Certificação Master</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {evaluators.filter(e => e.certification_level === 'master').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avaliações Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {evaluators.reduce((sum, e) => sum + e.pending_evaluations, 0)}
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
                  placeholder="Nome, email ou especialidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Certificação</Label>
              <Select value={certificationFilter} onValueChange={setCertificationFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="junior">Júnior</SelectItem>
                  <SelectItem value="senior">Sênior</SelectItem>
                  <SelectItem value="master">Master</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evaluators Table */}
      <Card>
        <CardHeader>
          <CardTitle>Avaliadores ({filteredEvaluators.length})</CardTitle>
          <CardDescription>
            Lista de todos os avaliadores certificados da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Certificação</TableHead>
                <TableHead>Experiência</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Avaliações</TableHead>
                <TableHead>Avaliação</TableHead>
                <TableHead>Especialidades</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvaluators.map((evaluator) => (
                <TableRow key={evaluator.id}>
                  <TableCell className="font-medium">
                    {evaluator.full_name}
                  </TableCell>
                  <TableCell>{evaluator.email}</TableCell>
                  <TableCell>
                    {getCertificationBadge(evaluator.certification_level)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {evaluator.years_experience} anos
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(evaluator.is_active)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Package className="h-3 w-3 text-green-600" />
                        <span className="text-sm">{evaluator.completed_evaluations} concluídas</span>
                      </div>
                      {evaluator.pending_evaluations > 0 && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-yellow-600" />
                          <span className="text-sm">{evaluator.pending_evaluations} pendentes</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {evaluator.average_rating > 0 ? (
                      getRatingStars(evaluator.average_rating)
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Sem avaliações
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {evaluator.specialties.slice(0, 2).map((specialty, index) => (
                        <Badge key={index} variant="outline" className="text-xs mr-1">
                          {specialty}
                        </Badge>
                      ))}
                      {evaluator.specialties.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{evaluator.specialties.length - 2}
                        </Badge>
                      )}
                    </div>
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
                            setSelectedEvaluator(evaluator)
                            setShowEvaluatorDetails(true)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => toggleEvaluatorStatus(evaluator.id, evaluator.is_active)}
                        >
                          {evaluator.is_active ? (
                            <>
                              <Ban className="mr-2 h-4 w-4" />
                              Desativar
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Ativar
                            </>
                          )}
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

      {/* Evaluator Details Dialog */}
      <Dialog open={showEvaluatorDetails} onOpenChange={setShowEvaluatorDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Avaliador</DialogTitle>
            <DialogDescription>
              Informações detalhadas sobre {selectedEvaluator?.full_name}
            </DialogDescription>
          </DialogHeader>
          {selectedEvaluator && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Nome Completo</Label>
                  <p>{selectedEvaluator.full_name}</p>
                </div>
                <div>
                  <Label className="font-medium">Email</Label>
                  <p>{selectedEvaluator.email}</p>
                </div>
                <div>
                  <Label className="font-medium">Certificação</Label>
                  <div className="mt-1">
                    {getCertificationBadge(selectedEvaluator.certification_level)}
                  </div>
                </div>
                <div>
                  <Label className="font-medium">Anos de Experiência</Label>
                  <p>{selectedEvaluator.years_experience} anos</p>
                </div>
                <div>
                  <Label className="font-medium">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedEvaluator.is_active)}
                  </div>
                </div>
                <div>
                  <Label className="font-medium">Cadastrado em</Label>
                  <p>{new Date(selectedEvaluator.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <Label className="font-medium">Especialidades</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedEvaluator.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="font-medium">Total de Avaliações</Label>
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedEvaluator.total_evaluations}
                  </p>
                </div>
                <div>
                  <Label className="font-medium">Concluídas</Label>
                  <p className="text-2xl font-bold text-green-600">
                    {selectedEvaluator.completed_evaluations}
                  </p>
                </div>
                <div>
                  <Label className="font-medium">Pendentes</Label>
                  <p className="text-2xl font-bold text-yellow-600">
                    {selectedEvaluator.pending_evaluations}
                  </p>
                </div>
              </div>

              <div>
                <Label className="font-medium">Avaliação Média</Label>
                <div className="mt-1">
                  {selectedEvaluator.average_rating > 0 ? (
                    getRatingStars(selectedEvaluator.average_rating)
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Sem avaliações
                    </span>
                  )}
                </div>
              </div>

              {selectedEvaluator.last_evaluation_date && (
                <div>
                  <Label className="font-medium">Última Avaliação</Label>
                  <p>{new Date(selectedEvaluator.last_evaluation_date).toLocaleString()}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowEvaluatorDetails(false)}
            >
              Fechar
            </Button>
            <Button>
              Editar Avaliador
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}