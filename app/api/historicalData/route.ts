import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { HistoricalDataGlobal } from '@/lib/types'

interface PuntoSerie { day: string; value: number }

// Construye un lookup de tipos de cambio: "ORIGEN:DESTINO:YYYY-MM-DD" → tasa
// Hace UNA sola query en vez de una por cada (divisa, fecha)
async function buildRateMap(
  supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>,
  divisasOrigen: string[],
  divisaDestino: string,
  fechaDesde: string,
  fechaHasta: string
): Promise<Map<string, number>> {
  const map = new Map<string, number>()
  if (divisasOrigen.length === 0) return map

  const { data } = await supabase
    .from('cambios')
    .select('divisaorigen, divisadestino, fecini, cambio')
    .in('divisaorigen', divisasOrigen)
    .eq('divisadestino', divisaDestino)
    .lte('fecini', fechaHasta)
    .order('fecini', { ascending: true })

  for (const row of data ?? []) {
    map.set(`${row.divisaorigen}:${row.divisadestino}:${row.fecini}`, Number(row.cambio))
  }

  return map
}

// Dado el mapa pre-cargado, devuelve la tasa para esa fecha (o la más cercana anterior)
function getTasa(
  map: Map<string, number>,
  origen: string,
  destino: string,
  fecha: string,
  todasFechas: string[]
): number {
  if (origen === destino) return 1

  const key = `${origen}:${destino}:${fecha}`
  if (map.has(key)) return map.get(key)!

  // Buscar la fecha disponible más cercana anterior
  for (let i = todasFechas.indexOf(fecha) - 1; i >= 0; i--) {
    const k = `${origen}:${destino}:${todasFechas[i]}`
    if (map.has(k)) return map.get(k)!
  }

  return 1 // sin datos → sin conversión
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const divisaFinal = searchParams.get('divisa')
  const fechaInicio = searchParams.get('fecha')

  if (!divisaFinal || !fechaInicio) {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // 1. Posiciones del usuario
  const { data: posiciones, error } = await supabase
    .from('activosposeidos')
    .select('activocodigo, cantidad, fechainicio, activos(divisacodigo)')
    .eq('usuario_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!posiciones || posiciones.length === 0) return NextResponse.json([])

  const posicionesMap = new Map<number, { cantidad: number; divisa: string; fechaInicio: string }[]>()
  const divisasNecesarias = new Set<string>()

  for (const p of posiciones) {
    const divisa = (p.activos as any)?.divisacodigo as string
    if (!posicionesMap.has(p.activocodigo)) posicionesMap.set(p.activocodigo, [])
    posicionesMap.get(p.activocodigo)!.push({ cantidad: Number(p.cantidad), divisa, fechaInicio: p.fechainicio })
    if (divisa && divisa !== divisaFinal) divisasNecesarias.add(divisa)
  }

  const codigos = [...posicionesMap.keys()]
  const hoy = new Date().toISOString().split('T')[0]

  // 2. Rango de fechas (BUG FIX: usar T12:00:00 evita el desfase de zona horaria
  //    con new Date("YYYY-MM-DD") que se interpreta como UTC medianoche)
  const fechas: string[] = []
  let cur = new Date(fechaInicio + 'T12:00:00')
  const fin = new Date(hoy + 'T12:00:00')
  while (cur <= fin) {
    fechas.push(cur.toISOString().split('T')[0])
    cur.setDate(cur.getDate() + 1)
  }

  // 3. Todos los históricos de precios en UNA query
  const [{ data: historicos }, { data: previos }] = await Promise.all([
    supabase
      .from('valorhistoricoactivo')
      .select('activocodigo, fecha, valor')
      .in('activocodigo', codigos)
      .gte('fecha', fechaInicio)
      .order('fecha', { ascending: true }),
    // BUG FIX: limitar previos — solo necesitamos el último precio por activo antes del inicio
    supabase
      .from('valorhistoricoactivo')
      .select('activocodigo, fecha, valor')
      .in('activocodigo', codigos)
      .lt('fecha', fechaInicio)
      .order('fecha', { ascending: false })
      .limit(codigos.length * 5),
  ])

  if (!historicos || historicos.length === 0) return NextResponse.json([])

  // 4. Todos los tipos de cambio del período en UNA query
  const rateMap = await buildRateMap(
    supabase,
    [...divisasNecesarias],
    divisaFinal,
    fechaInicio,
    hoy
  )

  // 5. Agrupar históricos por fecha
  const histPorFecha = new Map<string, typeof historicos>()
  for (const h of historicos) {
    if (!histPorFecha.has(h.fecha)) histPorFecha.set(h.fecha, [])
    histPorFecha.get(h.fecha)!.push(h)
  }

  // 6. Precio inicial (último disponible antes de fechaInicio)
  const ultimoPrecio = new Map<number, number>()
  for (const h of previos ?? []) {
    if (!ultimoPrecio.has(h.activocodigo)) ultimoPrecio.set(h.activocodigo, Number(h.valor))
  }

  // 7. Recorrer días — todo en memoria, sin más queries
  const resultado: PuntoSerie[] = []

  for (const fecha of fechas) {
    for (const h of histPorFecha.get(fecha) ?? []) {
      ultimoPrecio.set(h.activocodigo, Number(h.valor))
    }

    let totalDia = 0
    for (const [codigo, poss] of posicionesMap.entries()) {
      const precio = ultimoPrecio.get(codigo)
      if (precio === undefined) continue

      for (const pos of poss) {
        if (pos.fechaInicio > fecha) continue
        const tasa = getTasa(rateMap, pos.divisa, divisaFinal, fecha, fechas)
        totalDia += precio * tasa * pos.cantidad
      }
    }

    // BUG FIX: no pushear 0 cuando no hay datos previos — evita picos falsos en el gráfico
    if (totalDia > 0) resultado.push({ day: fecha, value: Math.round(totalDia * 100) / 100 })
  }

  return NextResponse.json(resultado)
}
