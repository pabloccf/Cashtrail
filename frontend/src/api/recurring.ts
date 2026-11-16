import { apiClient } from './client'
import type { RecurringInput, RecurringTransaction, UpcomingOccurrence } from '../types/recurring'

export function getRecurring() {
  return apiClient.get<RecurringTransaction[]>('/recurring')
}

// From today to `days` days from now, oldest first
export function getUpcomingRecurring(days: number) {
  return apiClient.get<UpcomingOccurrence[]>(`/recurring/upcoming?days=${days}`)
}

export function createRecurring(input: RecurringInput) {
  return apiClient.post<RecurringTransaction>('/recurring', input)
}

export function updateRecurring(id: string, input: RecurringInput) {
  return apiClient.put<RecurringTransaction>(`/recurring/${id}`, input)
}

// Pauses an active recurring transaction or resumes a paused one
export function toggleRecurring(id: string) {
  return apiClient.patch<RecurringTransaction>(`/recurring/${id}/toggle`)
}

export function deleteRecurring(id: string) {
  return apiClient.delete(`/recurring/${id}`)
}
