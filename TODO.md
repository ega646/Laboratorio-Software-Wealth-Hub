# TODO — Wealth Hub

Casos de uso pendientes de implementar. Los completados fueron eliminados.

---

## Índice de casos de uso

| ID | Caso de uso | Estado |
|---|---|---|
| UC04 | Dashboard — Net Worth, distribución y evolución histórica | 🟡 Parcial (falta TWR) |
| UC06 | Vincular cuentas y gestión de credenciales | 🟡 Parcial (UI existe, sin backend) |
| UC07 | Conversión de divisas y configuración de gráficas | 🟡 Parcial (falta componente `ChartControls` reutilizable) |
| UC08 | Eliminar activo de la cartera | 🟡 Parcial (falta botón eliminar en tabla del dashboard) |
| UC10 | Análisis de perfil de riesgo | 🔴 Pendiente |
| UC11 | Simulación proyectiva (interés compuesto) | 🔴 Pendiente |
| UC12 | Simulación histórica (backtesting) | 🔴 Pendiente |
| UC13 | Optimización de cartera | 🔴 Pendiente |

---

## ⚠️ Funciones compartidas — leer antes de empezar

| Función / recurso compartido | Casos de uso que la tocan | Qué hacer |
|---|---|---|
| `supabase.from('valorhistoricoactivo')` | UC04 (leer), UC11 (leer), UC12 (leer) | UC05 ✅ ya escribe en ella. |
| `app/api/portfolio/route.ts` | UC04 (totales), UC07 (conversión), UC13 (composición) | UC07 modifica la lógica de cálculo que usan UC04 y UC13. Coordinarse. |
| `supabase.from('cambios')` | UC07 (leer tipos de cambio) | UC04, UC11 y UC12 usan el resultado vía `convertirDivisa()`. |
| `supabase.from('activosposeidos')` | UC08, UC10 (riesgo), UC12 (backtesting), UC13 (optimización) | Lectura concurrente OK; cambios de esquema coordinarse. |
| `supabase.from('perfiles')` | UC07, UC10, UC11 | Leer `perfilriesgocodigo` y `divisabasecodigo`. No modificar estructura. |
| Componente `PriceChart` ✅ | UC04 ✅, UC11, UC12, UC13 | Ya creado en `components/PriceChart.tsx`. |
| Selector de intervalo / divisa en gráficas | UC04, UC07, UC11, UC12 | Extraer como componente `ChartControls` en `components/`. |

---

## UC04 — Dashboard — Net Worth, distribución y evolución histórica

**Descripción:** El dashboard muestra el patrimonio total (Net Worth), la distribución porcentual por clase de activo, la evolución histórica real del patrimonio y el rendimiento ponderado por tiempo (TWR). Los valores se muestran en la divisa base del usuario.

**Estado actual:** Net Worth ✅, distribución ✅, histórico real ✅, selector de divisa ✅. Falta TWR.

| # | Subtarea | Archivo(s) a tocar |
|---|---|---|
| 4.7 | Calcular y mostrar TWR (Time-Weighted Return) del portfolio | `app/api/portfolio/route.ts` |

---

## UC06 — Vincular cuentas y gestión de credenciales

**Descripción:** El usuario conecta su cuenta de Binance, Coinbase o Interactive Brokers introduciendo su API Key, que se guarda cifrada at-rest. La interfaz permite vincular y desvincular cuentas, y solo se aceptan claves con permisos de lectura.

**Comparte con:** UC05 ✅ (lee las API keys para obtener precios/posiciones)

| # | Subtarea | Archivo(s) a tocar |
|---|---|---|
| 6.1 | Crear `app/api/cuentas/route.ts` — GET (listar), POST (añadir), DELETE (eliminar) | `app/api/cuentas/route.ts` (crear) |
| 6.2 | Cifrar la API Key antes de guardarla en `apikey_cifrada` (usar `crypto` de Node) | `app/api/cuentas/route.ts` |
| 6.3 | Conectar el botón "+ Añadir Cuenta" del perfil con el endpoint real | `app/profile/edit/page.tsx` |
| 6.4 | Formulario: exchange, API Key, API Secret (si aplica) | `app/profile/edit/page.tsx` |
| 6.5 | Mostrar estado real de conexión (Conectada / Desconectada) consultando `cuentas` | `app/profile/page.tsx`, `app/profile/edit/page.tsx` |
| 6.6 | Botón de desvinculación con confirmación (DELETE) | `app/profile/edit/page.tsx` |
| 6.7 | Validar que la clave tenga permisos exclusivos de lectura antes de guardar | `app/api/cuentas/route.ts` |

---

## UC07 — Conversión de divisas y configuración de gráficas

**Descripción:** Los valores del portfolio se convierten a la divisa base del usuario (EUR, USD, GBP). Las gráficas permiten cambiar dinámicamente la divisa de visualización y el intervalo de datos sin modificar el perfil.

**Estado actual:** Conversión en portfolio ✅, selector de divisa en dashboard ✅. Falta componente `ChartControls` reutilizable para UC11 y UC12.

| # | Subtarea | Archivo(s) a tocar |
|---|---|---|
| 7.7 | Extraer selector de intervalo y divisa como componente `ChartControls` reutilizable | `components/ChartControls.tsx` (crear) |

---

## UC08 — Eliminar activo de la cartera

**Descripción:** El usuario elimina una inversión de su cartera desde el dashboard o desde el detalle del activo.

**Estado actual:** Botón eliminar en página de detalle ✅, endpoint DELETE ✅. Falta botón en la tabla principal del dashboard.

