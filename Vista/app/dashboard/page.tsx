"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart as PieIcon,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  PieChart as RechartsPie,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MOCK_USER_ID } from "@/lib/mocks/investments";
import {
  getPortfolioHistoryLastYear,
  getPortfolioSummary,
} from "@/lib/services/portfolio";
import type {
  PortfolioHistoryResponse,
  PortfolioSummary,
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
  return `${prefix}${formatCurrency(Math.abs(value), 0)}`;
}

function formatSignedPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toLocaleString("es-ES", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
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

function DashboardState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white pb-20">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="bg-zinc-900 border border-white/10">
          <CardContent className="p-10">
            <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
            <p className="text-zinc-400 text-lg mt-4">{description}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [history, setHistory] = useState<PortfolioHistoryResponse | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        const [summaryData, historyData] = await Promise.all([
          getPortfolioSummary(MOCK_USER_ID),
          getPortfolioHistoryLastYear(MOCK_USER_ID),
        ]);

        if (!isMounted) {
          return;
        }

        setSummary(summaryData);
        setHistory(historyData);
        setLoadState("ready");
      } catch (error) {
        console.error("Error cargando dashboard:", error);

        if (isMounted) {
          setLoadState("error");
        }
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loadState === "error") {
    return (
      <DashboardState
        title="No se pudo cargar el dashboard"
        description="Revisa la fuente de datos configurada o vuelve a intentarlo más tarde."
      />
    );
  }

  if (loadState === "loading" || !summary || !history) {
    return (
      <DashboardState
        title="Cargando cartera"
        description="Preparando el patrimonio total, la distribución de activos y el histórico del último año."
      />
    );
  }

  const isMonthlyPositive = summary.performance.monthlyChangeValue >= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white pb-20">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-5xl font-bold tracking-tight">Tu cartera</h1>
          <p className="text-xl text-zinc-400 mt-3">
            Bienvenido de nuevo. Aquí tienes el resumen de tu patrimonio.
          </p>
        </div>

        <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-white/10 mb-12 shadow-2xl">
          <CardContent className="p-9">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
              <div>
                <p className="text-zinc-400 text-base tracking-wide">
                  PATRIMONIO TOTAL
                </p>
                <h2 className="text-6xl font-bold tracking-tighter mt-3">
                  {formatCurrency(summary.totalNetWorth)}
                </h2>
                <div
                  className={`flex items-center gap-3 mt-5 text-lg ${
                    isMonthlyPositive ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {isMonthlyPositive ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                  <span className="text-xl font-medium">
                    {formatSignedPercent(summary.performance.monthlyChangePercent)} este
                    mes
                  </span>
                  <span
                    className={
                      isMonthlyPositive
                        ? "text-emerald-500/70"
                        : "text-red-500/70"
                    }
                  >
                    • {formatSignedCurrency(summary.performance.monthlyChangeValue)}
                  </span>
                </div>
              </div>
              <Wallet className="w-20 h-20 text-violet-400 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <Card className="bg-zinc-900 border border-white/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">Evolución del Patrimonio</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={history.points}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="date"
                    stroke="#52525b"
                    tickFormatter={formatChartTick}
                    minTickGap={36}
                  />
                  <YAxis
                    stroke="#52525b"
                    tickFormatter={(value: number) =>
                      `${formatCurrency(value / 1000, 0).replace(".000", "")}k`
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      border: "none",
                      borderRadius: "12px",
                    }}
                    labelFormatter={(label) => formatTooltipDate(String(label))}
                    formatter={(value: number) => [formatCurrency(value), "Valor"]}
                  />
                  <Line
                    type="natural"
                    dataKey="totalValue"
                    stroke="#60a5fa"
                    strokeWidth={4}
                    dot={false}
                    activeDot={{
                      fill: "#60a5fa",
                      r: 5,
                      stroke: "#18181b",
                      strokeWidth: 3,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border border-white/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">Distribución de Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={summary.distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={115}
                    dataKey="value"
                  >
                    {summary.distribution.map((entry, index) => (
                      <Cell key={`${entry.name}-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      color: "#111827",
                      padding: "12px 16px",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: number) => [formatCurrency(value), "Valor"]}
                    labelStyle={{ color: "#374151", fontWeight: "600" }}
                  />
                </RechartsPie>
              </ResponsiveContainer>

              <div className="grid grid-cols-2 gap-x-10 gap-y-5 mt-10">
                {summary.distribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-4">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="flex-1">
                      <p className="text-zinc-300">{item.name}</p>
                    </div>
                    <p className="font-semibold text-lg">{item.percentage}%</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="bg-zinc-900 border border-white/10 hover:border-white/20 transition-colors">
            <CardContent className="p-7">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-zinc-400 text-sm">Rendimiento (TWR)</p>
                  <p className="text-4xl font-bold mt-4 text-emerald-400">
                    {formatSignedPercent(summary.stats.twr12m)}
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-emerald-500/30" />
              </div>
              <p className="text-sm text-zinc-500 mt-6">Últimos 12 meses</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border border-white/10 hover:border-white/20 transition-colors">
            <CardContent className="p-7">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-zinc-400 text-sm">Mejor Activo</p>
                  <p className="text-4xl font-bold mt-4">
                    {summary.stats.bestPerformerSymbol}
                  </p>
                  <p className="text-emerald-400 mt-2">
                    {formatSignedPercent(summary.stats.bestPerformerChangePercent)} este
                    año
                  </p>
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
                    {summary.stats.diversificationLabel}
                  </p>
                </div>
                <PieIcon className="w-10 h-10 text-purple-500/30" />
              </div>
              <p className="text-sm text-zinc-500 mt-6">
                {summary.stats.assetCount} activos diferentes
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-zinc-900 border border-white/10">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl">Mis Inversiones</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-b border-white/10 hover:bg-transparent">
                  <TableHead className="text-zinc-400 font-normal">Activo</TableHead>
                  <TableHead className="text-zinc-400 font-normal">Tipo</TableHead>
                  <TableHead className="text-right text-zinc-400 font-normal">
                    Cantidad
                  </TableHead>
                  <TableHead className="text-right text-zinc-400 font-normal">
                    Precio
                  </TableHead>
                  <TableHead className="text-right text-zinc-400 font-normal">
                    Cambio 24h
                  </TableHead>
                  <TableHead className="text-right text-zinc-400 font-normal">
                    Valor Total
                  </TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.investments.map((investment) => (
                  <TableRow
                    key={investment.id}
                    className="border-b border-white/10 hover:bg-zinc-800/50 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-medium text-lg"
                          style={{ backgroundColor: investment.color }}
                        >
                          {investment.symbol.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-lg">{investment.name}</p>
                          <p className="text-sm text-zinc-500">{investment.symbol}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-zinc-800 text-zinc-300 px-4 py-1"
                      >
                        {investment.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-lg">
                      {investment.amount.toLocaleString("es-ES")}
                    </TableCell>
                    <TableCell className="text-right text-lg">
                      {formatCurrency(investment.currentPrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        className={`flex items-center justify-end gap-1.5 text-lg ${
                          investment.change24h >= 0
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {investment.change24h >= 0 ? (
                          <ArrowUpRight className="w-5 h-5" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5" />
                        )}
                        <span>
                          {Math.abs(investment.change24h).toLocaleString("es-ES", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                          %
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-lg">
                      {formatCurrency(investment.totalValue)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="link"
                        size="sm"
                        asChild
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Link href={`/dashboard/investments/${investment.id}`}>
                          Detalles →
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
