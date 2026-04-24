# TODO — Wealth Hub

Casos de uso pendientes de implementar. Cada uno tiene sus subtareas y se indica qué funciones/endpoints comparten distintos casos de uso para que el equipo se coordine y no se pisen.

---

## Índice de casos de uso

| ID | Caso de uso | Estado |
|---|---|---|
| UC01 | Añadir activo a la cartera | 🟡 Parcial (API existe, falta UI) |
| UC02 | Ver catálogo y detalle de inversión | 🟡 Parcial (página existe, gráfico es mock, falta búsqueda de catálogo) |
| UC03 | Gestionar perfil de usuario | ✅ Completo |
| UC04 | Dashboard — Net Worth, distribución y evolución histórica | 🟡 Parcial (gráfico histórico es mock, falta TWR y distribución por clase) |
| UC05 | Actualización de precios (tiempo real y programada) | 🔴 Pendiente |
| UC06 | Vincular cuentas y gestión de credenciales | 🟡 Parcial (UI existe, sin backend) |
| UC07 | Conversión de divisas y configuración de gráficas | 🔴 Pendiente |
| UC08 | Eliminar activo de la cartera | 🟡 Parcial (API existe, falta UI) |
| UC09 | Gestión de sesión | ✅ Completo |
| UC10 | Análisis de perfil de riesgo | 🔴 Pendiente |
| UC11 | Simulación proyectiva (interés compuesto) | 🔴 Pendiente |
| UC12 | Simulación histórica (backtesting) | 🔴 Pendiente |
| UC13 | Optimización de cartera | 🔴 Pendiente |

---

## ⚠️ Funciones compartidas — leer antes de empezar

Estas son las piezas de código que tocan más de un caso de uso. Si dos personas trabajan en casos de uso que comparten una función, tienen que coordinarse para no sobreescribirse.

| Función / recurso compartido | Casos de uso que la tocan | Qué hacer |
|---|---|---|
| `app/api/activos/route.ts` | UC01 (POST), UC08 (DELETE) | Misma ruta. Coordinarse UC01 y UC08. |
| `supabase.from('valorhistoricoactivo')` | UC02 (leer), UC04 (leer), UC05 (escribir), UC11 (leer), UC12 (leer) | UC05 define el formato; el resto lo consume. UC05 debe terminar antes. |
| `app/api/portfolio/route.ts` | UC04 (totales), UC07 (conversión), UC13 (composición) | UC07 modifica la lógica de cálculo que usan UC04 y UC13. Coordinarse. |
| `supabase.from('cuentas')` | UC06 (guardar API keys), UC05 (leer API keys) | UC06 escribe, UC05 lee. UC06 debe terminar antes. |
| `supabase.from('cambios')` | UC07 (leer tipos de cambio) | UC04, UC11 y UC12 usan el resultado vía `convertirDivisa()`. |
| `supabase.from('activosposeidos')` | UC01, UC08, UC10 (riesgo), UC12 (backtesting), UC13 (optimización) | Lectura concurrente OK; cambios de esquema coordinarse con UC01/UC08. |
| `supabase.from('perfiles')` | UC03 ✅, UC07, UC10, UC11 | Leer `perfilriesgocodigo` y `divisabasecodigo`. No modificar estructura sin avisar a UC03. |
| Componente `PriceChart` | UC02, UC04, UC11, UC12, UC13 | Crear reutilizable en `components/PriceChart.tsx`. UC02 o UC04 lo crean primero. |
| Selector de intervalo / divisa en gráficas | UC02, UC04, UC07, UC11, UC12 | Extraer como componente `ChartControls` en `components/`. |
| `lib/utils/divisas.ts` | UC07 (crear), UC04, UC11, UC12, UC13 (usar) | UC07 define la función `convertirDivisa()`; los demás la importan. |
| `app/dashboard/page.tsx` | UC04 (historial real), UC07 (totales convertidos), UC08 (botón eliminar) | Tres personas pueden tocar el mismo archivo. |

---

## UC01 — Añadir activo a la cartera

**Descripción:** El usuario busca un activo del catálogo y lo añade a su cartera indicando cantidad y precio de compra.

**Comparte con:** UC08 (`app/api/activos/route.ts`), UC02 (`GET /api/catalogo`), UC04 (refresca el dashboard)

