"use client";

// ============================================================
// UC17 — Simulador Monte Carlo de evolución del patrimonio
//
// Página accesible desde el dashboard. Permite al usuario simular
// la evolución de su cartera real en un horizonte temporal con
// 1000 trayectorias y ver el cono P10/P50/P90.
// ============================================================

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import {
  ArrowLeft, Sparkles, TrendingUp, TrendingDown, Wallet, Info,
  AlertTriangle, RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ComposedChart, Area, Line, ResponsiveContainer, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend, ReferenceLine,
} from "recharts";

interface ResultadoMonteCarlo {
  valorInicial: number
  horizonteDias: number
  nSimulaciones: number
  series: { p10: number[]; p50: number[]; p90: number[] }
  resumenFinal: { p10: number; p50: number; p90: number; media: number }
  cobertura: { simulados: number[]; excluidos: number[] }
}

interface RespuestaVacia { vacia: true; mensaje: string }
interface RespuestaSinHist { sinHistorico: true; mensaje: string; activos: { codigo: number; dias: number }[] }
type RespuestaApi = ResultadoMonteCarlo | RespuestaVacia | RespuestaSinHist | { error: string }

const HORIZONTES = [
  { dias: 63,   label: '3M' },
  { dias: 126,  label: '6M' },
  { dias: 252,  label: '1Y' },
] as const

