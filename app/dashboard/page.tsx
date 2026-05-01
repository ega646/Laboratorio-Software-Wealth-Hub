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

      setActivos(Array.isArray(activosData) ? activosData : []);
      setPortfolio(portfolioData);
      setHistoricalData(Array.isArray(historicalData) ? historicalData : [])
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
              className="gap-2 border-white/10 bg-zinc-900 hover:bg-zinc-800"
            >
              <RefreshCw className={`w-4 h-4 ${actualizando ? 'animate-spin' : ''}`} />
              {actualizando ? 'Actualizando...' : 'Actualizar precios'}
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
                    const nombreDisplay = datosActivo?.descripcion || `Activo #${pos.activocodigo}`;
                    
                    return (
                      <TableRow key={pos.idrelacion} className="border-b border-white/10 hover:bg-zinc-800/50 transition-colors">
                        <TableCell className="font-medium text-lg text-white py-6 px-6">
                          {/* [UC08] Enlace a la página de detalle de inversión */}
                          <Link 
                            href={`/dashboard/activos/${pos.activocodigo}`}
                            className="hover:text-violet-400 transition-colors"
                          >
                            {nombreDisplay}
                          </Link>
                          {(pos.simbolo_divisa)}{pos.precio_actual.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right text-lg text-zinc-300 py-6 px-6">
                          {Number(pos.cantidad).toLocaleString('es-ES')}
                        </TableCell>
                        <TableCell className="text-right font-bold text-lg text-emerald-400 py-6 px-6">
                          {(pos.simbolo_divisa)}{pos.valor_total.toLocaleString('es-ES')}
                        </TableCell>
                        <TableCell className="text-right py-6 px-6">
                          {/* [UC08] Botón eliminar con confirmación */}
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
    </div>
  );
}