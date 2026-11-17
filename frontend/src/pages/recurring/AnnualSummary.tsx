import CategoryIcon from '../../components/CategoryIcon'
import type { AnnualTotals } from '../../utils/recurring'
import { useMoney } from '../../hooks/useMoney'
import Card from '../../components/Card'

interface AnnualSummaryProps {
  totals: AnnualTotals
}

// How much the active recurring transactions add up to per year, with the expenses split by
// category (that is where "Suscripciones" shows up, whatever the user has renamed it to)
function AnnualSummary({ totals }: AnnualSummaryProps) {
  const { formatMoney } = useMoney()
  return (
    <section aria-labelledby="annual-summary" className="flex flex-col gap-3">
      <h2 id="annual-summary" className="sr-only">
        Resumen anual
      </h2>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-sm text-slate-500">Gastos fijos al año</p>
          <p className="mt-1 text-xl font-bold text-rose-600 tabular-nums">{formatMoney(totals.expense)}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Ingresos fijos al año</p>
          <p className="mt-1 text-xl font-bold text-emerald-600 tabular-nums">{formatMoney(totals.income)}</p>
        </Card>
      </div>

      {totals.expenseByCategory.length > 0 && (
        <Card>
          <h3 className="mb-2 text-sm font-medium text-slate-500">Gastos fijos por categoría</h3>
          <ul className="flex flex-col divide-y divide-slate-100">
            {totals.expenseByCategory.map(({ category, total }) => (
              <li key={category.id} className="flex items-center justify-between gap-3 py-2">
                <span className="flex min-w-0 items-center gap-2">
                  <CategoryIcon icon={category.icon} color={category.color} size="sm" />
                  <span className="truncate">{category.name}</span>
                </span>
                <span className="shrink-0 font-medium tabular-nums">{formatMoney(total)}/año</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <p className="text-xs text-slate-500">
        Ritmo anual de los fijos activos: los mensuales cuentan 12 veces y los anuales, una.
      </p>
    </section>
  )
}

export default AnnualSummary
