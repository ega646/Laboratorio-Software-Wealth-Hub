"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/Header";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Calendar,
  Percent,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getAssetDetail,
  getAssetPriceHistoryLastYear,
} from "@/lib/services/assets";
import type {
  AssetDetail,
  AssetPriceHistoryResponse,
} from "@/lib/types/investments";

type LoadState = "loading" | "ready" | "error";

function formatCurrency(value: number, maximumFractionDigits = 2) {
  return `$${value.toLocaleString("es-ES", {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  })}`;
}

function formatSignedCurrency(value: number) {
  const prefix = value >= 0 ? "+" : "-";
  return `${prefix}${formatCurrency(Math.abs(value))}`;
}

function formatSignedPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

function formatChartTick(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("es-ES", {
    month: "short",
  });
}

function formatTooltipDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function DetailState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
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

        <Card className="bg-zinc-900/70 border border-white/5">
          <CardContent className="p-10">
            <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
            <p className="text-zinc-400 text-lg mt-4">{description}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DetallesInversion() {
  const params = useParams();
  const id = params.id as string;
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [investment, setInvestment] = useState<AssetDetail | null>(null);
  const [priceHistory, setPriceHistory] =
    useState<AssetPriceHistoryResponse | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadAssetData() {
      setLoadState("loading");

      try {
        const [detail, history] = await Promise.all([
          getAssetDetail(id),
          getAssetPriceHistoryLastYear(id),
        ]);

        if (!isMounted) {
          return;
        }

        setInvestment(detail);
        setPriceHistory(history);
        setLoadState("ready");
      } catch (error) {
        console.error("Error cargando detalle del activo:", error);

        if (isMounted) {
          setLoadState("error");
        }
      }
    }

    loadAssetData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loadState === "error") {
    return (
      <DetailState
        title="No se pudo cargar el activo"
        description="Comprueba la fuente de datos configurada o vuelve a intentarlo más tarde."
      />
    );
  }

  if (loadState === "loading" || !investment || !priceHistory) {
    return (
      <DetailState
        title="Cargando activo"
        description="Preparando el detalle del activo y su histórico del último año."
      />
    );
  }

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

        <Card className="bg-zinc-900/70 border border-white/5 mb-12">
          <CardContent className="p-12">
            <div className="flex flex-col lg:flex-row gap-10 items-start justify-between">
              <div className="flex items-center gap-7">
                <div
                  className="w-24 h-24 rounded-3xl flex items-center justify-center text-white text-5xl font-bold"
                  style={{ backgroundColor: investment.color }}
                >
                  {investment.symbol.substring(0, 2)}
                </div>
                <div>
                  <h1 className="text-6xl font-bold tracking-tight">
                    {investment.name}
                  </h1>
                  <div className="flex items-center gap-4 mt-4">
                    <span className="text-3xl text-zinc-400">
                      {investment.symbol}
                    </span>
                    <Badge className="bg-zinc-800/70 text-zinc-400 text-xl px-6 py-2 border border-white/5">
                      {investment.type}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-zinc-500 text-xl">Precio Actual</p>
                <p className="text-6xl font-bold mt-3 tracking-tighter text-white">
                  {formatCurrency(investment.currentPrice)}
                </p>
                <div
                  className={`flex items-center justify-end gap-3 mt-6 text-2xl ${
                    investment.change24h >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {investment.change24h >= 0 ? (
                    <TrendingUp className="w-7 h-7" />
                  ) : (
                    <TrendingDown className="w-7 h-7" />
                  )}
                  <span>{formatSignedPercent(investment.change24h)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-14">
          <Card className="bg-zinc-900/70 border border-white/5 hover:border-white/10 transition-colors">
            <CardContent className="p-9">
              <div className="flex items-center gap-4 text-zinc-500 mb-5">
                <DollarSign className="w-6 h-6" />
                Cantidad Poseída
              </div>
              <p className="text-4xl font-semibold text-white">
                {investment.amount.toLocaleString("es-ES")}{" "}
                <span className="text-2xl text-zinc-500">{investment.symbol}</span>
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/70 border border-white/5 hover:border-white/10 transition-colors">
            <CardContent className="p-9">
              <div className="flex items-center gap-4 text-zinc-500 mb-5">
                <Activity className="w-6 h-6" />
                Valor Total Actual
              </div>
              <p className="text-4xl font-semibold text-white">
                {formatCurrency(investment.totalValue)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/70 border border-white/5 hover:border-white/10 transition-colors">
            <CardContent className="p-9">
              <div className="flex items-center gap-4 text-zinc-500 mb-5">
                <Calendar className="w-6 h-6" />
                Precio Promedio de Compra
              </div>
              <p className="text-4xl font-semibold text-white">
                {formatCurrency(investment.avgBuyPrice)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/70 border border-white/5 hover:border-white/10 transition-colors">
            <CardContent className="p-9">
              <div className="flex items-center gap-4 text-zinc-500 mb-5">
                <Percent className="w-6 h-6" />
                Ganancia / Pérdida
              </div>
              <p
                className={`text-4xl font-semibold ${
                  investment.profitLoss >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {formatSignedCurrency(investment.profitLoss)}
              </p>
              <p
                className={`text-xl mt-2 ${
                  investment.profitLoss >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                ({formatSignedPercent(investment.profitLossPercent)})
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-zinc-900/70 border border-white/5">
          <CardHeader className="pb-8">
            <CardTitle className="text-3xl">Historial de Precios</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-8">
            <ResponsiveContainer width="100%" height={440}>
              <AreaChart data={priceHistory.points}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="date"
                  stroke="#52525b"
                  tickFormatter={formatChartTick}
                  minTickGap={36}
                />
                <YAxis
                  stroke="#52525b"
                  tickFormatter={(value: number) => {
                    if (value >= 1000) {
                      return `$${(value / 1000).toFixed(0)}k`;
                    }

                    return formatCurrency(value, 0);
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "none",
                    borderRadius: "14px",
                    color: "#e4e4e7",
                  }}
                  labelFormatter={(label) => formatTooltipDate(String(label))}
                  formatter={(value: number) => [formatCurrency(value), "Precio"]}
                />
                <Area
                  type="natural"
                  dataKey="price"
                  stroke="#60a5fa"
                  strokeWidth={4}
                  fill="url(#colorPrice)"
                  dot={false}
                  activeDot={{
                    fill: "#60a5fa",
                    r: 5,
                    stroke: "#18181b",
                    strokeWidth: 3,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
