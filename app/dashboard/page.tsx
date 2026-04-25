"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { TrendingUp, Wallet, Trash2, PieChart as PieIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { LineChart, Line, PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ActivoPoseidoConPrecio, ResumenPortfolio } from "@/lib/types";
import { createClient } from "@/lib/supabase/client"; 

export default function Dashboard() {
  const [activos, setActivos] = useState<ActivoPoseidoConPrecio[]>([]);
  const [portfolio, setPortfolio] = useState<ResumenPortfolio | null>(null);
  const [userName, setUserName] = useState<string>("Usuario");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const name = user.user_metadata?.full_name || user.email?.split('@')[0] || "Inversor";
      setUserName(name);
    }

    try {
      const [activosRes, portfolioRes] = await Promise.all([
        fetch(`/api/activos?t=${Date.now()}`),
        fetch(`/api/portfolio?t=${Date.now()}`)
      ]);
      
      const activosData = await activosRes.json();
      const portfolioData = await portfolioRes.json();

      setActivos(Array.isArray(activosData) ? activosData : []);
      setPortfolio(portfolioData);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    window.addEventListener('focus', fetchData);
    return () => window.removeEventListener('focus', fetchData);
  }, [fetchData]);

  // [UC08] Lógica de eliminación con refresco optimista
  const eliminarActivo = async (codigo: number) => {
    // [UC08] Modal de confirmación
    if (!confirm("¿Seguro que quieres eliminar este activo de tu cartera? Esta acción no se puede deshacer.")) return;

    try {
      // [UC08] Llamar a DELETE /api/activos/[id]
      const res = await fetch(`/api/activos/${codigo}`, { method: 'DELETE' });
      
      if (res.ok) {
        // [UC08] Refrescar lista sin recargar la página (Optimistic UI)
        setActivos(prev => prev.filter(a => a.activocodigo !== codigo));
        
        // Refrescamos los totales del portfolio para que el patrimonio neto se actualice
        const portfolioRes = await fetch(`/api/portfolio?t=${Date.now()}`);
        if (portfolioRes.ok) {
          const portfolioData = await portfolioRes.json();
          setPortfolio(portfolioData);
        }
      } else {
        const error = await res.json();
        alert(error.error || "No se pudo eliminar el activo");
      }
    } catch (err) {
      console.error("Fallo al borrar:", err);
      alert("Error de conexión al intentar eliminar el activo");
    }
  };

  // 1. Filtrado: Solo mostramos lo que el usuario realmente posee
  const activosFiltrados = activos.filter(a => (a.cantidad ?? 0) > 0);
  
  const patrimonioCalculado = activosFiltrados.reduce((acc, curr) => acc + (curr.valor_total || 0), 0);
  const totalDisplay = portfolio?.patrimonio_total ?? patrimonioCalculado;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center">
        <p className="text-zinc-400 text-xl animate-pulse">Cargando tu patrimonio...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white pb-20">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-bold tracking-tight text-white">Tu cartera</h1>
            <p className="text-xl text-zinc-400 mt-3">
              Resumen de activos de <span className="text-white font-medium">{userName}</span>.
            </p>
          </div>
          
          <Button asChild className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-6 rounded-2xl text-lg font-bold shadow-lg shadow-violet-500/20 transition-all hover:scale-105">
            <Link href="/dashboard/nuevo-activo">
              + Añadir Inversión
            </Link>
          </Button>
        </div>

        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-white/10 mb-12 shadow-2xl">
          <CardContent className="p-9">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
              <div>
                <p className="text-zinc-400 text-base tracking-wide uppercase">Patrimonio Total</p>
                <h2 className="text-6xl font-bold tracking-tighter mt-3 text-white">
                  {totalDisplay.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                </h2>
              </div>
              <Wallet className="w-20 h-20 text-violet-400 flex-shrink-0 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border border-white/10 overflow-hidden">
          <CardHeader className="pb-6 border-b border-white/5">
            <CardTitle className="text-2xl text-white">Mis Inversiones</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {activosFiltrados.length === 0 ? (
              <div className="text-center py-20">
                 <p className="text-zinc-500 text-xl">No tienes activos con balance positivo.</p>
                 <Link href="/dashboard/nuevo-activo" className="text-violet-400 hover:underline mt-2 inline-block">Añade tu primera inversión</Link>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-b border-white/10 hover:bg-transparent">
                    <TableHead className="text-zinc-400 py-4 px-6">Activo</TableHead>
                    <TableHead className="text-right text-zinc-400 py-4 px-6">Cantidad</TableHead>
                    <TableHead className="text-right text-zinc-400 py-4 px-6">Valor Total</TableHead>
                    <TableHead className="text-right text-zinc-400 py-4 px-6 w-[80px]">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activosFiltrados.map((pos, index) => {
                    const datosActivo = (pos as any).activos;
                    const nombreDisplay = datosActivo?.descripcion || `Activo #${pos.activocodigo}`;
                    
                    return (
                      <TableRow key={`${pos.activocodigo}-${index}`} className="border-b border-white/5 group hover:bg-white/5 transition-colors">
                        <TableCell className="font-medium text-lg text-white py-6 px-6">
                          {/* [UC08] Enlace a la página de detalle de inversión */}
                          <Link 
                            href={`/dashboard/activos/${pos.activocodigo}`}
                            className="hover:text-violet-400 transition-colors"
                          >
                            {nombreDisplay}
                          </Link>
                        </TableCell>
                        <TableCell className="text-right text-lg text-zinc-300 py-6 px-6">
                          {Number(pos.cantidad).toLocaleString('es-ES')}
                        </TableCell>
                        <TableCell className="text-right font-bold text-lg text-emerald-400 py-6 px-6">
                          {(pos.valor_total ?? 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                        </TableCell>
                        <TableCell className="text-right py-6 px-6">
                          {/* [UC08] Botón eliminar con confirmación */}
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => eliminarActivo(pos.activocodigo)}
                            className="text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-all rounded-full"
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}