import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function convertirDivisa(
  valor: number,
  divisaOrigen: string,
  divisaDestino: string,
  fecha: string // formato 'YYYY-MM-DD'
): Promise<number> {
  if (divisaOrigen === divisaDestino) return valor

  const { data, error } = await supabase
    .from('cambios')
    .select('cambio')
    .eq('divisaorigen', divisaOrigen)
    .eq('divisadestino', divisaDestino)
    .lte('fecini', fecha)
    .or(`fecfin.is.null,fecfin.gte.${fecha}`)
    .order('fecini', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    throw new Error('No se encontró tipo de cambio para esa fecha')
  }

  const cambio = Number(data.cambio)

  return valor * cambio
}