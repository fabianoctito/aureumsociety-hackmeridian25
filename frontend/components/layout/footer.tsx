import Link from "next/link"
import { Crown, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-primary/10">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-bold text-foreground">Aurum</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Sua coleção de relógios de luxo merece o melhor. Descubra peças exclusivas e invista em elegância
              atemporal.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/marketplace"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Marketplace
                </Link>
              </li>
              <li>
                <Link
                  href="/collections"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Coleções
                </Link>
              </li>
              <li>
                <Link href="/brands" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Marcas
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Favoritos
                </Link>
              </li>
              <li>
                <Link href="/my-watches" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Minha Coleção
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Suporte</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Central de Ajuda
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Envios & Devoluções
                </Link>
              </li>
              <li>
                <Link
                  href="/authentication"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm"
                >
                  Autenticação
                </Link>
              </li>
              <li>
                <Link href="/warranty" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Garantia
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Contato</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground text-sm">contato@luxtime.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground text-sm">+55 (11) 9999-9999</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                <span className="text-muted-foreground text-sm leading-relaxed">
                  Av. Paulista, 1000
                  <br />
                  São Paulo, SP - 01310-100
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-muted-foreground text-sm">© 2024 LuxTime. Todos os direitos reservados.</p>
          <div className="flex space-x-6">
            <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Termos de Uso
            </Link>
            <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Privacidade
            </Link>
            <Link href="/cookies" className="text-muted-foreground hover:text-primary transition-colors text-sm">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
