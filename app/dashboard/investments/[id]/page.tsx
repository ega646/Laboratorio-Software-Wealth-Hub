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

  async function handleEliminar() {
    setEliminando(true);
    try {
      const resp = await fetch(`/api/activos/${id}`, { method: 'DELETE' });
      if (resp.ok) router.push('/dashboard');
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
  const divisaSimbolo = info?.divisacodigo === 'EUR' ? '€' : info?.divisacodigo === 'GBP' ? '£' : '$'

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
                    {divisaSimbolo}{activo.precio_actual.toLocaleString('es-ES')}
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
                        Se borrará esta posición de tu cartera. El activo seguirá disponible en el catálogo.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-zinc-800 border-white/10 text-white hover:bg-zinc-700">
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleEliminar}
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
                  {divisaSimbolo}{valorTotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 text-zinc-500">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm font-medium">Precio Promedio de Compra</span>
                </div>
                <p className="text-4xl font-semibold text-white">
                  {divisaSimbolo}{activo.precio_compra.toLocaleString('es-ES')}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3 text-zinc-500">
                  <Percent className="w-5 h-5" />
                  <span className="text-sm font-medium">Ganancia / Pérdida</span>
                </div>
                <p className={`text-4xl font-semibold ${ganancia >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {ganancia >= 0 ? '+' : ''}{divisaSimbolo}{Math.abs(ganancia).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                currency={divisaSimbolo}
              />
            ) : (
              <div className="flex items-center justify-center h-48 text-zinc-500">
                Sin datos históricos
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
