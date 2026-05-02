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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import type { ActivoPoseidoConPrecio, ResumenPortfolio, Activo, HistoricalDataGlobal } from "@/lib/types";



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

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/activos').then(r => r.json()),
      fetch('/api/portfolio').then(r => r.json()),
      fetch(`/api/historicalData?divisa=${divisa}&fecha=${fechaInicio}`).then(r => r.json()),
      fetch('/api/catalogo').then(r => r.json()), // Aquí asumimos que catalogo tiene el precio actual
    ]).then(([activosData, portfolioData, historicalData, catalogoData]) => {

      if (Array.isArray(activosData)) {
        const activosAgrupados = activosData.reduce((acc: any[], curr) => {
          // 1. Buscamos el precio actual en el catálogo para este activo
          const infoCatalogo = catalogoData.find((c: any) => c.codigo === curr.activocodigo);
          const precioMercado = infoCatalogo?.precio_actual || curr.precio_compra || 0;

          const existente = acc.find(item => item.activocodigo === curr.activocodigo);

          if (existente) {
            // Actualizamos acumulados
            existente.cantidad += curr.cantidad;
            existente.coste_total_acumulado += (curr.cantidad * curr.precio_compra);

            // El valor total es siempre Cantidad Total * Precio Mercado Actual
            existente.valor_total = existente.cantidad * precioMercado;

            // Precio Medio de Compra para calcular la rentabilidad total
            const precioMedioCompra = existente.coste_total_acumulado / existente.cantidad;
            existente.rentabilidad_pct = precioMedioCompra > 0
              ? ((precioMercado - precioMedioCompra) / precioMedioCompra) * 100
              : 0;
          } else {
            // Primera vez que vemos este activo en el bucle
            const valorTotalActual = curr.cantidad * precioMercado;
            const simboloDeDivisa = curr.activos?.divisas?.simbolo_divisa;
            const rentabilidadInicial = curr.precio_compra > 0
              ? ((precioMercado - curr.precio_compra) / curr.precio_compra) * 100
              : 0;

            acc.push({
              ...curr,
              // Aseguramos que el ID que usemos sea el del código del activo para evitar conflictos
              id: curr.activocodigo,
              precio_actual: precioMercado,
              valor_total: valorTotalActual,
              rentabilidad_pct: rentabilidadInicial,
              coste_total_acumulado: curr.cantidad * curr.precio_compra,
              simboloDivisa: simboloDeDivisa
            });
          }
          return acc;
        }, []);

        setActivos(activosAgrupados);
      } else {
        setActivos([]);
      }

      setPortfolio(portfolioData);
      setHistoricalData(Array.isArray(historicalData) ? historicalData : [])
      setCatalogo(Array.isArray(catalogoData) ? catalogoData : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [refreshKey,divisa,fechaInicio]);

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

  async function handleAddInversion() {
    const numCantidad = parseFloat(cantidad);
    const numPrecio = parseFloat(precioCompra);

    const hoyString = new Date().toISOString().split('T')[0]; // "2024-05-20" (ejemplo)

    // Si la cadena de la fecha elegida es mayor a la de hoy, es el futuro
    if (fechaCompra > hoyString) {
      alert("La fecha de compra no puede ser una fecha futura.");
      return;
    }

    if (!selectedActivoId || isNaN(numCantidad) || numCantidad <= 0) {
      alert("Por favor selecciona un activo y una cantidad válida (mayor a 0)");
      return;
    }

    setAdding(true);
    try {
      const res = await fetch('/api/activos', { // <--- Endpoint correcto
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activocodigo: selectedActivoId,
          cantidad: numCantidad,
          precio_compra: numPrecio,
          fechainicio: fechaCompra, // <--- Nombre de campo correcto según tu DB/Route
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
              className="gap-2 border-white/10 bg-zinc-900 hover:bg-zinc-800 h-11 px-6 text-base font-medium"
            >
              <RefreshCw className={`w-5 h-5 ${actualizando ? 'animate-spin' : ''}`} />
              {actualizando ? 'Actualizando...' : 'Actualizar cartera'}
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
                        formatter={(value: number) => [`${(portfolio?.simboloDivisa)}${value.toLocaleString()}`, 'Valor']}
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
          <CardHeader className="pb-6 flex flex-row items-center justify-between">
            <CardTitle className="text-2xl">Mis Inversiones</CardTitle>

            {/* Botón Añadir Inversión - Movido aquí y más grande */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-white text-black hover:bg-zinc-200 h-11 px-6 text-base font-medium">
                  <Plus className="w-5 h-5" />
                  Añadir Inversión
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 border-white/10 text-white sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Añadir Nueva Inversión</DialogTitle>
                </DialogHeader>
                {/* Formulario */}
                <div className="space-y-5 py-4">
                  {/* Campo: Activo */}
                  <div className="space-y-2">
                    <Label htmlFor="activo">Activo</Label>
                    <Popover open={openSearch} onOpenChange={(open) => {
                      setOpenSearch(open);
                      if (!open) setSearchTerm("");
                    }}>
                      <PopoverTrigger asChild>
                        <div className="relative">
                          <Input
                            placeholder="Buscar activo..."
                            // CAMBIO AQUÍ: Solo mostramos el activo seleccionado si NO hay un término de búsqueda
                            // Y el menú está cerrado. Si el menú está abierto, respetamos lo que el usuario escriba (o borre).
                            value={openSearch
                              ? searchTerm
                              : (catalogo.find(a => a.codigo.toString() === selectedActivoId)?.descripcion || "")
                            }
                            onChange={(e) => {
                              setSearchTerm(e.target.value);
                              if (!openSearch) setOpenSearch(true);
                            }}
                            // Añadimos esto para que al hacer clic se limpie visualmente y deje buscar
                            onFocus={() => {
                              if (selectedActivoId) {
                              }
                            }}
                            className="bg-zinc-950 border-white/10 text-white placeholder:text-zinc-500 h-11 pr-10 focus-visible:ring-violet-500 cursor-text"
                          />
                          <Search className="absolute right-3 top-3 h-5 w-5 text-zinc-500 pointer-events-none" />
                        </div>
                      </PopoverTrigger>

                      <PopoverContent
                        className="w-[var(--radix-popover-trigger-width)] p-0 bg-white border-none shadow-2xl"
                        align="start"
                        // Esto es CLAVE: Evita que el Popover atrape el foco y bloquee el scroll
                        onOpenAutoFocus={(e) => e.preventDefault()}
                      >
                        {/* Usamos un div normal con scroll en lugar de <Command> para evitar bloqueos de eventos */}
                        <div className="max-h-[280px] overflow-y-auto overflow-x-hidden py-1">
                          {catalogo
                            .filter(activo =>
                              searchTerm === "" ||
                              activo.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              activo.simbolo?.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .length === 0 ? (
                            <div className="py-6 text-center text-xs text-zinc-500">
                              No se encontraron activos.
                            </div>
                          ) : (
                            catalogo
                              .filter(activo =>
                                searchTerm === "" ||
                                activo.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                activo.simbolo?.toLowerCase().includes(searchTerm.toLowerCase())
                              )
                              .map((activo) => (
                                <div
                                  key={activo.codigo}
                                  onClick={() => {
                                    setSelectedActivoId(activo.codigo.toString());
                                    setSearchTerm("");
                                    setOpenSearch(false);
                                  }}
                                  className={cn(
                                    "flex items-center justify-between py-3 px-4 cursor-pointer transition-colors border-b border-zinc-100 last:border-none hover:bg-zinc-50",
                                    selectedActivoId === activo.codigo.toString() ? "bg-zinc-50" : ""
                                  )}
                                >
                                  <div className="flex flex-col gap-0.5">
                                    <span className="font-semibold text-sm leading-tight text-zinc-900">
                                      {activo.descripcion}
                                    </span>
                                    {activo.simbolo && (
                                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                                        {activo.simbolo}
                                      </span>
                                    )}
                                  </div>
                                  {selectedActivoId === activo.codigo.toString() && (
                                    <Check className="h-4 w-4 text-violet-600" />
                                  )}
                                </div>
                              ))
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Campo: Cantidad */}
                  <div className="space-y-2">
                    <Label htmlFor="cantidad">Cantidad</Label>
                    <Input
                      id="cantidad"
                      type="number"
                      step="any"
                      min="0"
                      value={cantidad}
                      onChange={(e) => setCantidad(e.target.value)}
                      placeholder="Ej: 1.5"
                      className="bg-zinc-950 border-white/10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>

                  {/* Campo: Precio de Compra con Indicador de Divisa */}
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
                        className="bg-zinc-950 border-white/10 pr-16"
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

                  {/* Campo: Fecha de Compra */}
                  <div className="space-y-2">
                    <Label htmlFor="fecha">Fecha de Compra</Label>
                    <Input
                      id="fecha"
                      type="date"
                      value={fechaCompra}
                      onChange={(e) => setFechaCompra(e.target.value)}
                      className="bg-zinc-950 border-white/10 color-scheme-dark"
                    />
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleAddInversion} disabled={adding} className="flex-1 bg-white text-black hover:bg-zinc-200">
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
                    const simboloDivisa = activo?.simboloDivisa;

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
                              <p className="text-sm text-zinc-500">#{pos.activocodigo}</p>
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

                        {/* Columna: Precio Actual */}
                        <TableCell className="text-right text-lg">
                           {(pos.simboloDivisa)}{pos.precio_actual.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
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
                           {(pos.simboloDivisa)}{pos.valor_total.toLocaleString('es-ES')}
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