"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Header } from "@/components/Header";
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Activity, Calendar, Percent } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState as useToggle } from "react";
import type { Activo } from "@/lib/types";

// Historial mock hasta integrar APIs externas de precios históricos (Fase 5)
const historicalMock = [
  { date: '1 Mar', price: 0 }, { date: '3 Mar', price: 0 },
  { date: '5 Mar', price: 0 }, { date: '7 Mar', price: 0 },
  { date: '9 Mar', price: 0 }, { date: '11 Mar', price: 0 },
  { date: '13 Mar', price: 0 }, { date: '15 Mar', price: 0 },
  { date: '17 Mar', price: 0 }, { date: '19 Mar', price: 0 },
  { date: '21 Mar', price: 0 }, { date: '23 Mar', price: 0 },
  { date: '25 Mar', price: 0 }, { date: '27 Mar', price: 0 },
  { date: '29 Mar', price: 0 },
];

const tipoLabel: Record<string, string> = {
  cripto: 'Criptomoneda', accion: 'Acción', etf: 'ETF', efectivo: 'Efectivo',
};

export default function DetallesInversion() {
  const params = useParams();
  const id = params.id as string;
  const [activo, setActivo] = useState<Activo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPersonalHistory, setShowPersonalHistory] = useState(true);

  useEffect(() => {
    fetch(`/api/activos/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        setActivo(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center">
        <p className="text-zinc-400 text-xl">Cargando activo...</p>
      </div>
    );
  }

  if (!activo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex flex-col items-center justify-center gap-6">
        <p className="text-zinc-400 text-xl">Activo no encontrado</p>
        <Button asChild variant="outline">
          <Link href="/dashboard">Volver al Dashboard</Link>
        </Button>
      </div>
    );
  }

  const valorTotal = activo.cantidad * activo.precio_actual;
  const ganancia = valorTotal - activo.cantidad * activo.precio_compra;
  const gananciaPercent = activo.precio_compra > 0
    ? ((activo.precio_actual - activo.precio_compra) / activo.precio_compra) * 100
    : 0;

  const chartData = historicalMock.map(p => ({ ...p, price: activo.precio_actual }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button
          variant="ghost"
          asChild
          className="mb-12 text-zinc-400 hover:text-white hover:bg-white/5 h-14 px-8 text-lg font-medium"
        >
          <Link href="/dashboard" className="flex items-center gap-3">
            <ArrowLeft className="w-6 h-6" />
            Volver al Dashboard
          </Link>
        </Button>

        {/* Header Card */}
        <Card className="bg-zinc-900/70 border border-white/5 mb-12">
          <CardContent className="p-12">
            <div className="flex flex-col lg:flex-row gap-10 items-start justify-between">
              <div className="flex items-center gap-7">
                <div
                  className="w-24 h-24 rounded-3xl flex items-center justify-center text-white text-5xl font-bold"
                  style={{ backgroundColor: activo.color }}
                >
                  {activo.ticker.substring(0, 2)}
                </div>
                <div>
                  <h1 className="text-6xl font-bold tracking-tight">{activo.nombre}</h1>
                  <div className="flex items-center gap-4 mt-4">
                    <span className="text-3xl text-zinc-400">{activo.ticker}</span>
                    <Badge className="bg-zinc-800/70 text-zinc-400 text-xl px-6 py-2 border border-white/5">
                      {tipoLabel[activo.tipo] ?? activo.tipo}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-zinc-500 text-xl">Precio Actual</p>
                <p className="text-6xl font-bold mt-3 tracking-tighter text-white">
                  ${activo.precio_actual.toLocaleString('es-ES')}
                </p>
                <div className={`flex items-center justify-end gap-3 mt-6 text-2xl ${gananciaPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {gananciaPercent >= 0 ? <TrendingUp className="w-7 h-7" /> : <TrendingDown className="w-7 h-7" />}
                  <span>
                    {gananciaPercent >= 0 ? '+' : ''}{Math.round(gananciaPercent * 100) / 100}% desde compra
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Situación Personal */}
        <Card className="bg-zinc-900/70 border border-white/5 mb-14">
          <CardHeader>
            <CardTitle className="text-3xl">Situación Personal</CardTitle>
            <CardDescription>Resumen de tu inversión en este activo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-zinc-500">
                  <DollarSign className="w-5 h-5" />
                  <span className="text-sm font-medium">Cantidad Poseída</span>
                </div>
                <p className="text-4xl font-semibold text-white">
                  {activo.cantidad} <span className="text-2xl text-zinc-500">{activo.ticker}</span>
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 text-zinc-500">
                  <Activity className="w-5 h-5" />
                  <span className="text-sm font-medium">Valor Total Actual</span>
                </div>
                <p className="text-4xl font-semibold text-white">
                  ${valorTotal.toLocaleString('es-ES')}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 text-zinc-500">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm font-medium">Precio Promedio de Compra</span>
                </div>
                <p className="text-4xl font-semibold text-white">
                  ${activo.precio_compra.toLocaleString('es-ES')}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 text-zinc-500">
                  <Percent className="w-5 h-5" />
                  <span className="text-sm font-medium">Ganancia / Pérdida</span>
                </div>
                <p className={`text-4xl font-semibold ${ganancia >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {ganancia >= 0 ? '+' : ''}${ganancia.toLocaleString('es-ES')}
                </p>
                <p className={`text-xl ${ganancia >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  ({Math.round(gananciaPercent * 100) / 100}%)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico */}
        <Card className="bg-zinc-900/70 border border-white/5">
          <CardHeader className="pb-6 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-3xl">Precio del Mercado</CardTitle>
              <CardDescription>
                Historial de precios en tiempo real — disponible en Fase 5 (integración de APIs externas)
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pt-4 pb-8">
            <ResponsiveContainer width="100%" height={440}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#52525b" />
                <YAxis stroke="#52525b" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '14px', color: '#e4e4e7' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Precio']}
                />
                <Area
                  type="natural"
                  dataKey="price"
                  stroke="#60a5fa"
                  strokeWidth={4}
                  fill="url(#colorPrice)"
                  dot={{ fill: '#60a5fa', r: 5, stroke: '#18181b', strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
