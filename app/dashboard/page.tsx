"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { TrendingUp, Wallet, Trash2, PieChart as PieIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { LineChart, Line, PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ActivoPoseidoConPrecio, ResumenPortfolio, HistoricalDataGlobal } from "@/lib/types";
import { createClient } from "@/lib/supabase/client"; 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import type { ActivoPoseidoConPrecio, ResumenPortfolio, Activo } from "@/lib/types";

export default function Dashboard() {
  const [activos, setActivos] = useState<ActivoPoseidoConPrecio[]>([]);
  const [portfolio, setPortfolio] = useState<ResumenPortfolio | null>(null);
  const [userName, setUserName] = useState<string>("Usuario");
  const [divisa, setDivisa]           = useState('EUR')
  const [fechaInicio, setFechaInicio] = useState('2026-04-01')
  const [historicalData, setHistoricalData] = useState<HistoricalDataGlobal | null>(null);
  const [loading, setLoading] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [mensajePrecios, setMensajePrecios] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
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
      const name = user.user_metadata?.full_name || user.email?.split('@')[0] || "Inversor";
      setUserName(name);
      fetch(`/api/historicalData?divisa=${divisa}&fecha=${fechaInicio}`).then(r => r.json()),
    ]).then(([activosData, portfolioData, historicalData]) => {
    }

    try {
      const [activosRes, portfolioRes] = await Promise.all([
        fetch(`/api/activos?t=${Date.now()}`),
        fetch(`/api/portfolio?t=${Date.now()}`)
      ]);
      
      const activosData = await activosRes.json();
      const portfolioData = await portfolioRes.json();

      fetch('/api/catalogo').then(r => r.json()), // Aquí asumimos que catalogo tiene el precio actual
    ]).then(([activosData, portfolioData, catalogoData]) => {

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
              coste_total_acumulado: curr.cantidad * curr.precio_compra
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
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
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

  useEffect(() => {
    fetchData();
    window.addEventListener('focus', fetchData);
    return () => window.removeEventListener('focus', fetchData);
  }, [fetchData]);
  async function handleAddInversion() {
    const numCantidad = parseFloat(cantidad);
    const numPrecio = parseFloat(precioCompra);

    const hoyString = new Date().toISOString().split('T')[0]; // "2024-05-20" (ejemplo)

  // [UC08] Lógica de eliminación con refresco optimista
  const eliminarActivo = async (codigo: number) => {
    // [UC08] Modal de confirmación
    if (!confirm("¿Seguro que quieres eliminar este activo de tu cartera? Esta acción no se puede deshacer.")) return;

    try {
      // [UC08] Llamar a DELETE /api/activos/[id]
      const res = await fetch(`/api/activos/${codigo}`, { method: 'DELETE' });
      
      if (res.ok) {
        // [UC08] Refrescar lista sin recargar la página (Optimistic UI)
        setActivos(prev => prev.filter(a => a.activocodigo !== codigo));
        
        // Refrescamos los totales del portfolio para que el patrimonio neto se actualice
        const portfolioRes = await fetch(`/api/portfolio?t=${Date.now()}`);
        if (portfolioRes.ok) {
          const portfolioData = await portfolioRes.json();
          setPortfolio(portfolioData);
        }
      } else {
        const error = await res.json();
        alert(error.error || "No se pudo eliminar el activo");
      }
    } catch (err) {
      console.error("Fallo al borrar:", err);
      alert("Error de conexión al intentar eliminar el activo");
    }
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

  // 1. Filtrado: Solo mostramos lo que el usuario realmente posee
  const activosFiltrados = activos.filter(a => (a.cantidad ?? 0) > 0);
  
  const patrimonioCalculado = activosFiltrados.reduce((acc, curr) => acc + (curr.valor_total || 0), 0);
  const totalDisplay = portfolio?.patrimonio_total ?? patrimonioCalculado;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex items-center justify-center">
        <p className="text-zinc-400 text-xl animate-pulse">Cargando tu patrimonio...</p>
        <p className="text-zinc-400 text-xl">Cargando cartera...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white pb-20">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-bold tracking-tight text-white">Tu cartera</h1>
            <p className="text-xl text-zinc-400 mt-3">
              Resumen de activos de <span className="text-white font-medium">{userName}</span>.
            </p>
          </div>
          
          <Button asChild className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-6 rounded-2xl text-lg font-bold shadow-lg shadow-violet-500/20 transition-all hover:scale-105">
            <Link href="/dashboard/nuevo-activo">
              + Añadir Inversión
            </Link>
          </Button>

              disabled={actualizando}
              variant="outline"
              className="gap-2 border-white/10 bg-zinc-900 hover:bg-zinc-800 h-11 px-6 text-base font-medium"
            >
              <RefreshCw className={`w-5 h-5 ${actualizando ? 'animate-spin' : ''}`} />
              {actualizando ? 'Actualizando...' : 'Actualizar cartera'}
            </Button>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-white/10 mb-12 shadow-2xl">
          <CardContent className="p-9">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
              <div>
                <p className="text-zinc-400 text-base tracking-wide uppercase">Patrimonio Total</p>
                <h2 className="text-6xl font-bold tracking-tighter mt-3 text-white">
                  {(portfolio?.simboloDivisa)}{(portfolio?.patrimonio_total ?? 0).toLocaleString('es-ES')}
                </h2>
              </div>
              <Wallet className="w-20 h-20 text-violet-400 flex-shrink-0 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border border-white/10 overflow-hidden">
          <CardHeader className="pb-6 border-b border-white/5">
            <CardTitle className="text-2xl text-white">Mis Inversiones</CardTitle>
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
                  <XAxis dataKey="day" stroke="#52525b" />
                    formatter={(value: number) => [`${value.toLocaleString()}`, 'Valor']}
          <CardHeader className="pb-6 flex flex-row items-center justify-between">

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
          <CardContent className="p-0">
            {activosFiltrados.length === 0 ? (
              <div className="text-center py-20">
                 <p className="text-zinc-500 text-xl">No tienes activos con balance positivo.</p>
                 <Link href="/dashboard/nuevo-activo" className="text-violet-400 hover:underline mt-2 inline-block">Añade tu primera inversión</Link>
                        formatter={(value: number) => [`${portfolio.simboloDivisa}${value.toLocaleString()}`, 'Valor']}
                    {(portfolio?.simboloDivisa)}{(portfolio?.patrimonio_total ?? 0).toLocaleString('es-ES')}
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-b border-white/10 hover:bg-transparent">
                    <TableHead className="text-zinc-400 py-4 px-6">Activo</TableHead>
                    <TableHead className="text-right text-zinc-400 py-4 px-6">Cantidad</TableHead>
                    <TableHead className="text-right text-zinc-400 py-4 px-6">Valor Total</TableHead>
                    <TableHead className="text-right text-zinc-400 py-4 px-6 w-[80px]">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activosFiltrados.map((pos, index) => {
                    const datosActivo = (pos as any).activos;
                    // Extraemos la información del activo (ahora agrupado)
                    const nombreDisplay = datosActivo?.descripcion || `Activo #${pos.activocodigo}`;
                    
                    return (
                      <TableRow key={pos.idrelacion} className="border-b border-white/10 hover:bg-zinc-800/50 transition-colors">
                        <TableCell className="font-medium text-lg text-white py-6 px-6">
                        {/* Columna: Identificación del Activo */}
                          {/* [UC08] Enlace a la página de detalle de inversión */}
                          <Link 
                            href={`/dashboard/activos/${pos.activocodigo}`}
                            className="hover:text-violet-400 transition-colors"
                          >
                            {nombreDisplay}
                          </Link>
                          {(pos.simbolo_divisa)}{pos.precio_actual.toLocaleString('es-ES', { minimumFractionDigits: 2 })}

                        {/* Columna: Badge de Tipo */}
                        {/* Columna: Cantidad (Sumada en el reduce) */}
                        <TableCell className="text-right font-medium text-lg">
                          {pos.cantidad.toLocaleString()}
                        </TableCell>

                        {/* Columna: Precio Actual */}
                        </TableCell>
                        <TableCell className="text-right text-lg text-zinc-300 py-6 px-6">
                          {Number(pos.cantidad).toLocaleString('es-ES')}

                        {/* Columna: Rentabilidad (Calculada ponderada en el reduce) */}
                            {/* Limitamos los decimales a 2 */}
                            <span>{Math.abs(pos.rentabilidad_pct).toFixed(2)}%</span>
                        </TableCell>
                        <TableCell className="text-right font-bold text-lg text-emerald-400 py-6 px-6">
                          {(pos.simbolo_divisa)}{pos.valor_total.toLocaleString('es-ES')}

                        {/* Columna: Valor Total (Sumado en el reduce) */}
                        </TableCell>
                        <TableCell className="text-right py-6 px-6">
                          {/* [UC08] Botón eliminar con confirmación */}

                        {/* Columna: Acciones */}
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