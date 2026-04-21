import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/catalogo
// UC01: Devuelve todos los activos disponibles en el sistema
export async function GET() {
  const supabase = await createClient()

  // Eliminamos el filtro de usuario porque el catálogo es público/general
  const { data: activos, error } = await supabase
    .from('activos') // Nombre de tu tabla en Supabase
    .select(`
      codigo,
      descripcion,
      tipocodigo,
      divisacodigo,
      color,
      simbolo
    `)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(activos)
}