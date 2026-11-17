// Currencies a user can choose in their profile. A short, closed list on purpose:
// - every amount is stored in cents and shown with 2 decimals, so currencies without decimals
//   (JPY...) or with 3 (KWD...) are left out
// - each one has its own symbol: MXN is left out because it also shows as "$", like USD
// The currency only changes how amounts are SHOWN: nothing is ever converted.
// Keep in sync with SUPPORTED_CURRENCIES in the frontend (src/utils/currency.ts)
export const SUPPORTED_CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF'] as const;
