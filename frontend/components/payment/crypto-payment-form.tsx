"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, QrCode, CheckCircle, Clock, AlertCircle } from "lucide-react"

interface CryptoPaymentFormProps {
  totalAmount: number
  onPaymentComplete?: (paymentData: any) => void
}

const cryptoCurrencies = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    icon: "₿",
    rate: 43500, // USD per BTC
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    network: "Bitcoin Network",
    confirmations: 3,
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    icon: "Ξ",
    rate: 2650, // USD per ETH
    address: "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
    network: "Ethereum Network",
    confirmations: 12,
  },
  {
    id: "usdc",
    name: "USD Coin",
    symbol: "USDC",
    icon: "$",
    rate: 1, // USD per USDC
    address: "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
    network: "Ethereum Network (ERC-20)",
    confirmations: 12,
  },
  {
    id: "usdt",
    name: "Tether",
    symbol: "USDT",
    icon: "₮",
    rate: 1, // USD per USDT
    address: "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
    network: "Ethereum Network (ERC-20)",
    confirmations: 12,
  },
]

export function CryptoPaymentForm({ totalAmount, onPaymentComplete }: CryptoPaymentFormProps) {
  const [selectedCrypto, setSelectedCrypto] = useState<string>("")
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "processing" | "completed" | "failed">("pending")
  const [transactionHash, setTransactionHash] = useState("")
  const [timeRemaining, setTimeRemaining] = useState(900) // 15 minutes in seconds

  const selectedCurrency = cryptoCurrencies.find((c) => c.id === selectedCrypto)
  const cryptoAmount = selectedCurrency ? (totalAmount / selectedCurrency.rate).toFixed(8) : "0"

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  const handlePaymentSubmit = () => {
    if (!selectedCurrency || !transactionHash) return

    setPaymentStatus("processing")

    // Simulate payment processing
    setTimeout(() => {
      setPaymentStatus("completed")
      onPaymentComplete?.({
        currency: selectedCurrency,
        amount: cryptoAmount,
        transactionHash,
        totalUSD: totalAmount,
      })
    }, 3000)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  if (paymentStatus === "completed") {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-green-600">Pagamento Confirmado!</CardTitle>
          <CardDescription>
            Sua transação foi processada com sucesso. Você receberá um email de confirmação em breve.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor Pago:</span>
              <span className="font-medium">
                {cryptoAmount} {selectedCurrency?.symbol} (${totalAmount.toLocaleString()})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hash da Transação:</span>
              <span className="font-mono text-sm">{transactionHash.slice(0, 20)}...</span>
            </div>
          </div>
          <Button className="w-full" onClick={() => (window.location.href = "/my-watches")}>
            Ver Meus Relógios
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Pagamento com Criptomoeda
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            <Clock className="h-3 w-3 mr-1" />
            {formatTime(timeRemaining)}
          </Badge>
        </CardTitle>
        <CardDescription>Selecione sua criptomoeda preferida para completar a compra</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Summary */}
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Total a Pagar:</span>
            <span className="text-2xl font-bold text-primary">${totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Cryptocurrency Selection */}
        <div className="space-y-3">
          <Label>Selecione a Criptomoeda</Label>
          <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha uma criptomoeda" />
            </SelectTrigger>
            <SelectContent>
              {cryptoCurrencies.map((crypto) => (
                <SelectItem key={crypto.id} value={crypto.id}>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{crypto.icon}</span>
                    <div>
                      <div className="font-medium">{crypto.name}</div>
                      <div className="text-sm text-muted-foreground">
                        1 {crypto.symbol} = ${crypto.rate.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCurrency && (
          <>
            <Separator />

            {/* Payment Details */}
            <div className="space-y-4">
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Detalhes do Pagamento</h3>
                  <Badge variant="outline">{selectedCurrency.network}</Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor em {selectedCurrency.symbol}:</span>
                    <span className="font-mono font-bold">
                      {cryptoAmount} {selectedCurrency.symbol}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <Label>Endereço da Carteira</Label>
                    <div className="flex items-center gap-2">
                      <Input value={selectedCurrency.address} readOnly className="font-mono text-sm" />
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(selectedCurrency.address)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Instruções:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                    <li>
                      Envie exatamente{" "}
                      <strong>
                        {cryptoAmount} {selectedCurrency.symbol}
                      </strong>{" "}
                      para o endereço acima
                    </li>
                    <li>Aguarde {selectedCurrency.confirmations} confirmações na rede</li>
                    <li>Cole o hash da transação no campo abaixo</li>
                    <li>Clique em "Confirmar Pagamento" para finalizar</li>
                  </ol>
                </AlertDescription>
              </Alert>

              {/* Transaction Hash Input */}
              <div className="space-y-2">
                <Label htmlFor="txHash">Hash da Transação</Label>
                <Input
                  id="txHash"
                  placeholder="Cole o hash da sua transação aqui..."
                  value={transactionHash}
                  onChange={(e) => setTransactionHash(e.target.value)}
                  className="font-mono"
                />
              </div>

              {/* Submit Button */}
              <Button
                className="w-full"
                onClick={handlePaymentSubmit}
                disabled={!transactionHash || paymentStatus === "processing"}
              >
                {paymentStatus === "processing" ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Verificando Pagamento...
                  </>
                ) : (
                  "Confirmar Pagamento"
                )}
              </Button>
            </div>
          </>
        )}

        {/* Security Notice */}
        <div className="text-center text-sm text-muted-foreground border-t pt-4">
          <p>🔒 Transação segura e criptografada</p>
          <p>Seus dados e pagamentos são protegidos por criptografia de ponta</p>
        </div>
      </CardContent>
    </Card>
  )
}
