import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Watch, DollarSign } from "lucide-react"

interface ProfileStatsProps {
  totalWatches: number
  totalValue: number
  totalInvestment: number
  totalProfit: number
}

export function ProfileStats({ totalWatches, totalValue, totalInvestment, totalProfit }: ProfileStatsProps) {
  const profitPercentage = ((totalProfit / totalInvestment) * 100).toFixed(1)
  const isProfit = totalProfit > 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Relógios</CardTitle>
          <Watch className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalWatches}</div>
          <p className="text-xs text-muted-foreground">peças na coleção</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">valor atual da coleção</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Investimento Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalInvestment.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">valor investido</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Lucro/Prejuízo</CardTitle>
          {isProfit ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isProfit ? "text-green-600" : "text-red-600"}`}>
            {isProfit ? "+" : ""}${totalProfit.toLocaleString()}
          </div>
          <p className={`text-xs ${isProfit ? "text-green-600" : "text-red-600"}`}>
            {isProfit ? "+" : ""}
            {profitPercentage}% do investimento
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
