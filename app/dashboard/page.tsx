"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { TrendingUp, TrendingDown, Wallet, PieChart as PieIcon, ArrowUpRight, ArrowDownRight, RefreshCw, Sparkles } from "lucide-react";
import { LineChart, Line, PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { RecomendacionesWidget } from "@/components/RecomendacionesWidget";

import type { ActivoPoseidoConPrecio, ResumenPortfolio, Activo, HistoricalDataGlobal } from "@/lib/types";


export default function Dashboard() {

  const [activos, setActivos] = useState<ActivoPoseidoConPrecio[]>([]);
  const [portfolio, setPortfolio] = useState<ResumenPortfolio | null>(null);
  const [fechaInicio, setFechaInicio] = useState('2026-04-01')
  const [historicalData, setHistoricalData] = useState<HistoricalDataGlobal[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingChart, setLoadingChart] = useState(false);
  const [actualizando, setActualizando] = useState(false);
  const [mensajePrecios, setMensajePrecios] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Estados para el modal de añadir inversión
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [openSearch, setOpenSearch] = useState(false); // Controla el desplegable de búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedActivoId, setSelectedActivoId] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [precioCompra, setPrecioCompra] = useState("0"); // Default 0
  const [fechaCompra, setFechaCompra] = useState(new Date().toISOString().split('T')[0]); // Default hoy (YYYY-MM-DD)
  const [adding, setAdding] = useState(false);
  const [catalogo, setCatalogo] = useState<Activo[]>([]);

  // Helper para encontrar el símbolo de la divisa del activo seleccionado
  const activoSeleccionado = catalogo.find(a => a.codigo.toString() === selectedActivoId);

  // Carga principal: portfolio, activos y catálogo. Solo se recarga con refreshKey.
  useEffect(() => {
    setLoading(true);
    fetch('/api/portfolio')
      .then(r => r.json())
      .then(portfolioData => {
        setPortfolio(portfolioData);
        return Promise.all([
          fetch('/api/activos').then(r => r.json()),
          fetch('/api/catalogo').then(r => r.json()),
        ]);
      })
      .then(([activosData, catalogoData]) => {
        if (Array.isArray(activosData)) {
          const activosAgrupados = activosData.reduce((acc: any[], curr) => {
            const precioMercado = curr.precio_actual || curr.precio_compra || 0;
            const existente = acc.find(item => item.activocodigo === curr.activocodigo);
            if (existente) {
              existente.cantidad += curr.cantidad;
              existente.coste_total_acumulado += (curr.cantidad * curr.precio_compra);
              existente.valor_total = existente.cantidad * precioMercado;
              const precioMedioCompra = existente.coste_total_acumulado / existente.cantidad;
              existente.precio_promedio_compra = precioMedioCompra;
              existente.rentabilidad_pct = precioMedioCompra > 0
                ? ((precioMercado - precioMedioCompra) / precioMedioCompra) * 100
                : 0;
            } else {
              acc.push({
                ...curr,
                id: curr.activocodigo,
                precio_actual: precioMercado,
                valor_total: curr.cantidad * precioMercado,
                precio_promedio_compra: curr.precio_compra,
                rentabilidad_pct: curr.precio_compra > 0
                  ? ((precioMercado - curr.precio_compra) / curr.precio_compra) * 100
                  : 0,
                coste_total_acumulado: curr.cantidad * curr.precio_compra,
                simboloDivisa: curr.activos?.divisas?.simbolo_divisa,
              });
            }
            return acc;
          }, []);
          setActivos(activosAgrupados);
        } else {
          setActivos([]);
        }
        setCatalogo(Array.isArray(catalogoData) ? catalogoData : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [refreshKey]);

  // Carga del gráfico: solo se recarga cuando cambia la fecha o la divisa del perfil.
  useEffect(() => {
    const divisaUsuario = portfolio?.divisaFinal ?? 'EUR';
    setLoadingChart(true);
    fetch(`/api/historicalData?divisa=${divisaUsuario}&fecha=${fechaInicio}`)
      .then(r => r.json())
      .then(data => setHistoricalData(Array.isArray(data) ? data : []))
      .catch(() => setHistoricalData([]))
      .finally(() => setLoadingChart(false));
  }, [fechaInicio, portfolio?.divisaFinal]);

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

  const esEfectivo = activoSeleccionado?.tipocodigo === 'EFECTIVO'

  async function handleAddInversion() {
    const numCantidad = parseFloat(cantidad);
    const hoyString = new Date().toISOString().split('T')[0];

    if (fechaCompra > hoyString && !esEfectivo) {
      alert("La fecha de compra no puede ser una fecha futura.");
      return;
    }

    if (!selectedActivoId || isNaN(numCantidad) || numCantidad <= 0) {
      alert("Por favor selecciona un activo y un valor válido (mayor a 0)");
      return;
    }

    // Para EFECTIVO: precio_compra = 1 (el saldo es la cantidad)
    const numPrecio = esEfectivo ? 1 : parseFloat(precioCompra);

    setAdding(true);
    try {
      const res = await fetch('/api/activos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activocodigo: selectedActivoId,
          cantidad: numCantidad,
          precio_compra: numPrecio,
          fechainicio: esEfectivo ? hoyString : fechaCompra,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al añadir la inversión");
      }

      // Éxito
      setIsAddModalOpen(false);

      // Reset de campos
      setSelectedActivoId("");
      setCantidad("");
      setPrecioCompra("0");
      setFechaCompra(new Date().toISOString().split('T')[0]);

      // Refrescar los datos de la interfaz
      setRefreshKey(k => k + 1);

    } catch (error) {
      alert("Error al añadir la inversión: " + (error as Error).message);
    } finally {
      setAdding(false);
    }
  }

  const tipoLabel: Record<string, string> = {
    cripto: 'Cripto', accion: 'Acción', etf: 'ETF', efectivo: 'Efectivo',
  };

  if (loading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <p className="text-zinc-400 text-xl">Cargando cartera...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white pb-20">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-5xl font-bold tracking-tight">Tu cartera</h1>
            <p className="text-xl text-zinc-400 mt-3">Bienvenido de nuevo. Aquí tienes el resumen de tu patrimonio.</p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {mensajePrecios && (
              <span className={`text-sm ${mensajePrecios.tipo === 'ok' ? 'text-emerald-400' : 'text-red-400'}`}>
                {mensajePrecios.texto}
              </span>
            )}

            <Button
              asChild
              variant="outline"
              className="gap-2 border-violet-500/30 bg-violet-950/20 hover:bg-violet-900/40 text-violet-300"
            >
              <Link href="/dashboard/simulacion">
                <Sparkles className="w-4 h-4" />
                Simular cartera
              </Link>
            </Button>
            <Button
              onClick={handleActualizarPrecios}
              disabled={actualizando}
              variant="outline"
              className="gap-2 border-white/10 bg-zinc-900 hover:bg-zinc-800 h-11 px-6 text-base font-medium"
            >
              <RefreshCw className={`w-5 h-5 ${actualizando ? 'animate-spin' : ''}`} />
              {actualizando ? 'Actualizando...' : 'Actualizar cartera'}
            </Button>
          </div>
        </div>

        {/* Recomendaciones (UC14) */}
        <RecomendacionesWidget refreshKey={refreshKey} />

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
              <Wallet className="w-20 h-20 text-violet-400 shrink-0" />
            </div>
          </CardContent>
        </Card>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Historical Performance */}
          <Card className="bg-zinc-900 border border-white/10">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-3">
                <CardTitle className="text-2xl">Evolución del Patrimonio</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Presets rápidos */}
                  {[
                    { label: '1M', days: 30 },
                    { label: '3M', days: 90 },
                    { label: '6M', days: 180 },
                    { label: '1A', days: 365 },
                    { label: '5A', days: 365 * 5 },
                  ].map(({ label, days }) => {
                    const fecha = new Date();
                    fecha.setDate(fecha.getDate() - days);
                    const valor = fecha.toISOString().split('T')[0];
                    return (
                      <button
                        key={label}
                        onClick={() => setFechaInicio(valor)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          fechaInicio === valor
                            ? 'bg-violet-600 text-white'
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                  {/* Selector de fecha personalizada */}
                  <div className="flex items-center gap-1.5 ml-1">
                    <span className="text-xs text-zinc-500">Desde</span>
                    <Input
                      type="date"
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                      className="w-36 h-7 text-xs bg-zinc-800 border-zinc-700 text-white scheme-dark px-2"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingChart ? (
                <div className="flex items-center justify-center h-75 text-zinc-500 text-sm gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Cargando gráfico...
                </div>
              ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={historicalData ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="day"
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
                    }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke="#52525b"
                    domain={[
                      (dataMin: number) => Math.floor(dataMin * 0.98),
                      (dataMax: number) => Math.ceil(dataMax * 1.02),
                    ]}
                    tickFormatter={(v: number) =>
                      v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M`
                      : v >= 1_000 ? `${(v / 1_000).toFixed(0)}k`
                      : String(v)
                    }
                    width={55}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '12px' }}
                    formatter={(value: number) => [`${value.toLocaleString()}`, 'Valor']}
                  />
                  <Line
                    type="linear"
                    dataKey="value"
                    stroke="#60a5fa"
                    strokeWidth={4}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Portfolio Distribution */}
          <Card className="bg-zinc-900 border border-white/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">Distribución de Activos</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                // Paleta de colores distintos para cuando los activos no tienen color propio
                const PALETTE = [
                  '#6366f1','#8b5cf6','#ec4899','#f43f5e','#f97316',
                  '#eab308','#22c55e','#14b8a6','#06b6d4','#3b82f6',
                  '#a855f7','#fb7185','#fb923c','#facc15','#4ade80',
                  '#2dd4bf','#38bdf8','#818cf8','#c084fc','#f9a8d4',
                ]
                const total = portfolio?.patrimonio_total ?? 0
                const items = activos
                  .filter(a => (a.valor_total ?? 0) > 0)
                  .sort((a, b) => (b.valor_total ?? 0) - (a.valor_total ?? 0))
                  .map((a, i) => {
                    const activo = a.activos as any
                    const color = activo?.color ?? PALETTE[i % PALETTE.length]
                    const nombre = activo?.descripcion ?? String(a.activocodigo)
                    const ticker = activo?.simbolo as string | null
                    const valor = Math.round((a.valor_total ?? 0) * 100) / 100
                    const pct = total > 0 ? Math.round((valor / total) * 1000) / 10 : 0
                    return { nombre, ticker, valor, pct, color }
                  })

                if (items.length === 0) {
                  return <p className="text-zinc-500 text-center py-20">Añade activos para ver la distribución</p>
                }

                return (
                  <>
                    <ResponsiveContainer width="100%" height={260}>
                      <RechartsPie>
                        <Pie
                          data={items}
                          cx="50%"
                          cy="50%"
                          innerRadius={75}
                          outerRadius={115}
                          dataKey="valor"
                          strokeWidth={0}
                        >
                          {items.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null
                            const d = payload[0].payload
                            return (
                              <div style={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '10px 14px' }}>
                                <p style={{ color: '#fff', fontWeight: 600, fontSize: 13, margin: 0 }}>
                                  {d.nombre}{d.ticker ? ` (${d.ticker})` : ''}
                                </p>
                                <p style={{ color: '#a1a1aa', fontSize: 13, margin: '4px 0 0' }}>
                                  {portfolio?.simboloDivisa}{Number(d.valor).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                                </p>
                                <p style={{ color: '#71717a', fontSize: 11, margin: '2px 0 0' }}>
                                  {d.pct}% del total
                                </p>
                              </div>
                            )
                          }}
                        />
                      </RechartsPie>
                    </ResponsiveContainer>

                    <div className="space-y-2 mt-4 max-h-44 overflow-y-auto pr-1">
                      {items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-sm text-zinc-300 flex-1 truncate">
                            {item.nombre}
                            {item.ticker && <span className="text-zinc-500 ml-1 text-xs">({item.ticker})</span>}
                          </span>
                          <span className="text-sm font-semibold text-white tabular-nums">{item.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                )
              })()}
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
          <CardHeader className="pb-6 flex flex-row items-center justify-between">
            <CardTitle className="text-2xl">Mis Inversiones</CardTitle>

            {/* Botón Añadir Inversión - Movido aquí y más grande */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button variant="cta" className="gap-2 h-11 px-6 text-base">
                  <Plus className="w-5 h-5" />
                  Añadir Inversión
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 border-white/10 text-white sm:max-w-106.25">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Añadir Nueva Inversión</DialogTitle>
                  <DialogDescription className="sr-only">
                    Formulario para añadir una nueva posición a tu cartera
                  </DialogDescription>
                </DialogHeader>
                {/* Formulario */}
                <div className="space-y-5 py-4">
                  {/* Campo: Activo */}
                  <div className="space-y-2">
                    <Label htmlFor="activo">Activo</Label>
                    <div className="relative">
                      <Input
                        placeholder="Buscar activo..."
                        value={openSearch
                          ? searchTerm
                          : (catalogo.find(a => a.codigo.toString() === selectedActivoId)?.descripcion || "")
                        }
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setOpenSearch(true);
                        }}
                        onFocus={() => setOpenSearch(true)}
                        onBlur={() => setTimeout(() => setOpenSearch(false), 150)}
                        className="bg-zinc-950 border-white/10 text-white placeholder:text-zinc-500 h-11 pr-10 focus-visible:ring-violet-500 cursor-text"
                      />
                      <Search className="absolute right-3 top-3 h-5 w-5 text-zinc-500 pointer-events-none" />

                      {openSearch && (
                        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-zinc-900 border border-white/10 rounded-md shadow-2xl overflow-y-auto py-1" style={{ maxHeight: 260 }}>
                          {catalogo.filter(a =>
                            searchTerm === "" ||
                            a.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            a.simbolo?.toLowerCase().includes(searchTerm.toLowerCase())
                          ).length === 0 ? (
                            <div className="py-6 text-center text-xs text-zinc-500">
                              No se encontraron activos.
                            </div>
                          ) : (
                            catalogo
                              .filter(a =>
                                searchTerm === "" ||
                                a.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                a.simbolo?.toLowerCase().includes(searchTerm.toLowerCase())
                              )
                              .map((activo) => (
                                <div
                                  key={activo.codigo}
                                  onMouseDown={(e) => {
                                    e.preventDefault(); // evita que onBlur cierre antes del click
                                    setSelectedActivoId(activo.codigo.toString());
                                    setSearchTerm("");
                                    setOpenSearch(false);
                                  }}
                                  className={cn(
                                    "flex items-center justify-between py-3 px-4 cursor-pointer transition-colors border-b border-white/5 last:border-none hover:bg-white/5",
                                    selectedActivoId === activo.codigo.toString() ? "bg-white/10" : ""
                                  )}
                                >
                                  <div className="flex flex-col gap-0.5">
                                    <span className="font-semibold text-sm leading-tight text-white">
                                      {activo.descripcion}
                                    </span>
                                    {activo.simbolo && (
                                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                                        {activo.simbolo}
                                      </span>
                                    )}
                                  </div>
                                  {selectedActivoId === activo.codigo.toString() && (
                                    <Check className="h-4 w-4 text-violet-400" />
                                  )}
                                </div>
                              ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Campo: Cantidad / Saldo */}
                  <div className="space-y-2">
                    <Label htmlFor="cantidad">
                      {esEfectivo ? `Saldo (${activoSeleccionado?.divisacodigo ?? ''})` : 'Cantidad'}
                    </Label>
                    <Input
                      id="cantidad"
                      type="number"
                      step="any"
                      min="0"
                      value={cantidad}
                      onChange={(e) => setCantidad(e.target.value)}
                      placeholder={esEfectivo ? "10 000" : "0.00"}
                      className="bg-zinc-950 border-white/10 placeholder:text-zinc-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    {esEfectivo && (
                      <p className="text-[10px] text-zinc-500 italic">
                        Introduce el saldo total de la cuenta.
                      </p>
                    )}
                  </div>

                  {/* Campo: Precio de Compra — oculto para EFECTIVO */}
                  {!esEfectivo && (
                    <div className="space-y-2">
                      <Label htmlFor="precio">Precio de Compra (Opcional)</Label>
                      <div className="relative">
                        <Input
                          id="precio"
                          type="number"
                          step="any"
                          min="0"
                          value={precioCompra}
                          onChange={(e) => setPrecioCompra(e.target.value)}
                          placeholder="0.00"
                          className="bg-zinc-950 border-white/10 pr-16 placeholder:text-zinc-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        {activoSeleccionado && (
                          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <span className="text-zinc-500 text-sm font-medium">
                              {activoSeleccionado.divisacodigo}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-500 italic">Dejar en 0 si se desconoce.</p>
                    </div>
                  )}

                  {/* Campo: Fecha de Compra — oculto para EFECTIVO */}
                  {!esEfectivo && (
                    <div className="space-y-2">
                      <Label htmlFor="fecha">Fecha de Compra</Label>
                      <Input
                        id="fecha"
                        type="date"
                        value={fechaCompra}
                        onChange={(e) => setFechaCompra(e.target.value)}
                        className="bg-zinc-950 border-white/10 text-white scheme-dark"
                      />
                    </div>
                  )}

                  {/* Botones de acción */}
                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleAddInversion} disabled={adding} variant="cta" className="flex-1">
                      {adding ? "Añadiendo..." : "Confirmar Inversión"}
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="flex-1 border-white/10 hover:bg-zinc-800">
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
                    <TableHead className="text-right text-zinc-400 font-normal">Precio Compra</TableHead>
                    <TableHead className="text-right text-zinc-400 font-normal">Precio Actual</TableHead>
                    <TableHead className="text-right text-zinc-400 font-normal">Rentabilidad</TableHead>
                    <TableHead className="text-right text-zinc-400 font-normal">Valor Total</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activos.map((pos) => {
                    // Extraemos la información del activo (ahora agrupado)
                    const activo = pos.activos as any;
                    const tipo = activo?.tiposactivos?.descripcion ?? activo?.tipocodigo ?? '—';
                    const color = activo?.color ?? '#6366f1';
                    const descripcion = activo?.descripcion ?? String(pos.activocodigo);
                    const ticker = activo?.simbolo;

                    return (
                      <TableRow key={pos.activocodigo} className="border-b border-white/10 hover:bg-zinc-800/50 transition-colors">
                        {/* Columna: Identificación del Activo */}
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
                              {ticker && <p className="text-sm text-zinc-500">({ticker})</p>}
                            </div>
                          </div>
                        </TableCell>

                        {/* Columna: Badge de Tipo */}
                        <TableCell>
                          <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 px-4 py-1">
                            {tipo}
                          </Badge>
                        </TableCell>

                        {/* Columna: Cantidad (Sumada en el reduce) */}
                        <TableCell className="text-right font-medium text-lg">
                          {pos.cantidad.toLocaleString()}
                        </TableCell>

                        {/* Columna: Precio Promedio de Compra (ponderado por cantidad) */}
                        <TableCell className="text-right text-zinc-400 text-lg">
                          {(pos.precio_promedio_compra ?? 0) > 0
                            ? `${portfolio?.simboloDivisa ?? ''}${pos.precio_promedio_compra!.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : '—'}
                        </TableCell>

                        {/* Columna: Precio Actual */}
                        <TableCell className="text-right text-lg">
                           {portfolio?.simboloDivisa}{pos.precio_actual.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                        </TableCell>

                        {/* Columna: Rentabilidad (Calculada ponderada en el reduce) */}
                        <TableCell className="text-right">
                          <div className={`flex items-center justify-end gap-1.5 text-lg ${pos.rentabilidad_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {pos.rentabilidad_pct >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                            {/* Limitamos los decimales a 2 */}
                            <span>{Math.abs(pos.rentabilidad_pct).toFixed(2)}%</span>
                          </div>
                        </TableCell>

                        {/* Columna: Valor Total (Sumado en el reduce) */}
                        <TableCell className="text-right font-semibold text-lg">
                           {portfolio?.simboloDivisa}{pos.valor_total.toLocaleString('es-ES')}
                        </TableCell>

                        {/* Columna: Acciones */}
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
    </div >
  );
}