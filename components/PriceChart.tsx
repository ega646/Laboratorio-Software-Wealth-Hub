"use client";

import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export interface PriceChartPoint {
  fecha: string
  valor: number
}

interface Props {
  data: PriceChartPoint[]
  color?: string
  height?: number
  currency?: string
}

function formatFecha(fecha: string): string {
  const d = new Date(fecha + 'T00:00:00')
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export function PriceChart({ data, color = '#60a5fa', height = 300, currency = '$' }: Props) {
  // El historico de la API viene en orden descendente; el gráfico necesita ascendente
  const chartData = [...data].reverse().map(p => ({
    fecha: formatFecha(p.fecha),
    valor: p.valor,
  }))

  const yMin = Math.min(...chartData.map(p => p.valor))
  const yMax = Math.max(...chartData.map(p => p.valor))
  const padding = (yMax - yMin) * 0.1 || yMax * 0.05

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.35} />
            <stop offset="95%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis dataKey="fecha" stroke="#52525b" tick={{ fontSize: 12 }} />
        <YAxis
          stroke="#52525b"
          tick={{ fontSize: 12 }}
          domain={[yMin - padding, yMax + padding]}
          tickFormatter={(v: number) =>
            v >= 1000
              ? `${currency}${(v / 1000).toFixed(0)}k`
              : `${currency}${v.toLocaleString('es-ES')}`
          }
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px', color: '#e4e4e7' }}
          formatter={(value: number) => [`${currency}${value.toLocaleString('es-ES')}`, 'Precio']}
        />
        <Area
          type="natural"
          dataKey="valor"
          stroke={color}
          strokeWidth={3}
          fill={`url(#grad-${color.replace('#', '')})`}
          dot={{ fill: color, r: 4, stroke: '#18181b', strokeWidth: 2 }}
          activeDot={{ r: 6 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