| # | Subtarea | Archivo(s) a tocar |
|---|---|---|
| 1.1 | Página o modal para buscar y seleccionar activo del catálogo | `app/dashboard/investments/new/page.tsx` (crear) |
| 1.2 | Formulario: cantidad, precio de compra, fecha de inicio | mismo archivo |
| 1.3 | Validaciones: cantidad > 0, activo no duplicado | mismo archivo |
| 1.4 | Llamar a `POST /api/activos` con los datos (el endpoint ya existe) | `app/api/activos/route.ts` (revisar, no tocar sin avisar a UC08) |
| 1.5 | Añadir `GET /api/catalogo` que devuelva todos los activos disponibles | `app/api/catalogo/route.ts` (crear) |
| 1.6 | Botón "Añadir inversión" en el dashboard que abra la página/modal | `app/dashboard/page.tsx` |

---

## UC02 — Ver catálogo y detalle de inversión

**Descripción:** El usuario puede buscar entre los activos del catálogo, ver su evolución histórica y, si ya los tiene en cartera, ver su posición actual y rentabilidad.

**Comparte con:** UC04 y UC05 (`valorhistoricoactivo`), componente `PriceChart`, UC01 (`/api/catalogo`)

| # | Subtarea | Archivo(s) a tocar |
|---|---|---|
| 2.1 | Reemplazar datos mock del gráfico por datos reales de `valorhistoricoactivo` | `app/dashboard/investments/[id]/page.tsx` |
| 2.2 | Crear componente `PriceChart` reutilizable (compartido con UC04, UC11, UC12, UC13) | `components/PriceChart.tsx` (crear) |
| 2.3 | Mostrar precio de compra vs precio actual con diferencia en € y % | `app/dashboard/investments/[id]/page.tsx` |
| 2.4 | Botón "Eliminar de mi cartera" con modal de confirmación (enlaza con UC08) | mismo archivo |
| 2.5 | El endpoint `GET /api/activos/[id]` ya devuelve 7 días de histórico — verificar que el gráfico lo usa | `app/api/activos/[id]/route.ts` (no tocar sin avisar) |
| 2.6 | Añadir página de búsqueda del catálogo completo (`GET /api/catalogo`) con filtro por nombre/tipo | `app/dashboard/catalogo/page.tsx` (crear), `app/api/catalogo/route.ts` |

---

## UC03 — Gestionar perfil de usuario ✅

**Descripción:** El usuario edita su nombre, divisa base, perfil de riesgo y contraseña.

**Estado:** Completo. No requiere más trabajo salvo ampliar con campos opcionales de idioma y teléfono si se necesita.

| # | Subtarea | Archivo(s) a tocar |
|---|---|---|
| 3.1 | ~~Editar nombre~~ | ✅ `app/profile/edit/page.tsx` |
| 3.2 | ~~Cambiar perfil de riesgo~~ | ✅ `app/profile/edit/page.tsx` |
| 3.3 | ~~Cambiar divisa base~~ | ✅ `app/profile/edit/page.tsx` |
| 3.4 | ~~Cambiar contraseña~~ | ✅ `app/profile/edit/page.tsx` |
| 3.5 | (Opcional) Añadir campos teléfono e idioma | `app/profile/edit/page.tsx`, `app/api/perfil/route.ts` |

---

## UC04 — Dashboard — Net Worth, distribución y evolución histórica

**Descripción:** El dashboard muestra el patrimonio total (Net Worth), la distribución porcentual por clase de activo, la evolución histórica real del patrimonio y el rendimiento ponderado por tiempo (TWR). Los valores se muestran en la divisa base del usuario.

**Comparte con:** UC02 (`PriceChart`), UC05 (`valorhistoricoactivo`), UC07 (`/api/portfolio`, `convertirDivisa`)

| # | Subtarea | Archivo(s) a tocar |
|---|---|---|
| 4.1 | Reemplazar `historicalData` mock por datos reales de patrimonio acumulado por fecha | `app/dashboard/page.tsx`, `app/api/portfolio/route.ts` |
| 4.2 | Crear componente `PriceChart` si UC02 aún no lo hizo (coordinarse) | `components/PriceChart.tsx` |
| 4.3 | Mostrar totales en la divisa base del usuario (depende de UC07) | `app/dashboard/page.tsx`, `app/api/portfolio/route.ts` |
| 4.4 | Añadir rango de fechas seleccionable en el gráfico (1W, 1M, 3M, 1Y) | `app/dashboard/page.tsx` |
| 4.5 | Mostrar Net Worth total destacado en la cabecera del dashboard | `app/dashboard/page.tsx` |
| 4.6 | Añadir gráfico de distribución por clase de activo (pie/donut con Recharts) | `app/dashboard/page.tsx`, `components/AssetDistribution.tsx` (crear) |
| 4.7 | Calcular y mostrar TWR (Time-Weighted Return) del portfolio | `app/api/portfolio/route.ts` |

