// ============================================================
// UC16 — Indicadores técnicos clásicos sobre series de precios
//
// Funciones puras, sin dependencias externas, sin claims predictivos.
// Solo describen el comportamiento histórico/actual de un activo.
// ============================================================

export type TendenciaCorto = 'alcista' | 'bajista' | 'lateral' | 'sin_datos'
export type NivelVolatilidad = 'baja' | 'media' | 'alta' | 'sin_datos'

// Días de mercado al año (estándar de la industria)
const DIAS_MERCADO_ANIO = 252

// ── SMA: Simple Moving Average ──────────────────────────────

/**
 * Calcula la SMA para cada punto que tenga suficiente histórico previo.
 * Devuelve un array del mismo tamaño que la serie de entrada, donde los
 * primeros (periodo - 1) elementos son `null` (no hay suficientes datos).
 *
 * La serie debe ir en orden cronológico ASCENDENTE (más antigua primero).
 */
export function calcularSMA(serie: number[], periodo: number): (number | null)[] {
  const out: (number | null)[] = new Array(serie.length).fill(null)
  if (periodo <= 0 || serie.length < periodo) return out

  let suma = 0
  for (let i = 0; i < periodo; i++) suma += serie[i]
  out[periodo - 1] = suma / periodo

  for (let i = periodo; i < serie.length; i++) {
    suma += serie[i] - serie[i - periodo]
    out[i] = suma / periodo
  }
  return out
}


// ── EMA: Exponential Moving Average ─────────────────────────

/**
 * EMA con factor de suavizado estándar (2 / (periodo + 1)).
 * Inicializada con la SMA del primer "periodo" para evitar arranque sesgado.
 */
export function calcularEMA(serie: number[], periodo: number): (number | null)[] {
  const out: (number | null)[] = new Array(serie.length).fill(null)
  if (periodo <= 0 || serie.length < periodo) return out

  const k = 2 / (periodo + 1)

  let suma = 0
  for (let i = 0; i < periodo; i++) suma += serie[i]
  out[periodo - 1] = suma / periodo

  for (let i = periodo; i < serie.length; i++) {
    const prev = out[i - 1]!
    out[i] = serie[i] * k + prev * (1 - k)
  }
  return out
}


// ── Volatilidad anualizada ──────────────────────────────────

/**
 * Calcula la volatilidad anualizada a partir de la desviación estándar
 * de los retornos diarios (ln-returns) de los últimos N días.
 *
 * Retorna en escala 0–1 (ej. 0.45 = 45%). Devuelve null si no hay
 * suficientes datos.
 */
export function calcularVolatilidadAnualizada(
  serie: number[],
  ventana = 30,
): number | null {
  if (serie.length < ventana + 1) return null

  // log returns de los últimos `ventana` días
  const tramo = serie.slice(-(ventana + 1))
  const retornos: number[] = []
  for (let i = 1; i < tramo.length; i++) {
    if (tramo[i - 1] <= 0) continue
    retornos.push(Math.log(tramo[i] / tramo[i - 1]))
  }
  if (retornos.length < 2) return null

  const media = retornos.reduce((s, r) => s + r, 0) / retornos.length
  const varianza = retornos.reduce((s, r) => s + (r - media) ** 2, 0) / (retornos.length - 1)
  const desv = Math.sqrt(varianza)
  return desv * Math.sqrt(DIAS_MERCADO_ANIO)
}


// ── Drawdown máximo histórico ───────────────────────────────

/**
 * Calcula el drawdown máximo: la mayor caída porcentual desde un pico
 * hasta un valle posterior. Retorna en escala 0–1 (ej. 0.35 = 35%).
 */
export function calcularDrawdownMax(serie: number[]): number | null {
  if (serie.length < 2) return null

  let pico = serie[0]
  let maxDD = 0
  for (const v of serie) {
    if (v > pico) pico = v
    if (pico > 0) {
      const dd = (pico - v) / pico
      if (dd > maxDD) maxDD = dd
    }
  }
  return maxDD
}


// ── Máximo y mínimo en una ventana ──────────────────────────

export interface MaxMin {
  max: number
  min: number
}

/**
 * Devuelve el max y min de los últimos N días (12 meses ≈ 252 días).
 * Si la serie es más corta, usa toda la disponible.
 */
export function calcularMaxMin(serie: number[], dias = DIAS_MERCADO_ANIO): MaxMin | null {
  if (serie.length === 0) return null
  const tramo = serie.slice(-dias)
  return {
    max: Math.max(...tramo),
    min: Math.min(...tramo),
  }
}


// ── Clasificadores ──────────────────────────────────────────

/**
 * Clasifica la tendencia de medio plazo a partir de la posición relativa
 * entre la SMA50 y la SMA200 (cruce dorado / cruce de la muerte).
 *
 * - SMA50 > SMA200 con holgura > 1% → alcista
 * - SMA50 < SMA200 con holgura > 1% → bajista
 * - Diferencia < 1% → lateral (sin tendencia clara)
 */
