"use client";

// ============================================================
// UC14 — Widget de recomendaciones de cartera
//
// Muestra las recomendaciones activas del usuario en el dashboard
// con botones rápidos para "Ignorar", "Recordar 7 días" y "Ver detalle".
// El detalle se abre en un Dialog con la comparación distribución
// actual vs target.
// ============================================================

import { useEffect, useState } from "react";
import { AlertTriangle, AlertCircle, Info, X, Clock, ChevronRight } from "lucide-react";
import {
  PieChart as RechartsPie, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import type { Recomendacion, DatosDesbalance, SeveridadRecomendacion } from "@/lib/types";

interface Props {
  /** Forzar recarga desde el padre (cambiar el valor) */
  refreshKey?: number;
}

export function RecomendacionesWidget({ refreshKey = 0 }: Props) {
  const [recomendaciones, setRecomendaciones] = useState<Recomendacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [seleccionada, setSeleccionada] = useState<Recomendacion | null>(null);
  const [accionando, setAccionando] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/recomendaciones')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        setRecomendaciones(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [refreshKey]);

  async function handleAccion(rec: Recomendacion, estado: 'ignorada' | 'recordar') {
    setAccionando(rec.id);
    try {
      const body: { estado: string; dias?: number } = { estado };
      if (estado === 'recordar') body.dias = 7;
      await fetch(`/api/recomendaciones/${rec.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      setRecomendaciones(prev => prev.filter(r => r.id !== rec.id));
      setSeleccionada(null);
    } finally {
      setAccionando(null);
    }
  }

  if (loading || recomendaciones.length === 0) {
    return null; // No mostrar nada si no hay recomendaciones activas
  }

  return (
    <>
      <Card className="bg-zinc-900 border border-white/10 mb-12">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            Recomendaciones para tu cartera
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recomendaciones.map(rec => (
            <RecomendacionItem
              key={rec.id}
              recomendacion={rec}
              accionando={accionando === rec.id}
              onIgnorar={() => handleAccion(rec, 'ignorada')}
              onRecordar={() => handleAccion(rec, 'recordar')}
              onVerDetalle={() => setSeleccionada(rec)}
            />
          ))}
        </CardContent>
      </Card>

      <Dialog open={!!seleccionada} onOpenChange={(o) => !o && setSeleccionada(null)}>
        <DialogContent className="max-w-3xl bg-zinc-900 border border-white/10 text-white">
          {seleccionada && (
            <DetalleRecomendacion
              recomendacion={seleccionada}
              accionando={accionando === seleccionada.id}
              onIgnorar={() => handleAccion(seleccionada, 'ignorada')}
              onRecordar={() => handleAccion(seleccionada, 'recordar')}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}


// ── Item individual ─────────────────────────────────────────

const COLORS_SEVERIDAD: Record<SeveridadRecomendacion, { bg: string; border: string; icon: string; badge: string }> = {
  info:     { bg: 'bg-blue-950/30',    border: 'border-blue-500/30',   icon: 'text-blue-400',   badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  warn:     { bg: 'bg-amber-950/30',   border: 'border-amber-500/30',  icon: 'text-amber-400',  badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  critical: { bg: 'bg-red-950/30',     border: 'border-red-500/30',    icon: 'text-red-400',    badge: 'bg-red-500/15 text-red-300 border-red-500/30' },
};

function iconoSeveridad(severidad: SeveridadRecomendacion) {
  if (severidad === 'critical') return AlertCircle;
  if (severidad === 'warn') return AlertTriangle;
  return Info;
}

interface ItemProps {
  recomendacion: Recomendacion;
  accionando: boolean;
  onIgnorar: () => void;
  onRecordar: () => void;
  onVerDetalle: () => void;
}

function RecomendacionItem({ recomendacion, accionando, onIgnorar, onRecordar, onVerDetalle }: ItemProps) {
  const colors = COLORS_SEVERIDAD[recomendacion.severidad];
  const Icon = iconoSeveridad(recomendacion.severidad);

  return (
    <div className={`rounded-xl border ${colors.border} ${colors.bg} p-5`}>
      <div className="flex items-start gap-4">
        <Icon className={`w-6 h-6 flex-shrink-0 mt-0.5 ${colors.icon}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-semibold text-lg">{recomendacion.titulo}</h3>
            <Badge variant="outline" className={`${colors.badge} text-xs uppercase`}>
              {recomendacion.severidad}
            </Badge>
          </div>
          <p className="text-zinc-300 text-sm mt-2 leading-relaxed">{recomendacion.mensaje}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={onVerDetalle}
              disabled={accionando}
              className="border-white/10 bg-zinc-900 hover:bg-zinc-800"
            >
              Ver detalle
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onRecordar}
              disabled={accionando}
              className="text-zinc-400 hover:text-white hover:bg-white/5"
            >
              <Clock className="w-4 h-4 mr-1.5" />
              Recordar en 7 días
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onIgnorar}
              disabled={accionando}
              className="text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
            >
              <X className="w-4 h-4 mr-1.5" />
              Ignorar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


// ── Modal de detalle ────────────────────────────────────────

interface DetalleProps {
  recomendacion: Recomendacion;
  accionando: boolean;
  onIgnorar: () => void;
  onRecordar: () => void;
}

const LABEL_TIPO: Record<string, string> = {
  CRYPTO:    'Cripto',
  INVERSION: 'Inversión',
  PROPIEDAD: 'Propiedad',
  OTRO:      'Otros',
};

function DetalleRecomendacion({ recomendacion, accionando, onIgnorar, onRecordar }: DetalleProps) {
  const datos = recomendacion.datos_json as DatosDesbalance;

  // Combinar todos los tipos del target con la distribución actual para el gráfico
  const tipos = Array.from(new Set([
    ...Object.keys(datos.distribucion_target ?? {}),
    ...(datos.distribucion_actual ?? []).map(d => d.tipo),
  ]));

  const dataComparacion = tipos.map(tipo => {
    const actual = datos.distribucion_actual?.find(d => d.tipo === tipo)?.porcentaje ?? 0;
    const target = datos.distribucion_target?.[tipo] ?? 0;
    return {
      tipo: LABEL_TIPO[tipo] ?? tipo,
      actual: Math.round(actual * 10) / 10,
      target,
    };
  }).filter(d => d.actual > 0 || d.target > 0);

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl">{recomendacion.titulo}</DialogTitle>
        <DialogDescription className="text-zinc-400 text-base mt-2 leading-relaxed">
          {recomendacion.mensaje}
        </DialogDescription>
      </DialogHeader>

      {/* Comparación distribución actual vs target */}
      <div className="mt-4">
        <h4 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wide">
          Distribución actual vs recomendada
        </h4>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={dataComparacion}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="tipo" stroke="#a1a1aa" tick={{ fontSize: 12 }} />
            <YAxis stroke="#a1a1aa" tick={{ fontSize: 12 }} unit="%" />
            <Tooltip
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
              formatter={(v: number) => `${v}%`}
            />
            <Legend />
            <Bar dataKey="actual" name="Actual" fill="#60a5fa" radius={[4, 4, 0, 0]} />
            <Bar dataKey="target" name="Recomendado" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Lista de desviaciones detectadas */}
      {datos.desviaciones && datos.desviaciones.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wide">
            Desviaciones detectadas
          </h4>
          {datos.desviaciones.map((d, i) => {
            const label = LABEL_TIPO[d.tipo] ?? d.tipo;
            const positiva = d.desviacionAbs > 0;
            return (
              <div key={i} className="flex justify-between items-center bg-zinc-950/50 rounded-lg p-3 border border-white/5">
                <span className="text-zinc-300">{label}</span>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-zinc-500">{d.pctActual}% actual</span>
                  <span className="text-zinc-600">→</span>
                  <span className="text-emerald-400">{d.pctTarget}% objetivo</span>
                  <span className={`font-mono ${positiva ? 'text-amber-400' : 'text-blue-400'}`}>
                    {positiva ? '+' : ''}{d.desviacionAbs}pp
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-zinc-500 italic mt-4 leading-relaxed">
        Esta sugerencia se basa en una distribución teórica para tu perfil de riesgo. No constituye
        asesoramiento financiero profesional.
      </p>

      <DialogFooter className="gap-2 mt-2">
        <Button
          variant="outline"
          onClick={onRecordar}
          disabled={accionando}
          className="border-white/10 bg-zinc-900 hover:bg-zinc-800"
        >
          <Clock className="w-4 h-4 mr-2" />
          Recordar en 7 días
        </Button>
        <Button
          variant="ghost"
          onClick={onIgnorar}
          disabled={accionando}
          className="text-zinc-400 hover:text-white"
        >
          <X className="w-4 h-4 mr-2" />
          Ignorar
        </Button>
      </DialogFooter>
    </>
  );
}
