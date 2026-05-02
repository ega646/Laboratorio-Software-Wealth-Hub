import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ==========================
// GET → listar activos usuario
// ==========================
export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

    // Traemos todos los activos del usuario
    const { data, error } = await supabase
      .from('activosposeidos')
      .select(`
        activocodigo,
        cantidad,
        precio_compra,
        activos (
          codigo, descripcion, color, simbolo,
          tiposactivos ( descripcion )
        )
      `)
      .eq('usuario_id', user.id)

  if (error) {
      console.log('En consulta activos: '+error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// ==========================
// POST → añadir inversión
// ==========================
export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();

  const activocodigo = parseInt(body.activocodigo);
  const cantidad = parseFloat(body.cantidad);
  const precio = parseFloat(body.precio_compra) || 0;

  if (!activocodigo || isNaN(cantidad) || cantidad <= 0) {
    return NextResponse.json(
      { error: "Datos inválidos" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("activosposeidos")
    .insert([
      {
        usuario_id: user.id,
        activocodigo,
        cantidad,
        precio_compra: precio,
        fechainicio:
          body.fechainicio ||
          new Date().toISOString().split("T")[0],
      },
    ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: "Activo añadido correctamente" });
}