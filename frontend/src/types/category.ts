import type { TransactionType } from './transaction'

export interface Category {
  id: string
  name: string
  color: string
  icon: string
  type: TransactionType
}

// Body of POST /categories and PUT /categories/:id
export interface CategoryInput {
  name: string
  color: string // "#22c55e"
  icon: string // Lucide icon name, e.g. "shopping-cart"
  type: TransactionType
}
