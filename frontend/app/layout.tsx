import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { DM_Serif_Text } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ClientOnly } from "@/components/client-only"
import { ClientLayout } from "@/components/client-layout"
import { AuthProvider } from "@/contexts/auth-context-api"
import "./globals.css"

const dmSerifText = DM_Serif_Text({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-serif",
  preload: true,
})

export const metadata: Metadata = {
  title: "Aurum - Relógios de Luxo",
  description: "Marketplace exclusivo de relógios de luxo com pagamento em criptomoedas",
  generator: "v0.app",
  metadataBase: new URL('https://aurum-marketplace.vercel.app'),
  openGraph: {
    title: "Aurum - Relógios de Luxo",
    description: "Marketplace exclusivo de relógios de luxo com pagamento em criptomoedas",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Critical resource hints for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Only preload the critical background image */}
        <link rel="preload" as="image" href="/luxury-watch-back-view.png" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} ${dmSerifText.variable} antialiased`}>
        <ClientOnly>
          <AuthProvider>
            <ClientLayout>
              {children}
            </ClientLayout>
          </AuthProvider>
        </ClientOnly>
        <Analytics />
      </body>
    </html>
  )
}
