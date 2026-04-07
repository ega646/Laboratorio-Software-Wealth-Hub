export type AssetCategory = "Cripto" | "Acción" | "ETF" | "Efectivo";

export interface InvestmentHolding {
  id: string;
  name: string;
  symbol: string;
  type: AssetCategory;
  amount: number;
  currentPrice: number;
  change24h: number;
  totalValue: number;
  color: string;
}

export interface PortfolioDistributionItem {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface PortfolioPerformance {
  monthlyChangePercent: number;
  monthlyChangeValue: number;
}

export interface PortfolioStats {
  twr12m: number;
  bestPerformerSymbol: string;
  bestPerformerChangePercent: number;
  diversificationLabel: string;
  assetCount: number;
}

export interface PortfolioSummary {
  userId: string;
  totalNetWorth: number;
  investments: InvestmentHolding[];
  distribution: PortfolioDistributionItem[];
  performance: PortfolioPerformance;
  stats: PortfolioStats;
}

export interface PortfolioHistoryPoint {
  date: string;
  totalValue: number;
}

export interface PortfolioHistoryResponse {
  userId: string;
  range: "1y";
  interval: "1d";
  metric: "portfolio-value";
  points: PortfolioHistoryPoint[];
}

export interface AssetDetail {
  id: string;
  name: string;
  symbol: string;
  type: string;
  currentPrice: number;
  amount: number;
  totalValue: number;
  change24h: number;
  changeValue: number;
  avgBuyPrice: number;
  totalInvested: number;
  profitLoss: number;
  profitLossPercent: number;
  color: string;
}

export interface AssetPriceHistoryPoint {
  date: string;
  price: number;
}

export interface AssetHoldingValueHistoryPoint {
  date: string;
  value: number;
}

export interface AssetHistoryResponse<TMetric extends string, TPoint> {
  assetId: string;
  symbol: string;
  range: "1y";
  interval: "1d";
  metric: TMetric;
  points: TPoint[];
}

export type AssetPriceHistoryResponse = AssetHistoryResponse<
  "price",
  AssetPriceHistoryPoint
>;

export type AssetHoldingValueHistoryResponse = AssetHistoryResponse<
  "holding-value",
  AssetHoldingValueHistoryPoint
>;
