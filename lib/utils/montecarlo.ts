// ============================================================
// UC17 — Simulación Monte Carlo de evolución del patrimonio
//
// Implementación pura en TypeScript, sin dependencias externas.
//
// Modelo: Geometric Brownian Motion (GBM) — el mismo que usan los
// simuladores financieros estándar. Para cada activo de la cartera
// se estiman dos parámetros del histórico:
//   - μ (mu): rendimiento medio diario log-return
//   - σ (sigma): desviación estándar diaria log-return
//
// Luego se generan N trayectorias aleatorias y se calculan los
// percentiles P10/P50/P90 a cada paso de tiempo.
//
// Importante: NO predice precios. Solo proyecta rangos plausibles
// asumiendo que la dinámica histórica se mantiene.
// ============================================================

const DIAS_MERCADO_ANIO = 252


// ── Generador gaussiano (Box-Muller) ────────────────────────

/**
 * Devuelve una muestra de una distribución normal estándar (μ=0, σ=1).
 * Usa la transformación Box-Muller a partir de dos uniformes.
 */
export function gaussianoBoxMuller(): number {
  let u1 = 0
  let u2 = 0
  // Math.random() puede devolver 0; descartamos para evitar log(0)
  while (u1 === 0) u1 = Math.random()
  while (u2 === 0) u2 = Math.random()
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}


// ── Estimación de parámetros desde el histórico ─────────────

export interface ParametrosGBM {
  mu: number       // log-return diario medio
  sigma: number    // desviación estándar diaria
  observaciones: number
}

/**
 * Calcula los log-returns diarios de una serie en orden ASC.
 */
export function calcularLogReturns(serieAsc: number[]): number[] {
  const out: number[] = []
  for (let i = 1; i < serieAsc.length; i++) {
    if (serieAsc[i - 1] <= 0) continue
    out.push(Math.log(serieAsc[i] / serieAsc[i - 1]))
  }
  return out
}

/**
 * Estima los parámetros GBM (μ, σ) a partir de la serie histórica
 * en orden cronológico ASC. Devuelve null si no hay suficientes datos.
 */
export function estimarParametros(serieAsc: number[]): ParametrosGBM | null {
  if (serieAsc.length < 30) return null
  const retornos = calcularLogReturns(serieAsc)
  if (retornos.length < 2) return null

  const mu = retornos.reduce((s, r) => s + r, 0) / retornos.length
  const varianza = retornos.reduce((s, r) => s + (r - mu) ** 2, 0) / (retornos.length - 1)
  const sigma = Math.sqrt(varianza)

  return { mu, sigma, observaciones: retornos.length }
}


// ── Métricas anualizadas (para mostrar al usuario) ──────────

/**
 * CAGR (Compound Annual Growth Rate) anualizado a partir de μ diario.
 */
export function cagrAnualizado(mu: number): number {
  return Math.exp(mu * DIAS_MERCADO_ANIO) - 1
}

/**
 * Volatilidad anualizada a partir de σ diario.
 */
export function volatilidadAnualizada(sigma: number): number {
  return sigma * Math.sqrt(DIAS_MERCADO_ANIO)
}


// ── Simulación de una trayectoria GBM ───────────────────────

/**
 * Genera una única trayectoria de precios simulada con GBM:
 *   S(t+1) = S(t) * exp((μ - σ²/2) + σ * Z)
 * donde Z ~ N(0,1).
 */
export function simularTrayectoria(
  valorInicial: number,
  mu: number,
  sigma: number,
  dias: number,
): number[] {
  const trayectoria: number[] = new Array(dias + 1)
  trayectoria[0] = valorInicial
  // mu ya es la media de log-returns (μ_geométrico = μ_aritmético - σ²/2).
  // Aplicar la corrección de Itô aquí sería doblarla y sesgar la mediana a la baja.
  for (let t = 1; t <= dias; t++) {
    const z = gaussianoBoxMuller()
    trayectoria[t] = trayectoria[t - 1] * Math.exp(mu + sigma * z)
  }
  return trayectoria
}


// ── Simulación de la cartera completa ───────────────────────

export interface ActivoSimulable {
  /** Identificador para reportes */
  codigo: number
  /** Cantidad poseída */
  cantidad: number
  /** Precio actual */
  precioActual: number
  /** Serie histórica ASC para estimar parámetros */
  serieAsc: number[]
}

