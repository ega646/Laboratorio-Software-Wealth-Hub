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

const historicalData = [
  { month: 'Ene', value: 85000 }, { month: 'Feb', value: 88500 },
  { month: 'Mar', value: 92000 }, { month: 'Abr', value: 89500 },
  { month: 'May', value: 95000 }, { month: 'Jun', value: 98000 },
  { month: 'Jul', value: 102000 }, { month: 'Ago', value: 105437 },
];

export default function Dashboard() {
  const [activos, setActivos] = useState<ActivoPoseidoConPrecio[]>([]);
  const [portfolio, setPortfolio] = useState<ResumenPortfolio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/activos').then(r => r.json()),
      fetch('/api/portfolio').then(r => r.json()),
    ]).then(([activosData, portfolioData]) => {
      setActivos(Array.isArray(activosData) ? activosData : []);
      setPortfolio(portfolioData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // [UC04] Lógica de respaldo: Si la API de portfolio no carga, calculamos el total a mano
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
        <div className="mb-12">
          <h1 className="text-5xl font-bold tracking-tight">Tu cartera</h1>
          <p className="text-xl text-zinc-400 mt-3">Resumen de activos de Iker Molina.</p>
        </div>

        {/* Net Worth - [UC04] Mostrar Patrimonio Total Destacado */}
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-white/10 mb-12 shadow-2xl">
          <CardContent className="p-9">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
              <div>
                <p className="text-zinc-400 text-base tracking-wide uppercase">Patrimonio Total</p>
                <h2 className="text-6xl font-bold tracking-tighter mt-3">
                  {totalDisplay.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                </h2>
                {portfolio?.mejor_activo && (
                  <div className="flex items-center gap-3 mt-5 text-emerald-400">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-xl font-medium">
                      Mejor activo: {portfolio.mejor_activo.descripcion} (+{portfolio.mejor_activo.rentabilidad_pct}%)
                    </span>
                  </div>
                )}
              </div>
              <Wallet className="w-20 h-20 text-violet-400 flex-shrink-0 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Gráficos y Tablas omitidos por brevedad, pero usa la misma lógica de seguridad: */}
        {/* Asegúrate de usar siempre ?.toLocaleString() y ?? 0 */}
        
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
                      <TableCell className="font-medium">
                        {(pos.activos as any)?.descripcion ?? `Activo #${pos.activocodigo}`}
                      </TableCell>
                      <TableCell className="text-right">
                        {pos.cantidad?.toLocaleString() ?? "0"}
                      </TableCell>
                      <TableCell className="text-right font-bold">
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