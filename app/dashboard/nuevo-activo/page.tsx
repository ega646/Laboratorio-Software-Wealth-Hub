"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

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
        router.push('/dashboard'); // Te devuelve al dashboard para ver el cambio
      } else {
        alert("Error al añadir el activo");
      }
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen bg-black">
      <h1 className="text-3xl font-bold mb-6 text-white">Catálogo de Activos</h1>
      <div className="grid gap-4">
        {catalogo.map((activo: any) => (
          <Card key={activo.codigo} className="bg-zinc-900 border-zinc-800 hover:border-violet-500 transition-all">
            <CardContent className="p-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full" style={{ backgroundColor: activo.color }} />
                <div>
                  <p className="text-white font-bold">{activo.descripcion}</p>
                  <p className="text-zinc-500 text-sm">{activo.tipocodigo}</p>
                </div>
              </div>
              <Button 
                onClick={() => añadirActivo(activo.codigo, activo.descripcion)}
                className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-6 py-2 rounded-xl transition-all shadow-lg shadow-violet-500/20"
                >
                Añadir a mi cartera
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}