export default function SimulacionPage() {
  const [horizonte, setHorizonte] = useState<number>(252)
  const [resultado, setResultado] = useState<ResultadoMonteCarlo | null>(null)
  const [vacio, setVacio] = useState<{ tipo: 'vacia' | 'sinHistorico'; mensaje: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function simular() {
    setLoading(true)
    setError(null)
    setVacio(null)
    try {
      const resp = await fetch(`/api/simulacion?dias=${horizonte}&n=1000`)
      const data: RespuestaApi = await resp.json()
      if ('error' in data) {
        setError(data.error)
        setResultado(null)
      } else if ('vacia' in data) {
        setVacio({ tipo: 'vacia', mensaje: data.mensaje })
        setResultado(null)
      } else if ('sinHistorico' in data) {
        setVacio({ tipo: 'sinHistorico', mensaje: data.mensaje })
        setResultado(null)
      } else {
        setResultado(data)
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen text-white pb-20">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button
          variant="ghost"
          asChild
          className="mb-8 text-zinc-400 hover:text-white hover:bg-white/5 h-12 px-6"
        >
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            Volver al Dashboard
          </Link>
        </Button>

        <div className="mb-10">
          <h1 className="text-5xl font-bold tracking-tight flex items-center gap-4">
            <Sparkles className="w-12 h-12 text-violet-400" />
            Simulador Monte Carlo
          </h1>
          <p className="text-xl text-zinc-400 mt-3 max-w-3xl">
            Estima la evolución probable de tu patrimonio aplicando 1.000 trayectorias
            aleatorias basadas en el comportamiento histórico de tus activos.
          </p>
        </div>

        {/* Controles */}
        <Card className="bg-zinc-900 border border-white/10 mb-10">
          <CardContent className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400 uppercase tracking-wide">Horizonte</p>
              <ToggleGroup
                type="single"
                value={String(horizonte)}
                onValueChange={(v) => v && setHorizonte(parseInt(v))}
                className="mt-3 bg-zinc-950 rounded-lg p-1 border border-white/10"
              >
                {HORIZONTES.map(h => (
                  <ToggleGroupItem
                    key={h.dias}
                    value={String(h.dias)}
                    className="data-[state=on]:bg-violet-500/20 data-[state=on]:text-violet-300 px-6 h-10"
                  >
                    {h.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <Button
              onClick={simular}
              disabled={loading}
              className="bg-violet-500 hover:bg-violet-600 text-white gap-2 h-12 px-6 text-base"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Simulando…' : 'Ejecutar simulación'}
            </Button>
          </CardContent>
        </Card>

        {/* Estados de error / vacío */}
        {error && (
          <Card className="bg-red-950/30 border border-red-500/30 mb-10">
            <CardContent className="p-5 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300">{error}</p>
            </CardContent>
          </Card>
        )}
        {vacio && (
          <Card className="bg-amber-950/30 border border-amber-500/30 mb-10">
            <CardContent className="p-5 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-300 font-medium">{vacio.mensaje}</p>
                {vacio.tipo === 'sinHistorico' && (
                  <p className="text-zinc-400 text-sm mt-2">
                    Carga histórico desde el panel admin (<code>/api/precios/cargar-historico</code>) o espera a que se acumulen suficientes precios diarios.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resultados */}
        {resultado && (
          <>
            <ResumenSimulacion resultado={resultado} />
            <ConoSimulacion resultado={resultado} />
            <CoberturaSimulacion resultado={resultado} />
            <Disclaimer />
          </>
        )}

        {/* Estado inicial sin resultados */}
        {!resultado && !error && !vacio && !loading && (
          <Card className="bg-zinc-900 border border-white/10">
            <CardContent className="p-12 text-center">
              <Sparkles className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-400 text-lg">
                Pulsa <strong className="text-white">Ejecutar simulación</strong> para
                proyectar la evolución de tu cartera.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}


// ── Resumen al horizonte final ──────────────────────────────

function ResumenSimulacion({ resultado }: { resultado: ResultadoMonteCarlo }) {
  const { valorInicial, horizonteDias, resumenFinal } = resultado
  const dineroFmt = (v: number) => `$${Math.round(v).toLocaleString('es-ES')}`
  const pctVs = (final: number) => {
    if (valorInicial === 0) return 0
    return ((final - valorInicial) / valorInicial) * 100
  }
  const horizonteLabel = horizonteDias === 252 ? '1 año'
    : horizonteDias === 126 ? '6 meses'
    : horizonteDias === 63 ? '3 meses'
    : `${horizonteDias} días`

  return (
    <Card className="bg-zinc-900 border border-white/10 mb-10">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Wallet className="w-6 h-6 text-violet-400" />
          Proyección a {horizonteLabel}
        </CardTitle>
        <CardDescription>
          Valor inicial: {dineroFmt(valorInicial)} · {resultado.nSimulaciones.toLocaleString('es-ES')} simulaciones
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <KpiCard
            label="Pesimista (P10)"
            valor={dineroFmt(resumenFinal.p10)}
            delta={pctVs(resumenFinal.p10)}
            colorBg="bg-red-950/30 border-red-500/30"
            colorText="text-red-400"
          />
          <KpiCard
            label="Esperado (P50)"
            valor={dineroFmt(resumenFinal.p50)}
            delta={pctVs(resumenFinal.p50)}
            colorBg="bg-blue-950/30 border-blue-500/30"
            colorText="text-blue-400"
            destacado
          />
          <KpiCard
            label="Optimista (P90)"
            valor={dineroFmt(resumenFinal.p90)}
            delta={pctVs(resumenFinal.p90)}
            colorBg="bg-emerald-950/30 border-emerald-500/30"
            colorText="text-emerald-400"
          />
        </div>
      </CardContent>
    </Card>
  )
}

interface KpiProps {
  label: string
  valor: string
  delta: number
  colorBg: string
  colorText: string
  destacado?: boolean
}
function KpiCard({ label, valor, delta, colorBg, colorText, destacado }: KpiProps) {
  const Icon = delta >= 0 ? TrendingUp : TrendingDown
  return (
    <div className={`rounded-xl border ${colorBg} p-6 ${destacado ? 'ring-1 ring-blue-500/40' : ''}`}>
      <p className={`text-sm font-medium uppercase tracking-wide ${colorText}`}>{label}</p>
      <p className="text-4xl font-bold mt-3">{valor}</p>
      <div className={`flex items-center gap-2 mt-2 ${colorText}`}>
        <Icon className="w-4 h-4" />
        <span className="text-base font-medium">
          {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
        </span>
      </div>
    </div>
  )
}


// ── Cono Monte Carlo ────────────────────────────────────────

function ConoSimulacion({ resultado }: { resultado: ResultadoMonteCarlo }) {
  // Construir datos para Recharts: [{dia, p10, p50, p90}, ...]
  const datos = resultado.series.p10.map((_, i) => ({
    dia: i,
    p10: resultado.series.p10[i],
    p50: resultado.series.p50[i],
    p90: resultado.series.p90[i],
    rango: [resultado.series.p10[i], resultado.series.p90[i]],
  }))

  // Ticks del eje X cada ~21 días para no saturar
  const tickStep = Math.max(1, Math.floor(resultado.horizonteDias / 12))
  const ticks = datos.filter((_, i) => i % tickStep === 0).map(d => d.dia)

  return (
    <Card className="bg-zinc-900 border border-white/10 mb-10">
      <CardHeader>
        <CardTitle className="text-2xl">Trayectoria simulada</CardTitle>
        <CardDescription>
          La banda muestra el rango entre los percentiles P10 y P90 (el 80% central
          de las simulaciones). La línea representa el escenario esperado (P50).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={420}>
          <ComposedChart data={datos}>
            <defs>
              <linearGradient id="grad-cono" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#60a5fa" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="dia"
              stroke="#52525b"
              ticks={ticks}
              tick={{ fontSize: 12 }}
              label={{ value: 'Días', position: 'insideBottom', offset: -5, fill: '#52525b' }}
            />
            <YAxis
              stroke="#52525b"
              tick={{ fontSize: 12 }}
              tickFormatter={(v: number) =>
                v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v.toLocaleString('es-ES')}`
              }
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px', color: '#e4e4e7' }}
              formatter={(value: number | number[], name: string) => {
                if (Array.isArray(value)) {
                  return [`$${Math.round(value[0]).toLocaleString('es-ES')} – $${Math.round(value[1]).toLocaleString('es-ES')}`, 'Rango P10–P90']
                }
                return [`$${Math.round(value).toLocaleString('es-ES')}`, name]
              }}
              labelFormatter={(v) => `Día ${v}`}
            />
            <Legend
              verticalAlign="top"
              wrapperStyle={{ paddingBottom: '8px' }}
              formatter={(v) => v === 'rango' ? 'Rango P10–P90' : v === 'p50' ? 'Esperado (P50)' : v}
            />
            <ReferenceLine
              y={resultado.valorInicial}
              stroke="#71717a"
              strokeDasharray="4 4"
              label={{ value: 'Inicial', position: 'left', fill: '#a1a1aa', fontSize: 11 }}
            />
            <Area
              type="monotone"
              dataKey="rango"
              stroke="none"
              fill="url(#grad-cono)"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="p50"
              stroke="#60a5fa"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="p10"
              stroke="#ef4444"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="p90"
              stroke="#10b981"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}


// ── Cobertura ──────────────────────────────────────────────

function CoberturaSimulacion({ resultado }: { resultado: ResultadoMonteCarlo }) {
  const { simulados, excluidos } = resultado.cobertura
  if (excluidos.length === 0) return null

  return (
    <Card className="bg-zinc-900/70 border border-white/10 mb-10">
      <CardContent className="p-5 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-zinc-300">
            <strong>{simulados.length}</strong> activo{simulados.length === 1 ? '' : 's'} simulado{simulados.length === 1 ? '' : 's'} con éxito.{' '}
            <strong>{excluidos.length}</strong> activo{excluidos.length === 1 ? '' : 's'} mantenido{excluidos.length === 1 ? '' : 's'} a precio constante por falta de histórico (necesita ≥30 días):
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {excluidos.map(c => (
              <Badge key={c} variant="outline" className="border-amber-500/30 text-amber-300 bg-amber-500/10">
                #{c}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


// ── Disclaimer legal ───────────────────────────────────────

function Disclaimer() {
  return (
    <Card className="bg-zinc-950/50 border border-white/5">
      <CardContent className="p-5 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-zinc-500 flex-shrink-0 mt-0.5" />
        <p className="text-zinc-500 text-sm leading-relaxed">
          <strong className="text-zinc-300">Aviso:</strong> esta simulación se basa en el
          comportamiento histórico de tus activos asumiendo que su dinámica se
          mantendrá en el futuro (modelo Geometric Brownian Motion). Los resultados
          pasados no garantizan rendimientos futuros. <strong className="text-zinc-300">
          No constituye asesoramiento financiero</strong>.
        </p>
      </CardContent>
    </Card>
  )
}
