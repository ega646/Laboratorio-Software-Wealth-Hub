import { insertarVinculo } from "./vinculos";

/**
 * Este servicio permite añadir activos a mano (ej: una wallet fría o efectivo)
 * Cumple con el requisito de llamar a insertarVinculo
 */
export async function procesarVinculoManual(
  usuarioId: string, 
  activo: string, 
  cantidad: number
) {
  // Llamada directa a la función base siguiendo los parámetros pedidos
  return await insertarVinculo(
    usuarioId,
    activo,
    new Date().toISOString(),
    cantidad,
    'MANUAL'
  );
}