import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { convertirDivisa } from '@/app/api/cambios/route'
import type { HistoricalDataGlobal } from '@/lib/types'

// GET /api/historicalData
// Devuelve la posicion del usuario a fecha
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const divisaFinal = searchParams.get('divisa')
  const fechaInicio = searchParams.get('fecha')

  if (!divisaFinal || !fechaInicio) {
    return new Response(
      JSON.stringify({ error: 'Faltan parámetros' }),
      { status: 400 }
    )
  }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })


    // 1️⃣ Posiciones
    const { data: posiciones, error } = await supabase
      .from('activosposeidos')
      .select(`
        activocodigo,
        cantidad,
        activos (divisacodigo),
        fechainicio
      `)
      .eq('usuario_id', user.id)
    if (error) {
          console.error(error)
          return NextResponse.json({ error: error.message }, { status: 500 })
      }
    if (!posiciones || posiciones.length === 0) return NextResponse.json([], { status: 200 })

    const posicionesMap = new Map<number, {
      cantidad: number
      divisa: string
      fechaInicio: string
    }[]>()

    for (const p of posiciones) {
      const key = p.activocodigo

      if (!posicionesMap.has(key)) {
        posicionesMap.set(key, [])
      }

      posicionesMap.get(key)!.push({
        cantidad: Number(p.cantidad),
        divisa: (p.activos as any)?.divisacodigo,
        fechaInicio: p.fechainicio,
      })
    }
    console.log('posiciones mapeadas')

    const codigos = [...posicionesMap.keys()]

    // 2️⃣ Históricos desde fecha
    const { data: historicos } = await supabase
      .from('valorhistoricoactivo')
      .select(`
        activocodigo,
        fecha,
        valor
      `)
      .in('activocodigo', codigos)
      .gte('fecha', fechaInicio)
      .order('fecha', { ascending: true })

    if (!historicos || historicos.length === 0) return NextResponse.json([], { status: 200 })

    // 3️⃣ Agrupar históricos por fecha
    const histPorFecha = new Map<string, typeof historicos>()

    for (const h of historicos) {
      if (!histPorFecha.has(h.fecha)) {
        histPorFecha.set(h.fecha, [])
      }
      histPorFecha.get(h.fecha)!.push(h)
    }

    const { data: previos } = await supabase
      .from('valorhistoricoactivo')
      .select('activocodigo, fecha, valor')
      .in('activocodigo', codigos)
      .lt('fecha', fechaInicio)
      .order('fecha', { ascending: false })

    // 4️⃣ Inicializar últimos precios
    const ultimoPrecio = new Map<number, number>()

    for (const h of previos ?? []) {
      if (!ultimoPrecio.has(h.activocodigo)) {
        ultimoPrecio.set(h.activocodigo, Number(h.valor))
      }
    }

    // 5️⃣ Generar rango de fechas
    const fechas: string[] = []
    let current = new Date(fechaInicio)
    const hoy = new Date()

    while (current <= hoy) {
      fechas.push(current.toISOString().split('T')[0])
      current.setDate(current.getDate() + 1)
    }

    const resultado: PuntoSerie[] = []

    // 6️⃣ Recorrer días
    for (const fecha of fechas) {
      const fechaDate = new Date(fecha)

      const histDia = histPorFecha.get(fecha) || []

      for (const h of histDia) {
        ultimoPrecio.set(h.activocodigo, Number(h.valor))
      }

      let totalDia = 0

      for (const [codigo, posiciones] of posicionesMap.entries()) {
        const precio = ultimoPrecio.get(codigo)
        if (precio === undefined) continue

        for (const pos of posiciones) {
          if (pos.fechaInicio > fecha) continue

          let valorConvertido = precio

          if (pos.divisa !== divisaFinal) {
            valorConvertido = await convertirDivisa(
              precio,
              pos.divisa,
              divisaFinal,
              fecha
            )
          }

          totalDia += valorConvertido * pos.cantidad
        }
      }

      resultado.push({
        day: fecha,
        value: Math.round(totalDia * 100) / 100
      })

    }

    console.log('Informacion historica obtenida:')
    //console.log(resultado)
    return NextResponse.json(resultado, { status: 200 })
}
