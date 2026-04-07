const DEFAULT_API_BASE_URL = "http://localhost:8080";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;

export const USE_MOCK_DATA =
  process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";

export async function fetchFromApi<T>(path: string) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`No se pudieron cargar los datos desde ${path}.`);
  }

  return (await response.json()) as T;
}

export async function simulateLatency(ms = 180) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
