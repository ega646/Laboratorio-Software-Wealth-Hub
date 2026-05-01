import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/catalogo
// Devuelve todos los activos del catálogo con info de tipo y precio más reciente.
// Acepta ?q=texto (búsqueda por nombre) y ?tipo=CRYPTO (filtro por tipocodigo).
export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim().toLowerCase()
  const tipo = searchParams.get('tipo')?.trim()

  let query = supabase
    .from('activos')
    .select(`
      codigo,
      descripcion,
      tipocodigo,
      divisacodigo,
      color,
      simbolo,
      tiposactivos ( codigo, descripcion, riesgocodigo )
    `)
    .order('tipocodigo')
    .order('descripcion')

  if (tipo) query = query.eq('tipocodigo', tipo)

  const { data: activos, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Filtro por nombre (client-side sobre el resultado ya acotado por tipo)
  const filtrados = q
    ? (activos ?? []).filter(a => a.descripcion.toLowerCase().includes(q))
    : (activos ?? [])

  // Precio más reciente para cada activo
  if (filtrados.length === 0) return NextResponse.json([])

  const codigos = filtrados.map(a => a.codigo)
  const { data: historicos } = await supabase
    .from('valorhistoricoactivo')
    .select('activocodigo, valor, fecha')
    .in('activocodigo', codigos)
    .order('fecha', { ascending: false })

  const precioActual: Record<number, number> = {}
  for (const h of historicos ?? []) {
    if (!(h.activocodigo in precioActual)) {
      precioActual[h.activocodigo] = Number(h.valor)
    }
  }

  const resultado = filtrados.map(a => ({
    ...a,
    precio_actual: precioActual[a.codigo] ?? null,
  }))

  return NextResponse.json(resultado)
}
