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

export async function POST(request: Request) {
  const supabase = await createClient();
  const { activocodigo, cantidad } = await request.json();

  // 1. Obtener el usuario actual
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  // 2. Insertar en la tabla 'activosposeidos'
  const { data, error } = await supabase
    .from("activosposeidos")
    .insert([
      { 
        usuario_id: user.id, 
        activocodigo: activocodigo, 
        cantidad: cantidad 
      }
    ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ message: "Activo añadido con éxito" });
}