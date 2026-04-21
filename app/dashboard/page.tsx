"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
// Añadimos Trash2 a los iconos
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

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name = user.user_metadata?.full_name || user.email?.split('@')[0] || "Inversor";
        setUserName(name);
      }

      try {
        const [activosRes, portfolioRes] = await Promise.all([
          fetch('/api/activos'),
          fetch('/api/portfolio')
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
    };

    fetchData();
  }, []);

  // --- NUEVA FUNCIÓN PARA ELIMINAR ---
  const eliminarActivo = async (codigo: number) => {
    if (!confirm("¿Seguro que quieres eliminar este activo de tu cartera?")) return;

    try {
      const res = await fetch(`/api/activos/${codigo}`, { method: 'DELETE' });
      if (res.ok) {
        // Actualizamos el estado local filtrando el activo borrado
        setActivos(prev => prev.filter(a => a.activocodigo !== codigo));
      } else {
        alert("No se pudo eliminar el activo");
      }
    } catch (err) {
      console.error("Fallo al borrar:", err);
    }
  };

  const patrimonioCalculado = activos.reduce((acc, curr) => acc + (curr.valor_total || 0), 0);
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
            <h1 className="text-5xl font-bold tracking-tight">Tu cartera</h1>
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
                <h2 className="text-6xl font-bold tracking-tighter mt-3">
                  {totalDisplay.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                </h2>
              </div>
              <Wallet className="w-20 h-20 text-violet-400 flex-shrink-0 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border border-white/10">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl">Mis Inversiones</CardTitle>
          </CardHeader>
          <CardContent>
            {activos.length === 0 ? (
              <p className="text-zinc-500 text-center py-20">No hay activos. Añade uno desde el catálogo.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-white/10">
                    <TableHead className="text-zinc-400">Activo</TableHead>
                    <TableHead className="text-right text-zinc-400">Cantidad</TableHead>
                    <TableHead className="text-right text-zinc-400">Valor Total</TableHead>
                    {/* CABECERA NUEVA */}
                    <TableHead className="text-right text-zinc-400 w-[80px]">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activos.map((pos, index) => (
                    <TableRow key={`${pos.activocodigo}-${index}`} className="border-b border-white/10 group">
                      <TableCell className="font-medium text-lg">
                        {(pos.activos as any)?.descripcion ?? `Activo #${pos.activocodigo}`}
                      </TableCell>
                      <TableCell className="text-right text-lg">
                        {pos.cantidad?.toLocaleString() ?? "0"}
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg">
                        {(pos.valor_total ?? 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                      </TableCell>
                      {/* BOTÓN DE ELIMINAR NUEVO */}
                      <TableCell className="text-right">
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
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}