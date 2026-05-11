// ============================================================
// UC14 — Análisis de cartera y alertas de balanceo
//
// Calcula la distribución actual de la cartera por tipo de activo
// y la compara con la distribución target del perfil de riesgo del
// usuario. Si la desviación supera ciertos umbrales, genera una
// recomendación con severidad apropiada.
//
// Reutilizado por UC10 (análisis detallado) y UC13 (optimización).
// ============================================================

export type CodigoPerfil = 'BAJO' | 'MEDIO' | 'ALTO'
export type CodigoTipoActivo = 'CRYPTO' | 'INVERSION' | 'PROPIEDAD' | 'OTRO'

export type Severidad = 'info' | 'warn' | 'critical'

// Umbral de desviación absoluta (puntos porcentuales) sobre el target
// para que se genere una alerta. Configurable en un solo punto.
export const UMBRAL_WARN     = 15  // 15 p.p. de desviación → 'warn'
export const UMBRAL_CRITICAL = 30  // 30 p.p. de desviación → 'critical'

// Distribución target por perfil de riesgo (en porcentaje, suman 100).
// Valores de partida razonables para una app educativa; el equipo puede
// ajustarlos sin tocar la lógica.
export const DISTRIBUCION_TARGET: Record<CodigoPerfil, Record<CodigoTipoActivo, number>> = {
  BAJO:  { INVERSION: 60, PROPIEDAD: 30, CRYPTO: 10, OTRO: 0 },
  MEDIO: { INVERSION: 50, PROPIEDAD: 25, CRYPTO: 20, OTRO: 5 },
  ALTO:  { INVERSION: 30, PROPIEDAD: 15, CRYPTO: 50, OTRO: 5 },
}

// Etiquetas legibles para el usuario
export const LABEL_TIPO: Record<CodigoTipoActivo, string> = {
  CRYPTO:    'Criptomonedas',
  INVERSION: 'Inversión (acciones / ETFs)',
  PROPIEDAD: 'Propiedades',
  OTRO:      'Otros',
}

export const LABEL_PERFIL: Record<CodigoPerfil, string> = {
  BAJO:  'Conservador',
  MEDIO: 'Moderado',
  ALTO:  'Agresivo',
}


// ── Cálculo de distribución actual ──────────────────────────

export interface PosicionParaBalanceo {
  tipocodigo: string
  valor_total: number   // cantidad × precio_actual, en divisa nativa del activo
}

export interface DistribucionItem {
  tipo: CodigoTipoActivo
  valor: number
  porcentaje: number   // 0-100
}

/**
 * Agrupa las posiciones del usuario por tipo de activo y calcula el
 * porcentaje que cada tipo representa sobre el patrimonio total.
 */
export function calcularDistribucionActual(
  posiciones: PosicionParaBalanceo[]
): DistribucionItem[] {
  if (!posiciones || posiciones.length === 0) return []

  const total = posiciones.reduce((sum, p) => sum + p.valor_total, 0)
  if (total <= 0) return []

  const porTipo: Partial<Record<CodigoTipoActivo, number>> = {}
  for (const p of posiciones) {
    const tipo = normalizarTipo(p.tipocodigo)
    porTipo[tipo] = (porTipo[tipo] ?? 0) + p.valor_total
  }

  return Object.entries(porTipo).map(([tipo, valor]) => ({
    tipo: tipo as CodigoTipoActivo,
    valor: valor!,
    porcentaje: Math.round((valor! / total) * 1000) / 10,
  }))
}

function normalizarTipo(codigo: string): CodigoTipoActivo {
  const c = codigo?.toUpperCase()
  if (c === 'CRYPTO' || c === 'PROPIEDAD') return c
  if (c === 'INVERSION' || c === 'ACCION') return 'INVERSION'
  return 'OTRO'
}


// ── Detección de desviaciones ───────────────────────────────

export interface Desviacion {
  tipo: CodigoTipoActivo
  pctActual: number
  pctTarget: number
  desviacionAbs: number   // diferencia en puntos porcentuales (firmada)
  severidad: Severidad
}

