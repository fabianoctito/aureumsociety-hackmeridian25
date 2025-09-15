"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context-api"
import { Footer } from "@/components/layout/footer"
import { CryptoPaymentForm } from "@/components/payment/crypto-payment-form"
import { CheckoutSummary } from "@/components/payment/checkout-summary"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, Wallet, ArrowLeft, Lock } from "lucide-react"
import Link from "next/link"

// Mock checkout data
const mockCheckoutItems = [
	{
		id: "1",
		name: "Submariner Date",
		brand: "Rolex",
		price: 12500,
		image: "/luxury-rolex-submariner.png",
	},
]

export default function CheckoutPage() {
	const [isMounted, setIsMounted] = useState(false)
	const [paymentMethod, setPaymentMethod] = useState<"crypto" | "card">("crypto")
	const [shippingInfo, setShippingInfo] = useState({
		firstName: "",
		lastName: "",
		email: "",
		address: "",
		city: "",
		country: "",
		zipCode: "",
	})

	useEffect(() => {
		setIsMounted(true)
	}, [])

	const { user } = useAuth()

	if (!isMounted) {
		return (
			<div className="min-h-screen bg-background">
				<div className="flex items-center justify-center h-screen">
					<div className="text-center">
						<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
						<p className="mt-4 text-muted-foreground">Carregando checkout...</p>
					</div>
				</div>
			</div>
		)
	}

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
							<h1 className="text-3xl font-bold">Login Necessário</h1>
							<p className="text-muted-foreground max-w-md mx-auto">
								Você precisa estar logado para finalizar sua compra.
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

	const subtotal = mockCheckoutItems.reduce((sum, item) => sum + item.price, 0)
	const shipping = 0 // Free shipping for luxury items
	const tax = Math.round(subtotal * 0.08) // 8% tax
	const total = subtotal + shipping + tax

	const handlePaymentComplete = (paymentData: any) => {
		// Redirect to success page or show success message
	}

	const handleShippingChange = (field: string, value: string) => {
		setShippingInfo((prev) => ({ ...prev, [field]: value }))
	}

	return (
		<div className="min-h-screen bg-background" data-testid="checkout-page">
			<div className="container mx-auto px-4 py-8">
				<div className="mb-6">
					<Link href="/marketplace" legacyBehavior>
						<a className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Voltar ao Marketplace
						</a>
					</Link>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
					{/* Main Content */}
					<div className="lg:col-span-8">
						<div className="space-y-8 checkout-sections">
							<h1 className="text-3xl font-bold tracking-tight">Finalizar Compra</h1>

							{/* Shipping Information */}
							<Card 
								className="checkout-card shipping-info-special" 
								style={{ 
									minHeight: '600px',
									border: '3px solid #94a3b8',
									borderRadius: '8px',
									boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
									outline: '1px solid #94a3b8'
								}}
							>
								<CardHeader 
									className="pt-8 px-6" 
									style={{ 
										paddingTop: '2rem',
										paddingLeft: '1.5rem',
										paddingRight: '1.5rem',
										paddingBottom: '1rem'
									}}
								>
									<CardTitle 
										className="mt-2" 
										style={{ 
											marginTop: '0.5rem',
											fontSize: '1.125rem',
											fontWeight: '600'
										}}
									>
										Informações de Entrega
									</CardTitle>
									<CardDescription>Onde devemos enviar seu relógio?</CardDescription>
								</CardHeader>
								<CardContent 
									className="space-y-6 pb-8 px-6" 
									style={{ 
										paddingBottom: '2rem',
										paddingLeft: '1.5rem',
										paddingRight: '1.5rem',
										paddingTop: '0.5rem'
									}}
								>
									<div 
										className="grid grid-cols-1 md:grid-cols-2 gap-6"
										style={{ 
											gap: '1.5rem',
											marginTop: '1rem'
										}}
									>
										<div className="space-y-3" style={{ marginBottom: '1.5rem' }}>
											<Label htmlFor="firstName">Nome</Label>
											<Input
												id="firstName"
												value={shippingInfo.firstName}
												onChange={(e) => handleShippingChange("firstName", e.target.value)}
												placeholder="João"
												style={{ marginTop: '0.5rem' }}
											/>
										</div>
										<div className="space-y-3" style={{ marginBottom: '1.5rem' }}>
											<Label htmlFor="lastName">Sobrenome</Label>
											<Input
												id="lastName"
												value={shippingInfo.lastName}
												onChange={(e) => handleShippingChange("lastName", e.target.value)}
												placeholder="Silva"
												style={{ marginTop: '0.5rem' }}
											/>
										</div>
										<div className="md:col-span-2 space-y-3" style={{ marginBottom: '1.5rem' }}>
											<Label htmlFor="email">Email</Label>
											<Input
												id="email"
												type="email"
												value={shippingInfo.email}
												onChange={(e) => handleShippingChange("email", e.target.value)}
												placeholder="joao@exemplo.com"
												style={{ marginTop: '0.5rem' }}
											/>
										</div>
										<div className="md:col-span-2 space-y-3" style={{ marginBottom: '1.5rem' }}>
											<Label htmlFor="address">Endereço</Label>
											<Input
												id="address"
												value={shippingInfo.address}
												onChange={(e) => handleShippingChange("address", e.target.value)}
												placeholder="Rua das Flores, 123"
												style={{ marginTop: '0.5rem' }}
											/>
										</div>
										<div className="space-y-3" style={{ marginBottom: '1.5rem' }}>
											<Label htmlFor="city">Cidade</Label>
											<Input
												id="city"
												value={shippingInfo.city}
												onChange={(e) => handleShippingChange("city", e.target.value)}
												placeholder="São Paulo"
												style={{ marginTop: '0.5rem' }}
											/>
										</div>
										<div className="space-y-3" style={{ marginBottom: '1.5rem' }}>
											<Label htmlFor="country">País</Label>
											<Select
												value={shippingInfo.country}
												onValueChange={(value) => handleShippingChange("country", value)}
											>
												<SelectTrigger style={{ marginTop: '0.5rem' }}>
													<SelectValue placeholder="Selecione o país" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="br">Brasil</SelectItem>
													<SelectItem value="us">Estados Unidos</SelectItem>
													<SelectItem value="uk">Reino Unido</SelectItem>
													<SelectItem value="de">Alemanha</SelectItem>
													<SelectItem value="fr">França</SelectItem>
													<SelectItem value="ch">Suíça</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className="space-y-3" style={{ marginBottom: '1.5rem' }}>
											<Label htmlFor="zipCode">CEP</Label>
											<Input
												id="zipCode"
												value={shippingInfo.zipCode}
												onChange={(e) => handleShippingChange("zipCode", e.target.value)}
												placeholder="01234-567"
												style={{ marginTop: '0.5rem' }}
											/>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Payment Method */}
							<Card className="checkout-card">
								<CardHeader className="pt-6 px-6">
									<CardTitle>Método de Pagamento</CardTitle>
									<CardDescription>Escolha como deseja pagar</CardDescription>
								</CardHeader>
								<CardContent className="px-6 pb-6">
									<Tabs value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as "crypto" | "card")}>
										<TabsList className="grid w-full grid-cols-2">
											<TabsTrigger value="crypto">
												<div className="flex items-center gap-2">
													<Wallet className="h-4 w-4" />
													<span>Criptomoeda</span>
												</div>
											</TabsTrigger>
											<TabsTrigger value="card">
												<div className="flex items-center gap-2">
													<CreditCard className="h-4 w-4" />
													<span>Cartão de Crédito</span>
												</div>
											</TabsTrigger>
										</TabsList>

										<TabsContent value="crypto" className="mt-6">
											<CryptoPaymentForm totalAmount={total} onPaymentComplete={handlePaymentComplete} />
										</TabsContent>

										<TabsContent value="card" className="mt-6">
											<Card className="bg-muted/50">
												<CardHeader>
													<CardTitle className="text-lg">Pagamento com Cartão</CardTitle>
													<CardDescription>
														Funcionalidade em desenvolvimento. Use criptomoeda para pagamento imediato.
													</CardDescription>
												</CardHeader>
												<CardContent className="space-y-4">
													<div className="space-y-2">
														<Label htmlFor="cardNumber">Número do Cartão</Label>
														<Input id="cardNumber" placeholder="•••• •••• •••• ••••" disabled />
													</div>
													<div className="grid grid-cols-2 gap-4">
														<div className="space-y-2">
															<Label htmlFor="expiry">Validade</Label>
															<Input id="expiry" placeholder="MM/AA" disabled />
														</div>
														<div className="space-y-2">
															<Label htmlFor="cvv">CVV</Label>
															<Input id="cvv" placeholder="•••" disabled />
														</div>
													</div>
													<Button className="w-full" disabled>
														Em Breve
													</Button>
												</CardContent>
											</Card>
										</TabsContent>
									</Tabs>
								</CardContent>
							</Card>
						</div>
					</div>

					{/* Sidebar - Order Summary */}
					<div className="lg:col-span-4">
						<div className="sticky top-24 checkout-sections">
							<CheckoutSummary
								items={mockCheckoutItems}
								subtotal={subtotal}
								shipping={shipping}
								tax={tax}
								total={total}
							/>
							<div className="mt-6 px-3">
								<Button className="w-full" size="lg">
									Finalizar Compra
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>

			<Footer />
		</div>
	)
}
