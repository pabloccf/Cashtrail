// Currencies a user can choose in their profile, with the name shown in the selector.
// Keep in sync with SUPPORTED_CURRENCIES in the backend (src/constants/currencies.ts)
export const SUPPORTED_CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF'] as const

export type Currency = (typeof SUPPORTED_CURRENCIES)[number]

export const CURRENCY_LABELS: Record<Currency, string> = {
  EUR: 'Euro (€)',
  USD: 'Dólar estadounidense ($)',
  GBP: 'Libra esterlina (£)',
  CHF: 'Franco suizo (CHF)',
}

// The user's currency comes from the API as a plain string, so it is checked before using it as a Currency
export function isSupportedCurrency(value: string): value is Currency {
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(value)
}

// "EUR" -> "€", "GBP" -> "£", "USD" -> "$", for labels such as "Importe (€)". Same as the backend
// (src/lib/currency.ts), so the app and the CSV show the same symbol
export function currencySymbol(currency: string): string {
  const parts = new Intl.NumberFormat('es-ES', { style: 'currency', currency, currencyDisplay: 'narrowSymbol' }).formatToParts(0)
  // A currency always has its symbol part; the code is only a fallback to keep TypeScript happy
  return parts.find((part) => part.type === 'currency')?.value ?? currency
}
