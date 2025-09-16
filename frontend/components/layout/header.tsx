"use client"
import { useState } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useAuth } from "@/contexts/auth-context-api"
import { useFavorites } from "@/contexts/favorites-context"
import { NotificationsDropdown } from "@/components/layout/notifications-dropdown"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Crown, Search, ShoppingBag, User, Menu, Heart, Moon, Sun, Store, Wallet, Bell } from "lucide-react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const { favorites } = useFavorites()
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 relative group">
            <div className="p-2 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 shadow-gold group-hover:shadow-gold transform group-hover:scale-105 transition-all duration-200">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-gold-600 to-gold-800 bg-clip-text text-transparent">
                Aurum
              </span>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Luxury Timepieces
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {/* <Link href="/marketplace" className="relative group text-sm font-medium text-foreground hover:text-primary transition-colors duration-200">
              Marketplace
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-gold-400 to-gold-600 group-hover:w-full transition-all duration-300"></span>
            </Link> */}
            {/* <Link href="/collections" className="relative group text-sm font-medium text-foreground hover:text-primary transition-colors duration-200">
              Collections
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-gold-400 to-gold-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="/brands" className="relative group text-sm font-medium text-foreground hover:text-primary transition-colors duration-200">
              Brands
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-gold-400 to-gold-600 group-hover:w-full transition-all duration-300"></span>
            </Link> */}
          </nav>

          {/* Search Bar */}
          {/* <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-gold-500" />
              <Input placeholder="Search luxury watches..." className="pl-10 pr-4 bg-muted/50 border-border focus:ring-2 focus:ring-gold-500 focus:border-gold-500 placeholder:text-muted-foreground focus:bg-background/90 transition-all duration-200" />
            </div>
          </div> */}

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={toggleTheme} className="hidden md:flex icon-hover hover:bg-gold-100 hover:text-gold-700">
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            <Link href="/favorites">
              <Button variant="ghost" size="sm" className="hidden md:flex relative icon-hover hover:bg-gold-100 hover:text-gold-700">
                <Heart className="h-4 w-4" />
                {favorites.length > 0 && (
                  <Badge
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-gradient-to-r from-gold-500 to-gold-600 text-white border-0"
                  >
                    {favorites.length}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Notifications - only appears for logged in users */}
            {user && (
              <NotificationsDropdown className="hidden md:flex" />
            )}

            <Link href="/checkout">
              <Button variant="ghost" size="icon" className="relative hover:bg-gold-100 hover:text-gold-700">
                <ShoppingBag className="h-4 w-4" />
                <Badge
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-gradient-to-r from-gold-500 to-gold-600 text-white border-0"
                  variant="secondary"
                >
                  1
                </Badge>
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" size="icon" className="hover:bg-gold-100 hover:text-gold-700">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-background/95 backdrop-blur-xl border-border shadow-luxury">
                {user ? (
                  <>
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-sm font-medium text-foreground">{user.full_name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuItem className="hover:bg-muted">
                      <Link href="/balance" className="w-full flex items-center gap-3">
                        <Wallet className="h-4 w-4 text-primary" />
                        <span>My Balance</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-muted">
                      <Link href="/notifications" className="w-full flex items-center gap-3">
                        <Bell className="h-4 w-4 text-primary" />
                        <span>Notifications</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-muted">
                      <Link href="/my-watches" className="w-full flex items-center gap-3">
                        <Heart className="h-4 w-4 text-primary" />
                        <span>My Watches</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-muted">
                      <Link href="/orders" className="w-full flex items-center gap-3">
                        <ShoppingBag className="h-4 w-4 text-primary" />
                        <span>Orders</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem onClick={logout} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem className="hover:bg-muted">
                    <Link href="/login" className="w-full">
                      Login
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Button variant="ghost" size="sm" className="md:hidden icon-hover hover:bg-gold-100" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4 bg-background border-border">
            <nav className="flex flex-col space-y-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search watches..." className="pl-10 pr-4 bg-muted/50" />
              </div>
              
              <Button variant="ghost" onClick={toggleTheme} className="justify-start hover:bg-muted">
                {theme === "light" ? <Moon className="h-4 w-4 mr-2" /> : <Sun className="h-4 w-4 mr-2" />}
                {theme === "light" ? "Dark Mode" : "Light Mode"}
              </Button>
              
              {/* Notifications in mobile menu - only for logged in users */}
              {user && (
                <Link href="/notifications" className="flex items-center py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Link>
              )}
              
              <div className="space-y-2">
                <Link href="/marketplace" className="flex items-center py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                  Marketplace
                </Link>
                {/* <Link href="/collections" className="flex items-center py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                  Collections
                </Link>
                <Link href="/brands" className="flex items-center py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                  Brands
                </Link>
                <Link href="/about" className="flex items-center py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
                  About
                </Link> */}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