---

## UC05 — Actualización de precios (tiempo real y programada)

**Descripción:** El sistema obtiene precios actuales de APIs externas (CoinGecko para cripto, Alpha Vantage para acciones), los normaliza a un formato común y los guarda en `valorhistoricoactivo`. La actualización puede ser manual (botón) o automática (frecuencia configurable).

**Comparte con:** UC02 y UC04 (consumen `valorhistoricoactivo`), UC06 (provee API keys de `cuentas`)

> ⚠️ UC02 y UC04 dependen de que UC05 esté funcionando para mostrar precios reales. Acordar el formato de datos antes de empezar.

| # | Subtarea | Archivo(s) a tocar |
|---|---|---|
| 5.1 | Crear `app/api/precios/route.ts` — llama a CoinGecko y devuelve precios de activos cripto | `app/api/precios/route.ts` (crear) |
| 5.2 | Extender para activos tipo INVERSION (Alpha Vantage u otro) | `app/api/precios/route.ts` |
| 5.3 | Guardar los precios obtenidos en `valorhistoricoactivo` (INSERT) | `app/api/precios/route.ts` |
| 5.4 | Las API Keys externas van en `.env.local` sin prefijo `NEXT_PUBLIC_` | `.env.local`, `.env.local.example` |
| 5.5 | Botón "Actualizar precios" en el dashboard que llame al endpoint manualmente | `app/dashboard/page.tsx` |
| 5.6 | Normalizar la respuesta de cada fuente externa a `{ activocodigo, fecha, valor }` antes del INSERT | `app/api/precios/route.ts`, `lib/utils/precios.ts` (crear) |
| 5.7 | Actualización automática periódica — implementar con Supabase Edge Function o Route Handler con cron | `supabase/functions/actualizar-precios/` o `app/api/precios/cron/route.ts` |

---

## UC06 — Vincular cuentas y gestión de credenciales

**Descripción:** El usuario conecta su cuenta de Binance, Coinbase o Interactive Brokers introduciendo su API Key, que se guarda cifrada at-rest. La interfaz permite vincular y desvincular cuentas, y solo se aceptan claves con permisos de lectura.

**Comparte con:** UC05 (lee las API keys para obtener precios/posiciones)

> ⚠️ UC05 lee las API keys que UC06 guarda. UC06 debe definir el esquema de `cuentas` antes de que UC05 lo implemente.

| # | Subtarea | Archivo(s) a tocar |
|---|---|---|
| 6.1 | Crear `app/api/cuentas/route.ts` — GET (listar), POST (añadir), DELETE (eliminar) | `app/api/cuentas/route.ts` (crear) |
| 6.2 | Cifrar la API Key antes de guardarla en `apikey_cifrada` (usar `crypto` de Node) | `app/api/cuentas/route.ts` |
| 6.3 | Conectar el botón "+ Añadir Cuenta" del perfil con el endpoint real | `app/profile/edit/page.tsx` |
| 6.4 | Formulario: exchange, API Key, API Secret (si aplica) | `app/profile/edit/page.tsx` |
| 6.5 | Mostrar estado real de conexión (Conectada / Desconectada) consultando `cuentas` | `app/profile/page.tsx`, `app/profile/edit/page.tsx` |
| 6.6 | Botón de desvinculación con confirmación (DELETE) | `app/profile/edit/page.tsx` |
| 6.7 | Validar que la clave tenga permisos exclusivos de lectura antes de guardar (verificar contra la API del exchange) | `app/api/cuentas/route.ts` |

---

## UC07 — Conversión de divisas y configuración de gráficas

**Descripción:** Los valores del portfolio se convierten a la divisa base del usuario (EUR, USD, GBP). Las gráficas permiten cambiar dinámicamente la divisa de visualización y el intervalo de datos sin modificar el perfil.

**Comparte con:** UC04 (totales convertidos), UC05 (normalización de precios), UC11 y UC12 (simulaciones en divisa del usuario)

