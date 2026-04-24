import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function convertirDivisa(
  valor: number,
  divisaOrigen: string,
  divisaDestino: string,
  fecha: string
): Promise<number> {

  const supabase = await createClient()

  const { data, error } = await supabase.rpc('convertir_divisa', {
    p_valor: valor,
    p_divisa_origen: divisaOrigen,
    p_divisa_destino: divisaDestino,
    p_fecha: fecha,
  })

  if (error) {
    throw new Error(error.message)
  }

  return Number(data)
}