export interface ResultadoSimulacion {
  valorInicial: number
  horizonteDias: number
  nSimulaciones: number
  /** Valor del patrimonio en cada paso (día 0..N) por percentil */
  series: {
    p10: number[]
    p50: number[]
    p90: number[]
  }
  /** Estadísticos al horizonte final */
  resumenFinal: {
    p10: number
    p50: number
    p90: number
    media: number
  }
  /** Activos que pudieron simularse y los que no (por falta de datos) */
  cobertura: {
    simulados: number[]   // códigos de activos
    excluidos: number[]   // códigos sin histórico suficiente
  }
}

/**
 * Simula la evolución del patrimonio total de la cartera con N
 * trayectorias por activo. Para cada paso de tiempo agrega los
 * valores y devuelve los percentiles P10/P50/P90.
 *
 * Si un activo no tiene histórico suficiente para estimar μ/σ, se
 * incluye en el valor inicial pero NO se simula su evolución
 * (su valor se mantiene constante en todas las trayectorias).
 */
export function simularCartera(
  activos: ActivoSimulable[],
  horizonteDias: number,
  nSimulaciones = 1000,
): ResultadoSimulacion {
  const cobertura = { simulados: [] as number[], excluidos: [] as number[] }

  // Estimar parámetros y separar simulables / fijos
  type ActivoConParams = ActivoSimulable & { params: ParametrosGBM | null }
  const conParams: ActivoConParams[] = activos.map(a => {
    const params = estimarParametros(a.serieAsc)
    if (params) cobertura.simulados.push(a.codigo)
    else cobertura.excluidos.push(a.codigo)
    return { ...a, params }
  })

  // Valor inicial total (incluye también los excluidos con valor constante)
  const valorInicial = activos.reduce(
    (s, a) => s + a.cantidad * a.precioActual,
    0,
  )

  // Matriz de patrimonio total: [simulación][día]
  // Cada celda = suma sobre activos de cantidad * precio_simulado
  const totales: number[][] = new Array(nSimulaciones)
  for (let s = 0; s < nSimulaciones; s++) {
    totales[s] = new Array(horizonteDias + 1).fill(0)
  }

  for (const a of conParams) {
    for (let s = 0; s < nSimulaciones; s++) {
      let trayectoria: number[]
      if (a.params) {
        trayectoria = simularTrayectoria(a.precioActual, a.params.mu, a.params.sigma, horizonteDias)
      } else {
        // Sin parámetros → precio constante en toda la trayectoria
        trayectoria = new Array(horizonteDias + 1).fill(a.precioActual)
      }
      for (let t = 0; t <= horizonteDias; t++) {
        totales[s][t] += a.cantidad * trayectoria[t]
      }
    }
  }

  // Percentiles a cada paso de tiempo
  const p10 = new Array(horizonteDias + 1)
  const p50 = new Array(horizonteDias + 1)
  const p90 = new Array(horizonteDias + 1)

  for (let t = 0; t <= horizonteDias; t++) {
    const valoresT = totales.map(row => row[t]).sort((a, b) => a - b)
    p10[t] = percentil(valoresT, 10)
    p50[t] = percentil(valoresT, 50)
    p90[t] = percentil(valoresT, 90)
  }

  // Estadísticos al horizonte final
  const valoresFinales = totales.map(row => row[horizonteDias]).sort((a, b) => a - b)
  const media = valoresFinales.reduce((s, v) => s + v, 0) / valoresFinales.length

  return {
    valorInicial,
    horizonteDias,
    nSimulaciones,
    series: { p10, p50, p90 },
    resumenFinal: {
      p10: percentil(valoresFinales, 10),
      p50: percentil(valoresFinales, 50),
      p90: percentil(valoresFinales, 90),
      media,
    },
    cobertura,
  }
}

/**
 * Percentil sobre array YA ORDENADO ascendentemente.
 * Usa interpolación lineal (R-7 / NumPy default).
 */
export function percentil(serieOrdenada: number[], p: number): number {
  if (serieOrdenada.length === 0) return 0
  if (p <= 0) return serieOrdenada[0]
  if (p >= 100) return serieOrdenada[serieOrdenada.length - 1]
  const idx = (p / 100) * (serieOrdenada.length - 1)
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  if (lo === hi) return serieOrdenada[lo]
  const frac = idx - lo
  return serieOrdenada[lo] + (serieOrdenada[hi] - serieOrdenada[lo]) * frac
}
