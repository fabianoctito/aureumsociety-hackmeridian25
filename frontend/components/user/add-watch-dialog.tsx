"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Upload } from "lucide-react"

interface AddWatchDialogProps {
  onAddWatch?: (watchData: any) => void
  trigger?: React.ReactNode
}

export function AddWatchDialog({ onAddWatch, trigger }: AddWatchDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    purchasePrice: "",
    purchaseDate: "",
    condition: "",
    notes: "",
  })

  const brands = [
    "Rolex",
    "Patek Philippe",
    "Audemars Piguet",
    "Omega",
    "Cartier",
    "Breitling",
    "TAG Heuer",
    "IWC",
    "Jaeger-LeCoultre",
    "Vacheron Constantin",
    "Outros",
  ]

  const conditions = ["Novo", "Excelente", "Muito Bom", "Bom", "Regular", "Precisa Reparo"]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddWatch?.(formData)
    setFormData({
      brand: "",
      model: "",
      purchasePrice: "",
      purchaseDate: "",
      condition: "",
      notes: "",
    })
    setOpen(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Relógio
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Relógio</DialogTitle>
          <DialogDescription>Adicione um novo relógio à sua coleção pessoal</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Marca</Label>
                <Select value={formData.brand} onValueChange={(value) => handleInputChange("brand", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a marca" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Modelo</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleInputChange("model", e.target.value)}
                  placeholder="Ex: Submariner Date"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Preço de Compra ($)</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  value={formData.purchasePrice}
                  onChange={(e) => handleInputChange("purchasePrice", e.target.value)}
                  placeholder="12500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Data de Compra</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => handleInputChange("purchaseDate", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Condição</Label>
              <Select value={formData.condition} onValueChange={(value) => handleInputChange("condition", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a condição" />
                </SelectTrigger>
                <SelectContent>
                  {conditions.map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      {condition}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Informações adicionais sobre o relógio..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Fotos</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Clique para adicionar fotos ou arraste e solte aqui</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG até 10MB</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Adicionar Relógio</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
