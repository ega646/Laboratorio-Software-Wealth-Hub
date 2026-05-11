// ============================================================
// UC14 — Helper server-side para regenerar las recomendaciones
// de un usuario a partir de su cartera y perfil de riesgo.
//
// Usado por:
//   - POST /api/recomendaciones/regenerar (manual)
//   - POST /api/activos (tras añadir un activo)
//   - DELETE /api/activos/[id] (tras eliminar un activo)
// ============================================================

import { createServiceClient } from '@/lib/supabase/service'
import {
  calcularDistribucionActual,
  calcularDesviaciones,
  generarMensajeDesbalance,
  severidadMaxima,
  DISTRIBUCION_TARGET,
  type CodigoPerfil,
  type PosicionParaBalanceo,
} from '@/lib/utils/balanceo'
import type { DatosDesbalance } from '@/lib/types'

export interface ResultadoRegeneracion {
  generadas: number
  desactivadas: number
  perfilUsuario: CodigoPerfil | null
}

/**
 * Recalcula las recomendaciones de tipo "desbalance_cartera" del
 * usuario:
 *   1. Lee su perfil y posiciones actuales con precios.
 *   2. Calcula desviaciones respecto al target del perfil.
 *   3. Si hay desviaciones, hace UPSERT en la única recomendación
 *      activa de tipo "desbalance_cartera"; si no, la marca como
 *      ignorada (para que no aparezca aunque ya existiera).
 *
 * Idempotente: el usuario nunca tiene más de una recomendación activa
 * de este tipo.
 */
export async function regenerarRecomendacionesUsuario(
  usuarioId: string,
): Promise<ResultadoRegeneracion> {
  const supabase = createServiceClient()

  // 1. Leer perfil
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('perfilriesgocodigo')
    .eq('id', usuarioId)
    .maybeSingle()

  const codigoPerfil = perfil?.perfilriesgocodigo as CodigoPerfil | null
  if (!codigoPerfil || !(codigoPerfil in DISTRIBUCION_TARGET)) {
    // Sin perfil definido no podemos calcular el target → no generamos nada
    return { generadas: 0, desactivadas: 0, perfilUsuario: null }
  }

  // 2. Leer posiciones con tipo y precio actual
  const { data: posiciones } = await supabase
    .from('activosposeidos')
    .select(`
      activocodigo,
      cantidad,
      activos ( tipocodigo )
    `)
    .eq('usuario_id', usuarioId)

  if (!posiciones || posiciones.length === 0) {
    // Sin cartera → desactivar cualquier recomendación previa
    const desactivadas = await desactivarPrevias(usuarioId)
    return { generadas: 0, desactivadas, perfilUsuario: codigoPerfil }
  }

  // Precio actual por activo
  const codigos = posiciones.map(p => p.activocodigo)
  const { data: historicos } = await supabase
    .from('valorhistoricoactivo')
    .select('activocodigo, valor, fecha')
    .in('activocodigo', codigos)
    .order('fecha', { ascending: false })
    .limit(codigos.length * 10)

  const precioActual: Record<number, number> = {}
  for (const h of historicos ?? []) {
    if (!(h.activocodigo in precioActual)) {
      precioActual[h.activocodigo] = Number(h.valor)
    }
  }

  // 3. Construir lista para balanceo y calcular desviaciones
  const paraBalanceo: PosicionParaBalanceo[] = posiciones.map(p => {
    const activo = p.activos as unknown as { tipocodigo: string }
    return {
      tipocodigo: activo?.tipocodigo ?? 'OTRO',
      valor_total: p.cantidad * (precioActual[p.activocodigo] ?? 0),
    }
  }).filter(p => p.valor_total > 0)

  if (paraBalanceo.length === 0) {
    const desactivadas = await desactivarPrevias(usuarioId)
    return { generadas: 0, desactivadas, perfilUsuario: codigoPerfil }
  }

  const distribucion = calcularDistribucionActual(paraBalanceo)
  const desviaciones = calcularDesviaciones(distribucion, codigoPerfil)

  // 4. Si no hay desviaciones significativas, desactivar previas y salir
  if (desviaciones.length === 0) {
    const desactivadas = await desactivarPrevias(usuarioId)
    return { generadas: 0, desactivadas, perfilUsuario: codigoPerfil }
  }

  // 5. Construir el payload y hacer UPSERT lógico:
  //    primero desactivamos cualquier recomendación previa del mismo tipo
  //    y luego insertamos la nueva (más simple que un upsert real con la
  //    serial PK).
  const desactivadas = await desactivarPrevias(usuarioId)

  const { titulo, mensaje } = generarMensajeDesbalance(desviaciones, codigoPerfil)
  const severidad = severidadMaxima(desviaciones)

  const datosJson: DatosDesbalance = {
    perfil: codigoPerfil,
    distribucion_actual: distribucion.map(d => ({
      tipo: d.tipo,
      porcentaje: d.porcentaje,
      valor: Math.round(d.valor * 100) / 100,
    })),
    distribucion_target: DISTRIBUCION_TARGET[codigoPerfil],
    desviaciones,
  }

  const { error: insertErr } = await supabase
    .from('recomendaciones')
    .insert({
      usuario_id: usuarioId,
      tipo: 'desbalance_cartera',
      severidad,
      titulo,
      mensaje,
      datos_json: datosJson,
      estado: 'activa',
    })

  if (insertErr) {
    return { generadas: 0, desactivadas, perfilUsuario: codigoPerfil }
  }

  return { generadas: 1, desactivadas, perfilUsuario: codigoPerfil }
}

/**
 * Marca como 'ignorada' cualquier recomendación activa de tipo
 * 'desbalance_cartera' del usuario. Devuelve cuántas filas afectó.
 */
async function desactivarPrevias(usuarioId: string): Promise<number> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('recomendaciones')
    .update({ estado: 'ignorada' })
    .eq('usuario_id', usuarioId)
    .eq('tipo', 'desbalance_cartera')
    .eq('estado', 'activa')
    .select('id')

  if (error) return 0
  return data?.length ?? 0
}
