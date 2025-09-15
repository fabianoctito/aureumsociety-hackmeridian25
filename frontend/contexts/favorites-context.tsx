"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface FavoritesContextType {
  favorites: string[]
  addToFavorites: (id: string) => void
  removeFromFavorites: (id: string) => void
  isFavorite: (id: string) => boolean
  toggleFavorite: (id: string) => void
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    // Load favorites from localStorage only after hydration
    if (isClient && typeof window !== 'undefined') {
      try {
        const storedFavorites = localStorage.getItem("luxtime_favorites")
        if (storedFavorites) {
          const parsedFavorites = JSON.parse(storedFavorites)
          setFavorites(parsedFavorites)
        }
      } catch (error) {
        console.error("Error parsing stored favorites:", error)
        if (typeof window !== 'undefined') {
          localStorage.removeItem("luxtime_favorites")
        }
      }
    }
  }, [isClient])

  useEffect(() => {
    // Save favorites to localStorage only after hydration
    if (isClient && typeof window !== 'undefined') {
      try {
        localStorage.setItem("luxtime_favorites", JSON.stringify(favorites))
      } catch (error) {
        console.error("Error saving favorites to localStorage:", error)
      }
    }
  }, [favorites, isClient])

  const addToFavorites = (id: string) => {
    setFavorites((prev) => [...prev, id])
  }

  const removeFromFavorites = (id: string) => {
    setFavorites((prev) => prev.filter((fav) => fav !== id))
  }

  const isFavorite = (id: string) => {
    return favorites.includes(id)
  }

  const toggleFavorite = (id: string) => {
    if (isFavorite(id)) {
      removeFromFavorites(id)
    } else {
      addToFavorites(id)
    }
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}
