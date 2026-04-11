// app/(dashboard)/investments/[id]/page.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Header } from "@/components/Header";
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Activity, Calendar, Percent } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

// Mock data
const investmentDetails: Record<string, any> = {
  btc: {
    name: "Bitcoin",
    symbol: "BTC",
    type: "Criptomoneda",
    currentPrice: 65432.50,
    amount: 0.5,
    totalValue: 32716.25,
    change24h: 5.23,
    changeValue: 1652.34,
    avgBuyPrice: 58420.00,
    totalInvested: 29210.00,
    profitLoss: 3506.25,
    profitLossPercent: 12.01,
    color: "#F7931A",
  },
};

// Historial del precio del mercado (azul)
const marketPriceHistory = [
  { date: '1 Mar', price: 58420 }, { date: '3 Mar', price: 59100 },
  { date: '5 Mar', price: 60200 }, { date: '7 Mar', price: 59800 },
  { date: '9 Mar', price: 61500 }, { date: '11 Mar', price: 62800 },
  { date: '13 Mar', price: 61900 }, { date: '15 Mar', price: 63400 },
  { date: '17 Mar', price: 64100 }, { date: '19 Mar', price: 63800 },
  { date: '21 Mar', price: 65200 }, { date: '23 Mar', price: 66100 },
  { date: '25 Mar', price: 64900 }, { date: '27 Mar', price: 65800 },
  { date: '29 Mar', price: 65432.50 },
];

// Historial personal del usuario (verde) - evolución del valor de tu posición
const personalHistory = [
  { date: '1 Mar', value: 25000 }, { date: '3 Mar', value: 25500 },
  { date: '5 Mar', value: 27200 }, { date: '7 Mar', value: 26800 },
  { date: '9 Mar', value: 28500 }, { date: '11 Mar', value: 29800 },
  { date: '13 Mar', value: 29200 }, { date: '15 Mar', value: 31000 },
  { date: '17 Mar', value: 32500 }, { date: '19 Mar', value: 31800 },
  { date: '21 Mar', value: 33500 }, { date: '23 Mar', value: 34800 },
  { date: '25 Mar', value: 34000 }, { date: '27 Mar', value: 35200 },
  { date: '29 Mar', value: 32716.25 },
];

export default function DetallesInversion() {
  const params = useParams();
  const id = params.id as string;
  const investment = investmentDetails[id] || investmentDetails.btc;

  const [showPersonalHistory, setShowPersonalHistory] = useState(true);

  const currentData = showPersonalHistory ? personalHistory : marketPriceHistory;
  const lineColor = showPersonalHistory ? "#22c55e" : "#60a5fa";   // Verde o Azul
  const gradientId = showPersonalHistory ? "colorPersonal" : "colorPrice";

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
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
                  style={{ backgroundColor: investment.color }}
                >
                  {investment.symbol.substring(0, 2)}
                </div>
                <div>
                  <h1 className="text-6xl font-bold tracking-tight">{investment.name}</h1>
                  <div className="flex items-center gap-4 mt-4">
                    <span className="text-3xl text-zinc-400">{investment.symbol}</span>
                    <Badge className="bg-zinc-800/70 text-zinc-400 text-xl px-6 py-2 border border-white/5">
                      {investment.type}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-zinc-500 text-xl">Precio Actual</p>
                <p className="text-6xl font-bold mt-3 tracking-tighter text-white">
                  ${investment.currentPrice.toLocaleString('es-ES')}
                </p>
                <div className={`flex items-center justify-end gap-3 mt-6 text-2xl ${investment.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {investment.change24h >= 0 ? <TrendingUp className="w-7 h-7" /> : <TrendingDown className="w-7 h-7" />}
                  <span>{investment.change24h >= 0 ? '+' : ''}{investment.change24h}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sección del usuario */}
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
                  {investment.amount} <span className="text-2xl text-zinc-500">{investment.symbol}</span>
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 text-zinc-500">
                  <Activity className="w-5 h-5" />
                  <span className="text-sm font-medium">Valor Total Actual</span>
                </div>
                <p className="text-4xl font-semibold text-white">
                  ${investment.totalValue.toLocaleString('es-ES')}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 text-zinc-500">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm font-medium">Precio Promedio de Compra</span>
                </div>
                <p className="text-4xl font-semibold text-white">
                  ${investment.avgBuyPrice.toLocaleString('es-ES')}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 text-zinc-500">
                  <Percent className="w-5 h-5" />
                  <span className="text-sm font-medium">Ganancia / Pérdida</span>
                </div>
                <p className={`text-4xl font-semibold ${investment.profitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {investment.profitLoss >= 0 ? '+' : ''}${investment.profitLoss.toLocaleString('es-ES')}
                </p>
                <p className={`text-xl ${investment.profitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  ({investment.profitLossPercent}%)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico con botón de alternancia */}
        <Card className="bg-zinc-900/70 border border-white/5">
          <CardHeader className="pb-6 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-3xl">
                {showPersonalHistory 
                  ? "Tu Historial" 
                  : "Precio del Mercado"}
              </CardTitle>
              <CardDescription>
                {showPersonalHistory 
                  ? "Evolución de tu dinero en este activo" 
                  : "Evolución del precio del activo en el mercado"}
              </CardDescription>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowPersonalHistory(!showPersonalHistory)}
              className="border-white/20 hover:bg-white/10 text-white"
            >
              {showPersonalHistory ? "Ver Precio del Mercado" : "Ver Mi Historial"}
            </Button>
          </CardHeader>

          <CardContent className="pt-4 pb-8">
            <ResponsiveContainer width="100%" height={440}>
              <AreaChart data={currentData}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={lineColor} stopOpacity={0.35}/>
                    <stop offset="95%" stopColor={lineColor} stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#52525b" />
                <YAxis 
                  stroke="#52525b" 
                  tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#18181b', 
                    border: 'none', 
                    borderRadius: '14px',
                    color: '#e4e4e7'
                  }} 
                  formatter={(value: number) => [`$${value.toLocaleString()}`, showPersonalHistory ? 'Valor de tu posición' : 'Precio']}
                />
                <Area 
                  type="natural" 
                  dataKey={showPersonalHistory ? "value" : "price"} 
                  stroke={lineColor} 
                  strokeWidth={4} 
                  fill={`url(#${gradientId})`} 
                  dot={{ fill: lineColor, r: 5, stroke: '#18181b', strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}