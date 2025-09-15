"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Filter, X } from "lucide-react"

interface FilterState {
  search?: string
  priceRange: [number, number]
  selectedBrands: string[]
  selectedCategories: string[]
  selectedConditions: string[]
}

interface FiltersProps {
  onFiltersChange: (filters: FilterState) => void
  filters: FilterState
}

export function Filters({ onFiltersChange, filters }: FiltersProps) {
  // Usamos apenas os valores passados por props, não mantemos estado interno
  const { priceRange, selectedBrands, selectedCategories, selectedConditions } = filters

  const brands = [
    "Rolex",
    "Patek Philippe",
    "Audemars Piguet",
    "Omega",
    "Cartier",
    "Breitling",
    "IWC",
    "Tudor",
    "TAG Heuer",
    "Jaeger-LeCoultre",
  ]

  const categories = [
    "Diving Watch",
    "Sport Watch", 
    "Chronograph",
    "Dress Watch",
    "GMT Watch",
    "Aviation Watch",
    "Complications",
    "Limited Edition",
  ]

  const conditions = [
    "novo",
    "seminovo", 
    "usado"
  ]

  const handleBrandChange = (brand: string, checked: boolean) => {
    const newBrands = checked 
      ? [...selectedBrands, brand]
      : selectedBrands.filter((b) => b !== brand);
      
    onFiltersChange({
      ...filters,
      selectedBrands: newBrands,
    });
  }

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked 
      ? [...selectedCategories, category]
      : selectedCategories.filter((c) => c !== category);
      
    onFiltersChange({
      ...filters,
      selectedCategories: newCategories,
    });
  }

  const handleConditionChange = (condition: string, checked: boolean) => {
    const newConditions = checked 
      ? [...selectedConditions, condition]
      : selectedConditions.filter((c) => c !== condition);
      
    onFiltersChange({
      ...filters,
      selectedConditions: newConditions,
    });
  }

  const handlePriceRangeChange = (newPriceRange: number[]) => {
    onFiltersChange({
      ...filters,
      priceRange: newPriceRange as [number, number],
    });
  }

  const clearFilters = () => {
    onFiltersChange({
      priceRange: [0, 100000],
      selectedBrands: [],
      selectedCategories: [],
      selectedConditions: [],
      search: filters.search,
    });
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price).replace('US$', '$')
  }
  
  const handleMinPriceChange = (value: string) => {
    const minPrice = Number.parseInt(value) || 0;
    onFiltersChange({
      ...filters,
      priceRange: [minPrice, priceRange[1]],
    });
  }
  
  const handleMaxPriceChange = (value: string) => {
    const maxPrice = Number.parseInt(value) || 100000;
    onFiltersChange({
      ...filters,
      priceRange: [priceRange[0], maxPrice],
    });
  }

  return (
      <div className="w-full space-y-6 bg-card/50 rounded-lg p-6 border shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros
        </h3>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />
          Limpar
        </Button>
      </div>

      {/* Active Filters Summary */}
      {(selectedBrands.length > 0 || selectedCategories.length > 0 || selectedConditions.length > 0) && (
        <div className="bg-primary/5 rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-2">Filtros ativos:</div>
          <div className="flex flex-wrap gap-1">
            {selectedBrands.map(brand => (
              <span key={brand} className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                {brand}
                <X 
                  className="h-3 w-3 cursor-pointer hover:bg-primary/20 rounded" 
                  onClick={() => handleBrandChange(brand, false)}
                />
              </span>
            ))}
            {selectedCategories.map(category => (
              <span key={category} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                {category}
                <X 
                  className="h-3 w-3 cursor-pointer hover:bg-blue-200 rounded" 
                  onClick={() => handleCategoryChange(category, false)}
                />
              </span>
            ))}
            {selectedConditions.map(condition => (
              <span key={condition} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md capitalize">
                {condition}
                <X 
                  className="h-3 w-3 cursor-pointer hover:bg-green-200 rounded" 
                  onClick={() => handleConditionChange(condition, false)}
                />
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 hover:bg-muted/50 rounded px-2">
          <Label className="text-sm font-medium">Faixa de Preço</Label>
          <ChevronDown className="h-4 w-4 transition-transform duration-200" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-2">
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={handlePriceRangeChange}
              max={100000}
              min={0}
              step={1000}
              className="w-full"
            />
          </div>
          <div className="text-center text-sm text-muted-foreground">
            {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
          </div>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              placeholder="Min"
              value={priceRange[0]}
              onChange={(e) => handleMinPriceChange(e.target.value)}
              className="flex-1"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={priceRange[1]}
              onChange={(e) => handleMaxPriceChange(e.target.value)}
              className="flex-1"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Condition */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 hover:bg-muted/50 rounded px-2">
          <Label className="text-sm font-medium">Condição</Label>
          <ChevronDown className="h-4 w-4 transition-transform duration-200" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
          {conditions.map((condition) => (
            <div key={condition} className="flex items-center space-x-2 hover:bg-muted/30 rounded p-1">
              <Checkbox
                id={condition}
                checked={selectedConditions.includes(condition)}
                onCheckedChange={(checked) => handleConditionChange(condition, checked as boolean)}
              />
              <Label htmlFor={condition} className="text-sm font-normal cursor-pointer capitalize">
                {condition}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Brands */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 hover:bg-muted/50 rounded px-2">
          <Label className="text-sm font-medium">Marcas</Label>
          <ChevronDown className="h-4 w-4 transition-transform duration-200" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2 max-h-60 overflow-y-auto">
          {brands.map((brand) => (
            <div key={brand} className="flex items-center space-x-2 hover:bg-muted/30 rounded p-1">
              <Checkbox
                id={brand}
                checked={selectedBrands.includes(brand)}
                onCheckedChange={(checked) => handleBrandChange(brand, checked as boolean)}
              />
              <Label htmlFor={brand} className="text-sm font-normal cursor-pointer">
                {brand}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Categories */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 hover:bg-muted/50 rounded px-2">
          <Label className="text-sm font-medium">Categorias</Label>
          <ChevronDown className="h-4 w-4 transition-transform duration-200" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2 hover:bg-muted/30 rounded p-1">
              <Checkbox
                id={category}
                checked={selectedCategories.includes(category)}
                onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
              />
              <Label htmlFor={category} className="text-sm font-normal cursor-pointer">
                {category}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
