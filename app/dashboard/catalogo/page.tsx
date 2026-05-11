"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { ArrowLeft, Search, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { Activo, ActivoPoseidoConPrecio, TipoActivo } from "@/lib/types";

type ActivoCatalogo = Activo & {
  tiposactivos?: TipoActivo
  precio_actual: number | null
}

const TIPOS = ['Todos', 'CRYPTO', 'INVERSION', 'PROPIEDAD']

export default function CatalogoPage() {
  const [catalogo, setCatalogo] = useState<ActivoCatalogo[]>([]);
  const [misActivos, setMisActivos] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [tipoSeleccionado, setTipoSeleccionado] = useState('Todos');

  useEffect(() => {
    Promise.all([
      fetch('/api/catalogo').then(r => r.json()),
      fetch('/api/activos').then(r => r.ok ? r.json() : []),
    ]).then(([catalogoData, activosData]) => {
      setCatalogo(Array.isArray(catalogoData) ? catalogoData : []);
      const codigos = new Set<number>(
        (Array.isArray(activosData) ? activosData as ActivoPoseidoConPrecio[] : [])
          .map(a => a.activocodigo)
      );
      setMisActivos(codigos);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return catalogo.filter(a => {
      const matchTipo = tipoSeleccionado === 'Todos' || a.tipocodigo === tipoSeleccionado;
      const matchBusqueda = !q || a.descripcion.toLowerCase().includes(q) || (a.simbolo?.toLowerCase().includes(q) ?? false);
      return matchTipo && matchBusqueda;
    });
  }, [catalogo, busqueda, tipoSeleccionado]);

  if (loading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <p className="text-zinc-400 text-xl">Cargando catálogo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white pb-20">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button
          variant="ghost"
          asChild
          className="mb-10 text-zinc-400 hover:text-white h-12 px-6 text-base font-medium"
        >
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            Volver al Dashboard
          </Link>
        </Button>

        <div className="mb-10">
          <h1 className="text-5xl font-bold tracking-tight">Catálogo de activos</h1>
          <p className="text-xl text-zinc-400 mt-3">
            Explora todos los activos disponibles. Los que ya tienes en cartera están marcados.
          </p>
        </div>

        {/* Controles de búsqueda y filtro */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <Input
              placeholder="Buscar por nombre o símbolo..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="pl-12 bg-zinc-900 border-white/10 text-white placeholder:text-zinc-500 h-12 text-base"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {TIPOS.map(tipo => (
              <Button
                key={tipo}
                variant={tipoSeleccionado === tipo ? 'default' : 'outline'}
                className={
                  tipoSeleccionado === tipo
                    ? 'bg-violet-600 hover:bg-violet-700 border-transparent'
                    : 'border-white/10 bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                }
                onClick={() => setTipoSeleccionado(tipo)}
              >
                {tipo}
              </Button>
            ))}
          </div>
        </div>

        {filtrados.length === 0 ? (
          <p className="text-zinc-500 text-center py-20 text-lg">
            No se encontraron activos con esos criterios.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtrados.map(activo => {
              const enCartera = misActivos.has(activo.codigo)
              const simbolo = activo.simbolo ?? activo.descripcion.substring(0, 4).toUpperCase()
              const divisaSimbolo = activo.divisacodigo === 'EUR' ? '€' : activo.divisacodigo === 'GBP' ? '£' : '$'
              const tipoLabel = activo.tiposactivos?.descripcion ?? activo.tipocodigo

              return (
                <Card
                  key={activo.codigo}
                  className="bg-zinc-900 border border-white/5 hover:border-white/20 transition-all duration-200 group"
                >
                  <CardContent className="p-7">
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                          style={{ backgroundColor: activo.color }}
                        >
                          {simbolo.substring(0, 3)}
                        </div>
                        <div>
                          <p className="font-semibold text-lg leading-tight">{activo.descripcion}</p>
                          <p className="text-sm text-zinc-500 mt-0.5">{simbolo}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {enCartera && (
                          <Badge className="bg-violet-600/20 text-violet-300 border-violet-500/30 text-xs">
                            En cartera
                          </Badge>
                        )}
                        <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 text-xs">
                          {tipoLabel}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-sm text-zinc-500 mb-1">Precio actual</p>
                        {activo.precio_actual !== null ? (
                          <p className="text-2xl font-bold">
                            {divisaSimbolo}{activo.precio_actual.toLocaleString('es-ES')}
                          </p>
                        ) : (
                          <p className="text-zinc-600 text-sm">Sin precio disponible</p>
                        )}
                      </div>
                      {enCartera && (
                        <Button
                          asChild
                          size="sm"
                          variant="link"
                          className="text-blue-400 hover:text-blue-300 gap-1 p-0"
                        >
                          <Link href={`/dashboard/investments/${activo.codigo}`}>
                            <TrendingUp className="w-4 h-4" />
                            Ver posición
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}
