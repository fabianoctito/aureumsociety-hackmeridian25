"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash2, Share2, DollarSign } from "lucide-react"

interface UserWatchCardProps {
  id: string
  name: string
  brand: string
  purchasePrice: number
  currentValue: number
  purchaseDate: string
  image: string
  status: "owned" | "for_sale" | "sold"
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onSell?: (id: string) => void
  onShare?: (id: string) => void
}

export function UserWatchCard({
  id,
  name,
  brand,
  purchasePrice,
  currentValue,
  purchaseDate,
  image,
  status,
  onView,
  onEdit,
  onDelete,
  onSell,
  onShare,
}: UserWatchCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const valueChange = currentValue - purchasePrice
  const valueChangePercent = ((valueChange / purchasePrice) * 100).toFixed(1)
  const isProfit = valueChange > 0

  const getStatusBadge = () => {
    switch (status) {
      case "owned":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Possuído
          </Badge>
        )
      case "for_sale":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            À Venda
          </Badge>
        )
      case "sold":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            Vendido
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <Card
      className="group overflow-hidden hover:shadow-lg transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          {getStatusBadge()}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(id)}>
                <Eye className="h-4 w-4 mr-2" />
                Ver Detalhes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(id)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShare?.(id)}>
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </DropdownMenuItem>
              {status === "owned" && (
                <DropdownMenuItem onClick={() => onSell?.(id)}>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Colocar à Venda
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDelete?.(id)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Remover
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <div className="relative aspect-square overflow-hidden bg-muted mx-4 rounded-lg">
        <Image
          src={image || "/placeholder.svg"}
          alt={`${brand} ${name}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div
          className={`absolute inset-0 bg-black/10 transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      <CardContent className="p-4 space-y-4">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{brand}</p>
          <h3 className="font-semibold text-foreground line-clamp-2 text-balance">{name}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Adquirido em {new Date(purchaseDate).toLocaleDateString("pt-BR")}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Preço de Compra:</span>
            <span className="font-medium">${purchasePrice.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Valor Atual:</span>
            <span className="font-medium">${currentValue.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Variação:</span>
            <span className={`font-medium ${isProfit ? "text-green-600" : "text-red-600"}`}>
              {isProfit ? "+" : ""}${valueChange.toLocaleString()} ({isProfit ? "+" : ""}
              {valueChangePercent}%)
            </span>
          </div>
        </div>

        <Button variant="outline" className="w-full bg-transparent" onClick={() => onView?.(id)}>
          Ver Detalhes
        </Button>
      </CardContent>
    </Card>
  )
}