/**
 * Compara la distribución actual con el target del perfil y devuelve
 * las desviaciones por tipo. Solo incluye tipos cuya |desviación| supera
 * UMBRAL_WARN.
 */
export function calcularDesviaciones(
  actual: DistribucionItem[],
  perfil: CodigoPerfil,
): Desviacion[] {
  const target = DISTRIBUCION_TARGET[perfil]
  const tiposActuales = new Map(actual.map(d => [d.tipo, d.porcentaje]))

  // Recorrer todos los tipos del target (incluso si el usuario no los tiene)
  const tipos: CodigoTipoActivo[] = ['CRYPTO', 'INVERSION', 'PROPIEDAD', 'OTRO']

  const desviaciones: Desviacion[] = []
  for (const tipo of tipos) {
    const pctActual = tiposActuales.get(tipo) ?? 0
    const pctTarget = target[tipo]
    const desviacionAbs = pctActual - pctTarget

    if (Math.abs(desviacionAbs) < UMBRAL_WARN) continue

    desviaciones.push({
      tipo,
      pctActual,
      pctTarget,
      desviacionAbs: Math.round(desviacionAbs * 10) / 10,
      severidad: clasificarSeveridad(Math.abs(desviacionAbs)),
    })
  }

  return desviaciones
}

export function clasificarSeveridad(desviacionAbs: number): Severidad {
  if (desviacionAbs >= UMBRAL_CRITICAL) return 'critical'
  if (desviacionAbs >= UMBRAL_WARN) return 'warn'
  return 'info'
}


// ── Generación de mensaje (template, sin LLM) ───────────────

export interface MensajeRecomendacion {
  titulo: string
  mensaje: string
}

/**
 * Genera un mensaje en español describiendo todas las desviaciones
 * detectadas. Si hay varias, las concatena en frases naturales.
 */
export function generarMensajeDesbalance(
  desviaciones: Desviacion[],
  perfil: CodigoPerfil,
): MensajeRecomendacion {
  const labelPerfil = LABEL_PERFIL[perfil]

  if (desviaciones.length === 0) {
    return {
      titulo: 'Cartera equilibrada',
      mensaje: `Tu cartera se ajusta a tu perfil ${labelPerfil}. ¡Bien hecho!`,
    }
  }

  const partesExceso: string[] = []
  const partesDefecto: string[] = []
  for (const d of desviaciones) {
    const label = LABEL_TIPO[d.tipo].toLowerCase()
    if (d.desviacionAbs > 0) {
      partesExceso.push(`${label} representa el ${d.pctActual}% (recomendado ${d.pctTarget}%)`)
    } else {
      partesDefecto.push(`${label} solo el ${d.pctActual}% (recomendado ${d.pctTarget}%)`)
    }
  }

  let mensaje = `Como inversor ${labelPerfil}, `
  if (partesExceso.length > 0) {
    mensaje += `tu exposición a ${partesExceso.join('; ')} es mayor de lo aconsejable`
  }
  if (partesExceso.length > 0 && partesDefecto.length > 0) {
    mensaje += '. Por contra, '
  }
  if (partesDefecto.length > 0) {
    mensaje += `tu exposición a ${partesDefecto.join('; ')} es menor de lo aconsejable`
  }
  mensaje += '. Considera rebalancear tu cartera para alinearla con tu perfil de riesgo.'

  const max = desviaciones.reduce((m, d) =>
    Math.abs(d.desviacionAbs) > Math.abs(m.desviacionAbs) ? d : m
  )

  let titulo: string
  if (max.severidad === 'critical') {
    titulo = `Desbalance importante en tu cartera`
  } else {
    titulo = `Tu cartera no se ajusta a tu perfil ${labelPerfil}`
  }

  return { titulo, mensaje }
}


// ── Severidad agregada ─────────────────────────────────────

/**
 * Devuelve la severidad más alta entre todas las desviaciones.
 * Útil para etiquetar la recomendación a guardar en BD.
 */
export function severidadMaxima(desviaciones: Desviacion[]): Severidad {
  if (desviaciones.some(d => d.severidad === 'critical')) return 'critical'
  if (desviaciones.some(d => d.severidad === 'warn'))     return 'warn'
  return 'info'
}
