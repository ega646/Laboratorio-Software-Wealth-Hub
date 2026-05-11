import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { regenerarRecomendacionesUsuario } from '@/lib/server/regenerarRecomendaciones'
import { calcularIndicadores } from '@/lib/utils/indicadores'
import type { ActivoPoseidoConPrecio } from '@/lib/types'
import { convertirDivisa } from '@/app/api/cambios/route'

// GET /api/activos/[id] -> Detalles y cálculos de un activo
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params;
  const activocodigo = parseInt(id)
  if (isNaN(activocodigo)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

  // 1. Obtener posiciones del usuario para este activo
    const { data: posiciones, error: errorPos } = await supabase
      .from('activosposeidos')
      .select(`
        id,
        perfiles(
            id,
            divisas (codigo, simbolo_divisa)
            ),
        usuario_id,
        activocodigo,
        cantidad,
        fechainicio,
        precio_compra,
        activos (
          codigo,
          descripcion,
          tipocodigo,
          color,
          simbolo,
          tiposactivos ( codigo, descripcion, riesgocodigo ),
          divisas (codigo, simbolo_divisa)
        )
      `)
      .eq('usuario_id', user.id)
      .eq('activocodigo', id)
   //   .single()

  if (errorPos || !posiciones || posiciones.length === 0) {
    console.error("Error o activo no encontrado:", errorPos)
    return NextResponse.json({ error: 'Activo no encontrado' }, { status: 404 })
  }

  const simboloDivisa = posiciones[0]?.perfiles?.divisas?.simbolo_divisa

  // 2. Obtener histórico de precios con conversión de divisa (orden DESC)
  const { data: historico } = await supabase.rpc(
    'get_historico_activo',
    { p_activocodigo: id,
      p_origen: posiciones[0].activos?.divisas?.codigo,
      p_destino: posiciones[0].perfiles?.divisas?.codigo
    }
  )

  const precioActual = historico && historico.length > 0 ? Number(historico[0].valor) : 0

  // 3. Para posiciones sin precio_compra, buscar precio histórico en fechainicio
  const precioEfectivoCompra: Record<number, number> = {}
  for (const pos of posiciones) {
    precioEfectivoCompra[pos.id as number] = pos.precio_compra
  }

  const posicionesSinPrecio = posiciones.filter(p => !p.precio_compra && p.fechainicio)
  if (posicionesSinPrecio.length > 0) {
    const fechaMin = posicionesSinPrecio.map(p => p.fechainicio!).sort()[0]
    const { data: historicosCompra } = await supabase
      .from('valorhistoricoactivo')
      .select('fecha, valor')
      .eq('activocodigo', activocodigo)
      .gte('fecha', fechaMin)
      .order('fecha', { ascending: true })

    for (const pos of posicionesSinPrecio) {
      const rows = historicosCompra ?? []
      const candidatos = rows.filter((h: { fecha: string; valor: unknown }) => h.fecha <= pos.fechainicio!)
      const precio = candidatos.length > 0
        ? Number(candidatos[candidatos.length - 1].valor)
        : Number(rows[0]?.valor ?? 0)
      precioEfectivoCompra[pos.id as number] = precio
    }
  }

  // 4. Cálculos de consolidación (múltiples compras del mismo activo)
  const totalCantidad = posiciones.reduce((acc, curr) => acc + curr.cantidad, 0)
  const costeTotal = posiciones.reduce(
    (acc, curr) => acc + curr.cantidad * precioEfectivoCompra[curr.id as number],
    0
  )

  const costeTotal_convertida = await convertirDivisa(
    costeTotal,
    posiciones[0].activos?.divisas?.codigo,
    posiciones[0].perfiles?.divisas?.codigo,
    new Date(),
  )
  const precioMedioCompra = totalCantidad > 0 ? costeTotal_convertida / totalCantidad : 0
  const valorTotal = totalCantidad * precioActual
  const rentabilidad = precioMedioCompra > 0
    ? ((precioActual - precioMedioCompra) / precioMedioCompra) * 100
    : 0

  // UC16: indicadores técnicos sobre la serie ASC
  const historicoAsc = (historico ?? []).slice().reverse()
  const serieValores = historicoAsc.map(h => Number(h.valor))
  const indicadores = calcularIndicadores(serieValores)

  const smaSeries = historicoAsc.map((h, i) => ({
    fecha: h.fecha as string,
    sma50: indicadores.serieSMA50[i],
    sma200: indicadores.serieSMA200[i],
  }))

  // 4. Respuesta unificada
  return NextResponse.json({
    activocodigo: id,
    cantidad: totalCantidad,
    precio_compra: precioMedioCompra,
    precio_actual: precioActual,
    simbolo_divisa: simboloDivisa,
    activos: posiciones[0].activos,
    historico: historico || [],
    valor_total: Math.round(valorTotal * 100) / 100,
    rentabilidad_pct: Math.round(rentabilidad * 100) / 100,
    compras: posiciones.map(p => ({
      id:            p.id,
      cantidad:      p.cantidad,
      precio_compra: precioEfectivoCompra[p.id as number],
      fechainicio:   p.fechainicio,
      simbolo_divisa: p.activos?.divisas?.simbolo_divisa
    })),
    indicadores: {
      sma50: indicadores.sma50,
      sma200: indicadores.sma200,
      tendencia: indicadores.tendencia,
      volatilidad: indicadores.volatilidad,
      nivelVolatilidad: indicadores.nivelVolatilidad,
      drawdownMax: indicadores.drawdownMax,
      maxMin12m: indicadores.maxMin12m,
      diasDeHistorico: indicadores.diasDeHistorico,
      textoDescriptivo: indicadores.textoDescriptivo,
      smaSeries,
    },
  })
}

// DELETE /api/activos/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const resolvedParams = await params
  const idStr = resolvedParams.id
  const activoBusqueda = isNaN(Number(idStr)) ? idStr : parseInt(idStr)

  const { searchParams } = new URL(request.url)
  const transactionId = searchParams.get('transactionId')

  let query = supabase.from('activosposeidos').delete().eq('usuario_id', user.id)

  if (transactionId && transactionId !== "undefined") {
    // Borrado de una sola fila (transacción específica)
    query = query.eq('id', transactionId)
  } else {
    // Borrado de todas las filas que coincidan con el código de activo
    query = query.eq('activocodigo', activoBusqueda)
  }

  const { error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // UC14: la cartera cambió → recalcular recomendaciones en background
  regenerarRecomendacionesUsuario(user.id).catch(() => { /* no bloquea la respuesta */ })

  return new NextResponse(null, { status: 204 })
}