| # | Subtarea | Archivo(s) a tocar |
|---|---|---|
| 7.1 | Crear `app/api/cambios/route.ts` — devuelve el tipo de cambio vigente entre dos divisas | `app/api/cambios/route.ts` (crear) |
| 7.2 | Crear función utilitaria `convertirDivisa(valor, origen, destino)` | `lib/utils/divisas.ts` (crear) |
| 7.3 | Aplicar conversión en `GET /api/portfolio` según `divisabasecodigo` del usuario | `app/api/portfolio/route.ts` (coordinarse con UC04) |
| 7.4 | Mostrar símbolo de divisa correcto en dashboard y detalle (€, $, £) | `app/dashboard/page.tsx`, `app/dashboard/investments/[id]/page.tsx` |
| 7.5 | Actualizar `cambios` con tipos de cambio frescos (manual o via API externa) | `app/api/cambios/route.ts` |
| 7.6 | Selector de divisa en las gráficas (visualización temporal sin cambiar el perfil) | `components/ChartControls.tsx` (crear) |
| 7.7 | Selector de intervalo de datos en las gráficas (1W, 1M, 3M, 1Y) — componente compartido con UC02 y UC04 | `components/ChartControls.tsx` |

---

## UC08 — Eliminar activo de la cartera

**Descripción:** El usuario elimina una inversión de su cartera desde el dashboard o desde el detalle del activo.

**Comparte con:** UC01 (`app/api/activos/route.ts`), UC02 (botón en detalle de inversión)

| # | Subtarea | Archivo(s) a tocar |
|---|---|---|
| 8.1 | Añadir botón "Eliminar" en la tabla del dashboard | `app/dashboard/page.tsx` |
| 8.2 | Modal de confirmación antes de eliminar | `app/dashboard/page.tsx` o componente `ConfirmDialog` |
| 8.3 | Llamar a `DELETE /api/activos/[id]` (el endpoint ya existe) | `app/api/activos/[id]/route.ts` (no tocar sin avisar a UC01) |
| 8.4 | Refrescar la lista del dashboard tras eliminar sin recargar la página | `app/dashboard/page.tsx` |
| 8.5 | Mismo botón y lógica en la página de detalle (coordinarse con UC02) | `app/dashboard/investments/[id]/page.tsx` |

---

## UC09 — Gestión de sesión ✅

**Descripción:** El usuario entra y sale de la aplicación con su email y contraseña. Las rutas protegidas redirigen a login si no hay sesión activa.

**Estado:** Completo. Login, registro, logout y middleware de protección de rutas implementados con Supabase Auth.

| # | Subtarea | Archivo(s) a tocar |
|---|---|---|
| 9.1 | ~~Login con email y contraseña~~ | ✅ `app/(auth)/login/page.tsx` |
| 9.2 | ~~Registro de nuevo usuario~~ | ✅ `app/(auth)/register/page.tsx` |
| 9.3 | ~~Middleware de protección de rutas `/dashboard` y `/profile`~~ | ✅ `middleware.ts` |
| 9.4 | ~~Logout~~ | ✅ `app/profile/page.tsx` |

---

## UC10 — Análisis de perfil de riesgo

**Descripción:** El sistema compara la composición actual de la cartera del usuario con su perfil de riesgo elegido (BAJO/MEDIO/ALTO), genera recomendaciones específicas y alerta si la exposición real no se alinea con el perfil.

**Comparte con:** UC03 (`perfilriesgocodigo` de `perfiles`), UC13 (datos de composición de cartera)

| # | Subtarea | Archivo(s) a tocar |
|---|---|---|
| 10.1 | Crear página `app/dashboard/riesgo/page.tsx` | `app/dashboard/riesgo/page.tsx` (crear) |
| 10.2 | Crear `GET /api/riesgo` — lee `perfilriesgocodigo` del usuario y la composición actual de `activosposeidos` | `app/api/riesgo/route.ts` (crear) |
| 10.3 | Definir umbrales de exposición por perfil (ej. BAJO: max 20% cripto, MEDIO: max 40%, ALTO: sin límite) | `lib/utils/riesgo.ts` (crear) |
| 10.4 | Comparar composición actual vs umbrales del perfil y generar lista de alertas/recomendaciones | `app/api/riesgo/route.ts` |
| 10.5 | Mostrar gráfico de composición actual con indicadores de alineación con el perfil | `app/dashboard/riesgo/page.tsx` |
| 10.6 | Enlazar desde la página de perfil con un botón "Ver análisis de riesgo" | `app/profile/page.tsx` |

---

