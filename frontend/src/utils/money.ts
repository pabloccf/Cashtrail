// Formatters are relatively expensive to create, so one is cached per currency
const formatters = new Map<string, Intl.NumberFormat>()

function getFormatter(currency: string) {
  let formatter = formatters.get(currency)
  if (!formatter) {
    formatter = new Intl.NumberFormat('es-ES', { style: 'currency', currency })
    formatters.set(currency, formatter)
  }
  return formatter
}

// 1250 -> "12,50 €". Amounts are stored in cents; dividing by 100 happens only here, for display
export function formatMoney(cents: number, currency = 'EUR'): string {
  return getFormatter(currency).format(cents / 100)
}

// Euros with an optional comma or dot and up to 2 decimals: "12", "12,5", "12.50".
// Up to 7 digits for euros, so the cents always fit in the database `integer` column
const AMOUNT_PATTERN = /^(\d{1,7})(?:[.,](\d{1,2}))?$/

// "12,50" -> 1250. Returns null if the text is not a valid amount.
// It works on the text itself: parseFloat("0.29") * 100 gives 28.999999999999996 because of float rounding
export function parseAmountToCents(text: string): number | null {
  const match = AMOUNT_PATTERN.exec(text.trim())
  if (!match) return null

  const euros = Number(match[1])
  const cents = Number((match[2] ?? '').padEnd(2, '0')) // "5" -> "50", missing -> "00"
  return euros * 100 + cents
}

// 1250 -> "12,50", to fill the amount input when editing
export function centsToInput(cents: number): string {
  const euros = Math.floor(cents / 100)
  const rest = String(cents % 100).padStart(2, '0')
  return `${euros},${rest}`
}
