import { Button } from "@/components/ui/button"
import { ArrowRight, Crown, Sparkles, Shield } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-muted/30 to-muted/40 py-24 md:py-32 px-4">
      {/* Optimized Background - using CSS for faster loading */}
      <div
        className="absolute inset-0 bg-[url('/luxury-watch-back-view.png')] bg-cover bg-center opacity-5"
        style={{ backgroundSize: 'cover' }}
      ></div>

      <div className="container mx-auto text-center space-y-12 relative z-10">
        {/* Hero Title and Subtitle */}
        <div className="space-y-8 max-w-5xl mx-auto">
          <div className="min-h-[200px] md:min-h-[300px] flex items-center justify-center">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-balance leading-tight">
              Exclusive Collection of
              <span className="text-primary block mt-2">
                Luxury Watches
              </span>
            </h1>
          </div>

          <p className="text-xl md:text-2xl text-muted-foreground text-balance max-w-3xl mx-auto leading-relaxed">
            Discover timeless pieces from the world’s most prestigious brands. Secure crypto payments and
            authenticity verified by experts.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link href="/marketplace">
            <Button variant="secondary" size="xl" className="text-lg px-10 group">
              Explore Collection
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/about">
            <Button
              variant="outline"
              size="xl"
              className="text-lg px-10 border-primary/30 text-primary hover:bg-primary/10"
            >
              How It Works
            </Button>
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
          <div className="text-center space-y-4">
            <div className="p-4 rounded-2xl bg-primary/10 w-fit mx-auto">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <div className="text-3xl md:text-4xl font-bold font-serif text-primary">500+</div>
            <p className="text-muted-foreground font-medium">Verified Exclusive Watches</p>
          </div>

          <div className="text-center space-y-4">
            <div className="p-4 rounded-2xl bg-primary/10 w-fit mx-auto">
              <Crown className="h-8 w-8 text-primary" />
            </div>
            <div className="text-3xl md:text-4xl font-bold font-serif text-primary">50+</div>
            <p className="text-muted-foreground font-medium">Global Premium Brands</p>
          </div>

          <div className="text-center space-y-4">
            <div className="p-4 rounded-2xl bg-primary/10 w-fit mx-auto">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div className="text-3xl md:text-4xl font-bold font-serif text-primary">100%</div>
            <p className="text-muted-foreground font-medium">Guaranteed Authenticity</p>
          </div>
        </div>
      </div>
    </section>
  )
}
