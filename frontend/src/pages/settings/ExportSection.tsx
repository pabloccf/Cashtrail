import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import { downloadTransactionsCsv } from '../../api/transactions'
import { saveFile } from '../../utils/download'
import { getErrorMessage } from '../../utils/errorMessage'
import { currentMonth, formatMonth, monthRange, shiftMonth } from '../../utils/month'
import type { TransactionFilters } from '../../utils/transactionFilters'

type ExportRange = 'month' | 'previousMonth' | 'year' | 'all'

interface RangeOption {
  value: ExportRange
  label: string
  filters: TransactionFilters
}

// Computed on each render: "this month" is decided in the user's time zone, like everywhere else
function getRangeOptions(): RangeOption[] {
  const month = currentMonth()
  const previousMonth = shiftMonth(month, -1)
  const year = month.slice(0, 4)
  return [
    { value: 'month', label: formatMonth(month), filters: monthRange(month) },
    { value: 'previousMonth', label: formatMonth(previousMonth), filters: monthRange(previousMonth) },
    { value: 'year', label: `Año ${year}`, filters: { from: `${year}-01-01`, to: `${year}-12-31` } },
    { value: 'all', label: 'Todo', filters: {} },
  ]
}

function ExportSection() {
  const [range, setRange] = useState<ExportRange>('month')
  const options = getRangeOptions()

  // A mutation, not a query: it is an action the user starts, and its result is not kept in the cache
  const exportMutation = useMutation({
    mutationFn: downloadTransactionsCsv,
    onSuccess: ({ blob, filename }) => saveFile(blob, filename),
  })

  function handleExport() {
    const selected = options.find((option) => option.value === range)
    if (selected) exportMutation.mutate(selected.filters)
  }

  return (
    <section aria-labelledby="export-title" className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4">
      <div>
        <h2 id="export-title" className="font-semibold">
          Exportar a CSV
        </h2>
        <p className="text-sm text-slate-500">
          Descarga tus transacciones para abrirlas en Excel, LibreOffice o Google Sheets.
        </p>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Periodo</legend>
        {/* Same pattern as the type toggle: real radios, visually hidden, and styled labels */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {options.map((option) => (
            <label key={option.value} className="cursor-pointer">
              <input
                type="radio"
                name="export-range"
                value={option.value}
                checked={range === option.value}
                onChange={() => setRange(option.value)}
                className="peer sr-only"
              />
              <span className="flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-2 text-center text-sm font-medium text-slate-600 peer-checked:border-brand-500 peer-checked:bg-brand-50 peer-checked:text-brand-800 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {exportMutation.isError && (
        <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700" role="alert">
          No se ha podido exportar: {getErrorMessage(exportMutation.error)}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleExport}
          disabled={exportMutation.isPending}
          className="flex min-h-11 items-center gap-2 rounded-lg bg-brand-600 px-5 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          <Download className="size-5" aria-hidden="true" />
          {exportMutation.isPending ? 'Exportando…' : 'Exportar'}
        </button>
      </div>
    </section>
  )
}

export default ExportSection
