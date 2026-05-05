"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Header } from "@/components/Header";
import { PriceChart } from "@/components/PriceChart";
import {
  ArrowLeft, TrendingUp, TrendingDown, DollarSign,
  Activity, Calendar, Percent, Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { ActivoPoseidoConPrecio, Activo, TipoActivo } from "@/lib/types";

type ActivoDetalle = ActivoPoseidoConPrecio & {
  activos: Activo & { tiposactivos?: TipoActivo }
  historico: { valor: number; fecha: string }[]
  compras: { id: number; cantidad: number; precio_compra: number; fechainicio: string }[]
}

export default function DetallesInversion() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [activo, setActivo] = useState<ActivoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    fetch(`/api/activos/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        setActivo(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleEliminar(transactionId?: number) {
    setEliminando(true);
    try {
      // Forzamos que si no hay ID, la URL sea limpia para borrar todo el grupo
      const url = transactionId
        ? `/api/activos/${id}?transactionId=${transactionId}`
        : `/api/activos/${id}`;

      const resp = await fetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (resp.ok) {
        // Caso A: Borramos todo el activo o era la última compra que quedaba
        if (!transactionId || (activo?.compras && activo.compras.length <= 1)) {
          router.push('/dashboard?refresh=true');
          router.refresh(); // Asegura que Next.js limpie la caché
        } else {
          // Caso B: Borramos solo una compra, recargamos los datos del activo
          const updatedResp = await fetch(`/api/activos/${id}`);
          if (updatedResp.ok) {
            const data = await updatedResp.json();
            setActivo(data);
          }
        }
      } else {
        const errorData = await resp.json();
        console.error("Error al eliminar:", errorData.error);
      }
    } catch (error) {
      console.error("Error en la petición DELETE:", error);
    } finally {
      setEliminando(false);
    }
  }

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

  const info = activo.activos
  const nombre = info?.descripcion ?? String(activo.activocodigo)
  const simbolo = info?.simbolo ?? nombre.substring(0, 4).toUpperCase()
  const color = info?.color ?? '#6366f1'
  const tipoLabel = info?.tiposactivos?.descripcion ?? info?.tipocodigo ?? '—'

  const valorTotal = activo.cantidad * activo.precio_actual
  const ganancia = valorTotal - activo.cantidad * activo.precio_compra
  const gananciaPercent = activo.precio_compra > 0
    ? ((activo.precio_actual - activo.precio_compra) / activo.precio_compra) * 100
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button
          variant="ghost"
          asChild
          className="mb-12 text-zinc-400 hover:text-white h-14 px-8 text-lg font-medium"
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
                  className="w-24 h-24 rounded-3xl flex items-center justify-center text-white text-3xl font-bold"
                  style={{ backgroundColor: color }}
                >
                  {simbolo.substring(0, 3)}
                </div>
                <div>
                  <h1 className="text-6xl font-bold tracking-tight">{nombre}</h1>
                  <div className="flex items-center gap-4 mt-4">
                    <span className="text-3xl text-zinc-400">{simbolo}</span>
                    <Badge className="bg-zinc-800/70 text-zinc-400 text-xl px-6 py-2 border border-white/5">
                      {tipoLabel}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-4">
                <div className="text-right">
                  <p className="text-zinc-500 text-xl">Precio Actual</p>
                  <p className="text-6xl font-bold mt-3 tracking-tighter text-white">
                    {activo.simbolo_divisa}{activo.precio_actual.toLocaleString('es-ES')}
                  </p>
                  <div className={`flex items-center justify-end gap-3 mt-6 text-2xl ${gananciaPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {gananciaPercent >= 0 ? <TrendingUp className="w-7 h-7" /> : <TrendingDown className="w-7 h-7" />}
                    <span>
                      {gananciaPercent >= 0 ? '+' : ''}{Math.round(gananciaPercent * 100) / 100}% desde compra
                    </span>
                  </div>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2 border-red-900/50 text-red-400 hover:bg-red-950/40 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar de mi cartera
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-zinc-900 border border-white/10 text-white">
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar {nombre}?</AlertDialogTitle>
                      <AlertDialogDescription className="text-zinc-400">
                        Se borrarán todas las compras asociadas a este activo de tu cartera.
                        Esta acción no se puede deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-zinc-800 border-white/10 text-white hover:bg-zinc-700">
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        // Usamos una función flecha vacía para que transactionId sea undefined
                        onClick={() => handleEliminar()}
                        disabled={eliminando}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {eliminando ? 'Eliminando...' : 'Confirmar'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
                  {activo.cantidad.toLocaleString('es-ES')}{' '}
                  <span className="text-2xl text-zinc-500">{simbolo}</span>
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 text-zinc-500">
                  <Activity className="w-5 h-5" />
                  <span className="text-sm font-medium">Valor Total Actual</span>
                </div>
                <p className="text-4xl font-semibold text-white">
                  {activo.simbolo_divisa}{valorTotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 text-zinc-500">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm font-medium">Precio Promedio de Compra</span>
                </div>
                <p className="text-4xl font-semibold text-white">
                  {activo.simbolo_divisa}{activo.precio_compra.toLocaleString('es-ES')}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 text-zinc-500">
                  <Percent className="w-5 h-5" />
                  <span className="text-sm font-medium">Ganancia / Pérdida</span>
                </div>
                <p className={`text-4xl font-semibold ${ganancia >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {ganancia >= 0 ? '+' : ''}{activo.simbolo_divisa}{Math.abs(ganancia).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
          <CardHeader className="pb-6">
            <CardTitle className="text-3xl">Evolución del Precio</CardTitle>
            <CardDescription>
              {activo.historico.length > 0
                ? `Últimos ${activo.historico.length} días — datos reales de mercado`
                : 'Sin datos históricos disponibles. Actualiza los precios desde el dashboard.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 pb-8">
            {activo.historico.length > 0 ? (
              <PriceChart
                data={activo.historico}
                color={color}
                height={440}
                currency={activo.simbolo_divisa}
              />
            ) : (
              <div className="flex items-center justify-center h-48 text-zinc-500">
                Sin datos históricos
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sección de Desglose de Compras Individuales */}
        <Card className="bg-zinc-900/70 border border-white/5 mt-12 mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Historial de Adquisiciones</CardTitle>
            <CardDescription>Gestiona cada compra individual de este activo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-zinc-500 border-b border-white/5">
                    <th className="pb-4 font-medium">Fecha</th>
                    <th className="pb-4 font-medium text-right">Cantidad</th>
                    <th className="pb-4 font-medium text-right">Precio Compra</th>
                    <th className="pb-4 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {activo.compras.map((compra) => (
                    <tr key={compra.id} className="group">
                      <td className="py-4 text-zinc-300">
                        {new Date(compra.fechainicio).toLocaleDateString('es-ES')}
                      </td>
                      <td className="py-4 text-right font-medium">
                        {compra.cantidad.toLocaleString('es-ES')} {simbolo}
                      </td>
                      <td className="py-4 text-right text-zinc-300">
                        {compra.simbolo_divisa}{compra.precio_compra.toLocaleString('es-ES')}
                      </td>
                      <td className="py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEliminar(compra.id)}
                          className="text-zinc-500 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}