export function clasificarTendencia(
  sma50: number | null,
  sma200: number | null,
): TendenciaCorto {
  if (sma50 == null || sma200 == null || sma200 === 0) return 'sin_datos'
  const diferencia = (sma50 - sma200) / sma200
  if (diferencia > 0.01) return 'alcista'
  if (diferencia < -0.01) return 'bajista'
  return 'lateral'
}

/**
 * Clasifica la volatilidad anualizada en niveles cualitativos.
 * Umbrales típicos para activos diversos:
 *   < 15% → baja (renta fija, blue chips estables)
 *   15–30% → media (índices y acciones líquidas)
 *   > 30% → alta (cripto, small caps, growth volátil)
 */
export function clasificarVolatilidad(volAnualizada: number | null): NivelVolatilidad {
  if (volAnualizada == null) return 'sin_datos'
  if (volAnualizada < 0.15) return 'baja'
  if (volAnualizada < 0.30) return 'media'
  return 'alta'
}


// ── Resumen completo para devolver desde la API ─────────────

export interface IndicadoresActivo {
  sma50: number | null
  sma200: number | null
  serieSMA50: (number | null)[]    // alineadas a la serie original (en ASC)
  serieSMA200: (number | null)[]
  tendencia: TendenciaCorto
  volatilidad: number | null      // escala 0-1
  nivelVolatilidad: NivelVolatilidad
  drawdownMax: number | null      // escala 0-1
  maxMin12m: MaxMin | null
  diasDeHistorico: number
  textoDescriptivo: string        // narrativa generada con templates
}

/**
 * Calcula todos los indicadores de un activo a partir de su serie de
 * precios en orden cronológico ASCENDENTE.
 */
export function calcularIndicadores(serieAsc: number[]): IndicadoresActivo {
  const diasDeHistorico = serieAsc.length

  const serieSMA50 = calcularSMA(serieAsc, 50)
  const serieSMA200 = calcularSMA(serieAsc, 200)

  const sma50  = serieSMA50[serieSMA50.length - 1] ?? null
  const sma200 = serieSMA200[serieSMA200.length - 1] ?? null

  const tendencia = clasificarTendencia(sma50, sma200)
  const volatilidad = calcularVolatilidadAnualizada(serieAsc, 30)
  const nivelVolatilidad = clasificarVolatilidad(volatilidad)
  const drawdownMax = calcularDrawdownMax(serieAsc)
  const maxMin12m = calcularMaxMin(serieAsc, DIAS_MERCADO_ANIO)

  const textoDescriptivo = generarTextoDescriptivo({
    tendencia,
    nivelVolatilidad,
    drawdownMax,
    diasDeHistorico,
  })

  return {
    sma50,
    sma200,
    serieSMA50,
    serieSMA200,
    tendencia,
    volatilidad,
    nivelVolatilidad,
    drawdownMax,
    maxMin12m,
    diasDeHistorico,
    textoDescriptivo,
  }
}


// ── Generador de texto descriptivo (template, sin LLM) ──────

const FRASE_TENDENCIA: Record<TendenciaCorto, string> = {
  alcista:    'Se encuentra en tendencia alcista de medio plazo (SMA50 por encima de SMA200).',
  bajista:    'Se encuentra en tendencia bajista de medio plazo (SMA50 por debajo de SMA200).',
  lateral:    'Atraviesa una fase lateral sin tendencia clara entre las medias móviles.',
  sin_datos:  'No hay suficiente histórico para calcular la tendencia (se necesitan al menos 200 días).',
}

const FRASE_VOLATILIDAD: Record<NivelVolatilidad, string> = {
  baja:       'Su volatilidad reciente es baja, indicando movimientos de precio contenidos.',
  media:      'Su volatilidad reciente es moderada, dentro de lo habitual para activos líquidos.',
  alta:       'Su volatilidad reciente es alta, con oscilaciones de precio significativas.',
  sin_datos:  '',
}

function generarTextoDescriptivo({
  tendencia,
  nivelVolatilidad,
  drawdownMax,
  diasDeHistorico,
}: {
  tendencia: TendenciaCorto
  nivelVolatilidad: NivelVolatilidad
  drawdownMax: number | null
  diasDeHistorico: number
}): string {
  const partes: string[] = []
  partes.push(FRASE_TENDENCIA[tendencia])

  const fraseVol = FRASE_VOLATILIDAD[nivelVolatilidad]
  if (fraseVol) partes.push(fraseVol)

  if (drawdownMax != null && drawdownMax > 0) {
    const pct = Math.round(drawdownMax * 100)
    partes.push(`La caída máxima histórica registrada es del ${pct}%.`)
  }

  if (diasDeHistorico < 200) {
    partes.push(
      `Disponemos de ${diasDeHistorico} día${diasDeHistorico === 1 ? '' : 's'} de histórico; ` +
      `algunos indicadores requieren más datos para ser representativos.`
    )
  }

  return partes.filter(Boolean).join(' ')
}
