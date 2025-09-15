import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/marketplace/hero-section"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WatchCard } from "@/components/ui/watch-card"
import { ArrowRight, Shield, Truck, CreditCard, Star, TrendingUp, Users, Award } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Suspense } from "react"

export default function HomePage() {
  const featuredWatches = [
    {
      id: "1",
      name: "Submariner Date",
      brand: "Rolex",
      price: 12500,
      cryptoPrice: "0.285 BTC",
      image: "/luxury-rolex-submariner.png",
      rating: 4.8,
      reviews: 127,
      isNew: true,
    },
    {
      id: "2",
      name: "Nautilus 5711/1A",
      brand: "Patek Philippe",
      price: 85000,
      cryptoPrice: "1.94 BTC",
      image: "/patek-philippe-nautilus-luxury-watch.png",
      rating: 4.9,
      reviews: 89,
      isLimited: true,
    },
    {
      id: "3",
      name: "Royal Oak Offshore",
      brand: "Audemars Piguet",
      price: 32000,
      cryptoPrice: "0.73 BTC",
      image: "/audemars-piguet-royal-oak-luxury-watch.png",
      rating: 4.7,
      reviews: 156,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section - Critical Above the Fold */}
      <HeroSection />
      
      {/* Featured Products Section - Lazy Loaded */}
      <Suspense fallback={
        <div className="py-20 px-4">
          <div className="container mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-muted rounded w-96 mx-auto mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1,2,3].map(i => (
                  <div key={i} className="h-96 bg-muted rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      }>
        <section className="py-20 px-4 bg-background relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-muted/10 via-transparent to-muted/10" />
          <div className="container mx-auto relative">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-4 mb-6">
                <Badge variant="secondary" className="text-sm px-4 py-2">
                  Seleção Premium
                </Badge>
                <Star className="h-6 w-6 text-gold-500 fill-gold-500" />
              </div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-gold-600">
                Destaques da Semana
              </h2>
              <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
                Peças selecionadas especialmente para colecionadores exigentes que buscam exclusividade e qualidade
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredWatches.map((watch) => (
                <WatchCard 
                  key={watch.id} 
                  id={watch.id}
                  name={watch.name}
                  brand={watch.brand}
                  price={watch.price}
                  cryptoPrice={watch.cryptoPrice}
                  image={watch.image}
                  rating={watch.rating}
                  reviews={watch.reviews}
                  isNew={watch.isNew}
                  isLimited={watch.isLimited}
                />
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link href="/marketplace">
                <Button variant="secondary" size="lg" className="group">
                  Ver Todos os Relógios
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </Suspense>

      {/* Why Choose Us Section - Lazy Loaded */}
      <Suspense fallback={<div className="py-20 px-4"><div className="h-64 bg-muted rounded animate-pulse"></div></div>}>
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-primary">
                Por que escolher a Aurum?
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Oferecemos uma experiência única em compra de relógios de luxo
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Shield,
                  title: "Autenticidade Garantida",
                  description: "Todos os relógios passam por rigorosa verificação de autenticidade",
                },
                {
                  icon: Truck,
                  title: "Entrega Segura",
                  description: "Entrega especializada com seguro completo e rastreamento",
                },
                {
                  icon: CreditCard,
                  title: "Pagamentos Seguros",
                  description: "Aceite cripto e métodos tradicionais com máxima segurança",
                },
                {
                  icon: Award,
                  title: "Curadoria Expert",
                  description: "Seleção feita por especialistas em relógios de luxo",
                },
              ].map((feature, index) => (
                <Card key={index} className="border-0 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-serif font-semibold text-lg mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </Suspense>

      {/* Stats Section - Lazy Loaded */}
      <Suspense fallback={<div className="py-20 px-4"><div className="h-64 bg-muted rounded animate-pulse"></div></div>}>
        <section className="py-20 px-4 bg-gradient-to-br from-foreground to-foreground/90 text-background">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-background">
                Números que Impressionam
              </h2>
              <p className="text-background/70 text-lg max-w-2xl mx-auto">
                Nossa excelência refletida em números
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Users, number: "10K+", label: "Clientes Satisfeitos" },
                { icon: Award, number: "500+", label: "Relógios Autenticados" },
                { icon: TrendingUp, number: "98%", label: "Taxa de Satisfação" },
                { icon: Star, number: "4.9", label: "Avaliação Média" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-background/10 rounded-full flex items-center justify-center">
                    <stat.icon className="h-8 w-8 text-background" />
                  </div>
                  <div className="text-4xl font-bold font-serif mb-2 text-background">{stat.number}</div>
                  <div className="text-background/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Suspense>

      {/* CTA Section - Lazy Loaded */}
      <Suspense fallback={<div className="py-20 px-4"><div className="h-64 bg-muted rounded animate-pulse"></div></div>}>
        <section className="py-20 px-4 bg-gradient-to-br from-muted/50 to-background">
          <div className="container mx-auto text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-primary">
                Pronto para Encontrar seu Próximo Relógio?
              </h2>
              <p className="text-muted-foreground text-xl mb-8 leading-relaxed">
                Descubra nossa coleção exclusiva de relógios de luxo e encontre a peça perfeita para sua coleção
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/marketplace">
                  <Button variant="secondary" size="xl" className="group">
                    Explorar Marketplace
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" size="xl">
                    Criar Conta Gratuita
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </Suspense>

      <Footer />
    </div>
  )
}