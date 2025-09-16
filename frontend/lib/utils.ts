import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Garante que um erro seja sempre uma string para renderização segura no React
 * @param error - O erro a ser convertido
 * @param fallback - Mensagem padrão caso o erro seja inválido
 * @returns Uma string segura para renderização
 */
export function formatErrorMessage(error: unknown, fallback = "Erro inesperado"): string {
  if (typeof error === 'string') {
    return error
  }
  
  if (typeof error === 'object' && error !== null) {
    // Se for um objeto de erro da API com estrutura específica
    if ('msg' in error && typeof error.msg === 'string') {
      return error.msg
    }
    if ('message' in error && typeof error.message === 'string') {
      return error.message
    }
    if ('detail' in error && typeof error.detail === 'string') {
      return error.detail
    }
    
    // Como último recurso, serializa o objeto
    try {
      return JSON.stringify(error)
    } catch {
      return fallback
    }
  }
  
  return fallback
}

