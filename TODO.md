# TODO — Wealth Hub

Solo lo que queda pendiente. Todo lo demás ya está implementado.

---

## Índice

| ID | Caso de uso | Estado |
|---|---|---|
| UC04 | Dashboard — TWR | 🟡 Falta solo el TWR (el resto está hecho) |
| UC06 | Vincular cuentas y gestión de credenciales | 🔴 Pendiente — falta todo el backend |
| UC07 | Selector de divisa en gráficas (UI) | 🟡 Falta la UI — el backend ya funciona |
| UC10 | Análisis de perfil de riesgo | 🔴 Pendiente |
| UC11 | Simulación proyectiva (interés compuesto manual) | 🔴 Pendiente — la página existe, falta la pestaña "Manual" |
| UC12 | Simulación histórica (backtesting) | 🔴 Pendiente |
| UC13 | Optimización de cartera | 🔴 Pendiente |
| UC15 | Recomendaciones con LLM open-source | ⏸️ Postergado — evaluar al terminar UC10, UC12, UC13 |

---

## ✅ Ya implementado (referencia)

| UC | Qué hay hecho |
|---|---|
| UC01 | Modal de añadir activo en dashboard + página `/nuevo-activo` |
| UC02 | Detalle de activo (`/investments/[id]`) con precio, rentabilidad, historial |
| UC03 | Catálogo de activos (`/catalogo`) |
| UC04 | Dashboard principal: patrimonio, distribución, gráfico histórico con selector de rango (1M/3M/…), conversión de divisa |
| UC05 | Carga de precios históricos (`/api/precios`, `/api/precios/cargar-historico`, cron) |
| UC07 | Backend de conversión de divisas (`/api/cambios`, `convertirDivisa`) |
| UC14 | Alertas de balanceo: `lib/utils/balanceo.ts`, tabla `recomendaciones`, todos los endpoints, `RecomendacionesWidget` |
| UC16 | Análisis técnico: `lib/utils/indicadores.ts`, `AnalisisTecnico.tsx`, SMA50/200 overlay, texto descriptivo |
| UC17 | Monte Carlo: `lib/utils/montecarlo.ts`, `GET /api/simulacion`, página `/simulacion` con cono P10/P50/P90 |

---

## UC04 — TWR (Time-Weighted Return)

Lo que falta del dashboard. Todo lo demás (gráfico, distribución, selector de fechas, divisa) ya está.

| # | Subtarea | Archivo |
|---|---|---|
| 4.1 | Calcular TWR del portfolio en `GET /api/portfolio` | `app/api/portfolio/route.ts` |
| 4.2 | Mostrar TWR en la tarjeta de resumen del dashboard | `app/dashboard/page.tsx` |

---

## UC06 — Vincular cuentas y gestión de credenciales

La UI del perfil ya existe. Falta todo el backend.

| # | Subtarea | Archivo |
|---|---|---|
| 6.1 | `GET /api/cuentas` — listar cuentas del usuario | `app/api/cuentas/route.ts` (crear) |
| 6.2 | `POST /api/cuentas` — añadir cuenta cifrando la API Key con `crypto` de Node | `app/api/cuentas/route.ts` |
| 6.3 | `DELETE /api/cuentas/[id]` — desvincular cuenta | `app/api/cuentas/[id]/route.ts` (crear) |
| 6.4 | Conectar botón "+ Añadir Cuenta" del perfil con el endpoint | `app/profile/edit/page.tsx` |
| 6.5 | Mostrar estado real de conexión (Conectada / Desconectada) | `app/profile/page.tsx` |
| 6.6 | Botón de desvinculación con confirmación | `app/profile/edit/page.tsx` |

---

## UC07 — Selector de divisa en gráficas (UI)

El backend (`/api/cambios`, `convertirDivisa`) ya funciona. Solo falta la UI para cambiar divisa sin tocar el perfil.

| # | Subtarea | Archivo |
|---|---|---|
| 7.1 | Selector de divisa (EUR / USD / GBP) en el gráfico del dashboard — sin modificar el perfil del usuario | `app/dashboard/page.tsx` |
| 7.2 | Pasar la divisa seleccionada como parámetro a `GET /api/historicalData` | `app/dashboard/page.tsx` |

