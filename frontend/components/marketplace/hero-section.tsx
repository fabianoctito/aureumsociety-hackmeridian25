import { Button } from "@/components/ui/button"
import { ArrowRight, Crown, Sparkles, Shield } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-muted/30 to-muted/40 py-24 md:py-32 px-4">
      {/* Optimized Background - using CSS for faster loading */}
      <div className="absolute inset-0 bg-[url('/luxury-watch-back-view.png')] bg-cover bg-center opacity-5" style={{backgroundSize: 'cover'}}></div>
      
      <div className="container mx-auto text-center space-y-12 relative z-10">
        {/* <div className="flex justify-center mb-8">
          <div className="p-6 rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-luxury">
            <Crown className="h-16 w-16 text-primary-foreground" />
          </div>
        </div> */}

        <div className="space-y-8 max-w-5xl mx-auto">
          {/* <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Marketplace Premium</span>
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
           */}
          {/* Fixed title with explicit height to prevent CLS */}
          <div className="min-h-[200px] md:min-h-[300px] flex items-center justify-center">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-balance leading-tight">
              Coleção Exclusiva de
              <span className="text-primary block mt-2">
                Relógios de Luxo
              </span>
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-muted-foreground text-balance max-w-3xl mx-auto leading-relaxed">
            Descubra peças atemporais das marcas mais prestigiadas do mundo. Pagamento seguro com criptomoedas e
            autenticidade garantida por especialistas.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link href="/marketplace">
            <Button variant="secondary" size="xl" className="text-lg px-10 group">
              Explorar Coleção
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="outline" size="xl" className="text-lg px-10 border-primary/30 text-primary hover:bg-primary/10">
              Como Funciona
            </Button>
          </Link>
        </div>

        {/* Simplified Trust Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
          <div className="text-center space-y-4">
            <div className="p-4 rounded-2xl bg-primary/10 w-fit mx-auto">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div className="text-3xl md:text-4xl font-bold font-serif text-primary">500+</div>
            <p className="text-muted-foreground font-medium">Relógios Exclusivos Verificados</p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="p-4 rounded-2xl bg-primary/10 w-fit mx-auto">
              <Crown className="h-8 w-8 text-primary" />
            </div>
            <div className="text-3xl md:text-4xl font-bold font-serif text-primary">50+</div>
            <p className="text-muted-foreground font-medium">Marcas Premium Mundiais</p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="p-4 rounded-2xl bg-primary/10 w-fit mx-auto">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div className="text-3xl md:text-4xl font-bold font-serif text-primary">100%</div>
            <p className="text-muted-foreground font-medium">Autenticidade Garantida</p>
          </div>
        </div>
      </div>
    </section>
  )
}
