"use client";

// ============================================================
// UC16 — Sección de análisis técnico para la página de detalle
//
// Muestra los indicadores calculados sobre la serie histórica del
// activo: tendencia (SMA50 vs SMA200), volatilidad, drawdown máximo,
// máximo y mínimo de los últimos 12 meses.
//
// Texto puramente descriptivo. Sin claims predictivos.
// ============================================================

import { TrendingUp, TrendingDown, Minus, Activity, AlertTriangle, BarChart3, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface IndicadoresResp {
  sma50: number | null
  sma200: number | null
  tendencia: 'alcista' | 'bajista' | 'lateral' | 'sin_datos'
  volatilidad: number | null
  nivelVolatilidad: 'baja' | 'media' | 'alta' | 'sin_datos'
  drawdownMax: number | null
  maxMin12m: { max: number; min: number } | null
  diasDeHistorico: number
  textoDescriptivo: string
}

interface Props {
  indicadores: IndicadoresResp
  divisaSimbolo: string
}

const STYLE_TENDENCIA = {
  alcista:   { Icon: TrendingUp,   label: 'Alcista',  color: 'text-emerald-400', bg: 'bg-emerald-950/30 border-emerald-500/30' },
  bajista:   { Icon: TrendingDown, label: 'Bajista',  color: 'text-red-400',     bg: 'bg-red-950/30 border-red-500/30' },
  lateral:   { Icon: Minus,        label: 'Lateral',  color: 'text-zinc-400',    bg: 'bg-zinc-900/50 border-white/10' },
  sin_datos: { Icon: Info,         label: 'Sin datos', color: 'text-zinc-500',    bg: 'bg-zinc-900/50 border-white/10' },
}

const STYLE_VOLATILIDAD = {
  baja:      { label: 'Baja',   color: 'text-emerald-400' },
  media:     { label: 'Media',  color: 'text-amber-400' },
  alta:      { label: 'Alta',   color: 'text-red-400' },
  sin_datos: { label: 'Sin datos', color: 'text-zinc-500' },
}

export function AnalisisTecnico({ indicadores, divisaSimbolo }: Props) {
  const sinHistorico = indicadores.diasDeHistorico === 0

  if (sinHistorico) {
    return (
      <Card className="bg-zinc-900/70 border border-white/5">
        <CardHeader>
          <CardTitle className="text-3xl flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-blue-400" />
            Análisis técnico
          </CardTitle>
          <CardDescription>
            Indicadores descriptivos basados en el histórico de precios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-500 text-center py-8">
            No hay histórico disponible para este activo. Carga datos desde el panel de
            administración o actualiza los precios.
          </p>
        </CardContent>
      </Card>
    )
  }

  const tendencia = STYLE_TENDENCIA[indicadores.tendencia]
  const volatilidad = STYLE_VOLATILIDAD[indicadores.nivelVolatilidad]

  return (
    <Card className="bg-zinc-900/70 border border-white/5">
      <CardHeader>
        <CardTitle className="text-3xl flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-blue-400" />
          Análisis técnico
        </CardTitle>
        <CardDescription>
          Indicadores descriptivos basados en {indicadores.diasDeHistorico} día{indicadores.diasDeHistorico === 1 ? '' : 's'} de histórico.
          No constituye asesoramiento financiero.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Tendencia */}
          <div className={`rounded-xl border p-5 ${tendencia.bg}`}>
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <tendencia.Icon className={`w-4 h-4 ${tendencia.color}`} />
              <span>Tendencia (SMA50/200)</span>
            </div>
            <p className={`text-2xl font-semibold mt-3 ${tendencia.color}`}>{tendencia.label}</p>
            {indicadores.sma50 != null && indicadores.sma200 != null && (
              <p className="text-xs text-zinc-500 mt-1">
                SMA50 {divisaSimbolo}{Math.round(indicadores.sma50).toLocaleString('es-ES')} ·
                SMA200 {divisaSimbolo}{Math.round(indicadores.sma200).toLocaleString('es-ES')}
              </p>
            )}
          </div>

          {/* Volatilidad */}
          <div className="rounded-xl border border-white/10 bg-zinc-950/40 p-5">
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <Activity className="w-4 h-4" />
              <span>Volatilidad anualizada</span>
            </div>
            <p className={`text-2xl font-semibold mt-3 ${volatilidad.color}`}>
              {indicadores.volatilidad != null
                ? `${(indicadores.volatilidad * 100).toFixed(1)}%`
                : '—'}
            </p>
            <p className="text-xs text-zinc-500 mt-1">{volatilidad.label}</p>
          </div>

          {/* Drawdown máximo */}
          <div className="rounded-xl border border-white/10 bg-zinc-950/40 p-5">
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Drawdown máximo</span>
            </div>
            <p className="text-2xl font-semibold text-red-400 mt-3">
              {indicadores.drawdownMax != null
                ? `-${(indicadores.drawdownMax * 100).toFixed(1)}%`
                : '—'}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Caída pico-valle máxima</p>
          </div>

          {/* Max/Min 12m */}
          <div className="rounded-xl border border-white/10 bg-zinc-950/40 p-5">
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <BarChart3 className="w-4 h-4" />
              <span>Rango 12 meses</span>
            </div>
            {indicadores.maxMin12m ? (
              <>
                <p className="text-base font-semibold mt-3 text-emerald-400">
                  Máx {divisaSimbolo}{Math.round(indicadores.maxMin12m.max).toLocaleString('es-ES')}
                </p>
                <p className="text-base font-semibold text-red-400">
                  Mín {divisaSimbolo}{Math.round(indicadores.maxMin12m.min).toLocaleString('es-ES')}
                </p>
              </>
            ) : (
              <p className="text-2xl font-semibold mt-3">—</p>
            )}
          </div>
        </div>

        {/* Texto descriptivo */}
        {indicadores.textoDescriptivo && (
          <div className="mt-6 rounded-xl bg-zinc-950/60 border border-white/5 p-5">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-zinc-300 leading-relaxed">{indicadores.textoDescriptivo}</p>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-zinc-500 italic mt-5 leading-relaxed">
          Indicadores calculados a partir del histórico almacenado. No constituyen
          asesoramiento financiero ni predicen el comportamiento futuro del activo.
        </p>

        {/* Aviso si falta histórico */}
        {indicadores.diasDeHistorico < 200 && (
          <div className="mt-4 flex items-start gap-3 text-amber-400/80 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              Algunos indicadores (SMA200, tendencia de medio plazo) requieren al menos
              200 días de histórico para ser representativos.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface BadgeTendenciaProps {
  tendencia: IndicadoresResp['tendencia']
}

export function BadgeTendencia({ tendencia }: BadgeTendenciaProps) {
  const style = STYLE_TENDENCIA[tendencia]
  return (
    <Badge variant="outline" className={`${style.color} border-current bg-transparent gap-1`}>
      <style.Icon className="w-3 h-3" />
      {style.label}
    </Badge>
  )
}
