"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { TrendingUp, Wallet, PieChart as PieIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { LineChart, Line, PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ActivoPoseidoConPrecio, ResumenPortfolio } from "@/lib/types";
import { createClient } from "@/lib/supabase/client"; 

const historicalData = [
  { month: 'Ene', value: 85000 }, { month: 'Feb', value: 88500 },
  { month: 'Mar', value: 92000 }, { month: 'Abr', value: 89500 },
  { month: 'May', value: 95000 }, { month: 'Jun', value: 98000 },
  { month: 'Jul', value: 102000 }, { month: 'Ago', value: 105437 },
];

export default function Dashboard() {
  const [activos, setActivos] = useState<ActivoPoseidoConPrecio[]>([]);
  const [portfolio, setPortfolio] = useState<ResumenPortfolio | null>(null);
  const [userName, setUserName] = useState<string>("Usuario"); // Nuevo estado para el nombre
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      
      // Intentamos obtener el usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Prioridad: Nombre completo > Email
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
            {/* NOMBRE DINÁMICO AQUÍ */}
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

        {/* ... Resto de la Card de Net Worth y Tabla (se mantiene igual) ... */}
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activos.map((pos, index) => (
                    <TableRow key={`${pos.activocodigo}-${index}`} className="border-b border-white/10">
                      <TableCell className="font-medium text-lg">
                        {(pos.activos as any)?.descripcion ?? `Activo #${pos.activocodigo}`}
                      </TableCell>
                      <TableCell className="text-right text-lg">
                        {pos.cantidad?.toLocaleString() ?? "0"}
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg">
                        {(pos.valor_total ?? 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
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