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

export async function POST(req: Request) {
  try {
    const { cantidad, origen, destino, fecha } = await req.json();

    const supabase = await createClient()

      const { data, error } = await supabase.rpc('convertir_divisa', {
        p_valor: cantidad,
        p_divisa_origen: origen,
        p_divisa_destino: destino,
        p_fecha: fecha,
      })
    console.log('Cambio de '+cantidad+origen+' a '+data+destino)
    return Response.json({data});

  } catch (error) {
      console.log("Error en convertir divisa "+error.message)
    return new Response(
      JSON.stringify({ error: 'Error al convertir divisa' }),
      { status: 500 }
    );
  }
}