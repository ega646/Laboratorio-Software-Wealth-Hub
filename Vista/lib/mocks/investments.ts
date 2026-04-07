import type {
  AssetCategory,
  AssetDetail,
  AssetHoldingValueHistoryResponse,
  AssetPriceHistoryResponse,
  InvestmentHolding,
  PortfolioDistributionItem,
  PortfolioHistoryResponse,
  PortfolioSummary,
} from "@/lib/types/investments";

type AssetMockConfig = {
  id: string;
  name: string;
  symbol: string;
  type: AssetCategory;
  detailType: string;
  amount: number;
  currentPrice: number;
  avgBuyPrice: number;
  color: string;
  historyStartPrice: number;
  volatility: number;
  cycles: number;
};

const HISTORY_DAYS = 365;
const MOCK_TODAY = new Date("2026-04-07T00:00:00Z");

export const MOCK_USER_ID = "demo-user";

const mockAssets: AssetMockConfig[] = [
  {
    id: "btc",
    name: "Bitcoin",
    symbol: "BTC",
    type: "Cripto",
    detailType: "Criptomoneda",
    amount: 0.5,
    currentPrice: 65432.5,
    avgBuyPrice: 58420,
    color: "#F7931A",
    historyStartPrice: 44500,
    volatility: 0.11,
    cycles: 7,
  },
  {
    id: "eth",
    name: "Ethereum",
    symbol: "ETH",
    type: "Cripto",
    detailType: "Criptomoneda",
    amount: 3.2,
    currentPrice: 3245.8,
    avgBuyPrice: 2780,
    color: "#627EEA",
    historyStartPrice: 2150,
    volatility: 0.09,
    cycles: 8,
  },
  {
    id: "aapl",
    name: "Apple Inc.",
    symbol: "AAPL",
    type: "Acción",
    detailType: "Acción",
    amount: 25,
    currentPrice: 178.32,
    avgBuyPrice: 165.1,
    color: "#111827",
    historyStartPrice: 155.4,
    volatility: 0.03,
    cycles: 5,
  },
  {
    id: "tsla",
    name: "Tesla Inc.",
    symbol: "TSLA",
    type: "Acción",
    detailType: "Acción",
    amount: 15,
    currentPrice: 245.67,
    avgBuyPrice: 230.4,
    color: "#E82127",
    historyStartPrice: 198.2,
    volatility: 0.08,
    cycles: 6,
  },
  {
    id: "spy",
    name: "S&P 500 ETF",
    symbol: "SPY",
    type: "ETF",
    detailType: "ETF",
    amount: 50,
    currentPrice: 512.45,
    avgBuyPrice: 485.2,
    color: "#1f77b4",
    historyStartPrice: 447.8,
    volatility: 0.025,
    cycles: 4,
  },
  {
    id: "cash",
    name: "Efectivo USD",
    symbol: "USD",
    type: "Efectivo",
    detailType: "Efectivo",
    amount: 15000,
    currentPrice: 1,
    avgBuyPrice: 1,
    color: "#2ecc71",
    historyStartPrice: 1,
    volatility: 0,
    cycles: 1,
  },
];

const distributionMeta: Record<
  AssetCategory,
  { name: string; color: string }
> = {
  Cripto: { name: "Criptomonedas", color: "#3b82f6" },
  "Acción": { name: "Acciones", color: "#8b5cf6" },
  ETF: { name: "ETFs", color: "#10b981" },
  Efectivo: { name: "Efectivo", color: "#f59e0b" },
};

