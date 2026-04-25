"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { TrendingUp, TrendingDown, Wallet, PieChart as PieIcon, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import { LineChart, Line, PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ActivoPoseidoConPrecio, ResumenPortfolio, HistoricalDataGlobal } from "@/lib/types";



export default function Dashboard() {
  const [activos, setActivos] = useState<ActivoPoseidoConPrecio[]>([]);
  const [portfolio, setPortfolio] = useState<ResumenPortfolio | null>(null);
  const [divisa, setDivisa]           = useState('EUR')
  const [fechaInicio, setFechaInicio] = useState('2026-04-01')
  const [historicalData, setHistoricalData] = useState<HistoricalDataGlobal | null>(null);
  const [loading, setLoading] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [mensajePrecios, setMensajePrecios] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/activos').then(r => r.json()),
      fetch('/api/portfolio').then(r => r.json()),
      fetch(`/api/historicalData?divisa=${divisa}&fecha=${fechaInicio}`).then(r => r.json()),
    ]).then(([activosData, portfolioData, historicalData]) => {
      setActivos(Array.isArray(activosData) ? activosData : []);
      setPortfolio(portfolioData);
      setHistoricalData(Array.isArray(historicalData) ? historicalData : [])
      setLoading(false);
    }).catch(() => setLoading(false));
}, [refreshKey, divisa, fechaInicio])

  async function handleActualizarPrecios() {
    setActualizando(true);
    setMensajePrecios(null);
    try {
      const resp = await fetch('/api/precios', { method: 'POST' });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error ?? 'Error desconocido');
      setMensajePrecios({ tipo: 'ok', texto: `${data.actualizados} precio${data.actualizados !== 1 ? 's' : ''} actualizado${data.actualizados !== 1 ? 's' : ''}` });
      setRefreshKey(k => k + 1);
    } catch (e) {
      setMensajePrecios({ tipo: 'error', texto: (e as Error).message });
    } finally {
      setActualizando(false);
      setTimeout(() => setMensajePrecios(null), 4000);
    }
  }

  const tipoLabel: Record<string, string> = {
    cripto: 'Cripto', accion: 'Acción', etf: 'ETF', efectivo: 'Efectivo',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center">
        <p className="text-zinc-400 text-xl">Cargando cartera...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white pb-20">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-5xl font-bold tracking-tight">Tu cartera</h1>
            <p className="text-xl text-zinc-400 mt-3">Bienvenido de nuevo. Aquí tienes el resumen de tu patrimonio.</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {mensajePrecios && (
              <span className={`text-sm ${mensajePrecios.tipo === 'ok' ? 'text-emerald-400' : 'text-red-400'}`}>
                {mensajePrecios.texto}
              </span>
            )}
            <Button
              onClick={handleActualizarPrecios}
              disabled={actualizando}
              variant="outline"
              className="gap-2 border-white/10 bg-zinc-900 hover:bg-zinc-800"
            >
              <RefreshCw className={`w-4 h-4 ${actualizando ? 'animate-spin' : ''}`} />
              {actualizando ? 'Actualizando...' : 'Actualizar precios'}
            </Button>
          </div>
        </div>

        {/* Net Worth */}
        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-white/10 mb-12 shadow-2xl">
          <CardContent className="p-9">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
              <div>
                <p className="text-zinc-400 text-base tracking-wide">PATRIMONIO TOTAL</p>
                <h2 className="text-6xl font-bold tracking-tighter mt-3">
                  {(portfolio?.simboloDivisa)}{(portfolio?.patrimonio_total ?? 0).toLocaleString('es-ES')}
                </h2>
                {portfolio?.mejor_activo && (
                  <div className="flex items-center gap-3 mt-5 text-emerald-400">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-xl font-medium">
                      Mejor activo: {portfolio.mejor_activo.descripcion} ({portfolio.mejor_activo.rentabilidad_pct > 0 ? '+' : ''}{portfolio.mejor_activo.rentabilidad_pct}%)
                    </span>
                  </div>
                )}
              </div>
              <Wallet className="w-20 h-20 text-violet-400 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 mb-4">
          {/* Selector de divisa */}
          <select
            value={divisa}
            onChange={(e) => setDivisa(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
          >
            <option value="EUR">EUR €</option>
            <option value="USD">USD $</option>
            <option value="GBP">GBP ₤</option>
          </select>

          {/* Selector de fecha */}
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2"
          />
        </div>
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
                  <XAxis dataKey="day" stroke="#52525b" />
                  <YAxis stroke="#52525b" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px' }}
                    formatter={(value: number) => [`${value.toLocaleString()}`, 'Valor']}
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
              {portfolio && portfolio.distribucion.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPie>
                      <Pie
                        data={portfolio.distribucion}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={115}
                        dataKey="valor"
                      >
                        {portfolio.distribucion.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', color: '#111827', padding: '12px 16px' }}
                        formatter={(value: number) => [`${portfolio.simboloDivisa}${value.toLocaleString()}`, 'Valor']}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-x-10 gap-y-5 mt-10">
                    {portfolio.distribucion.map((item, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                        <div className="flex-1">
                          <p className="text-zinc-300">{item.nombre}</p>
                        </div>
                        <p className="font-semibold text-lg">{item.porcentaje}%</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-zinc-500 text-center py-20">Añade activos para ver la distribución</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="bg-zinc-900 border border-white/10 hover:border-white/20 transition-colors">
            <CardContent className="p-7">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-zinc-400 text-sm">Patrimonio Total</p>
                  <p className="text-4xl font-bold mt-4">
                    {(portfolio?.simboloDivisa)}{(portfolio?.patrimonio_total ?? 0).toLocaleString('es-ES')}
                  </p>
                </div>
                <Wallet className="w-10 h-10 text-violet-500/30" />
              </div>
              <p className="text-sm text-zinc-500 mt-6">{activos.length} activos en cartera</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border border-white/10 hover:border-white/20 transition-colors">
            <CardContent className="p-7">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-zinc-400 text-sm">Mejor Activo</p>
                  <p className="text-4xl font-bold mt-4">
                    {portfolio?.mejor_activo?.descripcion ?? '—'}
                  </p>
                  {portfolio?.mejor_activo && (
                    <p className={`mt-2 ${portfolio.mejor_activo.rentabilidad_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {portfolio.mejor_activo.rentabilidad_pct >= 0 ? '+' : ''}
                      {portfolio.mejor_activo.rentabilidad_pct}%
                    </p>
                  )}
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
                  <p className="text-4xl font-bold mt-4">
                    {(portfolio?.distribucion.length ?? 0) >= 3
                      ? 'Buena'
                      : (portfolio?.distribucion.length ?? 0) >= 1
                        ? 'Limitada'
                        : 'Sin datos'}
                  </p>
                </div>
                <PieIcon className="w-10 h-10 text-purple-500/30" />
              </div>
              <p className="text-sm text-zinc-500 mt-6">
                {portfolio?.distribucion.length ?? 0} tipos de activos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Investments Table */}
        <Card className="bg-zinc-900 border border-white/10">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl">Mis Inversiones</CardTitle>
          </CardHeader>
          <CardContent>
            {activos.length === 0 ? (
              <p className="text-zinc-500 text-center py-20">
                No tienes activos aún. Añade tu primera inversión.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-white/10 hover:bg-transparent">
                    <TableHead className="text-zinc-400 font-normal">Activo</TableHead>
                    <TableHead className="text-zinc-400 font-normal">Tipo</TableHead>
                    <TableHead className="text-right text-zinc-400 font-normal">Cantidad</TableHead>
                    <TableHead className="text-right text-zinc-400 font-normal">Precio Actual</TableHead>
                    <TableHead className="text-right text-zinc-400 font-normal">Rentabilidad</TableHead>
                    <TableHead className="text-right text-zinc-400 font-normal">Valor Total</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activos.map((pos) => {
                    const activo = pos.activos as any;
                    const tipo = activo?.tiposactivos?.descripcion ?? activo?.tipocodigo ?? '—';
                    const color = activo?.color ?? '#6366f1';
                    const descripcion = activo?.descripcion ?? String(pos.activocodigo);

                    return (
                      <TableRow key={pos.idrelacion} className="border-b border-white/10 hover:bg-zinc-800/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <div
                              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-medium text-lg"
                              style={{ backgroundColor: color }}
                            >
                              {descripcion.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-lg">{descripcion}</p>
                              <p className="text-sm text-zinc-500">#{pos.activocodigo}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 px-4 py-1">
                            {tipo}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium text-lg">{pos.cantidad.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-lg">
                          {(pos.simbolo_divisa)}{pos.precio_actual.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className={`flex items-center justify-end gap-1.5 text-lg ${pos.rentabilidad_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {pos.rentabilidad_pct >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                            <span>{Math.abs(pos.rentabilidad_pct)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-lg">
                          {(pos.simbolo_divisa)}{pos.valor_total.toLocaleString('es-ES')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="link" size="sm" asChild className="text-blue-400 hover:text-blue-300">
                            <Link href={`/dashboard/investments/${pos.activocodigo}`}>
                              Detalles →
                            </Link>
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
