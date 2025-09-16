// import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/marketplace/hero-section"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Shield, Truck, CreditCard, Star } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header removed - added in global layout */}
      
      {/* Hero Section - Critical Above the Fold */}
      <HeroSection />
      
      {/* Simplified Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-primary">
              Why Choose Aurum?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We offer a unique experience in luxury watch purchasing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-serif font-semibold text-lg mb-3">Guaranteed Authenticity</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Every watch undergoes rigorous verification
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Truck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-serif font-semibold text-lg mb-3">Secure Delivery</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Specialized delivery with full insurance
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <CreditCard className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-serif font-semibold text-lg mb-3">Secure Payments</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Accepts crypto and traditional methods
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-serif font-semibold text-lg mb-3">Expert Curation</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Expertly curated selection
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Simple CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-muted/50 to-background">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-primary">
              Ready to Find Your Next Timepiece?
            </h2>
            <p className="text-muted-foreground text-xl mb-8 leading-relaxed">
              Explore our exclusive collection of luxury watches
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/marketplace">
                <Button variant="secondary" size="xl" className="group">
                  Explore Marketplace
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