function addDays(baseDate: Date, days: number) {
  const nextDate = new Date(baseDate);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function roundNumber(value: number, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function roundCurrency(value: number) {
  return roundNumber(value, 2);
}

function percentChange(current: number, previous: number) {
  if (previous === 0) {
    return 0;
  }

  return roundNumber(((current - previous) / previous) * 100, 2);
}

function getAssetConfig(assetId: string) {
  const asset = mockAssets.find((item) => item.id === assetId);

  if (!asset) {
    throw new Error(`No existe un activo mock con id "${assetId}".`);
  }

  return asset;
}

function buildPriceSeries(asset: AssetMockConfig): AssetPriceHistoryResponse {
  const startDate = addDays(MOCK_TODAY, -(HISTORY_DAYS - 1));

  const points = Array.from({ length: HISTORY_DAYS }, (_, index) => {
    const progress = index / (HISTORY_DAYS - 1);
    const trend =
      asset.historyStartPrice +
      (asset.currentPrice - asset.historyStartPrice) * progress;
    const primaryWave =
      Math.sin(progress * Math.PI * asset.cycles) *
      asset.historyStartPrice *
      asset.volatility;
    const secondaryWave =
      Math.cos(progress * Math.PI * (asset.cycles / 2)) *
      asset.historyStartPrice *
      asset.volatility *
      0.35;
    const rawPrice =
      asset.type === "Efectivo"
        ? 1
        : Math.max(0.01, trend + primaryWave + secondaryWave);

    return {
      date: toIsoDate(addDays(startDate, index)),
      price: roundCurrency(rawPrice),
    };
  });

  points[points.length - 1].price = roundCurrency(asset.currentPrice);

  return {
    assetId: asset.id,
    symbol: asset.symbol,
    range: "1y",
    interval: "1d",
    metric: "price",
    points,
  };
}

const mockPriceHistoryByAsset = new Map(
  mockAssets.map((asset) => [asset.id, buildPriceSeries(asset)]),
);

function clonePriceHistory(assetId: string) {
  const history = mockPriceHistoryByAsset.get(assetId);

  if (!history) {
    throw new Error(`No existe histórico mock para el activo "${assetId}".`);
  }

  return {
    ...history,
    points: history.points.map((point) => ({ ...point })),
  };
}

function calculateInvestmentHolding(asset: AssetMockConfig): InvestmentHolding {
  const priceHistory = clonePriceHistory(asset.id);
  const previousPoint = priceHistory.points.at(-2);
  const change24h = previousPoint
    ? percentChange(asset.currentPrice, previousPoint.price)
    : 0;

  return {
    id: asset.id,
    name: asset.name,
    symbol: asset.symbol,
    type: asset.type,
    amount: asset.amount,
    currentPrice: roundCurrency(asset.currentPrice),
    change24h,
    totalValue: roundCurrency(asset.amount * asset.currentPrice),
    color: asset.color,
  };
}

export function getMockInvestmentHoldings() {
  return mockAssets.map(calculateInvestmentHolding);
}

export function getMockPortfolioHistoryLastYear(
  userId: string,
): PortfolioHistoryResponse {
  const histories = mockAssets.map((asset) => ({
    amount: asset.amount,
    history: clonePriceHistory(asset.id),
  }));

  const points = histories[0].history.points.map((point, index) => {
    const totalValue = histories.reduce((sum, item) => {
      const currentPoint = item.history.points[index];
      return sum + item.amount * currentPoint.price;
    }, 0);

    return {
      date: point.date,
      totalValue: roundCurrency(totalValue),
    };
  });

  return {
    userId,
    range: "1y",
    interval: "1d",
    metric: "portfolio-value",
    points,
  };
}

function buildDistribution(
  investments: InvestmentHolding[],
  totalNetWorth: number,
): PortfolioDistributionItem[] {
  const buckets = new Map<AssetCategory, number>();

  investments.forEach((investment) => {
    const currentValue = buckets.get(investment.type) ?? 0;
    buckets.set(investment.type, currentValue + investment.totalValue);
  });

  return Array.from(buckets.entries()).map(([type, value]) => ({
    name: distributionMeta[type].name,
    value: roundCurrency(value),
    percentage:
      totalNetWorth === 0 ? 0 : roundNumber((value / totalNetWorth) * 100, 1),
    color: distributionMeta[type].color,
  }));
}

function getAnnualReturn(assetId: string) {
  const history = clonePriceHistory(assetId);
  const firstPoint = history.points[0];
  const lastPoint = history.points[history.points.length - 1];

  return percentChange(lastPoint.price, firstPoint.price);
}

export function getMockPortfolioSummary(userId: string): PortfolioSummary {
  const investments = getMockInvestmentHoldings();
  const totalNetWorth = roundCurrency(
    investments.reduce((sum, investment) => sum + investment.totalValue, 0),
  );
  const distribution = buildDistribution(investments, totalNetWorth);
  const portfolioHistory = getMockPortfolioHistoryLastYear(userId);
  const monthAgoPoint =
    portfolioHistory.points[portfolioHistory.points.length - 31] ??
    portfolioHistory.points[0];
  const currentPoint =
    portfolioHistory.points[portfolioHistory.points.length - 1] ??
    portfolioHistory.points[0];
  const monthlyChangeValue = roundCurrency(
    currentPoint.totalValue - monthAgoPoint.totalValue,
  );
  const monthlyChangePercent = percentChange(
    currentPoint.totalValue,
    monthAgoPoint.totalValue,
  );
  const twr12m = percentChange(
    currentPoint.totalValue,
    portfolioHistory.points[0].totalValue,
  );
  const bestPerformer = mockAssets
    .filter((asset) => asset.type !== "Efectivo")
    .map((asset) => ({
      symbol: asset.symbol,
      annualReturn: getAnnualReturn(asset.id),
    }))
    .sort((left, right) => right.annualReturn - left.annualReturn)[0];
  const assetCount = investments.length;

  return {
    userId,
    totalNetWorth,
    investments,
    distribution,
    performance: {
      monthlyChangePercent,
      monthlyChangeValue,
    },
    stats: {
      twr12m,
      bestPerformerSymbol: bestPerformer?.symbol ?? "N/A",
      bestPerformerChangePercent: bestPerformer?.annualReturn ?? 0,
      diversificationLabel: assetCount >= 5 ? "Buena" : "Media",
      assetCount,
    },
  };
}

export function getMockAssetDetail(assetId: string): AssetDetail {
  const asset = getAssetConfig(assetId);
  const history = clonePriceHistory(assetId);
  const previousPoint = history.points.at(-2);
  const totalValue = roundCurrency(asset.amount * asset.currentPrice);
  const totalInvested = roundCurrency(asset.amount * asset.avgBuyPrice);
  const profitLoss = roundCurrency(totalValue - totalInvested);

  return {
    id: asset.id,
    name: asset.name,
    symbol: asset.symbol,
    type: asset.detailType,
    currentPrice: roundCurrency(asset.currentPrice),
    amount: asset.amount,
    totalValue,
    change24h: previousPoint
      ? percentChange(asset.currentPrice, previousPoint.price)
      : 0,
    changeValue: previousPoint
      ? roundCurrency((asset.currentPrice - previousPoint.price) * asset.amount)
      : 0,
    avgBuyPrice: roundCurrency(asset.avgBuyPrice),
    totalInvested,
    profitLoss,
    profitLossPercent: percentChange(totalValue, totalInvested),
    color: asset.color,
  };
}

export function getMockAssetPriceHistoryLastYear(assetId: string) {
  return clonePriceHistory(assetId);
}

export function getMockAssetHoldingValueHistoryLastYear(
  assetId: string,
  quantity?: number,
): AssetHoldingValueHistoryResponse {
  const asset = getAssetConfig(assetId);
  const finalQuantity = quantity ?? asset.amount;
  const priceHistory = clonePriceHistory(assetId);

  return {
    assetId: asset.id,
    symbol: asset.symbol,
    range: "1y",
    interval: "1d",
    metric: "holding-value",
    points: priceHistory.points.map((point) => ({
      date: point.date,
      value: roundCurrency(point.price * finalQuantity),
    })),
  };
}
