// "EUR" -> "€", "GBP" -> "£", "USD" -> "$". Intl knows the symbol of every ISO 4217 currency, so no
// table has to be kept by hand. 'narrowSymbol' gives the short symbol: the default ('symbol') in
// es-ES gives "GBP" for the pound and "US$" for the dollar
export function currencySymbol(currency: string): string {
  const parts = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
  }).formatToParts(0);
  // A currency always has its symbol part; the code is only a fallback to keep TypeScript happy
  return parts.find((part) => part.type === 'currency')?.value ?? currency;
}
