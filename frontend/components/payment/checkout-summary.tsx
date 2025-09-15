import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Truck, Shield, Clock } from "lucide-react"
import Image from "next/image"

interface CheckoutItem {
  id: string
  name: string
  brand: string
  price: number
  image: string
}

interface CheckoutSummaryProps {
  items: CheckoutItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
}

export function CheckoutSummary({ items, subtotal, shipping, tax, total }: CheckoutSummaryProps) {
  return (
    <Card className="sticky top-6 checkout-card">
      <CardHeader className="px-6 pt-6">
        <CardTitle>Resumo do Pedido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        {/* Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={`${item.brand} ${item.name}`}
                  width={64}
                  height={64}
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground">{item.brand}</p>
                <p className="font-medium truncate">{item.name}</p>
                <p className="text-sm font-bold">${item.price.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Pricing Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Frete</span>
            <span>{shipping === 0 ? "Grátis" : `${shipping.toLocaleString()}`}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Impostos</span>
            <span>${tax.toLocaleString()}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">${total.toLocaleString()}</span>
          </div>
        </div>

        <Separator />

        {/* Benefits */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Truck className="h-4 w-4 text-green-600" />
            <span>Frete grátis mundial</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-blue-600" />
            <span>Autenticidade garantida</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-orange-600" />
            <span>Entrega em 3-7 dias úteis</span>
          </div>
        </div>

        {/* Security Badges */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Badge variant="outline" className="text-xs">
            SSL Seguro
          </Badge>
          <Badge variant="outline" className="text-xs">
            Crypto Aceito
          </Badge>
          <Badge variant="outline" className="text-xs">
            Garantia 30 dias
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
