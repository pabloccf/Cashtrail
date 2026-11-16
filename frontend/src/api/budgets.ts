import { apiClient } from './client'
import type { Budget, CreateBudgetInput, UpdateBudgetInput } from '../types/budget'

// Budgets of a month, each with what has been spent in its category, sorted by category name
export function getBudgets(month: string) {
  return apiClient.get<Budget[]>(`/budgets?month=${month}`)
}

export function createBudget(input: CreateBudgetInput) {
  return apiClient.post<Budget>('/budgets', input)
}

export function updateBudget(id: string, input: UpdateBudgetInput) {
  return apiClient.put<Budget>(`/budgets/${id}`, input)
}

export function deleteBudget(id: string) {
  return apiClient.delete(`/budgets/${id}`)
}

// Copies the budgets of the month before `month` into `month`. Categories that already have one keep it.
// `copied` is how many were really created (0 if the previous month had none)
export function copyBudgetsFromPreviousMonth(month: string) {
  return apiClient.post<{ copied: number }>('/budgets/copy', { month })
}
