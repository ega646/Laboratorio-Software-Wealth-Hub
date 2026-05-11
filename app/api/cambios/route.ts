import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function convertirDivisa(
  valor: number,
  divisaOrigen: string | undefined,
  divisaDestino: string | undefined,
  fecha: string | Date
): Promise<number> {
  if (!divisaOrigen || !divisaDestino || divisaOrigen === divisaDestino) return valor

  const supabase = await createClient()
  const fechaStr = typeof fecha === 'string' ? fecha : fecha.toISOString().split('T')[0]

  // Intentar conversión exacta vía RPC
  const { data, error } = await supabase.rpc('convertir_divisa', {
    p_valor: valor,
    p_divisa_origen: divisaOrigen,
    p_divisa_destino: divisaDestino,
    p_fecha: fechaStr,
  })

  if (!error && data !== null) return Number(data)

  // Fallback: usar la tasa más reciente disponible (para fechas sin datos)
  const { data: cambio } = await supabase
    .from('cambios')
    .select('cambio')
    .eq('divisaorigen', divisaOrigen)
    .eq('divisadestino', divisaDestino)
    .lte('fecfin', fechaStr)
    .order('fecfin', { ascending: false })
    .limit(1)
    .single()

  if (cambio) return Math.round(valor * Number(cambio.cambio) * 1_000_000) / 1_000_000

  // Si tampoco hay datos anteriores, intentar con la tasa más antigua disponible
  const { data: cambioFuturo } = await supabase
    .from('cambios')
    .select('cambio')
    .eq('divisaorigen', divisaOrigen)
    .eq('divisadestino', divisaDestino)
    .order('fecini', { ascending: true })
    .limit(1)
    .single()

  if (cambioFuturo) return Math.round(valor * Number(cambioFuturo.cambio) * 1_000_000) / 1_000_000

  console.warn(`Sin tipo de cambio para ${divisaOrigen} -> ${divisaDestino}, devolviendo valor sin convertir`)
  return valor
}

export async function POST(req: Request) {
  try {
    const { cantidad, origen, destino, fecha } = await req.json()
    const resultado = await convertirDivisa(cantidad, origen, destino, fecha)
    return Response.json({ data: resultado })
  } catch (error: any) {
    console.error('Error en convertir divisa', error?.message)
    return new Response(JSON.stringify({ error: 'Error al convertir divisa' }), { status: 500 })
  }
}
