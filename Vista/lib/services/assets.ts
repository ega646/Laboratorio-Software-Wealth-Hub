import {
  getMockAssetDetail,
  getMockAssetHoldingValueHistoryLastYear,
  getMockAssetPriceHistoryLastYear,
} from "@/lib/mocks/investments";
import { fetchFromApi, simulateLatency, USE_MOCK_DATA } from "@/lib/services/api";
import type {
  AssetDetail,
  AssetHoldingValueHistoryResponse,
  AssetPriceHistoryResponse,
} from "@/lib/types/investments";

export async function getAssetDetail(assetId: string): Promise<AssetDetail> {
  if (USE_MOCK_DATA) {
    await simulateLatency();
    return getMockAssetDetail(assetId);
  }

  return fetchFromApi<AssetDetail>(`/api/assets/${assetId}/detail`);
}

export async function getAssetPriceHistoryLastYear(
  assetId: string,
): Promise<AssetPriceHistoryResponse> {
  if (USE_MOCK_DATA) {
    await simulateLatency();
    return getMockAssetPriceHistoryLastYear(assetId);
  }

  return fetchFromApi<AssetPriceHistoryResponse>(
    `/api/assets/${assetId}/history?range=1y&interval=1d&metric=price`,
  );
}

export async function getAssetHoldingValueHistoryLastYear(
  assetId: string,
  quantity?: number,
): Promise<AssetHoldingValueHistoryResponse> {
  if (USE_MOCK_DATA) {
    await simulateLatency();
    return getMockAssetHoldingValueHistoryLastYear(assetId, quantity);
  }

  const quantityQuery =
    typeof quantity === "number" ? `&quantity=${quantity}` : "";

  return fetchFromApi<AssetHoldingValueHistoryResponse>(
    `/api/assets/${assetId}/history?range=1y&interval=1d&metric=holding-value${quantityQuery}`,
  );
}
