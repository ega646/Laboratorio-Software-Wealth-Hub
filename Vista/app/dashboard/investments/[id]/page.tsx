// app/(dashboard)/investments/[id]/page.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Header } from "@/components/Header";
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Activity, Calendar, Percent } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

const priceHistory = [
  { date: '1 Mar', price: 58420 }, { date: '3 Mar', price: 59100 },
  { date: '5 Mar', price: 60200 }, { date: '7 Mar', price: 59800 },
  { date: '9 Mar', price: 61500 }, { date: '11 Mar', price: 62800 },
  { date: '13 Mar', price: 61900 }, { date: '15 Mar', price: 63400 },
  { date: '17 Mar', price: 64100 }, { date: '19 Mar', price: 63800 },
  { date: '21 Mar', price: 65200 }, { date: '23 Mar', price: 66100 },
  { date: '25 Mar', price: 64900 }, { date: '27 Mar', price: 65800 },
  { date: '29 Mar', price: 65432.50 },
];

export default function DetallesInversion() {
  const params = useParams();
  const id = params.id as string;
  const investment = investmentDetails[id] || investmentDetails.btc;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button - Más grande y destacado */}
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-14">
          <Card className="bg-zinc-900/70 border border-white/5 hover:border-white/10 transition-colors">
            <CardContent className="p-9">
              <div className="flex items-center gap-4 text-zinc-500 mb-5">
                <DollarSign className="w-6 h-6" />
                Cantidad Poseída
              </div>
              <p className="text-4xl font-semibold text-white">
                {investment.amount} <span className="text-2xl text-zinc-500">{investment.symbol}</span>
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/70 border border-white/5 hover:border-white/10 transition-colors">
            <CardContent className="p-9">
              <div className="flex items-center gap-4 text-zinc-500 mb-5">
                <Activity className="w-6 h-6" />
                Valor Total Actual
              </div>
              <p className="text-4xl font-semibold text-white">
                ${investment.totalValue.toLocaleString('es-ES')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/70 border border-white/5 hover:border-white/10 transition-colors">
            <CardContent className="p-9">
              <div className="flex items-center gap-4 text-zinc-500 mb-5">
                <Calendar className="w-6 h-6" />
                Precio Promedio de Compra
              </div>
              <p className="text-4xl font-semibold text-white">
                ${investment.avgBuyPrice.toLocaleString('es-ES')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/70 border border-white/5 hover:border-white/10 transition-colors">
            <CardContent className="p-9">
              <div className="flex items-center gap-4 text-zinc-500 mb-5">
                <Percent className="w-6 h-6" />
                Ganancia / Pérdida
              </div>
              <p className={`text-4xl font-semibold ${investment.profitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {investment.profitLoss >= 0 ? '+' : ''}${investment.profitLoss.toLocaleString('es-ES')}
              </p>
              <p className={`text-xl mt-2 ${investment.profitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                ({investment.profitLossPercent}%)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Price History Chart */}
        <Card className="bg-zinc-900/70 border border-white/5">
          <CardHeader className="pb-8">
            <CardTitle className="text-3xl">Historial de Precios</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-8">
            <ResponsiveContainer width="100%" height={440}>
              <AreaChart data={priceHistory}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.02}/>
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