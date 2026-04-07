import {
  getMockPortfolioHistoryLastYear,
  getMockPortfolioSummary,
} from "@/lib/mocks/investments";
import { fetchFromApi, simulateLatency, USE_MOCK_DATA } from "@/lib/services/api";
import type {
  PortfolioHistoryResponse,
  PortfolioSummary,
} from "@/lib/types/investments";

export async function getPortfolioSummary(
  userId: string,
): Promise<PortfolioSummary> {
  if (USE_MOCK_DATA) {
    await simulateLatency();
    return getMockPortfolioSummary(userId);
  }

  return fetchFromApi<PortfolioSummary>(`/api/portfolio/${userId}/summary`);
}

export async function getPortfolioHistoryLastYear(
  userId: string,
): Promise<PortfolioHistoryResponse> {
  if (USE_MOCK_DATA) {
    await simulateLatency();
    return getMockPortfolioHistoryLastYear(userId);
  }

  return fetchFromApi<PortfolioHistoryResponse>(
    `/api/portfolio/${userId}/history?range=1y&interval=1d`,
  );
}