| # | Subtarea | Archivo(s) a tocar |
|---|---|---|
| 8.1 | Añadir botón "Eliminar" en la tabla de inversiones del dashboard | `app/dashboard/page.tsx` |
| 8.2 | Modal de confirmación para el botón del dashboard | `app/dashboard/page.tsx` |

---

## UC10 — Análisis de perfil de riesgo

**Descripción:** El sistema compara la composición actual de la cartera del usuario con su perfil de riesgo elegido (BAJO/MEDIO/ALTO), genera recomendaciones específicas y alerta si la exposición real no se alinea con el perfil.

**Comparte con:** UC03 ✅ (`perfilriesgocodigo` de `perfiles`), UC13 (datos de composición de cartera)

| # | Subtarea | Archivo(s) a tocar |
|---|---|---|
| 10.1 | Crear página `app/dashboard/riesgo/page.tsx` | `app/dashboard/riesgo/page.tsx` (crear) |
| 10.2 | Crear `GET /api/riesgo` — lee `perfilriesgocodigo` del usuario y composición actual | `app/api/riesgo/route.ts` (crear) |
| 10.3 | Definir umbrales de exposición por perfil (BAJO: max 20% cripto, MEDIO: max 40%, ALTO: sin límite) | `lib/utils/riesgo.ts` (crear) |
| 10.4 | Comparar composición actual vs umbrales y generar alertas/recomendaciones | `app/api/riesgo/route.ts` |
| 10.5 | Mostrar gráfico de composición actual con indicadores de alineación con el perfil | `app/dashboard/riesgo/page.tsx` |
| 10.6 | Enlazar desde la página de perfil con un botón "Ver análisis de riesgo" | `app/profile/page.tsx` |

---

## UC11 — Simulación proyectiva (interés compuesto)

**Descripción:** El usuario introduce capital inicial, aportación periódica, tasa de retorno estimada y horizonte temporal. El sistema genera una gráfica de crecimiento patrimonial proyectado con interés compuesto en la divisa base del usuario.

**Comparte con:** UC07 (`convertirDivisa`), `components/PriceChart` ✅, `components/ChartControls` (pendiente UC07)

| # | Subtarea | Archivo(s) a tocar |
|---|---|---|
| 11.1 | Crear página `app/dashboard/simulacion/page.tsx` | `app/dashboard/simulacion/page.tsx` (crear) |
| 11.2 | Formulario: capital inicial, aportación periódica, tasa de retorno (%), horizonte (años) | mismo archivo |
| 11.3 | Calcular proyección con interés compuesto en el cliente (no requiere backend) | `lib/utils/simulacion.ts` (crear) |
| 11.4 | Gráfico de proyección reutilizando `PriceChart` ✅ con datos calculados localmente | `app/dashboard/simulacion/page.tsx` |
| 11.5 | Mostrar resultados en la divisa base del usuario | `app/dashboard/simulacion/page.tsx` |
| 11.6 | Comparar proyección optimista / base / pesimista en el mismo gráfico (tres líneas) | `lib/utils/simulacion.ts`, mismo archivo |

---

## UC12 — Simulación histórica (backtesting)

**Descripción:** El sistema aplica variaciones históricas de eventos de mercado conocidos (crisis 2008, COVID 2020, etc.) a la cartera actual del usuario y muestra cómo habría evolucionado su patrimonio durante esos periodos.

**Comparte con:** UC05 ✅ (`valorhistoricoactivo`), UC07 (`convertirDivisa`), `components/PriceChart` ✅

| # | Subtarea | Archivo(s) a tocar |
|---|---|---|
| 12.1 | Crear página `app/dashboard/backtesting/page.tsx` | `app/dashboard/backtesting/page.tsx` (crear) |
| 12.2 | Definir tabla o constante con eventos de mercado históricos (nombre, fechas, variación estimada por clase) | `lib/data/eventosMercado.ts` (crear) |
| 12.3 | Crear `GET /api/backtesting` — aplica variaciones históricas a la composición actual | `app/api/backtesting/route.ts` (crear) |
| 12.4 | Calcular evolución del patrimonio durante el evento usando `valorhistoricoactivo` | `app/api/backtesting/route.ts` |
| 12.5 | Gráfico comparativo: cartera real vs simulación del evento (dos líneas) | `app/dashboard/backtesting/page.tsx`, `components/PriceChart.tsx` ✅ |
| 12.6 | Selector de evento de mercado en la UI | `app/dashboard/backtesting/page.tsx` |

---

## UC13 — Optimización de cartera

**Descripción:** El sistema analiza la diversificación actual de la cartera del usuario, calcula la exposición a activos de alta volatilidad y genera sugerencias automáticas de rebalanceo con una distribución objetivo.

**Comparte con:** UC10 (comparten análisis de composición), UC04 (`/api/portfolio`), UC07 (`convertirDivisa`)

| # | Subtarea | Archivo(s) a tocar |
|---|---|---|
| 13.1 | Crear página `app/dashboard/optimizacion/page.tsx` | `app/dashboard/optimizacion/page.tsx` (crear) |
| 13.2 | Crear `GET /api/optimizacion` — lee composición actual y calcula métricas de diversificación | `app/api/optimizacion/route.ts` (crear) |
| 13.3 | Definir distribución objetivo por perfil de riesgo | `lib/utils/optimizacion.ts` (crear) |
| 13.4 | Calcular exposición actual vs distribución objetivo | `app/api/optimizacion/route.ts` |
| 13.5 | Generar lista de sugerencias de rebalanceo con valores concretos | `app/api/optimizacion/route.ts` |
| 13.6 | Gráfico de distribución actual vs sugerida (barras o donut comparativo) | `app/dashboard/optimizacion/page.tsx` |
