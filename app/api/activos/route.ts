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
      idrelacion,
      codigo,
      descripcion,
      tipocodigo,
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
  if (!posiciones || posiciones.length === 0) return NextResponse.json([])

  // 2. Para cada activo, obtener el precio más reciente de valorhistoricoactivo
  const codigos = posiciones.map(p => p.activocodigo)

  const { data: historicos } = await supabase
    .from('valorhistoricoactivo')
    .select('activocodigo, fecha, valor')
    .in('activocodigo', codigos)
    .order('fecha', { ascending: false })

  // Quedarse con el precio más reciente de cada activo
  const precioActual: Record<number, number> = {}
  for (const h of historicos ?? []) {
    if (!(h.activocodigo in precioActual)) {
      precioActual[h.activocodigo] = Number(h.valor)
    }
  }


  // 3. Combinar y calcular valores derivados
  const resultado: ActivoPoseidoConPrecio[] = posiciones.map(p => {
    const precio = precioActual[p.activocodigo] ?? 0
    const valorTotal = p.cantidad * precio
    const simbolo    = p.activos?.divisas?.simbolo_divisa
    const rentabilidad = p.precio_compra > 0
      ? ((precio - p.precio_compra) / p.precio_compra) * 100
      : 0
    const relacion = p.idrelacion

    return {
      ...p,
      simbolo_divisa: simbolo,
      precio_actual: precio,
      valor_total: Math.round(valorTotal * 100) / 100,
      rentabilidad_pct: Math.round(rentabilidad * 100) / 100,
      idrelacion: relacion
    } as ActivoPoseidoConPrecio
  })

  return NextResponse.json(resultado)
}

// POST /api/activos
// Añade un activo del catálogo a la cartera del usuario (inserta en activosposeidos)
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