---

## UC10 — Análisis de perfil de riesgo

Página dedicada que muestra la composición de la cartera vs. el target del perfil. `lib/utils/balanceo.ts` ya existe (creado por UC14), solo hay que usarlo.

| # | Subtarea | Archivo |
|---|---|---|
| 10.1 | `GET /api/riesgo` — lee perfil + posiciones, usa `calcularDesviaciones()` de `balanceo.ts` | `app/api/riesgo/route.ts` (crear) |
| 10.2 | Página `/dashboard/riesgo` con gráfico actual vs target y lista de desviaciones | `app/dashboard/riesgo/page.tsx` (crear) |
| 10.3 | Enlace desde la página de perfil con botón "Ver análisis de riesgo" | `app/profile/page.tsx` |

---

## UC11 — Simulación proyectiva (interés compuesto manual)

La página `/dashboard/simulacion` ya existe con UC17. Hay que añadir una pestaña "Manual" que no use la cartera real sino parámetros introducidos por el usuario.

| # | Subtarea | Archivo |
|---|---|---|
| 11.1 | Añadir pestaña "Manual" / "Mi cartera" en `/dashboard/simulacion` | `app/dashboard/simulacion/page.tsx` |
| 11.2 | Formulario: capital inicial, aportación periódica, tasa de retorno (%), horizonte (años) | mismo archivo |
| 11.3 | Calcular proyección con interés compuesto en cliente (sin backend) | `lib/utils/simulacion.ts` (crear) |
| 11.4 | Gráfico con tres líneas: pesimista / base / optimista | mismo archivo |

---

## UC12 — Simulación histórica (backtesting)

| # | Subtarea | Archivo |
|---|---|---|
| 12.1 | Definir tabla de eventos históricos (nombre, fechas, variación estimada por clase de activo) | `lib/data/eventosMercado.ts` (crear) |
| 12.2 | `GET /api/backtesting` — aplica variaciones históricas a la composición actual de la cartera | `app/api/backtesting/route.ts` (crear) |
| 12.3 | Página `/dashboard/backtesting` con selector de evento y gráfico comparativo (cartera real vs simulación) | `app/dashboard/backtesting/page.tsx` (crear) |

---

## UC13 — Optimización de cartera

Usa `lib/utils/balanceo.ts` (ya existe). Genera sugerencias concretas en importe (ej. "vender 0.05 BTC, comprar 100€ de S&P500").

| # | Subtarea | Archivo |
|---|---|---|
| 13.1 | `GET /api/optimizacion` — calcula desviaciones y las traduce a importes concretos | `app/api/optimizacion/route.ts` (crear) |
| 13.2 | Página `/dashboard/optimizacion` con lista de sugerencias y gráfico actual vs sugerido | `app/dashboard/optimizacion/page.tsx` (crear) |

---

## UC15 — Recomendaciones con LLM open-source ⏸️ POSTERGADO

**No iniciar** hasta que UC10, UC12 y UC13 estén funcionando.

**Idea:** Un LLM open-source toma los datos calculados por UC14 y genera texto natural más rico que los templates fijos.

### Opciones técnicas

| Opción | Pros | Contras |
|---|---|---|
| **Groq + Llama 3.1 8B** | API gratuita, ~500 tok/s, buena calidad en español | Rate limits, API externa |
| **HuggingFace Inference API** | Free tier, sin instalación | Latencia variable, rate limits estrictos |
| **Ollama + Llama 3.1 local** | 100% local, sin costes | Requiere CPU/GPU, no desplegable en Vercel |

### Subtareas (si se decide implementar)

1. Elegir opción técnica (probablemente Groq por simplicidad)
2. `app/api/ia/recomendar/route.ts` — lee datos de UC14, construye prompt, llama al LLM, devuelve texto
3. Reemplazar `mensaje` en la tabla `recomendaciones` por salida del LLM (con fallback al template de UC14)
4. Caché de 24h por usuario
5. Disclaimer en el system prompt del modelo
