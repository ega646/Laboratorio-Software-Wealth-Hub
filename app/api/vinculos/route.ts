import { NextResponse } from "next/server";
import { createClient } from "@/lib/utils/supabase/server"; // Ajusta según tu proyecto

export async function POST(req: Request) {
  const { usuarioId, codigoActivo, fechaInicio, cantidad, exchange } = await req.json();

  const supabase = createClient();

  const { data, error } = await supabase
    .from('vinculos') // Asegúrate de que la tabla se llame así
    .insert([
      { 
        usuario_id: usuarioId, 
        activo_id: codigoActivo, 
        fecha_inicio: fechaInicio, 
        cantidad: cantidad,
        origen: exchange 
      }
    ]);

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data });
}