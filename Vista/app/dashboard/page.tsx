// app/dashboard/page.tsx
"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { TrendingUp, TrendingDown, Wallet, PieChart as PieIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { LineChart, Line, PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Mock data (sin cambios)
const investments = [
  { id: "btc", name: "Bitcoin", symbol: "BTC", type: "Cripto", amount: 0.5, price: 65432.50, change: 5.23, total: 32716.25, color: "#F7931A" },
  { id: "eth", name: "Ethereum", symbol: "ETH", type: "Cripto", amount: 3.2, price: 3245.80, change: 3.45, total: 10386.56, color: "#627EEA" },
  { id: "aapl", name: "Apple Inc.", symbol: "AAPL", type: "Acción", amount: 25, price: 178.32, change: -1.24, total: 4458.00, color: "#000000" },
  { id: "tsla", name: "Tesla Inc.", symbol: "TSLA", type: "Acción", amount: 15, price: 245.67, change: 2.87, total: 3685.05, color: "#E82127" },
  { id: "spy", name: "S&P 500 ETF", symbol: "SPY", type: "ETF", amount: 50, price: 512.45, change: 0.89, total: 25622.50, color: "#1f77b4" },
  { id: "cash", name: "Efectivo USD", symbol: "USD", type: "Efectivo", amount: 15000, price: 1, change: 0, total: 15000, color: "#2ecc71" },
];

const totalNetWorth = investments.reduce((sum, inv) => sum + inv.total, 0);

const portfolioData = [
  { name: "Criptomonedas", value: 43102.81, percentage: 40.2, color: "#3b82f6" },
  { name: "Acciones", value: 8143.05, percentage: 7.6, color: "#8b5cf6" },
  { name: "ETFs", value: 39191.50, percentage: 36.5, color: "#10b981" },
  { name: "Efectivo", value: 15000, percentage: 14.0, color: "#f59e0b" },
];

const historicalData = [
  { month: 'Ene', value: 85000 },
  { month: 'Feb', value: 88500 },
  { month: 'Mar', value: 92000 },
  { month: 'Abr', value: 89500 },
  { month: 'May', value: 95000 },
  { month: 'Jun', value: 98000 },
  { month: 'Jul', value: 102000 },
  { month: 'Ago', value: 105437 },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white pb-20">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-5xl font-bold tracking-tight">Tu cartera</h1>
          <p className="text-xl text-zinc-400 mt-3">Bienvenido de nuevo. Aquí tienes el resumen de tu patrimonio.</p>
        </div>

        {/* Net Worth */}
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-white/10 mb-12 shadow-2xl">
          <CardContent className="p-9">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
              <div>
                <p className="text-zinc-400 text-base tracking-wide">PATRIMONIO TOTAL</p>
                <h2 className="text-6xl font-bold tracking-tighter mt-3">
                  ${totalNetWorth.toLocaleString('es-ES')}
                </h2>
                <div className="flex items-center gap-3 mt-5 text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-xl font-medium">+12.4% este mes</span>
                  <span className="text-emerald-500/70 text-lg">• +$11,637</span>
                </div>
              </div>
              <Wallet className="w-20 h-20 text-violet-400 flex-shrink-0" /> {/* Color púrpura como en la landing */}
            </div>
          </CardContent>
        </Card>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Historical Performance */}
          <Card className="bg-zinc-900 border border-white/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">Evolución del Patrimonio</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="month" stroke="#52525b" />
                  <YAxis stroke="#52525b" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px' }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Valor']}
                  />
                  <Line 
                    type="natural" 
                    dataKey="value" 
                    stroke="#60a5fa" 
                    strokeWidth={4} 
                    dot={{ fill: '#60a5fa', r: 5, stroke: '#18181b', strokeWidth: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Portfolio Distribution */}
          <Card className="bg-zinc-900 border border-white/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">Distribución de Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={portfolioData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={115}
                    dataKey="value"
                  >
                    {portfolioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      color: '#111827',
                      padding: '12px 16px',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }} 
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Valor']}
                    labelStyle={{ color: '#374151', fontWeight: '600' }}
                  />
                </RechartsPie>
              </ResponsiveContainer>

              <div className="grid grid-cols-2 gap-x-10 gap-y-5 mt-10">
                {portfolioData.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                    <div className="flex-1">
                      <p className="text-zinc-300">{item.name}</p>
                    </div>
                    <p className="font-semibold text-lg">{item.percentage}%</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="bg-zinc-900 border border-white/10 hover:border-white/20 transition-colors">
            <CardContent className="p-7">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-zinc-400 text-sm">Rendimiento (TWR)</p>
                  <p className="text-4xl font-bold mt-4 text-emerald-400">+18.5%</p>
                </div>
                <TrendingUp className="w-10 h-10 text-emerald-500/30" />
              </div>
              <p className="text-sm text-zinc-500 mt-6">Últimos 12 meses</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border border-white/10 hover:border-white/20 transition-colors">
            <CardContent className="p-7">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-zinc-400 text-sm">Mejor Activo</p>
                  <p className="text-4xl font-bold mt-4">BTC</p>
                  <p className="text-emerald-400 mt-2">+45.2% este año</p>
                </div>
                <ArrowUpRight className="w-10 h-10 text-emerald-500/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border border-white/10 hover:border-white/20 transition-colors">
            <CardContent className="p-7">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-zinc-400 text-sm">Diversificación</p>
                  <p className="text-4xl font-bold mt-4">Buena</p>
                </div>
                <PieIcon className="w-10 h-10 text-purple-500/30" />
              </div>
              <p className="text-sm text-zinc-500 mt-6">7 activos diferentes</p>
            </CardContent>
          </Card>
        </div>

        {/* Investments Table */}
        <Card className="bg-zinc-900 border border-white/10">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl">Mis Inversiones</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-b border-white/10 hover:bg-transparent">
                  <TableHead className="text-zinc-400 font-normal">Activo</TableHead>
                  <TableHead className="text-zinc-400 font-normal">Tipo</TableHead>
                  <TableHead className="text-right text-zinc-400 font-normal">Cantidad</TableHead>
                  <TableHead className="text-right text-zinc-400 font-normal">Precio</TableHead>
                  <TableHead className="text-right text-zinc-400 font-normal">Cambio 24h</TableHead>
                  <TableHead className="text-right text-zinc-400 font-normal">Valor Total</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investments.map((investment) => (
                  <TableRow key={investment.id} className="border-b border-white/10 hover:bg-zinc-800/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-medium text-lg"
                          style={{ backgroundColor: investment.color }}
                        >
                          {investment.symbol.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-lg">{investment.name}</p>
                          <p className="text-sm text-zinc-500">{investment.symbol}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 px-4 py-1">{investment.type}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-lg">{investment.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-lg">
                      ${investment.price.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className={`flex items-center justify-end gap-1.5 text-lg ${investment.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {investment.change >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                        <span>{Math.abs(investment.change)}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-lg">
                      ${investment.total.toLocaleString('es-ES')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="link" size="sm" asChild className="text-blue-400 hover:text-blue-300">
                        <Link href={`/dashboard/investments/${investment.id}`}>
                          Detalles →
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}