## UC11 — Simulación proyectiva (interés compuesto)

**Descripción:** El usuario introduce capital inicial, aportación periódica, tasa de retorno estimada y horizonte temporal. El sistema genera una gráfica de crecimiento patrimonial proyectado con interés compuesto en la divisa base del usuario.

**Comparte con:** UC07 (`convertirDivisa`), UC04 (`PriceChart`), `components/ChartControls`

| # | Subtarea | Archivo(s) a tocar |
|---|---|---|
| 11.1 | Crear página `app/dashboard/simulacion/page.tsx` | `app/dashboard/simulacion/page.tsx` (crear) |
| 11.2 | Formulario: capital inicial, aportación periódica (mensual/anual), tasa de retorno (%), horizonte (años) | mismo archivo |
| 11.3 | Calcular proyección con interés compuesto en el cliente (no requiere backend) | `lib/utils/simulacion.ts` (crear) |
| 11.4 | Gráfico de proyección reutilizando `PriceChart` con datos calculados localmente | `app/dashboard/simulacion/page.tsx` |
| 11.5 | Mostrar resultados en la divisa base del usuario (usa `convertirDivisa` de UC07) | `app/dashboard/simulacion/page.tsx` |
| 11.6 | Comparar proyección optimista / base / pesimista en el mismo gráfico (tres líneas) | `lib/utils/simulacion.ts`, mismo archivo |

---

## UC12 — Simulación histórica (backtesting)

**Descripción:** El sistema aplica variaciones históricas de eventos de mercado conocidos (crisis 2008, COVID 2020, etc.) a la cartera actual del usuario y muestra cómo habría evolucionado su patrimonio durante esos periodos.

**Comparte con:** UC05 (`valorhistoricoactivo`), UC07 (`convertirDivisa`), UC04 (`PriceChart`)

> ⚠️ Depende de UC05 para tener datos históricos reales en `valorhistoricoactivo`. Acordar el rango de fechas disponibles antes de implementar.

| # | Subtarea | Archivo(s) a tocar |
|---|---|---|
| 12.1 | Crear página `app/dashboard/backtesting/page.tsx` | `app/dashboard/backtesting/page.tsx` (crear) |
| 12.2 | Definir tabla o constante con eventos de mercado históricos (nombre, fecha inicio, fecha fin, variación estimada por clase de activo) | `lib/data/eventosMercado.ts` (crear) |
| 12.3 | Crear `GET /api/backtesting` — aplica variaciones históricas a la composición actual de `activosposeidos` | `app/api/backtesting/route.ts` (crear) |
| 12.4 | Calcular evolución del patrimonio durante el evento seleccionado usando `valorhistoricoactivo` | `app/api/backtesting/route.ts` |
| 12.5 | Gráfico comparativo: cartera real vs simulación del evento (dos líneas) | `app/dashboard/backtesting/page.tsx`, `components/PriceChart.tsx` |
| 12.6 | Selector de evento de mercado en la UI | `app/dashboard/backtesting/page.tsx` |

---

## UC13 — Optimización de cartera

**Descripción:** El sistema analiza la diversificación actual de la cartera del usuario, calcula la exposición a activos de alta volatilidad y genera sugerencias automáticas de rebalanceo con una distribución objetivo.

**Comparte con:** UC10 (comparten análisis de composición), UC04 (`/api/portfolio`), UC07 (`convertirDivisa`)

| # | Subtarea | Archivo(s) a tocar |
|---|---|---|
| 13.1 | Crear página `app/dashboard/optimizacion/page.tsx` | `app/dashboard/optimizacion/page.tsx` (crear) |
| 13.2 | Crear `GET /api/optimizacion` — lee composición actual de `activosposeidos` y calcula métricas de diversificación | `app/api/optimizacion/route.ts` (crear) |
| 13.3 | Definir distribución objetivo por perfil de riesgo (ej. BAJO: 60% bonos, 30% acciones, 10% cripto) | `lib/utils/optimizacion.ts` (crear) |
| 13.4 | Calcular exposición actual a activos de alta volatilidad vs distribución objetivo | `app/api/optimizacion/route.ts` |
| 13.5 | Generar lista de sugerencias de rebalanceo (qué reducir y qué aumentar con valores concretos) | `app/api/optimizacion/route.ts` |
| 13.6 | Gráfico de distribución actual vs distribución sugerida (barras o donut comparativo) | `app/dashboard/optimizacion/page.tsx` |
