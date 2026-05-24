# TODO — Wealth Hub (Actualizado Mayo 2026)

Este documento refleja únicamente las tareas de refinamiento final. El núcleo de la aplicación (gestión de activos, integraciones financieras y simulaciones estadísticas) está **completado**.

---

## Índice de Tareas Pendientes

| ID | Caso de uso | Estado |
|---|---|---|
| UC13 | Optimización de cartera (Sugerencias de rebalanceo) | 🔴 Pendiente |
| UC15 | Recomendaciones con LLM (IA Generativa) | 🟡 En evaluación (Groq / Llama 3.1) |

---

## ✅ Ya implementado (Hitos alcanzados)

| UC | Logro técnico | Descripción |
|---|---|---|
| **UC01** | **Gestión Manual** | Alta de activos y transacciones manuales. |
| **UC02** | **Analytics de Activo** | Vista detallada con rentabilidad e historial de precios. |
| **UC04** | **Dashboard & TWR** | Patrimonio total, distribución por clase y cálculo de **Time-Weighted Return**. |
| **UC05** | **Data Pipeline** | Sistema de ingesta de precios históricos vía Cron y API. |
| **UC06** | **Integración de Exchanges** | **Binance y Coinbase** operativos. Conexión segura mediante firmas **HMAC-SHA256**. |
| **UC07** | **Multi-Divisa UI** | Conversión dinámica (EUR/USD/GBP) en gráficas y balances. |
| **UC10** | **Perfil de Riesgo** | Análisis de desviación de cartera según el perfil del inversor. |
| **UC12** | **Backtesting** | Simulación de comportamiento de la cartera ante eventos históricos. |
| **UC14** | **Motor de Alertas** | Lógica de balanceo y generación de recomendaciones críticas. |
| **UC16** | **Análisis Técnico** | Indicadores visuales (SMA 50/200) y detección de tendencias. |
| **UC17** | **Simulación Monte Carlo** | Proyecciones estadísticas P10/P50/P90 sobre activos reales. |

---

## 🛠️ Detalles de Implementación Pendiente

### UC13 — Optimización de cartera
Usa la lógica de `lib/utils/balanceo.ts` para traducir porcentajes de desviación en órdenes de compra/venta concretas.

* [ ] **API:** `GET /api/optimizacion` — Calcula importes exactos basados en precios actuales.
* [ ] **Frontend:** Página `/dashboard/optimizacion` con tabla de acciones recomendadas ("Vender X de A, comprar Y de B").

### UC15 — Recomendaciones con LLM
Enriquecer las alertas del sistema mediante IA para dar un contexto macroeconómico a las recomendaciones.

* [ ] **Integración:** Configurar el cliente de **Groq** para procesar prompts con **Llama 3.1**.
* [ ] **Seguridad:** Implementar *System Prompt* para evitar consejos financieros vinculantes (disclaimer).
* [ ] **Rendimiento:** Sistema de caché de 24h para no saturar los límites de la API gratuita.

---

**Nota sobre la arquitectura:** La estructura de servicios en `@/lib/services` (Binance, Coinbase, Manual) ha quedado cerrada, permitiendo que cualquier nueva integración futura sea transparente para el frontend.