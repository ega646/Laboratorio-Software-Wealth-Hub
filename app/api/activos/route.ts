import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/catalogo
// UC01: Devuelve todos los activos disponibles en el sistema
// GET /api/activos -> Listar todos los activos del usuario
export async function GET() {
  const supabase = await createClient()
  // Eliminamos el filtro de usuario porque el catálogo es público/general
  const { data: activos, error } = await supabase
    .from('activos') // Nombre de tu tabla en Supabase
  // Traemos todos los activos del usuario
  const { data, error } = await supabase
    .select(`
      idrelacion,
      usuario_id,
      precio_compra,
      activos (
        codigo, descripcion, color, simbolo,
        tiposactivos ( descripcion )
        divisas (codigo, simbolo_divisa),
      color,
        simbolo,
        tiposactivos ( codigo, descripcion, riesgocodigo )
      )
    `)
    .eq('usuario_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const simbolo    = p.activos?.divisas?.simbolo_divisa
    const relacion = p.idrelacion
  
  return NextResponse.json(data)
      simbolo_divisa: simbolo,
      idrelacion: relacion
}

// POST /api/activos -> Crear una nueva posición
export async function POST(request: Request) {
  const supabase = await createClient();
  const { activocodigo, cantidad } = await request.json();
  

  // 1. Obtener el usuario actual
  const body = await request.json()
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
      activocodigo: parseInt(body.activocodigo),
      cantidad: parseFloat(body.cantidad),
      fechainicio: body.fechainicio || new Date().toISOString().split('T')[0],
      precio_compra: parseFloat(body.precio_compra) || 0,
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ message: "Activo añadido con éxito" });
}