import { useMemo } from 'react'
import { currencySymbol } from '../utils/currency'
import { formatMoney, formatMoneyCompact } from '../utils/money'
import { useCurrentUser } from './useAuth'

// The fallback while there is no user (it never happens inside the app: ProtectedRoute waits for it)
const DEFAULT_CURRENCY = 'EUR'

// Money formatters already set to the user's currency. The currency comes from the cached
// /auth/me, so no new request is made, and when the profile changes (useUpdateProfile writes the
// new user into the cache) every component that uses this hook re-renders with the new symbol.
// Only the display changes: amounts are stored in cents and never converted
export function useMoney() {
  const { data: user } = useCurrentUser()
  const currency = user?.currency ?? DEFAULT_CURRENCY

  // useMemo keeps the same functions while the currency does not change, so props such as a
  // chart's tickFormatter do not change on every render
  return useMemo(
    () => ({
      formatMoney: (cents: number) => formatMoney(cents, currency),
      formatMoneyCompact: (cents: number) => formatMoneyCompact(cents, currency),
      symbol: currencySymbol(currency),
    }),
    [currency],
  )
}
