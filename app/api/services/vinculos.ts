// lib/services/vinculos.ts

export async function insertarVinculo(
  usuarioId: string,
  codigoActivo: string,
  fechaInicio: string,
  cantidad: number,
  exchange: string
) {
  try {
    // Aquí llamarás a tu API interna que conecta con Supabase o tu DB
    const response = await fetch('/api/vinculos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        usuarioId, 
        codigoActivo, 
        fechaInicio, 
        cantidad, 
        exchange 
      }),
    });

    if (!response.ok) throw new Error("Error al insertar en la DB");
    
    return await response.json();
  } catch (error) {
    console.error("Error en insertarVinculo:", error);
    throw error;
  }
}