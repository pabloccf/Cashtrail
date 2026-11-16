// Mirrors what the backend returns for /stats. Every amount is in cents and only confirmed
// records count, except in `remainingRecurring`

export interface StatsTotals {
  income: number
  expense: number
}

// GET /stats/summary?month=YYYY-MM
export interface StatsSummary extends StatsTotals {
  month: string // "YYYY-MM"
  balance: number // income − expense. Can be negative
  // Recurring income and expenses of the month not in the balance yet: pending records
  // plus the occurrences the daily job has not generated yet
  remainingRecurring: StatsTotals
  estimatedBalance: number // balance + remaining income − remaining expense
}
