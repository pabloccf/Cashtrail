import { apiClient } from './client'
import type { Category, CategoryInput } from '../types/category'

export function getCategories() {
  return apiClient.get<Category[]>('/categories')
}

export function createCategory(input: CategoryInput) {
  return apiClient.post<Category>('/categories', input)
}

export function updateCategory(id: string, input: CategoryInput) {
  return apiClient.put<Category>(`/categories/${id}`, input)
}

export function deleteCategory(id: string) {
  return apiClient.delete(`/categories/${id}`)
}
