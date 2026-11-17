import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
  type YAxisTickContentProps,
} from 'recharts'
import type { CategoryTotal } from '../types/stats'
import { getCategoryIcon } from '../utils/categoryIcons'
import { useMoney } from '../hooks/useMoney'

interface CategoryBarChartProps {
  items: CategoryTotal[] // Highest first, as the backend returns them
}

// Each row is 36px high, so the chart grows with the number of categories instead of squashing them
const ROW_HEIGHT = 36
const BAR_SIZE = 18
// Room on the left for the icon and the name, and on the right for the amount label
const NAME_WIDTH = 124
const LABEL_SPACE = 84
const MAX_NAME_LENGTH = 13

// Slate text colors: text never takes the color of the series (the bar already carries it)
const TEXT_COLOR = '#475569' // slate-600

interface ChartRow {
  id: string
  name: string
  color: string
  icon: string
  total: number
  share: number // 0-1 of the total of the month
}

function truncate(text: string): string {
  return text.length > MAX_NAME_LENGTH ? `${text.slice(0, MAX_NAME_LENGTH - 1)}…` : text
}

interface CategoryTickProps {
  x: number
  y: number
  row: ChartRow | undefined
}

// Category icon (white on a circle of its color, like CategoryIcon) plus its name, drawn in SVG
// because the axis is part of the chart's <svg>
function CategoryTick({ x, y, row }: CategoryTickProps) {
  if (!row) return null
  const Icon = getCategoryIcon(row.icon)
  // `x` is where the axis meets the bars; the tick is drawn from the left edge of the axis area
  const left = x - NAME_WIDTH + 12

  return (
    <g>
      <circle cx={left + 10} cy={y} r={10} fill={row.color} />
      {/* Same reason as in CategoryIcon: getCategoryIcon only looks up an existing component in a
          module-level Map (it never creates a new one), so the same name always gives the same component */}
      {/* eslint-disable-next-line react-hooks/static-components */}
      <Icon x={left + 4} y={y - 6} width={12} height={12} color="white" aria-hidden="true" />
      <text x={left + 26} y={y} dy="0.35em" fontSize={13} fill={TEXT_COLOR}>
        {truncate(row.name)}
      </text>
    </g>
  )
}

function CategoryTooltip({ active, payload }: TooltipContentProps) {
  const { formatMoney } = useMoney()
  // `payload[0].payload` is the original row of the hovered bar
  const row = payload?.[0]?.payload as ChartRow | undefined
  if (!active || !row) return null

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-slate-900">{row.name}</p>
      <p className="text-slate-600 tabular-nums">
        {formatMoney(row.total)} · {Math.round(row.share * 100)} %
      </p>
    </div>
  )
}

// Ranked horizontal bars: one row per category, highest first. It receives the data by props and
// does not fetch anything, so the shared dashboard (phase 8) can reuse it
function CategoryBarChart({ items }: CategoryBarChartProps) {
  const { formatMoney } = useMoney()
  const grandTotal = items.reduce((sum, item) => sum + item.total, 0)
  const rows: ChartRow[] = items.map(({ category, total }) => ({
    ...category,
    total,
    share: grandTotal > 0 ? total / grandTotal : 0,
  }))
  const rowsById = new Map(rows.map((row) => [row.id, row]))

  return (
    <ResponsiveContainer width="100%" height={rows.length * ROW_HEIGHT + 8}>
      <BarChart data={rows} layout="vertical" margin={{ top: 4, right: LABEL_SPACE, bottom: 4, left: 0 }}>
        {/* layout="vertical": the categories go down the Y axis and the bars grow to the right */}
        <XAxis type="number" hide domain={[0, 'dataMax']} />
        <YAxis
          type="category"
          dataKey="id"
          width={NAME_WIDTH}
          axisLine={false}
          tickLine={false}
          // Recharts gives x/y as number | string and the tick value (the category id) untyped
          tick={(props: YAxisTickContentProps) => (
            <CategoryTick x={Number(props.x)} y={Number(props.y)} row={rowsById.get(String(props.payload.value))} />
          )}
        />
        {/* Rendered as a component (not content={CategoryTooltip}): the tooltip uses a hook. See MonthlyBarChart */}
        <Tooltip content={(props) => <CategoryTooltip {...props} />} cursor={{ fill: '#f1f5f9' }} />
        <Bar dataKey="total" barSize={BAR_SIZE} radius={[0, 4, 4, 0]} isAnimationActive={false}>
          {/* One <Cell> per bar, so each one takes the color of its category */}
          {rows.map((row) => (
            <Cell key={row.id} fill={row.color} />
          ))}
          <LabelList
            dataKey="total"
            position="right"
            fontSize={13}
            fill={TEXT_COLOR}
            formatter={(value) => (typeof value === 'number' ? formatMoney(value) : value)}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default CategoryBarChart
