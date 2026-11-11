import { apiClient } from './client'
import type { Category } from '../types/category'

export function getCategories() {
  return apiClient.get<Category[]>('/categories')
}
