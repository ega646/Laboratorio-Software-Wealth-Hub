"use client";

import { ComposedChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";

export interface PriceChartPoint {
  fecha: string
  valor: number
}

export interface PriceChartOverlay {
  /** Etiqueta para tooltip y leyenda (ej. "SMA 50") */
  label: string
  /** Color del trazo (ej. "#f59e0b") */
  color: string
  /**
   * Serie de valores alineada por índice con `data` ya invertida (ASC).
   * Si la longitud no coincide con `data`, se ignora.
   * Los valores `null` se renderizan como huecos (no dibuja línea).
   */
  values: (number | null)[]
}

interface Props {
  data: PriceChartPoint[]
  color?: string
  height?: number
  currency?: string
  /**
   * UC16: overlays opcionales (medias móviles u otros indicadores) que se
   * dibujan como líneas adicionales sobre el gráfico de precio.
   *
   * IMPORTANTE: cuando hay overlays se asume que `data` ya está en orden
   * cronológico ASC (porque sus values vienen alineados por índice). El
   * componente NO invierte `data` en este caso.
   */
  overlays?: PriceChartOverlay[]
}

function formatFecha(fecha: string): string {
  const d = new Date(fecha + 'T00:00:00')
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

function formatFechaCompleta(fecha: string): string {
  const d = new Date(fecha + 'T00:00:00')
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function PriceChart({
  data,
  color = '#60a5fa',
  height = 300,
  currency = '$',
  overlays,
}: Props) {
  const tieneOverlays = overlays && overlays.length > 0

  // Si NO hay overlays, mantenemos el comportamiento original
  // (la API devuelve histórico DESC y este componente lo invierte para mostrar).
  // Si hay overlays, asumimos que `data` ya viene en ASC y alineado con los overlays.
  const dataAlineada = tieneOverlays ? data : [...data].reverse()

  const chartData = dataAlineada.map((p, i) => {
    const punto: Record<string, number | string | null> = {
      fecha: formatFecha(p.fecha),
      _fechaCompleta: formatFechaCompleta(p.fecha),
      valor: p.valor,
    }
    if (tieneOverlays) {
      for (const ov of overlays!) {
        punto[ov.label] = ov.values[i] ?? null
      }
    }
    return punto
  })

  // Rango Y considerando precio + overlays para que las líneas no se salgan
  const valoresParaRango: number[] = chartData.flatMap(p => {
    const arr: number[] = [p.valor as number]
    if (tieneOverlays) {
      for (const ov of overlays!) {
        const v = p[ov.label]
        if (typeof v === 'number') arr.push(v)
      }
    }
    return arr
  })
  const yMin = Math.min(...valoresParaRango)
  const yMax = Math.max(...valoresParaRango)
  const padding = (yMax - yMin) * 0.1 || yMax * 0.05

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis
          dataKey="fecha"
          stroke="#52525b"
          tick={{ fontSize: 12 }}
          minTickGap={tieneOverlays ? 30 : 40}
          interval="preserveStartEnd"
        />
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
          labelFormatter={(_label: unknown, payload: any[]) =>
            payload?.[0]?.payload?._fechaCompleta ?? _label
          }
          formatter={(value: unknown, name: string) => {
            if (value == null) return ['—', name]
            const num = typeof value === 'number' ? value : Number(value)
            const label = name === 'valor' ? 'Precio' : name
            return [`${currency}${num.toLocaleString('es-ES')}`, label]
          }}
        />
        {tieneOverlays && (
          <Legend
            verticalAlign="top"
            height={36}
            wrapperStyle={{ paddingBottom: '8px' }}
            formatter={(value) => value === 'valor' ? 'Precio' : value}
          />
        )}
        <Line
          type="linear"
          dataKey="valor"
          stroke={color}
          strokeWidth={tieneOverlays ? 2 : 3}
          fill="none"
          dot={false}
          activeDot={{ r: 6 }}
        />
        {tieneOverlays && overlays!.map(ov => (
          <Line
            key={ov.label}
            type="natural"
            dataKey={ov.label}
            stroke={ov.color}
            strokeWidth={2}
            dot={false}
            connectNulls={false}
            activeDot={false}
            isAnimationActive={false}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  )
}
