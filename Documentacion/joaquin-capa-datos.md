# Capa de datos de inversiones

## Qué se hizo

Se separó la información mock de la interfaz para que el `dashboard` y el detalle de cada activo consuman datos desde una capa de servicios.

Archivos principales:

- `Vista/lib/types/investments.ts`: contratos y tipos compartidos.
- `Vista/lib/mocks/investments.ts`: datos mock y generación de históricos del último año.
- `Vista/lib/services/api.ts`: configuración común para mock o backend real.
- `Vista/lib/services/portfolio.ts`: datos del dashboard principal.
- `Vista/lib/services/assets.ts`: detalle e históricos de activos.

También se conectaron estas pantallas para que dejen de depender de arrays hardcodeados:

- `Vista/app/dashboard/page.tsx`
- `Vista/app/dashboard/investments/[id]/page.tsx`

## Funciones disponibles

- `getPortfolioSummary(userId)`
- `getPortfolioHistoryLastYear(userId)`
- `getAssetDetail(assetId)`
- `getAssetPriceHistoryLastYear(assetId)`
- `getAssetHoldingValueHistoryLastYear(assetId, quantity?)`

La última se dejó preparada porque todavía falta confirmar si en el panel de detalle quieren mostrar:

- solo el precio histórico del activo
- o el valor histórico de la posición del usuario (`precio * cantidad`)

## Estructuras principales

Dashboard:

- histórico del patrimonio: `[{ date, totalValue }]`
- distribución: `[{ name, value, percentage, color }]`
- inversiones: `[{ id, name, symbol, type, amount, currentPrice, change24h, totalValue, color }]`

Detalle de activo:

- histórico del precio: `[{ date, price }]`
- histórico del valor de posición: `[{ date, value }]`
- detalle del activo: `AssetDetail`

## Qué hay que pedir a las otras partes

### Interfaz

- Confirmar si la gráfica del detalle usa `price` o `value`.
- Mantener estados de `loading`, `error` y ausencia de datos.
- Confirmar si el histórico final debe visualizarse diario, semanal o mensual.

### Backend / API

Endpoints sugeridos:

- `GET /api/portfolio/{userId}/summary`
- `GET /api/portfolio/{userId}/history?range=1y&interval=1d`
- `GET /api/assets/{assetId}/detail`
- `GET /api/assets/{assetId}/history?range=1y&interval=1d&metric=price`
- `GET /api/assets/{assetId}/history?range=1y&interval=1d&metric=holding-value&quantity=...`

### Base de datos

- Tabla o modelo para usuarios.
- Tabla o modelo para activos por usuario.
- Fuente para histórico de precios o una estrategia para guardarlo/cachearlo.
- Relación entre cuentas vinculadas y activos importados desde APIs externas.

## Cómo cambiar de mocks a backend real

Por defecto la vista usa mocks.

Variables previstas:

- `NEXT_PUBLIC_USE_MOCK_DATA=false`
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080`

Con eso la interfaz podrá dejar de leer mocks y empezar a consumir el backend cuando esté listo.
