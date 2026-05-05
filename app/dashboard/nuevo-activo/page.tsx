"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react"; // Importamos un icono de volver
import Link from "next/link";

export default function SeleccionarActivo() {
  const [catalogo, setCatalogo] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/activos').then(r => r.json()).then(setCatalogo);
  }, []);

  const añadirActivo = async (codigo: number, nombre: string) => {
    const cantidadStr = prompt(`¿Qué cantidad de ${nombre} quieres añadir?`, "1");
    const cantidad = parseFloat(cantidadStr || "0");

    if (cantidad > 0) {
      const res = await fetch('/api/activos', {
        method: 'POST',
        body: JSON.stringify({ activocodigo: codigo, cantidad: cantidad }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        alert("¡Añadido con éxito!");
        router.push('/dashboard');
      } else {
        alert("Error al añadir el activo");
      }
    }
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        {/* Cabecera con botón de volver */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/dashboard" className="text-zinc-500 hover:text-white flex items-center gap-2 mb-4 transition-colors">
              <ChevronLeft className="w-4 h-4" /> Volver al Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-white tracking-tight">Catálogo de Activos</h1>
            <p className="text-zinc-400 mt-2">Selecciona un activo para añadirlo a tu patrimonio.</p>
          </div>
        </div>

        {/* Rejilla de Activos */}
        <div className="grid gap-4">
          {catalogo.map((activo: any) => (
            <Card key={activo.codigo} className="bg-zinc-900/50 border-zinc-800 hover:border-violet-500/50 transition-all duration-300 group">
              <CardContent className="p-6 flex justify-between items-center">
                <div className="flex items-center gap-5">
                  {/* Avatar del activo con color dinámico */}
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-inner"
                    style={{ 
                      backgroundColor: activo.color ? `${activo.color}22` : '#27272a',
                      color: activo.color || '#ffffff',
                      border: `1px solid ${activo.color}44`
                    }}
                  >
                    {activo.descripcion.substring(0, 2).toUpperCase()}
                  </div>
                  
                  <div>
                    <p className="text-white text-xl font-bold">{activo.descripcion}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs font-medium px-2 py-1 bg-zinc-800 text-zinc-400 rounded uppercase tracking-wider">
                        {activo.tipocodigo}
                      </span>
                      <span className="text-xs font-medium px-2 py-1 bg-zinc-800 text-zinc-500 rounded uppercase tracking-wider">
                        {activo.divisacodigo || 'EUR'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* BOTÓN DE ACCIÓN - Muy visible */}
                <Button 
                  onClick={() => añadirActivo(activo.codigo, activo.descripcion)}
                  className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-8 py-6 rounded-2xl transition-all shadow-lg shadow-violet-600/20 active:scale-95"
                >
                  Añadir
                </Button>
              </CardContent>
            </Card>
          ))}

          {catalogo.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-3xl">
              <p className="text-zinc-500">Cargando catálogo...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}