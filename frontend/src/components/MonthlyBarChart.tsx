import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from 'recharts'
import type { MonthlyTotals } from '../types/stats'
import { useMoney } from '../hooks/useMoney'
import ChartTooltip from './ChartTooltip'
import { formatMonth, formatShortMonth } from '../utils/month'

interface MonthlyBarChartProps {
  data: MonthlyTotals[] // Oldest month first
}

// Green for income and red for expenses, like the amounts in the rest of the app. They differ in
// lightness too (dark green, light red): a classic green/red pair looks the same to people with
// red-green color blindness. Checked with the dataviz palette validator
const INCOME_COLOR = '#047857' // emerald-700
const EXPENSE_COLOR = '#fb7185' // rose-400

// Recessive axes and grid: they help reading the values without competing with the bars
const AXIS_TEXT_COLOR = '#64748b' // slate-500
const GRID_COLOR = '#e2e8f0' // slate-200

const series = [
  { key: 'income', label: 'Ingresos', color: INCOME_COLOR },
  { key: 'expense', label: 'Gastos', color: EXPENSE_COLOR },
] as const

function MonthlyTooltip({ active, payload }: TooltipContentProps) {
  const { formatMoney } = useMoney()
  // `payload[0].payload` is the original row of the hovered month
  const row = payload?.[0]?.payload as MonthlyTotals | undefined
  if (!active || !row) return null

  return (
    <ChartTooltip title={formatMonth(row.month)}>
      {/* The value leads (the reader already knows the series and wants the number) and the series
          is keyed with a short stroke of its color: a filled box would be too heavy at this size */}
      <div className="flex flex-col gap-1">
        {series.map((item) => (
          <p key={item.key} className="flex items-center gap-2">
            <span className="h-0.5 w-3 shrink-0 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />
            <span className="font-semibold text-slate-900 tabular-nums">{formatMoney(row[item.key])}</span>
            <span className="text-slate-500">{item.label}</span>
          </p>
        ))}
      </div>
      <p className="mt-2 flex items-center gap-2 border-t border-slate-100 pt-2">
        {/* Empty key of the same width, so the balance lines up with the two values above */}
        <span className="w-3 shrink-0" aria-hidden="true" />
        <span className="font-semibold text-slate-900 tabular-nums">{formatMoney(row.income - row.expense)}</span>
        <span className="text-slate-500">Balance</span>
      </p>
    </ChartTooltip>
  )
}

// Income and expenses side by side, one pair of bars per month. It receives the data by props and
// does not fetch anything, so the shared dashboard (phase 8) can reuse it
function MonthlyBarChart({ data }: MonthlyBarChartProps) {
  const { formatMoney, formatMoneyCompact } = useMoney()
  return (
    <div className="flex flex-col gap-3">
      {/* Legend in HTML above the chart: two series, so identity never depends on color alone */}
      <ul className="flex gap-4 text-sm text-slate-600">
        {series.map((item) => (
          <li key={item.key} className="flex items-center gap-2">
            <span className="size-3 rounded-sm" style={{ backgroundColor: item.color }} aria-hidden="true" />
            {item.label}
          </li>
        ))}
      </ul>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }} barGap={2}>
          <CartesianGrid vertical={false} stroke={GRID_COLOR} />
          <XAxis
            dataKey="month"
            tickFormatter={formatShortMonth}
            tickLine={false}
            axisLine={{ stroke: GRID_COLOR }}
            tick={{ fill: AXIS_TEXT_COLOR, fontSize: 12 }}
          />
          <YAxis
            tickFormatter={formatMoneyCompact}
            tickLine={false}
            axisLine={false}
            tick={{ fill: AXIS_TEXT_COLOR, fontSize: 12 }}
            width={64}
          />
          {/* A function that returns an element (not content={MonthlyTooltip}): Recharts would call that one
              as a plain function, and the hook inside MonthlyTooltip needs it to be rendered as a component */}
          <Tooltip content={(props) => <MonthlyTooltip {...props} />} cursor={{ fill: '#f1f5f9' }} />
          {series.map((item) => (
            <Bar
              key={item.key}
              dataKey={item.key}
              name={item.label}
              fill={item.color}
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* The same numbers as a table, for screen readers and for reading the exact amounts */}
      <details className="text-sm">
        <summary className="min-h-11 cursor-pointer content-center font-medium text-brand-700">Ver como tabla</summary>
        <table className="mt-2 w-full text-left tabular-nums">
          <thead className="text-slate-500">
            <tr>
              <th className="py-1 font-medium">Mes</th>
              <th className="py-1 text-right font-medium">Ingresos</th>
              <th className="py-1 text-right font-medium">Gastos</th>
              <th className="py-1 text-right font-medium">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr key={row.month}>
                <td className="py-1">{formatMonth(row.month)}</td>
                <td className="py-1 text-right">{formatMoney(row.income)}</td>
                <td className="py-1 text-right">{formatMoney(row.expense)}</td>
                <td className="py-1 text-right">{formatMoney(row.income - row.expense)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  )
}

export default MonthlyBarChart
